import jwt from 'jsonwebtoken';
import handleAsyncError from './handleAsyncError.js';
import { User } from '../models/user.model.js';

export const verifyToken = handleAsyncError(async (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - no token provided',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user information to the request object
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user; // Attach full user information
    req.userId = user._id; // Attach only userId for easier access in other controllers
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new HandleError(
                `Role: ${req.user.role} is not allowed to access this resource`, 403
            ));
        }
        next();
    }
}
