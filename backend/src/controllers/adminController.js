const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Create new admin user
// @route   POST /api/admin/create
// @access  Admin only
const createAdmin = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      password,
      phone,
      role = 'admin',
      location,
      address,
      preferences,
      sendWelcomeEmail = true
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        data: {
          email: existingUser.email,
          role: existingUser.role,
          isActive: existingUser.isActive
        }
      });
    }

    // Validate role
    const allowedRoles = ['admin', 'field_worker'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: admin, field_worker'
      });
    }

    // Create admin user data
    const adminData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      phone: phone || null,
      role,
      isVerified: true,
      isActive: true,
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      address: address || '',
      gamification: {
        points: role === 'admin' ? 1000 : 500,
        level: role === 'admin' ? 'Platinum' : 'Gold',
        badges: [{
          name: role === 'admin' ? 'Administrator' : 'Field Worker',
          description: `${role === 'admin' ? 'System Administrator' : 'Field Worker'} Badge`,
          earnedAt: new Date()
        }],
        streak: {
          current: 0,
          longest: 0
        }
      },
      preferences: preferences || {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        language: 'en'
      }
    };

    // Create the admin user
    const adminUser = new User(adminData);
    await adminUser.save();

    // Remove password from response
    const adminResponse = adminUser.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Administrator' : 'Field worker'} user created successfully`,
      data: {
        user: adminResponse,
        credentials: {
          email: adminUser.email,
          temporaryPassword: password,
          note: 'Please ask the user to change this password on first login'
        }
      }
    });

    // Log admin creation activity
    console.log(`Admin user created: ${adminUser.email} by ${req.user.email}`);

  } catch (error) {
    console.error('Admin creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating admin user'
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/admin
// @access  Admin only
const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'all', status = 'all' } = req.query;

    // Build query
    const query = {};
    
    if (role !== 'all') {
      query.role = role === 'admin' ? 'admin' : { $in: ['admin', 'field_worker'] };
    } else {
      query.role = { $in: ['admin', 'field_worker'] };
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password -resetPasswordToken -resetPasswordExpires -verificationToken',
      sort: { createdAt: -1 }
    };

    const admins = await User.find(query)
      .select(options.select)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalItems: total,
          itemsPerPage: options.limit
        }
      }
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin users'
    });
  }
};

// @desc    Update admin role
// @route   PUT /api/admin/:id/role
// @access  Admin only
const updateAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['admin', 'field_worker', 'citizen'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// @desc    Deactivate admin user
// @route   PUT /api/admin/:id/deactivate
// @access  Admin only
const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Admin only
const getAdminStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          role: { $in: ['admin', 'field_worker'] }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactive: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    res.status(200).json({
      success: true,
      data: {
        adminStats: stats,
        overview: {
          totalUsers,
          totalCitizens,
          totalAdmins: stats.find(s => s._id === 'admin')?.count || 0,
          totalFieldWorkers: stats.find(s => s._id === 'field_worker')?.count || 0
        }
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  updateAdminRole,
  deactivateAdmin,
  getAdminStats
};