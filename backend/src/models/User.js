const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['citizen', 'field_worker', 'admin'],
    default: 'citizen'
  },
  avatar: {
    type: String,
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: {
    street: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    ward: {
      type: String,
      default: ''
    },
    area: {
      type: String,
      default: ''
    },
    landmark: {
      type: String,
      default: ''
    },
    full: {
      type: String,
      default: ''
    }
  },
  // Citizen-specific information
  citizenProfile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    occupation: {
      type: String,
      default: ''
    },
    aadharNumber: {
      type: String,
      sparse: true, // Allow null but unique when present
      match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number']
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Enhanced report tracking for citizens
  reportStats: {
    totalReports: {
      type: Number,
      default: 0
    },
    pendingReports: {
      type: Number,
      default: 0
    },
    resolvedReports: {
      type: Number,
      default: 0
    },
    rejectedReports: {
      type: Number,
      default: 0
    },
    reportHistory: [{
      issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue'
      },
      issueNumber: String, // Human-readable issue ID like ISS001
      title: String,
      status: String,
      reportedAt: Date,
      lastUpdated: Date
    }],
    averageResolutionTime: {
      type: Number,
      default: 0 // in hours
    }
  },
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    badges: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: Date
    },
    achievements: [{
      type: String,
      earnedAt: Date
    }]
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  verificationTokenExpires: Date
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update gamification level based on points
userSchema.methods.updateLevel = function() {
  if (this.gamification.points >= 1000) {
    this.gamification.level = 'Platinum';
  } else if (this.gamification.points >= 500) {
    this.gamification.level = 'Gold';
  } else if (this.gamification.points >= 100) {
    this.gamification.level = 'Silver';
  } else {
    this.gamification.level = 'Bronze';
  }
};

// Add points and update level
userSchema.methods.addPoints = function(points) {
  this.gamification.points += points;
  this.updateLevel();
};

// Add a new report to citizen's history
userSchema.methods.addReport = function(issueId, issueNumber, title, status) {
  this.reportStats.reportHistory.unshift({
    issueId,
    issueNumber,
    title,
    status,
    reportedAt: new Date(),
    lastUpdated: new Date()
  });
  
  this.reportStats.totalReports += 1;
  if (status === 'reported' || status === 'in_review' || status === 'assigned' || status === 'in_progress') {
    this.reportStats.pendingReports += 1;
  }
  
  // Keep only last 50 reports in history
  if (this.reportStats.reportHistory.length > 50) {
    this.reportStats.reportHistory = this.reportStats.reportHistory.slice(0, 50);
  }
};

// Update report status in citizen's history
userSchema.methods.updateReportStatus = function(issueId, newStatus, oldStatus) {
  const report = this.reportStats.reportHistory.find(
    r => r.issueId.toString() === issueId.toString()
  );
  
  if (report) {
    report.status = newStatus;
    report.lastUpdated = new Date();
    
    // Update counters
    if (oldStatus === 'reported' || oldStatus === 'in_review' || oldStatus === 'assigned' || oldStatus === 'in_progress') {
      this.reportStats.pendingReports -= 1;
    }
    
    if (newStatus === 'resolved') {
      this.reportStats.resolvedReports += 1;
      // Award points for resolved issues
      this.addPoints(10);
    } else if (newStatus === 'rejected') {
      this.reportStats.rejectedReports += 1;
    } else if (newStatus === 'reported' || newStatus === 'in_review' || newStatus === 'assigned' || newStatus === 'in_progress') {
      this.reportStats.pendingReports += 1;
    }
  }
};

// Calculate profile completeness percentage
userSchema.methods.calculateProfileCompleteness = function() {
  let completeness = 0;
  const totalFields = 10;
  
  if (this.name) completeness += 1;
  if (this.email) completeness += 1;
  if (this.phone) completeness += 1;
  if (this.address.street) completeness += 1;
  if (this.address.city) completeness += 1;
  if (this.address.pincode) completeness += 1;
  if (this.citizenProfile.dateOfBirth) completeness += 1;
  if (this.citizenProfile.gender) completeness += 1;
  if (this.citizenProfile.occupation) completeness += 1;
  if (this.location.coordinates[0] !== 0 && this.location.coordinates[1] !== 0) completeness += 1;
  
  this.citizenProfile.profileCompleteness = Math.round((completeness / totalFields) * 100);
  this.citizenProfile.isProfileComplete = this.citizenProfile.profileCompleteness >= 70;
  
  return this.citizenProfile.profileCompleteness;
};

// Get citizen dashboard stats
userSchema.methods.getDashboardStats = function() {
  return {
    totalReports: this.reportStats.totalReports,
    pendingReports: this.reportStats.pendingReports,
    resolvedReports: this.reportStats.resolvedReports,
    rejectedReports: this.reportStats.rejectedReports,
    points: this.gamification.points,
    level: this.gamification.level,
    profileCompleteness: this.citizenProfile.profileCompleteness,
    recentReports: this.reportStats.reportHistory.slice(0, 5)
  };
};

module.exports = mongoose.model('User', userSchema);