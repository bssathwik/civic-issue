const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Admin middleware to check if the authenticated user is an admin
 * This middleware should be used after the auth middleware
 */
const admin = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error in admin check' 
    });
  }
};

/**
 * Super admin middleware to check if the user is a super admin
 */
const superAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has super admin role
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Super admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error in super admin check' 
    });
  }
};

/**
 * Middleware to check admin or self access (user can access their own resources or admin can access any)
 */
const adminOrSelf = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userId = req.params.id || req.params.userId || req.body.userId;
    
    // Allow if user is admin or accessing their own resource
    if (req.user.role === 'admin' || 
        req.user.role === 'superadmin' || 
        req.user._id.toString() === userId) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges or self-access required' 
    });
  } catch (error) {
    console.error('AdminOrSelf middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error in access check' 
    });
  }
};

module.exports = admin;
module.exports.admin = admin;
module.exports.superAdmin = superAdmin;
module.exports.adminOrSelf = adminOrSelf;