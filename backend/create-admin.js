// Script to create an admin user for testing
// Run this with: node create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issue-db';
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@civic.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@civic.com');
      console.log('🎭 Role:', existingAdmin.role);
      console.log('📝 If you want to reset the password, delete this user first and run the script again.');
      process.exit(0);
    }

    // Create admin user with specified credentials  
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@civic.com',
      password: 'Admin123', // This will be hashed automatically
      phone: '+1234567890',
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
    console.log('📧 Email: admin@civic.com');
    console.log('🔑 Password: Admin123');
    console.log('👤 Name: Administrator');
    console.log('🎭 Role: admin');
    console.log('🌟 Level: Platinum');
    console.log('✅ Verified: Yes');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('🔍 Admin user already exists with this email.');
    }
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();