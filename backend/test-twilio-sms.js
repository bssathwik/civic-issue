// Simple Twilio Test Script
const axios = require('axios');

async function testTwilioSMS() {
  try {
    console.log('🧪 Testing Twilio SMS Integration...\n');
    
    // Test phone number (replace with your actual number)
    const testPhone = '9876543210'; // Your phone number without +91
    
    const response = await axios.post('http://localhost:3000/api/verification/send-phone-otp', {
      phone: testPhone
    });
    
    console.log('✅ SMS Test Result:', response.data);
    
    if (response.data.provider === 'twilio') {
      console.log('🎉 SUCCESS: Real SMS sent via Twilio!');
      console.log('📱 Check your phone for the OTP message');
    } else if (response.data.provider === 'mock') {
      console.log('ℹ️  MOCK MODE: SMS not actually sent');
      console.log('🔧 To enable real SMS, set SMS_ENABLED=true in .env');
      console.log('📱 Mock OTP:', response.data.debug?.otp);
    }
    
  } catch (error) {
    console.error('❌ SMS Test Failed:', error.response?.data || error.message);
    console.log('\n🛠  Troubleshooting:');
    console.log('1. Make sure backend server is running (npm start)');
    console.log('2. Check your Twilio credentials in .env file');
    console.log('3. Verify your Twilio account has credit/is verified');
    console.log('4. Ensure phone number format is correct');
  }
}

// Run the test
testTwilioSMS();