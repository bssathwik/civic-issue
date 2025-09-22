@echo off
echo Starting Civic Issue Management System...
echo.

echo Starting Backend Server...
cd /d "D:\SIH2025\civic-issue-app\backend"
start "Backend Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo Starting Admin Dashboard...
cd /d "D:\SIH2025\civic-issue-app\admin-dasboard"
start "Admin Dashboard" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Admin Dashboard: http://localhost:5000
echo.
pause