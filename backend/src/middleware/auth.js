import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - requires a valid JWT
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_token_academic_audit_companion_987654321');

      // Get user from token and attach to req
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      if (req.user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account suspended. Contact administrator.',
        });
      }

      next();
    } catch (error) {
      console.error('Token validation error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this resource`,
      });
    }
    next();
  };
};
