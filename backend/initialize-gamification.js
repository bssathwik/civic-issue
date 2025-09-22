#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const gamificationService = require('./src/services/GamificationService');
const CertificateService = require('./src/services/CertificateService');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function initializeGamificationSystem() {
  console.log('🚀 Initializing Civic Issue App Gamification System...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Initialize services
    const certificateService = new CertificateService();
    
    console.log('📋 Step 1: Initializing Badges...');
    const badgesResult = await gamificationService.initializeDefaultBadges();
    
    console.log('🏆 Step 2: Initializing Certificates...');
    const certificatesResult = await certificateService.initializeDefaultCertificates();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ GAMIFICATION SYSTEM INITIALIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📈 Badges initialized: ${badgesResult ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🏅 Certificates initialized: ${certificatesResult ? 'SUCCESS' : 'FAILED'}`);
    
    if (badgesResult && certificatesResult) {
      console.log('\n🎉 Your Civic Issue App is now ready with the complete gamification system!');
      console.log('\n📚 Available Badge Categories:');
      console.log('   • 👣 First Step - for new users');
      console.log('   • 📅 Steady Contributor - for consistent reporting');
      console.log('   • 🏆 Top Reporter - for high-volume reporters');
      console.log('   • 🤝 Community Helper - for civic engagement');
      console.log('   • 📢 Social Sharer - for spreading awareness');
      console.log('   • 🛡️ Verified Reporter - for quality reports');
      console.log('   • 🌱 Eco Warrior - for environmental advocacy');
      console.log('   • 👍 Voice of Community - for active voting');
      console.log('   • 💬 Feedback Star - for helpful comments');
      console.log('   • 🎯 Milestone Badges - for achievement levels');
      console.log('   • 👑 Hall of Fame - for exceptional contributors');
      
      console.log('\n🏆 Available Certificates:');
      console.log('   • Certificate of Contribution - for consistent long-term participation');
      console.log('   • Community Champion Certificate - for earning multiple badges');
      console.log('   • Top Reporter Certificate - monthly recognition');
      console.log('   • Annual Contributor Certificate - yearly achievement');
      
      console.log('\n📡 API Endpoints Available:');
      console.log('   • GET /api/gamification/badges - View all badges');
      console.log('   • GET /api/gamification/certificates - View all certificates');
      console.log('   • GET /api/gamification/user-achievements/:userId - User achievements');
      console.log('   • GET /api/gamification/leaderboard - Community leaderboard');
      console.log('   • POST /api/gamification/award-points - Manual point awards (admin)');
      
      console.log('\n🎮 How it works:');
      console.log('   • Users earn points for reporting issues, voting, commenting');
      console.log('   • Points unlock badges based on thresholds and activities');
      console.log('   • Badges contribute to certificates and recognition');
      console.log('   • Leaderboard showcases top contributors');
      console.log('   • Push notifications celebrate achievements');
    } else {
      console.log('\n❌ Some components failed to initialize. Check the logs above.');
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Integrate gamification middleware into your issue routes');
    console.log('   2. Update your mobile app to display badges and certificates');
    console.log('   3. Set up push notifications for achievement alerts');
    console.log('   4. Test the system by creating issues and earning badges');
    
  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeGamificationSystem();
}

module.exports = { initializeGamificationSystem };