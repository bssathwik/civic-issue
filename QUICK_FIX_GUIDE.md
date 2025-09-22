# 🚀 QUICK FIX GUIDE

## Current Issues and Solutions

### Issue 1: Terminal Directory Navigation
**Problem**: Commands running from wrong directory
**Solution**: Use absolute paths

### Issue 2: Admin Dashboard Startup
**Problem**: Dashboard not starting properly
**Solution**: Follow steps below

## ✅ WORKING SOLUTION - Step by Step

### Step 1: Start Backend Server
```cmd
# Open Command Prompt and run:
cd "D:\SIH2025\civic-issue-app\backend"
npm install
npm start
```

### Step 2: Start Admin Dashboard  
```cmd
# Open ANOTHER Command Prompt and run:
cd "D:\SIH2025\civic-issue-app\admin-dasboard"
npm install
npm run dev
```

### Step 3: Access Application
- **Backend API**: http://localhost:3000
- **Admin Dashboard**: http://localhost:5000
- **Login**: http://localhost:5000/login

## 🔧 Alternative: Use the Batch File

From the `D:\SIH2025\civic-issue-app` directory, run:
```cmd
start-admin-system.bat
```

## 🎯 Default Login Credentials

For testing:
- **Email**: admin@example.com
- **Password**: admin123

*Note: You'll need to create an admin user first using the backend scripts*

## ⚠️ Prerequisites

### Required Software:
1. **Node.js** (v16+)
2. **MongoDB** (running on localhost:27017)

### MongoDB Setup:
```cmd
# If MongoDB is not running, start it:
mongod --dbpath "C:\data\db"
```

### Create Admin User:
```cmd
cd "D:\SIH2025\civic-issue-app\backend"
node create-default-admin.js
```

## 🐛 Troubleshooting

### If Backend Won't Start:
1. Check if MongoDB is running
2. Verify port 3000 is not in use
3. Check `.env` file exists in backend directory

### If Admin Dashboard Won't Start:
1. Verify port 5000 is not in use  
2. Check if `node_modules` exists
3. Run `npm install` if needed

### If Login Doesn't Work:
1. Ensure backend is running
2. Create an admin user first
3. Check browser console for errors

## 📁 File Structure Check

Your structure should look like:
```
civic-issue-app/
├── backend/
│   ├── package.json ✅
│   ├── src/app.js ✅
│   └── .env ✅
├── admin-dasboard/
│   ├── package.json ✅
│   ├── server.ts ✅
│   └── src/ ✅
└── start-admin-system.bat ✅
```

## 🚀 Quick Commands Reference

### Kill Processes on Ports:
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Kill process on port 5000  
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### Test Backend API:
```cmd
curl http://localhost:3000/api/health
```

### Reset and Restart:
```cmd
# Backend
cd "D:\SIH2025\civic-issue-app\backend"
rmdir /s node_modules
npm install
npm start

# Admin Dashboard
cd "D:\SIH2025\civic-issue-app\admin-dasboard"  
rmdir /s node_modules
npm install
npm run dev
```

## ✅ Success Indicators

You'll know it's working when:

1. **Backend Terminal Shows**:
   ```
   Server running on port 3000
   MongoDB connected successfully
   ```

2. **Dashboard Terminal Shows**:
   ```
   > Ready on http://0.0.0.0:5000
   > Socket.IO server running at ws://0.0.0.0:5000/api/socketio
   ```

3. **Browser Shows**:
   - http://localhost:5000 → Login page
   - After login → Dashboard with real data

---

**If you're still having issues, try the manual startup commands above instead of using the terminal integration.**