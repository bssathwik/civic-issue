const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send notification to user
  async sendNotification(userId, type, title, message, data = {}, channels = ['inApp']) {
    try {
      // Create notification record
      const notification = await Notification.createNotification({
        recipient: userId,
        sender: data.senderId || null,
        type,
        title,
        message,
        data,
        priority: data.priority || 'medium'
      });

      // Send through different channels
      const results = {};

      if (channels.includes('push')) {
        results.push = await this.sendPushNotification(userId, title, message, data);
      }

      if (channels.includes('email')) {
        results.email = await this.sendEmailNotification(userId, title, message, data);
      }

      if (channels.includes('sms')) {
        results.sms = await this.sendSMSNotification(userId, title, message, data);
      }

      // Update notification with send results
      await this.updateNotificationChannels(notification._id, results);

      return {
        notificationId: notification._id,
        results
      };
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  // Send push notification
  async sendPushNotification(userId, title, message, data = {}) {
    try {
      // In a real implementation, you would integrate with Firebase Cloud Messaging
      // or another push notification service
      console.log(`Push notification sent to user ${userId}: ${title}`);
      
      return {
        sent: true,
        sentAt: new Date(),
        response: 'Push notification sent successfully'
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return {
        sent: false,
        sentAt: new Date(),
        response: error.message
      };
    }
  }

  // Send email notification
  async sendEmailNotification(userId, title, message, data = {}) {
    try {
      // Get user email from database
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      // Check user preferences
      if (!user.preferences.notifications.email) {
        return {
          sent: false,
          sentAt: new Date(),
          response: 'User has disabled email notifications'
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: title,
        html: this.generateEmailTemplate(title, message, data, user.name)
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Email notification (dev mode):', mailOptions);
        return {
          sent: true,
          sentAt: new Date(),
          response: 'Email sent (development mode)'
        };
      }

      const info = await this.emailTransporter.sendMail(mailOptions);
      
      return {
        sent: true,
        sentAt: new Date(),
        response: `Email sent: ${info.messageId}`
      };
    } catch (error) {
      console.error('Email notification error:', error);
      return {
        sent: false,
        sentAt: new Date(),
        response: error.message
      };
    }
  }

  // Send SMS notification
  async sendSMSNotification(userId, title, message, data = {}) {
    try {
      // Get user phone from database
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user || !user.phone) {
        throw new Error('User phone not found');
      }

      // Check user preferences
      if (!user.preferences.notifications.sms) {
        return {
          sent: false,
          sentAt: new Date(),
          response: 'User has disabled SMS notifications'
        };
      }

      // In a real implementation, integrate with Twilio or another SMS service
      console.log(`SMS sent to ${user.phone}: ${title} - ${message}`);
      
      return {
        sent: true,
        sentAt: new Date(),
        response: 'SMS sent successfully'
      };
    } catch (error) {
      console.error('SMS notification error:', error);
      return {
        sent: false,
        sentAt: new Date(),
        response: error.message
      };
    }
  }

  // Generate email template
  generateEmailTemplate(title, message, data = {}, userName = 'User') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #2196F3; color: white; padding: 20px; margin: -30px -30px 20px -30px; border-radius: 8px 8px 0 0; }
          .content { line-height: 1.6; color: #333; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Civic Issue Platform</h2>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <h3>${title}</h3>
            <p>${message}</p>
            ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated message from Civic Issue Platform. Please do not reply to this email.</p>
            <p>If you no longer wish to receive these notifications, you can update your preferences in the app.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Update notification channels
  async updateNotificationChannels(notificationId, results) {
    try {
      const updateFields = {};
      
      if (results.push) {
        updateFields['channels.push'] = results.push;
      }
      
      if (results.email) {
        updateFields['channels.email'] = results.email;
      }
      
      if (results.sms) {
        updateFields['channels.sms'] = results.sms;
      }

      await Notification.findByIdAndUpdate(notificationId, updateFields);
    } catch (error) {
      console.error('Update notification channels error:', error);
    }
  }

  // Send issue status update notification
  async notifyIssueStatusUpdate(issueId, oldStatus, newStatus, userId) {
    try {
      const Issue = require('../models/Issue');
      const issue = await Issue.findById(issueId).populate('reportedBy', 'name email');
      
      if (!issue) return;

      const statusMessages = {
        'in_review': 'Your reported issue is now being reviewed by officials.',
        'assigned': 'Your reported issue has been assigned to a field worker.',
        'in_progress': 'Work has started on your reported issue.',
        'resolved': 'Great news! Your reported issue has been resolved.',
        'closed': 'Your reported issue has been closed.',
        'rejected': 'Your reported issue has been rejected after review.'
      };

      const message = statusMessages[newStatus] || `Your issue status has been updated to ${newStatus}.`;

      // Notify the issue reporter
      if (issue.reportedBy._id.toString() !== userId?.toString()) {
        await this.sendNotification(
          issue.reportedBy._id,
          'issue_updated',
          `Issue Status Update: ${issue.title}`,
          message,
          {
            issueId: issue._id,
            oldStatus,
            newStatus,
            actionUrl: `/issues/${issue._id}`
          },
          ['inApp', 'email', 'push']
        );
      }

      // If issue is resolved, send gamification notification
      if (newStatus === 'resolved') {
        const gamificationService = require('./GamificationService');
        await gamificationService.awardPoints(issue.reportedBy._id, 'ISSUE_RESOLVED');
      }
    } catch (error) {
      console.error('Issue status notification error:', error);
    }
  }

  // Send upvote notification
  async notifyUpvote(issueId, voterId) {
    try {
      const Issue = require('../models/Issue');
      const issue = await Issue.findById(issueId).populate('reportedBy', 'name');
      
      if (!issue || issue.reportedBy._id.toString() === voterId.toString()) return;

      const User = require('../models/User');
      const voter = await User.findById(voterId);

      await this.sendNotification(
        issue.reportedBy._id,
        'issue_upvoted',
        'Your Issue Received an Upvote!',
        `${voter?.name || 'Someone'} upvoted your issue: "${issue.title}"`,
        {
          issueId: issue._id,
          voterId,
          actionUrl: `/issues/${issue._id}`
        },
        ['inApp', 'push']
      );

      // Award points for upvote received
      const gamificationService = require('./GamificationService');
      await gamificationService.awardPoints(issue.reportedBy._id, 'UPVOTE_RECEIVED');
    } catch (error) {
      console.error('Upvote notification error:', error);
    }
  }

  // Send comment notification
  async notifyComment(issueId, commenterId, commentText) {
    try {
      const Issue = require('../models/Issue');
      const issue = await Issue.findById(issueId).populate('reportedBy', 'name');
      
      if (!issue || issue.reportedBy._id.toString() === commenterId.toString()) return;

      const User = require('../models/User');
      const commenter = await User.findById(commenterId);

      await this.sendNotification(
        issue.reportedBy._id,
        'issue_commented',
        'New Comment on Your Issue',
        `${commenter?.name || 'Someone'} commented on your issue: "${issue.title}"`,
        {
          issueId: issue._id,
          commenterId,
          commentText: commentText.substring(0, 100),
          actionUrl: `/issues/${issue._id}`
        },
        ['inApp', 'push']
      );
    } catch (error) {
      console.error('Comment notification error:', error);
    }
  }

  // Send 48-hour resolution reminder
  async send48HourReminder(issueId) {
    try {
      const Issue = require('../models/Issue');
      const issue = await Issue.findById(issueId).populate('assignedTo', 'name email');
      
      if (!issue || !issue.assignedTo || issue.status === 'resolved') return;

      const hoursElapsed = (Date.now() - issue.tracking.reportedAt) / (1000 * 60 * 60);
      
      if (hoursElapsed >= 36 && hoursElapsed < 48) {
        await this.sendNotification(
          issue.assignedTo._id,
          'resolution_reminder',
          'Issue Resolution Reminder',
          `The issue "${issue.title}" needs resolution within 12 hours to meet the 48-hour target.`,
          {
            issueId: issue._id,
            hoursRemaining: Math.max(0, 48 - hoursElapsed).toFixed(1),
            actionUrl: `/issues/${issue._id}`
          },
          ['inApp', 'email', 'push']
        );
      }
    } catch (error) {
      console.error('48-hour reminder error:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({
        recipient: userId,
        isActive: true
      })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const unreadCount = await Notification.getUnreadCount(userId);

      return {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (notification && !notification.isRead) {
        notification.markAsRead();
        await notification.save();
      }

      return notification;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.markAllAsRead(userId);
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Gamification-specific notification methods
  async sendBadgeEarnedNotification(userId, badge, pointsAwarded) {
    try {
      const title = `🏆 Badge Earned: ${badge.displayName || badge.name}`;
      const message = `Congratulations! You've earned the "${badge.displayName || badge.name}" badge and received ${pointsAwarded} points. ${badge.description}`;
      
      return await this.sendNotification(
        userId,
        'achievement_earned',
        title,
        message,
        {
          badgeId: badge._id,
          badgeName: badge.name,
          badgeDisplayName: badge.displayName,
          badgeIcon: badge.icon,
          badgeRarity: badge.rarity,
          pointsAwarded,
          actionUrl: '/achievements',
          priority: badge.rarity === 'legendary' ? 'high' : 'medium',
          metadata: {
            achievementType: 'badge',
            category: badge.category,
            rarity: badge.rarity
          }
        },
        ['inApp', 'push']
      );
    } catch (error) {
      console.error('Error sending badge notification:', error);
      throw error;
    }
  }

  async sendCertificateEarnedNotification(userId, certificate, pointsAwarded) {
    try {
      const title = `🏅 Certificate Earned: ${certificate.displayName || certificate.name}`;
      const message = `Outstanding achievement! You've earned the "${certificate.displayName || certificate.name}" certificate and received ${pointsAwarded} points. ${certificate.description}`;
      
      return await this.sendNotification(
        userId,
        'achievement_earned',
        title,
        message,
        {
          certificateId: certificate._id,
          certificateName: certificate.name,
          certificateDisplayName: certificate.displayName,
          certificateLevel: certificate.level,
          pointsAwarded,
          actionUrl: '/certificates',
          priority: 'high',
          metadata: {
            achievementType: 'certificate',
            level: certificate.level,
            category: certificate.category
          }
        },
        ['inApp', 'push', 'email']
      );
    } catch (error) {
      console.error('Error sending certificate notification:', error);
      throw error;
    }
  }

  async sendLevelUpNotification(userId, oldLevel, newLevel, totalPoints) {
    try {
      const title = `🌟 Level Up: Welcome to ${newLevel}!`;
      const message = `Amazing progress! You've advanced from ${oldLevel} to ${newLevel} level with ${totalPoints} total points. Keep up the great civic engagement!`;
      
      return await this.sendNotification(
        userId,
        'level_up',
        title,
        message,
        {
          oldLevel,
          newLevel,
          totalPoints,
          actionUrl: '/profile',
          priority: 'high',
          metadata: {
            achievementType: 'level_up',
            previousLevel: oldLevel,
            currentLevel: newLevel
          }
        },
        ['inApp', 'push']
      );
    } catch (error) {
      console.error('Error sending level up notification:', error);
      throw error;
    }
  }

  async sendPointsAwardedNotification(userId, action, pointsAwarded, totalPoints, context = {}) {
    try {
      const actionMessages = {
        'REPORT_ISSUE': `📝 +${pointsAwarded} points for reporting an issue`,
        'ISSUE_VERIFIED': `✅ +${pointsAwarded} points for issue verification`,
        'VOTE_ISSUE': `👍 +${pointsAwarded} points for voting on an issue`,
        'COMMENT_ISSUE': `💬 +${pointsAwarded} points for commenting on an issue`,
        'SHARE_ISSUE': `📤 +${pointsAwarded} points for sharing an issue`,
        'ISSUE_RESOLVED': `🎯 +${pointsAwarded} points for issue resolution`,
        'DAILY_LOGIN': `📅 +${pointsAwarded} points for daily engagement`,
        'STREAK_BONUS': `🔥 +${pointsAwarded} streak bonus points`
      };

      const title = `Points Earned!`;
      const message = actionMessages[action] || `+${pointsAwarded} points earned! Total: ${totalPoints} points`;
      
      return await this.sendNotification(
        userId,
        'achievement_earned',
        title,
        message,
        {
          action,
          pointsAwarded,
          totalPoints,
          actionUrl: '/achievements',
          priority: 'low',
          metadata: {
            achievementType: 'points',
            action,
            context
          }
        },
        ['inApp'] // Only in-app for regular points to avoid spam
      );
    } catch (error) {
      console.error('Error sending points notification:', error);
      throw error;
    }
  }

  async sendStreakMilestoneNotification(userId, streakDays, bonusPoints) {
    try {
      const title = `🔥 ${streakDays}-Day Streak Achievement!`;
      const message = `Incredible consistency! You've maintained a ${streakDays}-day activity streak and earned ${bonusPoints} bonus points. Keep the momentum going!`;
      
      return await this.sendNotification(
        userId,
        'achievement_earned',
        title,
        message,
        {
          streakDays,
          bonusPoints,
          actionUrl: '/achievements',
          priority: 'medium',
          metadata: {
            achievementType: 'streak',
            streakLength: streakDays
          }
        },
        ['inApp', 'push']
      );
    } catch (error) {
      console.error('Error sending streak milestone notification:', error);
      throw error;
    }
  }

  async sendLeaderboardRankNotification(userId, newRank, previousRank, timeFrame = 'weekly') {
    try {
      if (newRank <= 10 && (previousRank > 10 || !previousRank)) {
        const title = `🏆 Top 10 Achiever!`;
        const message = `Excellent work! You're now ranked #${newRank} on the ${timeFrame} leaderboard. Your civic engagement is making a real difference!`;
        
        return await this.sendNotification(
          userId,
          'achievement_earned',
          title,
          message,
          {
            newRank,
            previousRank,
            timeFrame,
            actionUrl: '/leaderboard',
            priority: 'medium',
            metadata: {
              achievementType: 'leaderboard',
              ranking: newRank,
              timeFrame
            }
          },
          ['inApp', 'push']
        );
      }
    } catch (error) {
      console.error('Error sending leaderboard notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();