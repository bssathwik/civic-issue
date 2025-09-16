const express = require('express');
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  voteIssue,
  addComment,
  getIssueStats
} = require('../controllers/issueController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  validateCreateIssue,
  validateUpdateIssue,
  validateComment,
  validateId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Public routes (with optional auth for user-specific data)
router.get('/', optionalAuth, validatePagination, getIssues);
router.get('/stats', getIssueStats);
router.get('/:id', optionalAuth, validateId, getIssue);

// Protected routes
router.use(authenticate);

// Issue management
router.post('/', uploadMultiple('images', 5), validateCreateIssue, createIssue);
router.put('/:id', validateId, validateUpdateIssue, updateIssue);
router.delete('/:id', validateId, deleteIssue);

// Voting and commenting
router.post('/:id/vote', validateId, voteIssue);
router.post('/:id/comments', validateId, validateComment, addComment);

module.exports = router;