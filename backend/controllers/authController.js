import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { sendEmail } from "../utils/email.js";
import verificationEmail from "../utils/emailTemplates/verificationTemplate.js";

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

    // Create unverified user and send verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

    const user = await User.create({
      name: name || undefined,
      identifier: id,
      email: email.toLowerCase(),
      password,
      role,
      institution: institution || undefined,
      isVerified: false,
      emailVerificationCode: codeHash,
      emailVerificationExpires: new Date(expires),
    });

    // send email (best-effort)
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your account",
        text: `Your verification code is: ${code}`,
        html: verificationEmail({
          name: user.name || user.identifier,
          code,
          expiresMinutes: 15,
        }),
      });
    } catch (e) {
      console.warn("Failed to send verification email", e);
    }

    res.status(201).json({
      success: true,
      message: "Verification code sent to email",
      data: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return next(new AppError("Email and code are required", 400));
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationCode +emailVerificationExpires +password",
    );
    if (!user) return next(new AppError("User not found", 404));
    if (user.isVerified)
      return next(new AppError("Email already verified", 400));
    if (!user.emailVerificationCode || !user.emailVerificationExpires)
      return next(
        new AppError("No verification pending for this account", 400),
      );
    if (user.emailVerificationExpires.getTime() < Date.now())
      return next(new AppError("Verification code expired", 400));

    const codeHash = crypto
      .createHash("sha256")
      .update(code.toString())
      .digest("hex");
    if (codeHash !== user.emailVerificationCode)
      return next(new AppError("Invalid verification code", 400));

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // return token so user can be logged in immediately
    const token = generateToken(user._id);
    res.status(200).json({ success: true, token, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError("Email is required", 400));
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError("User not found", 404));
    if (user.isVerified)
      return next(new AppError("Email already verified", 400));

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expires = Date.now() + 1000 * 60 * 15;

    user.emailVerificationCode = codeHash;
    user.emailVerificationExpires = new Date(expires);
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your account - code resent",
        text: `Your verification code is: ${code}`,
        html: verificationEmail({
          name: user.name || user.identifier,
          code,
          expiresMinutes: 15,
        }),
      });
    } catch (e) {
      console.warn("Failed to send verification email", e);
    }

    res
      .status(200)
      .json({ success: true, message: "Verification code resent" });
  } catch (err) {
    next(err);
  }
};

// @desc    Request password reset (send code)
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError("Email is required", 400));
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError("User not found", 404));

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

    user.passwordResetCode = codeHash;
    user.passwordResetExpires = new Date(expires);
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Password reset code",
        text: `Your password reset code is: ${code}`,
        html: verificationEmail({
          name: user.name || user.identifier,
          code,
          expiresMinutes: 15,
        }),
      });
    } catch (e) {
      console.warn("Failed to send password reset email", e);
    }

    res.status(200).json({ success: true, message: "Reset code sent" });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify password reset code
// @route   POST /api/auth/verify-reset
// @access  Public
export const verifyPasswordReset = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return next(new AppError("Email and code are required", 400));
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetCode +passwordResetExpires",
    );
    if (!user) return next(new AppError("User not found", 404));
    if (!user.passwordResetCode || !user.passwordResetExpires)
      return next(new AppError("No reset requested for this account", 400));
    if (user.passwordResetExpires.getTime() < Date.now())
      return next(new AppError("Reset code expired", 400));

    const codeHash = crypto
      .createHash("sha256")
      .update(code.toString())
      .digest("hex");
    if (codeHash !== user.passwordResetCode)
      return next(new AppError("Invalid reset code", 400));

    res.status(200).json({ success: true, message: "Code valid" });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password)
      return next(
        new AppError("Email, code and new password are required", 400),
      );
    if ((password || "").length < 6)
      return next(
        new AppError("Password must be at least 6 characters long", 400),
      );

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetCode +passwordResetExpires +password",
    );
    if (!user) return next(new AppError("User not found", 404));
    if (!user.passwordResetCode || !user.passwordResetExpires)
      return next(new AppError("No reset requested for this account", 400));
    if (user.passwordResetExpires.getTime() < Date.now())
      return next(new AppError("Reset code expired", 400));

    const codeHash = crypto
      .createHash("sha256")
      .update(code.toString())
      .digest("hex");
    if (codeHash !== user.passwordResetCode)
      return next(new AppError("Invalid reset code", 400));

    user.password = password;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    next(err);
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
