const Badge = require('../models/Badge');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const PointLog = require('../models/PointLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('./notificationService');

class GamificationService {
  constructor() {
    this.pointsConfig = {
      REPORT_ISSUE: 10,
      UPVOTE_RECEIVED: 5,
      DOWNVOTE_RECEIVED: -2,
      COMMENT: 3,
      ISSUE_RESOLVED: 20,
      FIRST_REPORT: 25,
      WEEKLY_ACTIVE: 15,
      MONTHLY_ACTIVE: 50,
      HELPFUL_COMMENT: 8,
      VERIFIED_REPORT: 30,
      VOTE_ISSUE: 2,
      SHARE_ISSUE: 5
    };
  }

  // Initialize default badges with the new designs
  async initializeDefaultBadges() {
    const defaultBadges = [
      {
        name: 'first_step',
        displayName: 'First Step',
        description: 'Earned for submitting your first issue report!',
        icon: '👣',
        color: '#FFD700',
        category: 'milestone',
        rarity: 'common',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 1,
          timeFrame: 'all_time'
        },
        points: 10
      },
      {
        name: 'steady_contributor',
        displayName: 'Steady Contributor',
        description: 'Awarded for reporting issues consistently for 7 consecutive days!',
        icon: '📅',
        color: '#4CAF50',
        category: 'consistency',
        rarity: 'uncommon',
        requirements: {
          type: 'streak',
          metric: 'consecutive_days',
          threshold: 7,
          timeFrame: 'daily'
        },
        points: 50
      },
      {
        name: 'top_reporter',
        displayName: 'Top Reporter',
        description: 'Top Reporter of the Month! Keep up the great work!',
        icon: '🏆',
        color: '#FF6B35',
        category: 'reporting',
        rarity: 'rare',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 20,
          timeFrame: 'monthly'
        },
        points: 100
      },
      {
        name: 'community_helper',
        displayName: 'Community Helper',
        description: 'Helping the Community by actively engaging with others!',
        icon: '🤝',
        color: '#27AE60',
        category: 'engagement',
        rarity: 'uncommon',
        requirements: {
          type: 'count',
          metric: 'votes_given',
          threshold: 50,
          timeFrame: 'all_time'
        },
        points: 30
      },
      {
        name: 'social_sharer',
        displayName: 'Social Sharer',
        description: 'Social Advocate! Thanks for spreading awareness!',
        icon: '📢',
        color: '#9B59B6',
        category: 'social',
        rarity: 'common',
        requirements: {
          type: 'count',
          metric: 'shares_made',
          threshold: 10,
          timeFrame: 'all_time'
        },
        points: 25
      },
      {
        name: 'verified_reporter',
        displayName: 'Verified Reporter',
        description: 'Verified & Trusted! Your reports are making a real impact!',
        icon: '🛡️',
        color: '#3498DB',
        category: 'verification',
        rarity: 'rare',
        requirements: {
          type: 'count',
          metric: 'issues_verified',
          threshold: 5,
          timeFrame: 'all_time'
        },
        points: 75
      },
      {
        name: 'eco_warrior',
        displayName: 'Eco Warrior',
        description: 'Environmental Advocate! Fighting for a cleaner environment!',
        icon: '🌱',
        color: '#16A085',
        category: 'reporting',
        rarity: 'uncommon',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 10,
          timeFrame: 'all_time'
        },
        points: 40
      },
      {
        name: 'voice_of_community',
        displayName: 'Voice of the Community',
        description: 'Top Voter! Your voice matters!',
        icon: '�',
        color: '#F39C12',
        category: 'engagement',
        rarity: 'uncommon',
        requirements: {
          type: 'count',
          metric: 'votes_given',
          threshold: 100,
          timeFrame: 'all_time'
        },
        points: 60
      },
      {
        name: 'feedback_star',
        displayName: 'Feedback Star',
        description: 'Feedback Champion! Your comments help improve the community!',
        icon: '💬',
        color: '#85C1E9',
        category: 'engagement',
        rarity: 'common',
        requirements: {
          type: 'count',
          metric: 'comments_made',
          threshold: 20,
          timeFrame: 'all_time'
        },
        points: 35
      },
      {
        name: 'milestone_10',
        displayName: '10 Reports',
        description: 'Milestone Achiever! 10 reports submitted!',
        icon: '🎯',
        color: '#CD7F32',
        category: 'milestone',
        rarity: 'common',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 10,
          timeFrame: 'all_time'
        },
        points: 50
      },
      {
        name: 'milestone_50',
        displayName: '50 Reports',
        description: 'Milestone Achiever! 50 reports submitted!',
        icon: '🎯',
        color: '#C0C0C0',
        category: 'milestone',
        rarity: 'uncommon',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 50,
          timeFrame: 'all_time'
        },
        points: 150
      },
      {
        name: 'milestone_100',
        displayName: '100 Reports',
        description: 'Milestone Achiever! 100 reports submitted!',
        icon: '🎯',
        color: '#FFD700',
        category: 'milestone',
        rarity: 'rare',
        requirements: {
          type: 'count',
          metric: 'issues_reported',
          threshold: 100,
          timeFrame: 'all_time'
        },
        points: 300
      },
      {
        name: 'hall_of_fame',
        displayName: 'Hall of Fame',
        description: 'Hall of Fame Contributor! You are a civic hero!',
        icon: '👑',
        color: '#1C1C1C',
        category: 'milestone',
        rarity: 'legendary',
        requirements: {
          type: 'combined',
          metric: 'total_points',
          threshold: 1000,
          timeFrame: 'all_time'
        },
        points: 500
      }
    ];

    try {
      for (const badgeData of defaultBadges) {
        await Badge.findOneAndUpdate(
          { name: badgeData.name },
          badgeData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Default badges initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing default badges:', error);
      return false;
    }
  }

  // Legacy badges configuration for backward compatibility
  get badges() {
    return {
      FIRST_REPORTER: {
        name: 'Quality Reporter',
        description: 'All reports verified by officials',
        icon: '✅',
        points: 300
      },
      STREAK_MASTER: {
        name: 'Streak Master',
        description: 'Maintained 7-day activity streak',
        icon: '🔥',
        points: 75
      }
    };
  }

  // Award points to user with new tracking system
  async awardPoints(userId, action, additionalPoints = 0, relatedIssueId = null, description = '') {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      // Ensure user has gamification data initialized
      if (!user.gamification) {
        user.gamification = {
          points: 0,
          level: 1,
          badges: [],
          streaks: {},
          achievements: []
        };
        await user.save();
      }

      const oldLevel = user.gamification.level || 1;
      const oldPoints = user.gamification.points || 0;

      const points = this.pointsConfig[action] || additionalPoints;
      user.addPoints(points);
      
      // Log the points in the new system
      await PointLog.create({
        user: userId,
        action: action.toLowerCase().replace('_', '_'),
        points,
        relatedIssue: relatedIssueId,
        description
      });
      
      // Update streak if applicable
      if (action === 'REPORT_ISSUE' || action === 'COMMENT') {
        this.updateStreak(user);
      }

      const newLevel = user.gamification.level;
      const newPoints = user.gamification.points;

      await user.save();

      // Send points notification (for significant point awards)
      if (points >= 5) {
        await notificationService.sendPointsAwardedNotification(
          userId, 
          action, 
          points, 
          newPoints, 
          { relatedIssueId, description }
        );
      }

      // Check for level up and send notification
      if (oldLevel !== newLevel) {
        await notificationService.sendLevelUpNotification(
          userId,
          oldLevel,
          newLevel,
          newPoints
        );
      }

      // Check for new badges
      const newBadges = await this.checkAndAwardBadges(user);

      // Check for streak milestones
      await this.checkStreakMilestones(userId, user);

      return {
        pointsAwarded: points,
        totalPoints: newPoints,
        level: newLevel,
        newBadges,
        leveledUp: oldLevel !== newLevel
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return null;
    }
  }

  // Enhanced badge checking system
  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const badges = await Badge.find({ isActive: true });
      const userStats = await this.getUserStats(userId);
      const newlyAwardedBadges = [];

      for (const badge of badges) {
        // Check if user already has this badge
        const hasBadge = user.gamification.badges.some(
          userBadge => userBadge.name === badge.displayName
        );

        if (!hasBadge && this.checkBadgeRequirement(badge, userStats)) {
          // Award the badge
          user.gamification.badges.push({
            name: badge.displayName,
            description: badge.description,
            earnedAt: new Date()
          });

          // Award points for the badge
          user.addPoints(badge.points);

          // Log achievement
          await Achievement.create({
            user: userId,
            badge: badge._id,
            pointsAwarded: badge.points,
            type: 'badge',
            details: `Earned ${badge.displayName} badge`
          });

          // Send notification
          await this.sendBadgeNotification(userId, badge);

          newlyAwardedBadges.push(badge);
        }
      }

      if (newlyAwardedBadges.length > 0) {
        await user.save();
        console.log(`✅ Awarded ${newlyAwardedBadges.length} new badges to user ${userId}`);
      }

      return newlyAwardedBadges;
    } catch (error) {
      console.error('❌ Error checking and awarding badges:', error);
      return [];
    }
  }

  // Check badge requirements
  checkBadgeRequirement(badge, userStats) {
    const { requirements } = badge;
    
    switch (requirements.type) {
      case 'count':
        return userStats[requirements.metric] >= requirements.threshold;
      
      case 'streak':
        if (requirements.metric === 'consecutive_days') {
          return userStats.currentStreak >= requirements.threshold;
        }
        return false;
      
      case 'combined':
        return userStats[requirements.metric] >= requirements.threshold;
      
      default:
        return false;
    }
  }

  // Get comprehensive user statistics
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      const pointLogs = await PointLog.find({ user: userId });
      
      // Calculate various statistics
      const stats = {
        issues_reported: pointLogs.filter(log => log.action === 'report_issue').length,
        votes_given: pointLogs.filter(log => log.action === 'vote_issue').length,
        comments_made: pointLogs.filter(log => log.action === 'comment_issue').length,
        shares_made: pointLogs.filter(log => log.action === 'share_issue').length,
        issues_verified: pointLogs.filter(log => log.action === 'verify_issue').length,
        total_points: user.gamification.points,
        currentStreak: user.gamification.streak.current,
        longestStreak: user.gamification.streak.longest
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return {};
    }
  }

  // Check for streak milestones and send notifications
  async checkStreakMilestones(userId, user) {
    try {
      const currentStreak = user.gamification.streak.current;
      const milestones = [7, 14, 30, 60, 100];
      
      // Check if current streak hits any milestone
      if (milestones.includes(currentStreak)) {
        const bonusPoints = currentStreak >= 100 ? 50 : 
                          currentStreak >= 60 ? 30 : 
                          currentStreak >= 30 ? 20 : 
                          currentStreak >= 14 ? 15 : 10;
        
        // Award bonus points
        user.addPoints(bonusPoints);
        await user.save();
        
        // Log bonus points
        await PointLog.create({
          user: userId,
          action: 'streak_bonus',
          points: bonusPoints,
          description: `${currentStreak}-day streak milestone bonus`
        });
        
        // Send notification
        await notificationService.sendStreakMilestoneNotification(
          userId,
          currentStreak,
          bonusPoints
        );
      }
    } catch (error) {
      console.error('Error checking streak milestones:', error);
    }
  }

  // Send badge notification
  async sendBadgeNotification(userId, badge) {
    try {
      await Notification.create({
        recipient: userId,
        type: 'badge_earned',
        title: 'New Badge Earned! 🎉',
        message: `Congratulations! You've earned the "${badge.displayName}" badge: ${badge.description}`,
        metadata: {
          badgeId: badge._id,
          badgeName: badge.displayName,
          badgeIcon: badge.icon,
          pointsAwarded: badge.points
        }
      });
    } catch (error) {
      console.error('Error sending badge notification:', error);
    }
  }

  // Update user activity streak
  updateStreak(user) {
    const today = new Date();
    const lastActivity = user.gamification.streak.lastActivity;

    if (!lastActivity) {
      // First activity
      user.gamification.streak.current = 1;
      user.gamification.streak.lastActivity = today;
    } else {
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        user.gamification.streak.current += 1;
        user.gamification.streak.longest = Math.max(
          user.gamification.streak.longest,
          user.gamification.streak.current
        );
      } else if (daysDiff > 1) {
        // Streak broken
        user.gamification.streak.current = 1;
      }
      
      user.gamification.streak.lastActivity = today;
    }
  }

  // Check and award badges
  async checkAndAwardBadges(user) {
    try {
      // Ensure user has gamification data and badges array
      if (!user.gamification) {
        user.gamification = {
          points: 0,
          level: 1,
          badges: [],
          streaks: {},
          achievements: []
        };
        await user.save();
      }
      
      if (!user.gamification.badges) {
        user.gamification.badges = [];
        await user.save();
      }
      
      const earnedBadges = user.gamification.badges.map(badge => badge.name);
      const newBadges = [];

      // Check for First Reporter badge
      if (!earnedBadges.includes('First Reporter')) {
        const Issue = require('../models/Issue');
        const issueCount = await Issue.countDocuments({ reportedBy: user._id });
        
        if (issueCount >= 1) {
          await this.awardBadge(user, 'FIRST_REPORTER');
          newBadges.push('First Reporter');
        }
      }

      // Check for Community Champion badge
      if (!earnedBadges.includes('Community Champion')) {
        const Issue = require('../models/Issue');
        const issues = await Issue.find({ reportedBy: user._id });
        const totalUpvotes = issues.reduce((sum, issue) => sum + issue.upvotes.length, 0);
        
        if (totalUpvotes >= 50) {
          await this.awardBadge(user, 'COMMUNITY_CHAMPION');
          newBadges.push('Community Champion');
        }
      }

      // Check for Problem Solver badge
      if (!earnedBadges.includes('Problem Solver')) {
        const Issue = require('../models/Issue');
        const resolvedCount = await Issue.countDocuments({
          reportedBy: user._id,
          status: 'resolved'
        });
        
        if (resolvedCount >= 10) {
          await this.awardBadge(user, 'PROBLEM_SOLVER');
          newBadges.push('Problem Solver');
        }
      }

      // Check for Streak Master badge
      if (!earnedBadges.includes('Streak Master') && user.gamification.streak.longest >= 7) {
        await this.awardBadge(user, 'STREAK_MASTER');
        newBadges.push('Streak Master');
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Award a specific badge
  async awardBadge(user, badgeKey) {
    try {
      const badge = this.badges[badgeKey];
      if (!badge) return false;

      // Check if user already has this badge
      const hasBadge = user.gamification.badges.some(b => b.name === badge.name);
      if (hasBadge) return false;

      // Add badge to user
      user.gamification.badges.push({
        name: badge.name,
        description: badge.description,
        earnedAt: new Date()
      });

      // Award badge points
      user.addPoints(badge.points);

      await user.save();

      // Send enhanced notification
      await notificationService.sendBadgeEarnedNotification(
        user._id,
        badge,
        badge.points
      );

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Get user's gamification stats
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const Issue = require('../models/Issue');
      
      // Get user's issue statistics
      const [totalIssues, resolvedIssues, totalUpvotes] = await Promise.all([
        Issue.countDocuments({ reportedBy: userId }),
        Issue.countDocuments({ reportedBy: userId, status: 'resolved' }),
        Issue.aggregate([
          { $match: { reportedBy: user._id } },
          { $project: { upvoteCount: { $size: '$upvotes' } } },
          { $group: { _id: null, total: { $sum: '$upvoteCount' } } }
        ])
      ]);

      return {
        points: user.gamification.points,
        level: user.gamification.level,
        badges: user.gamification.badges,
        streak: user.gamification.streak,
        stats: {
          totalIssues,
          resolvedIssues,
          totalUpvotes: totalUpvotes[0]?.total || 0,
          resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10, period = 'all') {
    try {
      let matchStage = {};
      
      if (period === 'weekly') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        matchStage.updatedAt = { $gte: weekAgo };
      } else if (period === 'monthly') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        matchStage.updatedAt = { $gte: monthAgo };
      }

      const leaderboard = await User.aggregate([
        { $match: { ...matchStage, isActive: true } },
        {
          $project: {
            name: 1,
            avatar: 1,
            'gamification.points': 1,
            'gamification.level': 1,
            'gamification.badges': 1
          }
        },
        { $sort: { 'gamification.points': -1 } },
        { $limit: limit }
      ]);

      return leaderboard.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        name: user.name,
        avatar: user.avatar,
        points: user.gamification.points,
        level: user.gamification.level,
        badgeCount: user.gamification.badges.length
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}

module.exports = new GamificationService();