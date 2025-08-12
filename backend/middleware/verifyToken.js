import jwt from 'jsonwebtoken';
import handleAsyncError from './handleAsyncError.js';
import { User } from '../models/user.model.js';
import HandleError from '../utils/handleError.js';

// Middleware to verify JWT token from cookies or Authorization header
export const verifyToken = handleAsyncError(async (req, res, next) => {
  // Try getting token from cookie or Authorization header
  const token =
    req.cookies.token ||
    (req.headers.authorization?.startsWith('Bearer ') &&
      req.headers.authorization.split(' ')[1]);

      console.log('Token:', token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - no token provided',
    });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Middleware for role-based access control
export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
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
