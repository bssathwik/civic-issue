const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Badge display name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Badge icon is required']
  },
  color: {
    type: String,
    default: '#3498db'
  },
  category: {
    type: String,
    enum: ['reporting', 'engagement', 'consistency', 'social', 'verification', 'milestone'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  requirements: {
    type: {
      type: String,
      enum: ['count', 'streak', 'percentage', 'time_based', 'combined'],
      required: true
    },
    metric: {
      type: String,
      enum: [
        'issues_reported',
        'issues_verified',
        'votes_given',
        'comments_made',
        'shares_made',
        'consecutive_days',
        'total_points',
        'resolved_issues',
        'upvotes_received'
      ],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    timeFrame: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'all_time'],
      default: 'all_time'
    }
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemBadge: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
badgeSchema.index({ category: 1, isActive: 1 });
badgeSchema.index({ rarity: 1, isActive: 1 });

module.exports = mongoose.model('Badge', badgeSchema);