import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

// Generate JWT Token
// Default JWT secret for development
const defaultSecret = "dev-secret-change-me";
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || defaultSecret;
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { id, email, password, role, name, institution } = req.body;

    if (!id || !password || !email || !institution || !role)
      return next(
        new AppError(
          "Identifier, email, password, institution and role are required",
          400,
        ),
      );

    if ((password || "").length < 6)
      return next(
        new AppError("Password must be at least 6 characters long", 400),
      );

    // Check if user exists by identifier within the same institution
    const existingById = await User.findOne({ identifier: id, institution });
    if (existingById) {
      return next(
        new AppError("This ID is already registered for this institution", 400),
      );
    }

    // Check if email already registered (global)
    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      return next(new AppError("This email already has an account", 400));
    }

    // Create user
    const user = await User.create({
      name: name || undefined,
      identifier: id,
      email: email.toLowerCase(),
      password,
      role,
      institution: institution || undefined,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { id, password, email } = req.body;

    // Allow login by id or email
    if ((!id && !email) || !password) {
      return next(new AppError("Please provide id/email and password", 400));
    }

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password",
      );
    } else {
      user = await User.findOne({ identifier: id }).select("+password");
    }

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
