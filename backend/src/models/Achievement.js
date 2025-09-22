const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    default: null
  },
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  awardedAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['badge', 'certificate', 'level', 'milestone'],
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

achievementSchema.index({ user: 1, type: 1, awardedAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);