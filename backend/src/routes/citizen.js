const express = require('express');
const {
  getCitizenDashboard,
  getReportHistory,
  getCitizenIssue,
  updateCitizenProfile
} = require('../controllers/citizenController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All citizen routes require authentication
router.use(authenticate);

// Citizen dashboard and profile routes
router.get('/dashboard', getCitizenDashboard);
router.get('/reports', getReportHistory);
router.get('/issues/:issueId', getCitizenIssue);
router.put('/profile', updateCitizenProfile);

module.exports = router;