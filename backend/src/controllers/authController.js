const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/GamificationService');
const { validateCitizenRegistration, validateProfileUpdate } = require('../validation/citizenRegistration');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const register = async (req, res) => {
  try {
    // Validate registration data
    const validation = validateCitizenRegistration(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const userData = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: userData.email },
        { phone: userData.phone },
        ...(userData.aadharNumber ? [{ 'citizenProfile.aadharNumber': userData.aadharNumber }] : [])
      ]
    });

    if (existingUser) {
      let message = 'User already exists';
      if (existingUser.email === userData.email) message = 'User with this email already exists';
      else if (existingUser.phone === userData.phone) message = 'User with this phone number already exists';
      else if (userData.aadharNumber && existingUser.citizenProfile?.aadharNumber === userData.aadharNumber) {
        message = 'User with this Aadhar number already exists';
      }
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Generate hashed password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    userData.password = hashedPassword;

    // Create comprehensive user profile
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: 'citizen',
      
      // Enhanced address structure
      address: {
        street: userData.address.street,
        area: userData.address.area,
        city: userData.address.city,
        state: userData.address.state,
        pincode: userData.address.pincode,
        ward: userData.address.ward || '',
        landmark: userData.address.landmark || '',
        full: `${userData.address.street}, ${userData.address.area}, ${userData.address.city}, ${userData.address.state} - ${userData.address.pincode}`
      },
      
      // Location coordinates
      location: {
        type: 'Point',
        coordinates: userData.location.coordinates
      },
      
      // Citizen profile
      citizenProfile: {
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        occupation: userData.occupation,
        aadharNumber: userData.aadharNumber || undefined,
        emergencyContact: userData.emergencyContact,
        isProfileComplete: true,
        profileCompleteness: 100
      },
      
      // Preferences
      preferences: {
        notifications: userData.preferences?.notifications || {
          email: true,
          push: true,
          sms: false
        },
        language: userData.preferences?.language || 'en'
      },
      
      isVerified: true // Auto-verify for now, implement email verification later
    });

    // Calculate actual profile completeness
    const completeness = user.calculateProfileCompleteness();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Award registration points
    await gamificationService.awardPoints(user._id, 'FIRST_REPORT');

    // Send welcome notification with personalized message
    await notificationService.sendNotification(
      user._id,
      'system_announcement',
      'Welcome to Civic Issue Platform!',
      `Hi ${user.name}! Your account has been created successfully. You can now report civic issues and track their progress. Your profile is ${completeness}% complete.`,
      {
        actionUrl: '/dashboard'
      },
      ['inApp', 'email']
    );

    // Prepare response data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      location: user.location,
      citizenProfile: {
        dateOfBirth: user.citizenProfile.dateOfBirth,
        gender: user.citizenProfile.gender,
        occupation: user.citizenProfile.occupation,
        isProfileComplete: user.citizenProfile.isProfileComplete,
        profileCompleteness: user.citizenProfile.profileCompleteness,
        emergencyContact: user.citizenProfile.emergencyContact
      },
      gamification: user.gamification,
      reportStats: user.reportStats,
      preferences: user.preferences
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Civic Issue Platform.',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Duplicate value error';
      
      if (field === 'email') message = 'Email already exists';
      else if (field === 'phone') message = 'Phone number already exists';
      else if (field === 'citizenProfile.aadharNumber') message = 'Aadhar number already exists';
      
      return res.status(400).json({
        success: false,
        message,
        field
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        gamification: user.gamification,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user with comprehensive data
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get dashboard stats for citizens
    const dashboardStats = user.role === 'citizen' ? user.getDashboardStats() : null;
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      location: user.location,
      gamification: user.gamification,
      preferences: user.preferences,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    // Add citizen-specific data
    if (user.role === 'citizen' && user.citizenProfile) {
      userResponse.citizenProfile = {
        dateOfBirth: user.citizenProfile.dateOfBirth,
        gender: user.citizenProfile.gender,
        occupation: user.citizenProfile.occupation,
        isProfileComplete: user.citizenProfile.isProfileComplete,
        profileCompleteness: user.citizenProfile.profileCompleteness,
        emergencyContact: user.citizenProfile.emergencyContact
      };
      userResponse.reportStats = user.reportStats;
      userResponse.dashboardStats = dashboardStats;
    }

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced profile update
const updateProfile = async (req, res) => {
  try {
    // Validate update data
    const validation = validateProfileUpdate(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const updateData = validation.data;
    const userId = req.user.id;

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate phone/aadhar if being updated
    if (updateData.phone && updateData.phone !== currentUser.phone) {
      const existingPhone = await User.findOne({ 
        phone: updateData.phone, 
        _id: { $ne: userId } 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    if (updateData.aadharNumber && updateData.aadharNumber !== currentUser.citizenProfile?.aadharNumber) {
      const existingAadhar = await User.findOne({ 
        'citizenProfile.aadharNumber': updateData.aadharNumber, 
        _id: { $ne: userId } 
      });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          message: 'Aadhar number already exists'
        });
      }
    }

    // Prepare update object
    const updates = {};
    
    // Basic fields
    if (updateData.name) updates.name = updateData.name;
    if (updateData.phone) updates.phone = updateData.phone;
    
    // Address update
    if (updateData.address) {
      updates.address = {
        ...currentUser.address.toObject(),
        ...updateData.address
      };
      
      // Update full address
      updates.address.full = `${updates.address.street}, ${updates.address.area}, ${updates.address.city}, ${updates.address.state} - ${updates.address.pincode}`;
    }
    
    // Location update
    if (updateData.location && updateData.location.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: updateData.location.coordinates
      };
    }
    
    // Citizen profile updates
    if (updateData.dateOfBirth || updateData.gender || updateData.occupation || 
        updateData.emergencyContact || updateData.aadharNumber !== undefined) {
      
      updates.citizenProfile = {
        ...currentUser.citizenProfile.toObject(),
        ...(updateData.dateOfBirth && { dateOfBirth: updateData.dateOfBirth }),
        ...(updateData.gender && { gender: updateData.gender }),
        ...(updateData.occupation && { occupation: updateData.occupation }),
        ...(updateData.emergencyContact && { emergencyContact: updateData.emergencyContact }),
        ...(updateData.aadharNumber !== undefined && { aadharNumber: updateData.aadharNumber })
      };
    }
    
    // Preferences update
    if (updateData.preferences) {
      updates.preferences = {
        ...currentUser.preferences.toObject(),
        ...updateData.preferences
      };
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    // Recalculate profile completeness
    const completeness = user.calculateProfileCompleteness();
    await user.save();

    // Prepare response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      location: user.location,
      citizenProfile: {
        dateOfBirth: user.citizenProfile.dateOfBirth,
        gender: user.citizenProfile.gender,
        occupation: user.citizenProfile.occupation,
        isProfileComplete: user.citizenProfile.isProfileComplete,
        profileCompleteness: user.citizenProfile.profileCompleteness,
        emergencyContact: user.citizenProfile.emergencyContact
      },
      gamification: user.gamification,
      reportStats: user.reportStats,
      preferences: user.preferences,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
      profileCompleteness: completeness
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No avatar image provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.uploadedFile.url },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Avatar update failed',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send reset password notification
    await notificationService.sendNotification(
      user._id,
      'system_announcement',
      'Password Reset Request',
      'You have requested a password reset. Click the link in your email to reset your password.',
      {
        resetToken,
        actionUrl: `/reset-password/${resetToken}`
      },
      ['inApp', 'email']
    );

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      token: authToken
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};