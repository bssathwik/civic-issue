const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const PointLog = require('../models/PointLog');
const gamificationService = require('../services/GamificationService');
const { authenticate } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { body, validationResult } = require('express-validator');

// Remove the initialization since the service is already instantiated

/**
 * @route   GET /api/gamification/badges
 * @desc    Get all available badges
 * @access  Public
 */
router.get('/badges', async (req, res) => {
  try {
    const { category, rarity, isActive = true } = req.query;
    
    const filter = { isActive };
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;
    
    const badges = await Badge.find(filter).sort({ category: 1, rarity: 1 });
    
    res.json({
      success: true,
      data: badges,
      count: badges.length
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/certificates
 * @desc    Get all available certificates
 * @access  Public
 */
router.get('/certificates', async (req, res) => {
  try {
    const { category, level, isActive = true } = req.query;
    
    const filter = { isActive };
    if (category) filter.category = category;
    if (level) filter.level = level;
    
    const certificates = await Certificate.find(filter).sort({ level: 1, category: 1 });
    
    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/user-achievements/:userId
 * @desc    Get user's achievements, badges, and certificates
 * @access  Private
 */
router.get('/user-achievements/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get user achievements
    const achievements = await Achievement.find({ user: userId })
      .populate('badge')
      .populate('certificate')
      .sort({ awardedAt: -1 });
    
    // Get user point logs
    const pointLogs = await PointLog.find({ user: userId })
      .populate('relatedIssue', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Get user statistics
    const userStats = await gamificationService.getUserStats(userId);
    
    res.json({
      success: true,
      data: {
        achievements,
        pointLogs,
        statistics: userStats
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard with top users
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeFrame = 'all_time', limit = 10 } = req.query;
    
    let matchStage = {};
    
    if (timeFrame !== 'all_time') {
      const now = new Date();
      let startDate;
      
      switch (timeFrame) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        matchStage.createdAt = { $gte: startDate };
      }
    }
    
    const leaderboard = await PointLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
          actionsCount: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          actionsCount: 1,
          'user.name': 1,
          'user.avatar': 1,
          'user.gamification.level': 1,
          'user.gamification.badges': 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: leaderboard,
      timeFrame,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gamification/award-points
 * @desc    Manually award points to a user (Admin only)
 * @access  Admin
 */
router.post('/award-points', [
  authenticate,
  admin,
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('points').isInt({ min: 1, max: 1000 }).withMessage('Points must be between 1 and 1000'),
  body('reason').isLength({ min: 1, max: 200 }).withMessage('Reason is required and must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { userId, points, reason } = req.body;
    
    const result = await gamificationService.awardPoints(
      userId,
      'other',
      points,
      null,
      `Admin award: ${reason}`
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Points awarded successfully',
      data: result
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gamification/create-badge
 * @desc    Create a new badge (Admin only)
 * @access  Admin
 */
router.post('/create-badge', [
  authenticate,
  admin,
  body('name').isLength({ min: 1, max: 50 }).withMessage('Badge name is required'),
  body('displayName').isLength({ min: 1, max: 100 }).withMessage('Display name is required'),
  body('description').isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('icon').isLength({ min: 1 }).withMessage('Icon is required'),
  body('category').isIn(['reporting', 'engagement', 'consistency', 'social', 'verification', 'milestone']).withMessage('Invalid category'),
  body('rarity').isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const badge = new Badge(req.body);
    await badge.save();
    
    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge
    });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create badge',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gamification/initialize
 * @desc    Initialize default badges and certificates (Admin only)
 * @access  Admin
 */
router.post('/initialize', [authenticate, admin], async (req, res) => {
  try {
    const badgesResult = await gamificationService.initializeDefaultBadges();
    
    res.json({
      success: true,
      message: 'Gamification system initialized successfully',
      data: {
        badgesInitialized: badgesResult
      }
    });
  } catch (error) {
    console.error('Initialize gamification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize gamification system',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/stats/overview
 * @desc    Get gamification system overview stats (Admin only)
 * @access  Admin
 */
router.get('/stats/overview', [authenticate, admin], async (req, res) => {
  try {
    const [
      totalBadges,
      totalCertificates,
      totalAchievements,
      totalPointsAwarded
    ] = await Promise.all([
      Badge.countDocuments({ isActive: true }),
      Certificate.countDocuments({ isActive: true }),
      Achievement.countDocuments(),
      PointLog.aggregate([
        { $group: { _id: null, total: { $sum: '$points' } } }
      ])
    ]);
    
    const stats = {
      totalBadges,
      totalCertificates,
      totalAchievements,
      totalPointsAwarded: totalPointsAwarded[0]?.total || 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

module.exports = router;