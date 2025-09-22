const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock user data for testing
const users = [
  {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In real app, this would be hashed
    phone: '1234567890',
    role: 'citizen'
  }
];

// Mock issues data
const issues = [];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role = 'citizen' } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }
  
  // Create new user
  const newUser = {
    _id: String(users.length + 1),
    name,
    email,
    password, // In real app, hash this
    phone,
    role
  };
  
  users.push(newUser);
  
  // Generate mock token
  const token = 'mock-jwt-token-' + newUser._id;
  
  res.json({
    success: true,
    message: 'Registration successful!',
    token,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Check password (in real app, compare hashed passwords)
  if (user.password !== password) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Generate mock token
  const token = 'mock-jwt-token-' + user._id;
  
  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

app.get('/api/auth/me', (req, res) => {
  // Mock getting current user
  const user = users[0]; // Return first user for testing
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// Issues routes
app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    data: {
      issues,
      totalCount: issues.length,
      currentPage: 1,
      totalPages: 1
    }
  });
});

app.post('/api/issues', (req, res) => {
  const newIssue = {
    _id: String(issues.length + 1),
    ...req.body,
    reportedBy: users[0]._id,
    upvotes: 0,
    downvotes: 0,
    status: 'reported',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  issues.push(newIssue);
  
  res.json({
    success: true,
    data: newIssue
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Mock Civic Issue API Server
📡 Server running on port ${PORT}
🌐 Accessible on all network interfaces
🔧 This is a test server for mobile app development

📱 Current mobile app configuration:
   - Computer IP: 10.207.93.220
   - API URL: http://10.207.93.220:${PORT}/api
   - Status: ✅ Ready for mobile connection

🎯 Test your connection using the mobile app "Test Connection" button!
  `);
});

module.exports = app;
