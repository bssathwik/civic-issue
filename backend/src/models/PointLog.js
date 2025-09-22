const mongoose = require('mongoose');

const pointLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['report_issue', 'vote_issue', 'comment_issue', 'share_issue', 'resolve_issue', 'verify_issue', 'other'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  relatedIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

pointLogSchema.index({ user: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model('PointLog', pointLogSchema);