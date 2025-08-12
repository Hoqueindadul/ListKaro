import jwt from 'jsonwebtoken';
import handleAsyncError from './handleAsyncError.js';
import { User } from '../models/user.model.js';
import HandleError from '../utils/handleError.js';

// Middleware to verify JWT token from cookies or Authorization header
export const verifyToken = handleAsyncError(async (req, res, next) => {
  let token;

  // Try getting token from cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookie:', token);
  }
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from header:', token);
  }

  console.log('All cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - no token provided',
    });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find the user in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user._id;

    next(); // Proceed to next middleware/route handler
  } catch (error) {
    console.error('Error verifying token:', error);
    
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

// Middleware for role-based access control
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