const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issues');
    console.log('✅ Database connected successfully');
    
    const Issue = require('./src/models/Issue');
    const issueCount = await Issue.countDocuments();
    console.log('📊 Total issues in database:', issueCount);
    
    if (issueCount > 0) {
      const recentIssues = await Issue.find()
        .limit(5)
        .select('title createdAt status category')
        .sort({ createdAt: -1 });
      
      console.log('\n📝 Recent issues:');
      recentIssues.forEach((issue, i) => {
        console.log(`  ${i+1}. ${issue.title}`);
        console.log(`     Status: ${issue.status} | Category: ${issue.category}`);
        console.log(`     Date: ${issue.createdAt.toLocaleDateString()}\n`);
      });
    }
    
    // Load User model
    require('./src/models/User');
    const User = mongoose.model('User');
    const userCount = await User.countDocuments();
    console.log('👥 Total users in database:', userCount);
    
    const Badge = require('./src/models/Badge');
    const badgeCount = await Badge.countDocuments();
    console.log('🏆 Total badges available:', badgeCount);
    
    const Achievement = require('./src/models/Achievement');
    const achievementCount = await Achievement.countDocuments();
    console.log('🎯 Total achievements earned:', achievementCount);
    
    await mongoose.connection.close();
    console.log('\n✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();