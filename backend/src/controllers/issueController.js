const Issue = require('../models/Issue');
const User = require('../models/User');
const aiService = require('../services/aiService');
const mapsService = require('../services/mapsService');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');

// Create new issue
const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = 'medium',
      location,
      address,
      isAnonymous = false,
      visibility = 'public'
    } = req.body;

    // Validate coordinates
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required'
      });
    }

    const [lng, lat] = location.coordinates;
    if (!mapsService.isValidCoordinates(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach(file => {
        images.push({
          url: file.url,
          publicId: file.filename
        });
      });
    }

    // AI analysis
    const aiAnalysis = await aiService.analyzeIssue(title, description, images);

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      reportedBy: req.user.id,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      address,
      images,
      isAnonymous,
      visibility,
      aiAnalysis,
      metadata: {
        reportingMethod: req.body.reportingMethod || 'web',
        deviceInfo: req.headers['user-agent'],
        appVersion: req.headers['app-version']
      }
    });

    // Populate the issue with user data
    await issue.populate('reportedBy', 'name avatar');

    // Award points for reporting
    await gamificationService.awardPoints(req.user.id, 'REPORT_ISSUE');

    // Send notifications to nearby field workers (if not spam)
    if (!aiAnalysis.isSpam) {
      await notifyNearbyFieldWorkers(issue);
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue: formatIssueResponse(issue, req.user.id)
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: error.message
    });
  }
};

// Get all issues with filtering and pagination
const getIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      lat,
      lng,
      radius = 5000, // 5km default radius
      assignedTo,
      reportedBy
    } = req.query;

    // Build filter object
    const filter = { visibility: 'public' };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Location-based filtering
    if (lat && lng && mapsService.isValidCoordinates(parseFloat(lat), parseFloat(lng))) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Issue.countDocuments(filter);

    // Format response
    const formattedIssues = issues.map(issue => 
      formatIssueResponse(issue, req.user?.id)
    );

    res.json({
      success: true,
      issues: formattedIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
};

// Get single issue
const getIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('resolution.resolvedBy', 'name avatar');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user can view this issue
    if (issue.visibility === 'private' && 
        issue.reportedBy._id.toString() !== req.user?.id?.toString() &&
        !['admin', 'field_worker'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      issue: formatIssueResponse(issue, req.user?.id)
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: error.message
    });
  }
};

// Update issue
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check permissions
    const canUpdate = 
      issue.reportedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'field_worker' && issue.assignedTo?.toString() === req.user.id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue'
      });
    }

    // Handle status updates
    if (updates.status && updates.status !== issue.status) {
      const oldStatus = issue.status;
      issue.updateStatus(updates.status);
      
      // Send notifications
      await notificationService.notifyIssueStatusUpdate(
        issue._id,
        oldStatus,
        updates.status,
        req.user.id
      );
    }

    // Handle assignment
    if (updates.assignedTo !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can assign issues'
        });
      }
      issue.assignedTo = updates.assignedTo;
    }

    // Update other fields
    const allowedUpdates = ['title', 'description', 'category', 'priority'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        issue[field] = updates[field];
      }
    });

    await issue.save();
    await issue.populate('reportedBy', 'name avatar');
    await issue.populate('assignedTo', 'name avatar');

    res.json({
      success: true,
      message: 'Issue updated successfully',
      issue: formatIssueResponse(issue, req.user.id)
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue',
      error: error.message
    });
  }
};

// Delete issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check permissions
    const canDelete = 
      issue.reportedBy.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    await Issue.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message
    });
  }
};

// Vote on issue
const voteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'

    const issue = await Issue.findById(id).populate('reportedBy', 'name');
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Cannot vote on own issue
    if (issue.reportedBy._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own issue'
      });
    }

    if (type === 'upvote') {
      issue.toggleUpvote(req.user.id);
      // Send notification if upvoted
      if (issue.hasUpvoted(req.user.id)) {
        await notificationService.notifyUpvote(issue._id, req.user.id);
      }
    } else if (type === 'downvote') {
      issue.toggleDownvote(req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    await issue.save();

    res.json({
      success: true,
      message: `Issue ${type}d successfully`,
      votes: {
        upvotes: issue.upvoteCount,
        downvotes: issue.downvoteCount,
        netVotes: issue.netVotes,
        userVote: issue.hasUpvoted(req.user.id) ? 'upvote' : 
                 issue.hasDownvoted(req.user.id) ? 'downvote' : null
      }
    });
  } catch (error) {
    console.error('Vote issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote on issue',
      error: error.message
    });
  }
};

// Add comment to issue
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add comment
    issue.comments.push({
      user: req.user.id,
      text
    });

    await issue.save();
    await issue.populate('comments.user', 'name avatar');

    // Award points for commenting
    await gamificationService.awardPoints(req.user.id, 'COMMENT');

    // Send notification to issue reporter
    await notificationService.notifyComment(issue._id, req.user.id, text);

    // Get the newly added comment
    const newComment = issue.comments[issue.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get issue statistics
const getIssueStats = async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          reported: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } },
          inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const resolutionStats = await Issue.aggregate([
      {
        $match: { 
          status: 'resolved',
          'tracking.isWithin48Hours': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalResolved: { $sum: 1 },
          within48Hours: { 
            $sum: { $cond: ['$tracking.isWithin48Hours', 1, 0] } 
          },
          avgResolutionTime: { $avg: '$resolution.timeTaken' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        overview: stats[0] || {},
        categories: categoryStats,
        resolution: resolutionStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue statistics',
      error: error.message
    });
  }
};

// Helper function to format issue response
const formatIssueResponse = (issue, userId) => {
  const formatted = {
    id: issue._id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority,
    status: issue.status,
    location: issue.location,
    address: issue.address,
    images: issue.images,
    reportedBy: issue.isAnonymous ? null : issue.reportedBy,
    assignedTo: issue.assignedTo,
    upvotes: issue.upvoteCount,
    downvotes: issue.downvoteCount,
    netVotes: issue.netVotes,
    comments: issue.comments || [],
    resolution: issue.resolution,
    tracking: issue.tracking,
    isAnonymous: issue.isAnonymous,
    visibility: issue.visibility,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt
  };

  // Add user-specific vote status if authenticated
  if (userId) {
    formatted.userVote = issue.hasUpvoted(userId) ? 'upvote' : 
                       issue.hasDownvoted(userId) ? 'downvote' : null;
  }

  return formatted;
};

// Helper function to notify nearby field workers
const notifyNearbyFieldWorkers = async (issue) => {
  try {
    const [lng, lat] = issue.location.coordinates;
    
    // Find field workers within 10km radius
    const nearbyWorkers = await User.find({
      role: 'field_worker',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10km
        }
      }
    });

    // Send notifications to nearby field workers
    const notifications = nearbyWorkers.map(worker =>
      notificationService.sendNotification(
        worker._id,
        'issue_created',
        'New Issue Reported Nearby',
        `A new ${issue.category.replace('_', ' ')} issue has been reported: "${issue.title}"`,
        {
          issueId: issue._id,
          distance: mapsService.calculateDistance(
            lat, lng,
            worker.location.coordinates[1],
            worker.location.coordinates[0]
          ).toFixed(1),
          actionUrl: `/issues/${issue._id}`
        },
        ['inApp', 'push']
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying nearby field workers:', error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  voteIssue,
  addComment,
  getIssueStats
};