# 🏛️ CivicConnect - Civic Issue Reporting Platform

A comprehensive civic issue reporting platform that empowers citizens to make their communities better through collaborative issue reporting and resolution.

![Platform Screenshot](https://github.com/user-attachments/assets/4212f528-ff74-457f-9a05-2605d6a79d0f)

## 🚀 Features

### Core Functionality
- **📱 Multi-Platform Support**: React Native mobile app, React.js web app, Node.js backend
- **📸 Photo Upload**: Visual evidence with automatic image processing and optimization
- **📍 GPS Location**: Automatic location tracking for precise issue positioning
- **🤖 AI Spam Detection**: Advanced AI-powered spam filtering and issue classification
- **👥 Community Validation**: Upvote/downvote system for community-driven prioritization
- **🎮 Gamification System**: Points, levels, badges, and leaderboards to encourage participation
- **🗺️ Google Maps Integration**: Interactive maps for issue visualization and navigation
- **🔔 Real-time Notifications**: Push, email, and SMS notifications
- **🧠 ML-Powered Classification**: Automatic issue categorization using machine learning
- **⏱️ 48hr Resolution Tracking**: Monitor resolution times and performance metrics

### User Roles
- **Citizens**: Report issues, vote, comment, track progress
- **Field Workers**: Manage assigned issues, update status, resolve problems
- **Administrators**: Full platform management, analytics, user management

### Advanced Features
- **Real-time Dashboard**: Live statistics and analytics
- **Anonymous Reporting**: Privacy-focused issue reporting
- **Multi-language Support**: Internationalization ready
- **Offline Capability**: Work without internet connection
- **File Management**: Secure image storage and processing
- **Email Integration**: Automated notifications and updates
- **Rate Limiting**: API protection and abuse prevention

## 🏗️ Architecture

### Backend (Node.js + MongoDB)
```
backend/
├── src/
│   ├── models/          # Database models (User, Issue, Notification)
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication, validation, file upload
│   ├── services/        # AI, gamification, maps, notifications
│   ├── config/          # Database and app configuration
│   └── utils/           # Helper functions
├── uploads/             # File storage
└── package.json
```

**Key Technologies:**
- Express.js for REST API
- MongoDB with Mongoose ODM
- JWT authentication
- Multer + Sharp for image processing
- Socket.io for real-time features
- Google Maps API integration
- AI/ML services for spam detection
- Comprehensive middleware stack

### Web App (React.js + TypeScript)
```
web-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth, Notifications)
│   ├── services/        # API service layer
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript definitions
└── package.json
```

**Key Technologies:**
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- TanStack Query for data fetching
- Axios for HTTP requests
- Context API for state management

### Mobile App (React Native + Expo)
```
mobile-app/
├── src/
│   ├── components/      # Mobile-specific components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript definitions
└── package.json
```

**Key Technologies:**
- React Native with Expo
- TypeScript support
- Native device features (Camera, GPS, Push notifications)
- Offline-first architecture
- Cross-platform compatibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Web App Setup
```bash
cd web-app
npm install
npm start
```

### Mobile App Setup
```bash
cd mobile-app
npm install
npm run web  # For web testing
# or
npx expo start  # For mobile development
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/civic-issue-app
JWT_SECRET=your-jwt-secret
GOOGLE_MAPS_API_KEY=your-google-maps-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
AI_API_KEY=your-ai-service-key
```

**Web App (.env)**
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Issues
- `GET /api/issues` - List issues with filtering
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get single issue
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/vote` - Vote on issue
- `POST /api/issues/:id/comments` - Add comment

### Users & Gamification
- `GET /api/users/notifications` - Get notifications
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/gamification/stats` - Get user stats

## 🎯 Key Features Implementation

### 🤖 AI Spam Detection
- Rule-based filtering for common spam patterns
- Content analysis for suspicious keywords
- Sentiment analysis for quality assessment
- Automatic issue categorization
- Confidence scoring system

### 🎮 Gamification System
- **Points System**: Earn points for activities
- **Levels**: Bronze, Silver, Gold, Platinum
- **Badges**: Achievement system with 7+ badge types
- **Streaks**: Daily activity tracking
- **Leaderboards**: Community rankings

### 📍 Location Services
- GPS coordinate validation
- Address geocoding and reverse geocoding
- Nearby places discovery
- Distance calculations
- Google Maps integration

### 🔔 Notification System
- Multi-channel delivery (Push, Email, SMS)
- Real-time in-app notifications
- Customizable user preferences
- Automated status updates
- 48-hour resolution reminders

## 🚦 Current Status

### ✅ Completed Features
- ✅ Complete backend API with all core features
- ✅ Database models and relationships
- ✅ Authentication and authorization system
- ✅ File upload and image processing
- ✅ AI-powered spam detection and classification
- ✅ Comprehensive gamification system
- ✅ Google Maps service integration
- ✅ Real-time notification system
- ✅ React web app with homepage and navigation
- ✅ Material-UI component system
- ✅ React Native mobile app structure

### 🚧 In Progress
- 🔄 Complete web app pages and components
- 🔄 Mobile app implementation
- 🔄 WebSocket real-time features
- 🔄 Admin dashboard interface
- 🔄 Field worker management interface

### 📋 Todo
- [ ] Comprehensive testing suite
- [ ] Production deployment configuration
- [ ] Advanced analytics dashboard
- [ ] Integration with external services
- [ ] Performance optimization
- [ ] Documentation completion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Backend API**: http://localhost:3000/api
- **Web App**: http://localhost:3001
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/api

## 🏆 Acknowledgments

- Material-UI for the beautiful component library
- Expo for React Native development platform
- Google Maps for location services
- MongoDB for the database solution
- All contributors and the open-source community

---

**Made with ❤️ for building better communities**
