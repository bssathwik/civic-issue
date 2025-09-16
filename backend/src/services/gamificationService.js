const User = require('../models/User');
const Notification = require('../models/Notification');

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
      VERIFIED_REPORT: 30
    };

    this.badges = {
      FIRST_REPORTER: {
        name: 'First Reporter',
        description: 'Reported your first civic issue',
        icon: '🏆',
        points: 25
      },
      COMMUNITY_CHAMPION: {
        name: 'Community Champion',
        description: 'Received 50+ upvotes',
        icon: '⭐',
        points: 100
      },
      PROBLEM_SOLVER: {
        name: 'Problem Solver',
        description: 'Had 10 issues resolved',
        icon: '🔧',
        points: 200
      },
      ACTIVE_CITIZEN: {
        name: 'Active Citizen',
        description: 'Active for 30 consecutive days',
        icon: '🏃',
        points: 150
      },
      HELPFUL_NEIGHBOR: {
        name: 'Helpful Neighbor',
        description: 'Made 100+ helpful comments',
        icon: '🤝',
        points: 100
      },
      QUALITY_REPORTER: {
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

  // Award points to user
  async awardPoints(userId, action, additionalPoints = 0) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const points = this.pointsConfig[action] || additionalPoints;
      user.addPoints(points);
      
      // Update streak if applicable
      if (action === 'REPORT_ISSUE' || action === 'COMMENT') {
        this.updateStreak(user);
      }

      await user.save();

      // Check for new badges
      await this.checkAndAwardBadges(user);

      return {
        pointsAwarded: points,
        totalPoints: user.gamification.points,
        level: user.gamification.level
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return null;
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

      // Send notification
      await Notification.createNotification({
        recipient: user._id,
        type: 'achievement_earned',
        title: `Badge Earned: ${badge.name}`,
        message: `Congratulations! You've earned the "${badge.name}" badge. ${badge.description}`,
        data: {
          badgeId: badgeKey,
          points: badge.points
        },
        priority: 'medium'
      });

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