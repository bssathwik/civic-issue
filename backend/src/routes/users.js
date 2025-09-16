const express = require('express');
const {
  getUserProfile,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getLeaderboard,
  getGamificationStats,
  searchUsers
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/leaderboard', getLeaderboard);
router.get('/:id/profile', validateId, getUserProfile);

// Protected routes
router.use(authenticate);

// User-specific routes
router.get('/notifications', validatePagination, getUserNotifications);
router.put('/notifications/:id/read', validateId, markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.get('/gamification/stats', getGamificationStats);

// Admin routes
router.get('/search', authorize('admin'), validatePagination, searchUsers);

module.exports = router;