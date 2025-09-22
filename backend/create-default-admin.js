// Script to create default admin user
// Username: admin@civic.com
// Password: Admin123
// Run with: node create-default-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB using environment variable or fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issue-db';
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@civic.com' });
    if (existingAdmin) {
      console.log('\n✅ Admin user already exists!');
      console.log('📧 Email: admin@civic.com');
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎭 Role:', existingAdmin.role);
      console.log('✅ Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
      console.log('\n💡 You can use these credentials to login:');
      console.log('   Email: admin@civic.com');
      console.log('   Password: Admin123');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@civic.com',
      password: 'Admin123', // This will be hashed automatically by pre-save middleware
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
    
    console.log('\n🎉 Default admin user created successfully!');
    console.log('==========================================');
    console.log('📧 Email: admin@civic.com');
    console.log('🔑 Password: Admin123');
    console.log('👤 Name: Administrator');
    console.log('📱 Phone: +1234567890');
    console.log('🎭 Role: admin');
    console.log('🌟 Level: Platinum');
    console.log('✅ Verified: Yes');
    console.log('🔄 Status: Active');
    console.log('\n🚀 You can now login with these credentials!');
    console.log('\n⚠️  SECURITY NOTE: Please change the password after first login!');

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    console.error('Details:', error.message);
    
    if (error.code === 11000) {
      console.log('\n🔍 This usually means an admin user already exists.');
      console.log('💡 Try logging in with: admin@civic.com / Admin123');
    }
    
    if (error.name === 'ValidationError') {
      console.log('\n📝 Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Show startup message
console.log('🔧 Creating Default Admin User');
console.log('==============================');
console.log('📊 Target Database: civic-issue-db');
console.log('👤 Admin Email: admin@civic.com');
console.log('🔑 Admin Password: Admin123');
console.log('');

createDefaultAdmin();