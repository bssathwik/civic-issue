const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Certificate display name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Certificate description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  template: {
    type: String,
    required: [true, 'Certificate template is required'],
    enum: ['contribution', 'community_champion', 'top_reporter', 'monthly_achiever', 'annual_contributor']
  },
  category: {
    type: String,
    enum: ['contribution', 'achievement', 'milestone', 'recognition'],
    required: true
  },
  level: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  requirements: {
    type: {
      type: String,
      enum: ['badge_count', 'points_threshold', 'time_based', 'combined'],
      required: true
    },
    criteria: [{
      metric: {
        type: String,
        enum: [
          'total_points',
          'badges_earned',
          'issues_reported',
          'issues_resolved',
          'consecutive_months',
          'top_reporter_months',
          'community_engagement'
        ],
        required: true
      },
      threshold: {
        type: Number,
        required: true
      },
      timeFrame: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly', 'all_time'],
        default: 'all_time'
      }
    }]
  },
  points: {
    type: Number,
    default: 100,
    min: 0
  },
  validityPeriod: {
    type: Number, // in months
    default: null // null means permanent
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemCertificate: {
    type: Boolean,
    default: true
  },
  design: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    borderColor: {
      type: String,
      default: '#3498db'
    },
    textColor: {
      type: String,
      default: '#2c3e50'
    },
    logo: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
certificateSchema.index({ category: 1, isActive: 1 });
certificateSchema.index({ level: 1, isActive: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);