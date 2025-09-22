const mongoose = require('mongoose');
require('dotenv').config();

async function testIssueCreation() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issues');
    console.log('✅ Database connected successfully');
    
    const User = require('./src/models/User');
    const Issue = require('./src/models/Issue');
    const gamificationService = require('./src/services/GamificationService');
    
    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        phone: '+1234567890',
        isVerified: true
      });
      console.log('✅ Created test user');
    }
    
    console.log('👤 Test user ID:', testUser._id);
    
    // Create a test issue
    const testIssue = await Issue.create({
      title: 'Broken Street Light on Main Street',
      description: 'The street light at the corner of Main Street and Oak Avenue has been flickering and is now completely out. This creates a safety hazard for pedestrians walking at night.',
      category: 'street_lighting',
      priority: 'medium',
      reportedBy: testUser._id,
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128] // New York City coordinates
      },
      address: 'Corner of Main Street and Oak Avenue, New York, NY',
      status: 'reported',
      visibility: 'public'
    });
    
    console.log('📝 Created test issue:', testIssue.title);
    console.log('📍 Issue ID:', testIssue._id);
    
    // Award points for reporting the issue
    const pointsResult = await gamificationService.awardPoints(
      testUser._id.toString(),
      'REPORT_ISSUE',
      0,
      testIssue._id.toString(),
      'Reported a street lighting issue'
    );
    
    console.log('🎯 Points awarded result:', pointsResult);
    
    // Check user's updated stats
    const updatedUser = await User.findById(testUser._id);
    console.log('📊 User points:', updatedUser.gamification.points);
    console.log('🏆 User badges count:', updatedUser.gamification.badges.length);
    
    // Check if any badges were earned
    const Achievement = require('./src/models/Achievement');
    const userAchievements = await Achievement.find({ userId: testUser._id }).populate('badgeId certificateId');
    
    if (userAchievements.length > 0) {
      console.log('🎉 Achievements earned:');
      userAchievements.forEach(achievement => {
        if (achievement.badgeId) {
          console.log(`  🏅 Badge: ${achievement.badgeId.name} (+${achievement.points} points)`);
        }
        if (achievement.certificateId) {
          console.log(`  🏆 Certificate: ${achievement.certificateId.name} (+${achievement.points} points)`);
        }
      });
    } else {
      console.log('ℹ️ No achievements earned yet');
    }
    
    // Verify issue is stored
    const storedIssue = await Issue.findById(testIssue._id).populate('reportedBy', 'name');
    console.log('✅ Issue successfully stored in database');
    console.log('📝 Issue details:');
    console.log(`  Title: ${storedIssue.title}`);
    console.log(`  Category: ${storedIssue.category}`);
    console.log(`  Status: ${storedIssue.status}`);
    console.log(`  Reported by: ${storedIssue.reportedBy.name}`);
    console.log(`  Date: ${storedIssue.createdAt.toLocaleString()}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Issue creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Issue creation test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testIssueCreation();