const express = require('express');
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  voteIssue,
  upvoteIssue,
  downvoteIssue,
  addComment,
  getIssueStats,
  getMyIssues
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

// Specific protected routes (must be before /:id)
router.get('/my-issues', authenticate, getMyIssues);

// Public parameterized route (after specific routes to avoid conflicts)
router.get('/:id', optionalAuth, validateId, getIssue);

// Protected routes
router.use(authenticate);

// Issue management
router.post('/', 
  uploadMultiple('images', 5), 
  // Parse JSON fields from FormData
  (req, res, next) => {
    if (req.body.location && typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location data format'
        });
      }
    }
    
    // Convert string booleans to actual booleans
    if (req.body.isAnonymous === 'true') req.body.isAnonymous = true;
    if (req.body.isAnonymous === 'false') req.body.isAnonymous = false;
    
    next();
  },
  validateCreateIssue, 
  createIssue
);
router.put('/:id', validateId, validateUpdateIssue, updateIssue);
router.delete('/:id', validateId, deleteIssue);

// Voting and commenting
router.post('/:id/vote', validateId, voteIssue);
router.post('/:id/upvote', validateId, upvoteIssue);
router.post('/:id/downvote', validateId, downvoteIssue);
router.post('/:id/comments', validateId, validateComment, addComment);

module.exports = router;