@echo off
echo Creating Admin User for Civic Issue App
echo =======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the correct directory
if not exist "create-admin.js" (
    echo Error: create-admin.js not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found
    echo Creating .env file from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo .env file created. Please update it with your settings.
        echo.
    ) else (
        echo .env.example not found. Please create a .env file manually.
        echo.
    )
)

echo Choose an option:
echo 1. Create default admin (admin@civic.com / admin123)
echo 2. Create custom admin (interactive)
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Creating default admin user...
    node create-admin.js
) else if "%choice%"=="2" (
    echo Starting interactive admin creation...
    node create-admin-interactive.js
) else if "%choice%"=="3" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
)

echo.
pause