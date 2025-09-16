const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Issue category is required'],
    enum: [
      'road_maintenance',
      'street_lighting',
      'water_supply',
      'garbage_collection',
      'drainage',
      'public_transport',
      'traffic_management',
      'parks_recreation',
      'healthcare',
      'education',
      'safety_security',
      'noise_pollution',
      'air_pollution',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'reported'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90; // latitude
        },
        message: 'Invalid coordinates'
      }
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  images: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiAnalysis: {
    spamScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    isSpam: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    suggestedCategory: String,
    sentimentScore: Number,
    tags: [String]
  },
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionImages: [{
      url: String,
      publicId: String
    }],
    timeTaken: Number // in hours
  },
  tracking: {
    reportedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    assignedAt: Date,
    inProgressAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    isWithin48Hours: {
      type: Boolean,
      default: true
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  metadata: {
    deviceInfo: String,
    appVersion: String,
    reportingMethod: {
      type: String,
      enum: ['mobile', 'web'],
      default: 'mobile'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, priority: -1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, status: 1 });

// Virtual for upvote count
issueSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for downvote count
issueSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

// Virtual for net votes
issueSchema.virtual('netVotes').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Method to check if user has upvoted
issueSchema.methods.hasUpvoted = function(userId) {
  return this.upvotes.some(vote => vote.user.toString() === userId.toString());
};

// Method to check if user has downvoted
issueSchema.methods.hasDownvoted = function(userId) {
  return this.downvotes.some(vote => vote.user.toString() === userId.toString());
};

// Method to toggle upvote
issueSchema.methods.toggleUpvote = function(userId) {
  const hasUpvoted = this.hasUpvoted(userId);
  const hasDownvoted = this.hasDownvoted(userId);

  if (hasUpvoted) {
    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {
    if (hasDownvoted) {
      this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    }
    this.upvotes.push({ user: userId });
  }
};

// Method to toggle downvote
issueSchema.methods.toggleDownvote = function(userId) {
  const hasUpvoted = this.hasUpvoted(userId);
  const hasDownvoted = this.hasDownvoted(userId);

  if (hasDownvoted) {
    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {
    if (hasUpvoted) {
      this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    }
    this.downvotes.push({ user: userId });
  }
};

// Method to update tracking timestamps
issueSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  const now = new Date();
  
  switch (newStatus) {
    case 'in_review':
      this.tracking.reviewedAt = now;
      break;
    case 'assigned':
      this.tracking.assignedAt = now;
      break;
    case 'in_progress':
      this.tracking.inProgressAt = now;
      break;
    case 'resolved':
      this.tracking.resolvedAt = now;
      this.resolution.resolvedAt = now;
      // Calculate time taken in hours
      this.resolution.timeTaken = (now - this.tracking.reportedAt) / (1000 * 60 * 60);
      // Check if resolved within 48 hours
      this.tracking.isWithin48Hours = this.resolution.timeTaken <= 48;
      break;
    case 'closed':
      this.tracking.closedAt = now;
      break;
  }
};

module.exports = mongoose.model('Issue', issueSchema);