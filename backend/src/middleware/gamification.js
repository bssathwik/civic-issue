const GamificationService = require('../services/GamificationService');

// Initialize gamification service
const gamificationService = new GamificationService();

/**
 * Middleware to automatically award points for various user actions
 */
const gamificationMiddleware = {
  // Award points for reporting an issue
  async reportIssue(req, res, next) {
    try {
      if (res.locals.issueCreated && req.user) {
        const issueId = res.locals.issueId;
        const userId = req.user.id;
        
        // Award points for reporting
        const result = await gamificationService.awardPoints(
          userId,
          'REPORT_ISSUE',
          0,
          issueId,
          'Reported a new issue'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.newBadges = result.newBadges;
        }
        
        console.log(`Awarded points for issue report: User ${userId}, Issue ${issueId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (reportIssue):', error);
      next(); // Continue without failing the main request
    }
  },

  // Award points for voting on an issue
  async voteIssue(req, res, next) {
    try {
      if (res.locals.voteProcessed && req.user) {
        const issueId = req.params.id;
        const userId = req.user.id;
        
        const result = await gamificationService.awardPoints(
          userId,
          'VOTE_ISSUE',
          0,
          issueId,
          'Voted on an issue'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.newBadges = result.newBadges;
        }
        
        console.log(`Awarded points for vote: User ${userId}, Issue ${issueId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (voteIssue):', error);
      next();
    }
  },

  // Award points for commenting on an issue
  async commentIssue(req, res, next) {
    try {
      if (res.locals.commentAdded && req.user) {
        const issueId = req.params.id;
        const userId = req.user.id;
        
        const result = await gamificationService.awardPoints(
          userId,
          'COMMENT',
          0,
          issueId,
          'Commented on an issue'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.newBadges = result.newBadges;
        }
        
        console.log(`Awarded points for comment: User ${userId}, Issue ${issueId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (commentIssue):', error);
      next();
    }
  },

  // Award points when an issue is resolved
  async resolveIssue(req, res, next) {
    try {
      if (res.locals.issueResolved) {
        const issue = res.locals.issue;
        const reporterId = issue.reportedBy;
        
        // Award points to the original reporter
        const result = await gamificationService.awardPoints(
          reporterId,
          'ISSUE_RESOLVED',
          0,
          issue._id,
          'Issue was resolved'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.reporterBadges = result.newBadges;
        }
        
        console.log(`Awarded resolution points to reporter: ${reporterId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (resolveIssue):', error);
      next();
    }
  },

  // Award points for sharing an issue
  async shareIssue(req, res, next) {
    try {
      if (res.locals.shareProcessed && req.user) {
        const issueId = req.params.id;
        const userId = req.user.id;
        
        const result = await gamificationService.awardPoints(
          userId,
          'SHARE_ISSUE',
          0,
          issueId,
          'Shared an issue'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.newBadges = result.newBadges;
        }
        
        console.log(`Awarded points for share: User ${userId}, Issue ${issueId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (shareIssue):', error);
      next();
    }
  },

  // Award points for receiving upvotes
  async receiveUpvote(req, res, next) {
    try {
      if (res.locals.upvoteReceived) {
        const issue = res.locals.issue;
        const reporterId = issue.reportedBy;
        
        const result = await gamificationService.awardPoints(
          reporterId,
          'UPVOTE_RECEIVED',
          0,
          issue._id,
          'Received upvote on issue'
        );
        
        console.log(`Awarded upvote points to reporter: ${reporterId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (receiveUpvote):', error);
      next();
    }
  },

  // Award points for verified reports
  async verifyReport(req, res, next) {
    try {
      if (res.locals.reportVerified) {
        const issue = res.locals.issue;
        const reporterId = issue.reportedBy;
        
        const result = await gamificationService.awardPoints(
          reporterId,
          'VERIFIED_REPORT',
          0,
          issue._id,
          'Report was verified by admin'
        );
        
        if (result && result.newBadges && result.newBadges.length > 0) {
          res.locals.verificationBadges = result.newBadges;
        }
        
        console.log(`Awarded verification points to reporter: ${reporterId}`);
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (verifyReport):', error);
      next();
    }
  },

  // Check for first-time actions and award bonus points
  async checkFirstTimeActions(req, res, next) {
    try {
      if (req.user) {
        const userId = req.user.id;
        const userStats = await gamificationService.getUserStats(userId);
        
        // Check for first report
        if (res.locals.issueCreated && userStats.issues_reported === 1) {
          await gamificationService.awardPoints(
            userId,
            'FIRST_REPORT',
            0,
            res.locals.issueId,
            'First issue report'
          );
        }
      }
      next();
    } catch (error) {
      console.error('Gamification middleware error (checkFirstTimeActions):', error);
      next();
    }
  },

  // Add badge information to response
  addBadgeInfo(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.locals.newBadges && res.locals.newBadges.length > 0) {
        if (typeof data === 'object' && data !== null) {
          data.newBadges = res.locals.newBadges;
        }
      }
      
      if (res.locals.reporterBadges && res.locals.reporterBadges.length > 0) {
        if (typeof data === 'object' && data !== null) {
          data.reporterBadges = res.locals.reporterBadges;
        }
      }
      
      if (res.locals.verificationBadges && res.locals.verificationBadges.length > 0) {
        if (typeof data === 'object' && data !== null) {
          data.verificationBadges = res.locals.verificationBadges;
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  }
};

module.exports = gamificationMiddleware;