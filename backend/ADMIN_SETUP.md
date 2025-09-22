# Admin User Creation Guide

This guide explains how to create an administrator user for the Civic Issue App.

## Prerequisites

1. **Node.js** installed on your system
2. **MongoDB** running (local or remote)
3. **Environment file** configured (`.env`)

## Setup Environment

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Update the `.env` file with your database connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/civic-issue-db
   ```

## Methods to Create Admin User

### Method 1: Default Admin (Quick Setup)
Run the simple script with default credentials:

```bash
# Using npm script
npm run create-admin

# Or directly
node create-admin.js

# Or using the batch file (Windows)
create-admin.bat
```

**Default Credentials:**
- Email: `admin@civic.com`
- Password: `admin123`
- Role: `admin`
- Level: `Platinum`

### Method 2: Custom Admin (Interactive)
Create an admin with custom credentials:

```bash
# Using npm script
npm run create-admin-interactive

# Or directly
node create-admin-interactive.js
```

This will prompt you for:
- Admin name
- Admin email
- Admin password (minimum 6 characters)
- Admin phone number

### Method 3: Environment Variables
Set environment variables and run the interactive script:

```bash
set ADMIN_NAME="John Doe"
set ADMIN_EMAIL="john.admin@civic.com"
set ADMIN_PASSWORD="securepassword123"
set ADMIN_PHONE="+1234567890"
node create-admin-interactive.js
```

## Admin User Features

The created admin user will have:

- **Full admin privileges** (role: 'admin')
- **Verified status** (can access all features immediately)
- **Platinum level** with 1000 points
- **Administrator badge**
- **All notification preferences** enabled
- **Active status**

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **Change the default password** immediately after first login
2. **Use strong passwords** (minimum 8 characters with mixed case, numbers, symbols)
3. **Don't use default credentials** in production
4. **Secure your `.env` file** (don't commit it to version control)
5. **Use HTTPS** in production environments

## Troubleshooting

### Common Issues:

1. **"MongoDB connection error"**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env`
   - Verify network connectivity

2. **"Admin user already exists"**
   - The script will detect existing admins
   - Use the interactive script to replace existing admin
   - Or manually delete from database first

3. **"Module not found"**
   - Run `npm install` to install dependencies
   - Ensure you're in the backend directory

### Verifying Admin Creation

After creating an admin, you can verify in several ways:

1. **MongoDB Compass**: Connect and check the `users` collection
2. **API Testing**: Try logging in with the admin credentials
3. **Application**: Use the admin credentials to log into the app

## Next Steps

1. **Test the login** with your admin credentials
2. **Change the password** through the app interface
3. **Configure other admin settings** as needed
4. **Set up additional admin users** if required

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all prerequisites are met
3. Ensure your database connection is working
4. Review the `.env` file configuration

---

**Quick Commands Summary:**
```bash
# Quick default admin
npm run create-admin

# Custom admin (interactive)
npm run create-admin-interactive

# Windows batch file
create-admin.bat
```