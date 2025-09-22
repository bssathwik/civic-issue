# Admin Dashboard Integration

This directory contains the integrated admin dashboard for the Civic Issue Management System. The dashboard has been made dynamic and connected to the backend API.

## Features Implemented

### 🔧 API Integration
- ✅ Complete API service layer for backend communication
- ✅ Authentication system with JWT tokens  
- ✅ Real-time data fetching from backend endpoints
- ✅ Error handling and loading states

### 🎯 Dashboard Functionality
- ✅ Dynamic overview with real statistics
- ✅ Issues management (view, filter, assign, update status)
- ✅ User management (citizens and field workers)
- ✅ Authentication and protected routes
- ✅ Responsive design with animations

### 📊 Data Management
- ✅ Issues: Create, read, update, assign, status tracking
- ✅ Users: View citizens and workers, profile management
- ✅ Statistics: Real-time dashboard metrics
- ✅ Filtering and search capabilities

## Quick Start

### Prerequisites
- Node.js (v16 or later)
- MongoDB running on localhost:27017
- Backend server running on port 3000

### Option 1: Use the Startup Script
```cmd
# Run from the civic-issue-app directory
start-admin-system.bat
```

### Option 2: Manual Setup

1. **Start Backend Server**
   ```cmd
   cd backend
   npm install
   npm start
   ```
   Backend will run on http://localhost:3000

2. **Start Admin Dashboard**
   ```cmd
   cd admin-dasboard
   npm install
   npm run dev
   ```
   Dashboard will run on http://localhost:5000

### Option 3: Custom Port Configuration
The dashboard is now configured to run on port 5000 by default. If you want to change it:

1. Edit `admin-dasboard/.env.local`:
   ```
   PORT=your_desired_port
   ```

## Usage

### Default Login
For testing purposes, you can use these credentials:
- **Email:** admin@example.com  
- **Password:** admin123

### Creating Admin Users
Use the backend scripts to create admin users:
```cmd
cd backend
node create-admin.js
```

## Architecture

### Frontend (admin-dasboard)
- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **Animations:** Framer Motion
- **State:** React hooks with custom API hooks
- **Auth:** JWT with localStorage and React Context

### Backend Integration
- **API Base:** `/api` endpoints from backend server
- **Authentication:** Bearer token in Authorization header
- **Data Flow:** 
  - Login → Get JWT token → Store in localStorage
  - API calls include token in headers
  - Protected routes redirect to login if unauthenticated

### Key Components
1. **API Services** (`src/services/api.ts`)
   - Issues management
   - User management  
   - Authentication
   - Statistics retrieval

2. **Authentication** (`src/hooks/useAuth.tsx`)
   - Login/logout functionality
   - Token management
   - Route protection

3. **Dashboard Pages**
   - `/` - Redirects to dashboard or login
   - `/login` - Authentication form
   - `/dashboard` - Main admin interface

## API Endpoints Used

### Issues
- `GET /api/issues` - List issues with filters
- `GET /api/issues/:id` - Get single issue
- `PUT /api/issues/:id` - Update issue (assign, status, etc.)
- `GET /api/issues/stats` - Issue statistics

### Users  
- `GET /api/users` - List users with filters
- `GET /api/users/:id` - Get user profile
- `GET /api/users/stats` - User statistics

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/create` - Create admin users

## Environment Variables

### Admin Dashboard (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=ws://localhost:5000
PORT=5000
```

### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civic-issue-app
JWT_SECRET=civic-connect-2025-super-secret-key-for-authentication
JWT_EXPIRES_IN=7d
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend server is running
   - Check port numbers match between frontend and backend

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Ensure admin user exists in database

3. **Database Issues**
   - Ensure MongoDB is running
   - Check database connection string

4. **Build/Runtime Errors**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript compilation errors

### Development Tips

1. **API Testing**
   - Use the provided Postman collection in `backend/Admin_API_Collection.postman_collection.json`
   - Check browser dev tools Network tab for API calls

2. **Database Management**
   - Use MongoDB Compass to view/edit data
   - Run `node test-db.js` in backend to test connection

3. **Adding Features**
   - Update API service types in `src/services/api.ts`
   - Add new hooks in `src/hooks/` for data fetching
   - Use existing UI components from `src/components/ui/`

## Next Steps

### Enhancements to Add
- [ ] Real-time notifications with WebSocket
- [ ] Advanced filtering and search
- [ ] Batch operations for issues
- [ ] User role management
- [ ] Analytics and reporting
- [ ] Mobile app integration
- [ ] File upload for issue images
- [ ] Map integration for location visualization

### Performance Optimizations
- [ ] Implement caching strategies
- [ ] Add pagination for large datasets
- [ ] Optimize API calls with React Query
- [ ] Add service worker for offline functionality

## Security Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- CORS is configured in backend for development
- All admin routes require authentication
- Rate limiting is implemented on backend API

## Contributing

When making changes:
1. Update TypeScript interfaces in `src/services/api.ts`
2. Add proper error handling for API calls
3. Include loading states for better UX
4. Test authentication flows
5. Update this README if adding new features

---

**Status:** ✅ **COMPLETE** - Admin dashboard is fully integrated with backend
**Last Updated:** September 19, 2025