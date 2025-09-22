const User = require('../models/User');
const Issue = require('../models/Issue');

// Get citizen dashboard with comprehensive stats
const getCitizenDashboard = async (req, res) => {
  try {
    const citizen = await User.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    const dashboardStats = await citizen.getDashboardStats();
    const recentReports = citizen.reportHistory.slice(-5).reverse(); // Get last 5 reports

    // Get detailed issue information for recent reports
    const recentIssuesDetails = await Issue.find({
      _id: { $in: recentReports.map(r => r.issueId) }
    })
    .select('issueNumber title status priority category createdAt updatedAt location address')
    .sort({ createdAt: -1 })
    .lean();

    // Combine report data with issue details
    const enhancedRecentReports = recentReports.map(report => {
      const issueDetail = recentIssuesDetails.find(
        issue => issue._id.toString() === report.issueId.toString()
      );
      return {
        ...report.toObject(),
        issueDetail
      };
    });

    res.json({
      success: true,
      data: {
        citizen: {
          id: citizen._id,
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone,
          citizenProfile: citizen.citizenProfile,
          profileCompleteness: citizen.calculateProfileCompleteness(),
          memberSince: citizen.createdAt,
          lastActive: citizen.lastActive
        },
        stats: dashboardStats,
        recentReports: enhancedRecentReports,
        gamification: {
          totalPoints: citizen.gamification?.totalPoints || 0,
          currentLevel: citizen.gamification?.level || 1,
          badges: citizen.gamification?.badges || []
        }
      }
    });
  } catch (error) {
    console.error('Get citizen dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get citizen dashboard',
      error: error.message
    });
  }
};

// Get citizen's report history with pagination
const getReportHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, dateRange } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const citizen = await User.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    // Build filter for issues
    const issueFilter = {
      reportedBy: req.user.id
    };

    if (status && status !== 'all') {
      issueFilter.status = status;
    }

    if (category && category !== 'all') {
      issueFilter.category = category;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        issueFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    // Get total count for pagination
    const totalReports = await Issue.countDocuments(issueFilter);

    // Get paginated reports
    const reports = await Issue.find(issueFilter)
      .select('issueNumber title description status priority category location address images createdAt updatedAt citizenUpdates')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enhanced reports with citizen-friendly data
    const enhancedReports = reports.map(report => ({
      ...report,
      citizenSummary: {
        issueNumber: report.issueNumber,
        title: report.title,
        status: report.status,
        statusFriendly: getCitizenFriendlyStatus(report.status),
        priority: report.priority,
        category: report.category,
        reportedOn: report.createdAt,
        lastUpdate: report.updatedAt,
        location: report.address?.full || `${report.location.coordinates[1]}, ${report.location.coordinates[0]}`,
        recentUpdate: report.citizenUpdates?.length > 0 ? 
          report.citizenUpdates[report.citizenUpdates.length - 1] : null,
        hasImages: report.images?.length > 0
      }
    }));

    res.json({
      success: true,
      data: {
        reports: enhancedReports,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReports / limitNum),
          totalReports,
          hasNext: pageNum < Math.ceil(totalReports / limitNum),
          hasPrev: pageNum > 1
        },
        summary: {
          totalReports: citizen.reportHistory.length,
          pendingReports: citizen.reportStatistics.pending,
          resolvedReports: citizen.reportStatistics.resolved
        }
      }
    });
  } catch (error) {
    console.error('Get report history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report history',
      error: error.message
    });
  }
};

// Get detailed issue information for citizen
const getCitizenIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findOne({
      $or: [
        { _id: issueId },
        { issueNumber: issueId }
      ],
      reportedBy: req.user.id
    })
    .populate('reportedBy', 'name avatar')
    .populate('assignedTo', 'name avatar department');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or you are not authorized to view it'
      });
    }

    res.json({
      success: true,
      data: {
        issue: {
          ...issue.toObject(),
          citizenSummary: issue.getCitizenSummary(),
          timeline: issue.citizenUpdates || [],
          canEdit: issue.status === 'reported' || issue.status === 'acknowledged'
        }
      }
    });
  } catch (error) {
    console.error('Get citizen issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get issue details',
      error: error.message
    });
  }
};

// Update citizen profile
const updateCitizenProfile = async (req, res) => {
  try {
    const citizen = await User.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    // Update basic profile information
    const {
      name,
      phone,
      citizenProfile = {}
    } = req.body;

    if (name) citizen.name = name;
    if (phone) citizen.phone = phone;

    // Update citizen profile fields
    const profileFields = [
      'dateOfBirth', 'gender', 'occupation', 'emergencyContact',
      'aadharNumber', 'address'
    ];

    profileFields.forEach(field => {
      if (citizenProfile[field] !== undefined) {
        if (!citizen.citizenProfile) citizen.citizenProfile = {};
        citizen.citizenProfile[field] = citizenProfile[field];
      }
    });

    // Update address if provided
    if (citizenProfile.address) {
      citizen.citizenProfile.address = {
        ...citizen.citizenProfile.address,
        ...citizenProfile.address
      };
    }

    await citizen.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        citizen: {
          id: citizen._id,
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone,
          citizenProfile: citizen.citizenProfile,
          profileCompleteness: citizen.calculateProfileCompleteness()
        }
      }
    });
  } catch (error) {
    console.error('Update citizen profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Helper function to get citizen-friendly status
const getCitizenFriendlyStatus = (status) => {
  const statusMap = {
    'reported': 'Reported - Under Review',
    'acknowledged': 'Acknowledged - Being Processed',
    'in_progress': 'In Progress - Work Started',
    'resolved': 'Resolved - Work Completed',
    'closed': 'Closed - Issue Resolved',
    'rejected': 'Not Accepted - See Details'
  };

  return statusMap[status] || status;
};

module.exports = {
  getCitizenDashboard,
  getReportHistory,
  getCitizenIssue,
  updateCitizenProfile
};