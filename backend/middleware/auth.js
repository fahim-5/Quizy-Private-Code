import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      // Debug: log missing token and request path
      try {
        const present = !!req.headers.authorization;
        console.warn(
          `[auth.protect] Missing token for ${req.method} ${req.originalUrl} — Authorization header present: ${present}`,
        );
      } catch (e) {}
      return next(new AppError("Not authorized to access this route", 401));
    }

    // Verify token (fall back to default secret if not configured)
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret);

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      try {
        console.warn(
          `[auth.protect] Token valid but user not found for ${req.method} ${req.originalUrl} (user id from token: ${decoded.id})`,
        );
      } catch (e) {}
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    // Debug: log verification error and masked token
    try {
      const raw = req.headers.authorization || "";
      const has = raw.startsWith("Bearer ");
      const tok = has ? raw.split(" ")[1] : null;
      const masked = tok ? `${tok.slice(0, 6)}...${tok.slice(-6)}` : null;
      console.error(
        `[auth.protect] Verification failed for ${req.method} ${req.originalUrl} — token present: ${!!tok} masked: ${masked} error: ${error.message}`,
      );
    } catch (e) {}
    return next(new AppError("Not authorized to access this route", 401));
  }
};

export const authorize = (...roles) => {
  // Simple role check — platform uses `student` and `teacher` roles
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Not authorized to access this route", 403));
    }
    next();
  };
};

// Optional authentication: if token provided, set req.user, otherwise continue anonymously
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next();

    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
    return next();
  } catch (error) {
    // ignore token errors — proceed without user
    return next();
  }
};
