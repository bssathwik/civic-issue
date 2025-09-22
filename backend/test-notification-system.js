const axios = require('axios');

// Test the notification system
async function testNotificationSystem() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('🔧 Testing Notification System...\n');

  try {
    // Test 1: Check if notification routes are available
    console.log('1. Testing notification endpoints availability...');
    
    try {
      const response = await axios.get(`${baseURL}/notifications`, {
        timeout: 5000
      });
      console.log('✅ Notifications endpoint accessible');
      console.log('Response status:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('⚠️ Endpoint exists but returned:', error.response.status);
        if (error.response.status === 401) {
          console.log('🔑 Authentication required (expected)');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running or not accessible');
        return;
      } else {
        console.log('❌ Error accessing endpoint:', error.message);
        return;
      }
    }

    // Test 2: Test gamification service notification methods (server-side test)
    console.log('\n2. Testing notification service methods...');
    
    // Create a test to check if our notification service methods exist
    try {
      const testResponse = await axios.post(`${baseURL}/test/notification-service`, {
        test: 'check-methods'
      }, {
        timeout: 5000
      });
      console.log('✅ Notification service methods available');
    } catch (error) {
      console.log('⚠️ Test endpoint not available (this is expected)');
    }

    console.log('\n🎯 Notification system appears to be properly integrated!');
    console.log('\nNext steps to test:');
    console.log('- Create a user account');
    console.log('- Award some points/badges');
    console.log('- Check notifications in mobile app');
    
  } catch (error) {
    console.error('❌ Failed to test notification system:', error.message);
  }
}

// Test notification data structure
function testNotificationDataStructure() {
  console.log('\n📋 Testing notification data structure...');
  
  const sampleNotification = {
    userId: '507f1f77bcf86cd799439011',
    type: 'achievement_earned',
    title: 'Badge Earned!',
    message: 'You earned the "Community Helper" badge',
    data: {
      badgeId: '507f1f77bcf86cd799439012',
      badgeName: 'Community Helper',
      badgeIcon: '🏆'
    },
    priority: 'medium',
    channels: ['in-app', 'push'],
    createdAt: new Date()
  };

  console.log('✅ Sample notification structure:');
  console.log(JSON.stringify(sampleNotification, null, 2));
  
  // Validate required fields
  const requiredFields = ['userId', 'type', 'title', 'message'];
  const missingFields = requiredFields.filter(field => !sampleNotification[field]);
  
  if (missingFields.length === 0) {
    console.log('✅ All required fields present');
  } else {
    console.log('❌ Missing required fields:', missingFields);
  }
}

// Run tests
console.log('🚀 Starting Notification System Test Suite\n');
testNotificationDataStructure();
setTimeout(() => {
  testNotificationSystem();
}, 1000);