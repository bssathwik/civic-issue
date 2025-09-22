const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit'); // DISABLED
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const citizenRoutes = require('./routes/citizen');
const gamificationRoutes = require('./routes/gamification');
const notificationRoutes = require('./routes/notifications');
const verificationRoutes = require('./routes/verification');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : [
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://localhost:5000', // Admin dashboard
        'http://localhost:19006', // Expo dev server
        'http://localhost:19000', // Expo web
        'http://10.207.93.220:3000', // Current network IP for mobile testing
        'http://10.207.93.220:19006', // Current Expo dev server on network IP
        'http://10.207.93.220:8081', // Current Expo dev server alternate port
        'http://192.168.1.19:3000', // Previous network IP (keeping for compatibility)
        'http://192.168.1.19:19006', // Previous Expo dev server on network IP
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'app-version']
}));

// Custom request logging for debugging multiple requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api', limiter); // DISABLED - No rate limiting

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Civic API is running',
    version: '2.0.0-citizen-enhanced',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: ['citizen-management', 'enhanced-registration', 'report-tracking']
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Civic Issue Reporting Platform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/avatar': 'Update user avatar',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password',
        'POST /api/auth/logout': 'Logout user'
      },
      issues: {
        'GET /api/issues': 'Get all issues with filtering',
        'GET /api/issues/:id': 'Get single issue',
        'POST /api/issues': 'Create new issue',
        'PUT /api/issues/:id': 'Update issue',
        'DELETE /api/issues/:id': 'Delete issue',
        'POST /api/issues/:id/vote': 'Vote on issue (upvote/downvote)',
        'POST /api/issues/:id/upvote': 'Upvote issue',
        'POST /api/issues/:id/downvote': 'Downvote issue',
        'POST /api/issues/:id/comments': 'Add comment to issue',
        'GET /api/issues/stats': 'Get issue statistics'
      },
      users: {
        'GET /api/users/:id/profile': 'Get user profile',
        'GET /api/users/notifications': 'Get user notifications',
        'PUT /api/users/notifications/:id/read': 'Mark notification as read',
        'PUT /api/users/notifications/read-all': 'Mark all notifications as read',
        'GET /api/users/leaderboard': 'Get gamification leaderboard',
        'GET /api/users/gamification/stats': 'Get user gamification stats',
        'GET /api/users/dashboard/stats': 'Get user dashboard statistics',
        'GET /api/users/search': 'Search users (admin only)'
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  // Get network IP address
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let networkIP = '10.207.93.220'; // Default to your current IP
  
  // Try to find the actual network IP
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal && 
          (address.address.startsWith('192.168.') || 
           address.address.startsWith('10.207.') ||
           address.address.startsWith('172.16.'))) {
        networkIP = address.address;
        break;
      }
    }
  }
  
  console.log(`
🚀 Civic Issue Platform API Server
🌍 Environment: ${process.env.NODE_ENV}
📡 Server running on port ${PORT}
🌐 Accessible on all network interfaces
🔗 API Endpoints: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
🔗 External Access: http://${networkIP}:${PORT}/api
📱 Mobile App Endpoint: http://${networkIP}:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;