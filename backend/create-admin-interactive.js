// Enhanced script to create an admin user
// Usage: 
//   node create-admin-interactive.js
//   Or with environment variables:
//   ADMIN_NAME="John Doe" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="newpassword" node create-admin-interactive.js

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./src/models/User');

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to prompt for password (hidden input would be better, but this is simple)
function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', (char) => {
      char = char + '';
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUser() {
  try {
    // Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issue-db';
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB');

    let adminName = process.env.ADMIN_NAME;
    let adminEmail = process.env.ADMIN_EMAIL;
    let adminPassword = process.env.ADMIN_PASSWORD;
    let adminPhone = process.env.ADMIN_PHONE;

    // If environment variables not provided, ask interactively
    if (!adminName || !adminEmail || !adminPassword) {
      console.log('\n🔧 Admin User Creation Tool');
      console.log('=====================================');
      
      if (!adminName) {
        adminName = await askQuestion('Enter admin name (default: System Administrator): ') || 'System Administrator';
      }
      
      if (!adminEmail) {
        adminEmail = await askQuestion('Enter admin email (default: admin@civic.com): ') || 'admin@civic.com';
      }
      
      if (!adminPassword) {
        adminPassword = await askPassword('Enter admin password (min 6 characters): ');
        if (adminPassword.length < 6) {
          console.log('❌ Password must be at least 6 characters long');
          process.exit(1);
        }
      }
      
      if (!adminPhone) {
        adminPhone = await askQuestion('Enter admin phone (optional, default: +1234567890): ') || '+1234567890';
      }
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`⚠️  Admin user with email '${adminEmail}' already exists!`);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎭 Role:', existingAdmin.role);
      
      const overwrite = await askQuestion('Do you want to delete and recreate? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
      
      await User.deleteOne({ email: adminEmail });
      console.log('🗑️  Existing admin user deleted.');
    }

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // This will be hashed automatically
      phone: adminPhone,
      role: 'admin',
      isVerified: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      gamification: {
        points: 1000,
        level: 'Platinum',
        badges: [{
          name: 'Administrator',
          description: 'System Administrator Badge',
          earnedAt: new Date()
        }],
        streak: {
          current: 0,
          longest: 0
        }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        language: 'en'
      }
    });

    await adminUser.save();
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', adminName);
    console.log('📱 Phone:', adminPhone);
    console.log('🎭 Role: admin');
    console.log('🌟 Level: Platinum');
    console.log('✅ Verified: Yes');
    console.log('🔑 Password: [hidden]');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('🔍 Admin user already exists with this email.');
    }
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

createAdminUser();