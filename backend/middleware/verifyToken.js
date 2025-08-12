import jwt from 'jsonwebtoken';
import handleAsyncError from './handleAsyncError.js';
import { User } from '../models/user.model.js';
import HandleError from '../utils/handleError.js';

export const verifyToken = handleAsyncError(async (req, res, next) => {
  let token;

  // Debug logging
  console.log("🔍 === TOKEN VERIFICATION DEBUG ===");
  console.log("🌐 Request origin:", req.headers.origin);
  console.log("🍪 Raw cookie header:", req.headers.cookie);
  console.log("🔑 Authorization header:", req.headers.authorization);
  console.log("🍪 Parsed cookies:", req.cookies);

  // Try to get token from cookies first (preferred for web browsers)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("✅ Token found in cookies");
  }
  // Fallback to Authorization header (good for mobile apps, API clients)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("✅ Token found in Authorization header");
  }

  if (!token) {
    console.log("❌ No token found in cookies or headers");
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - no token provided',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.userId);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    console.log("✅ User attached to request");

    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new HandleError('User not authenticated', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new HandleError(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};