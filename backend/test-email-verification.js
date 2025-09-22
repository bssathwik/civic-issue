// Email Verification Test Script
const axios = require('axios');

async function testEmailVerification() {
  try {
    console.log('📧 Testing Email Verification System...\n');
    
    // Test email address (replace with your actual email)
    const testEmail = 'test@example.com'; // Change this to your email
    
    console.log('Step 1: Sending email OTP...');
    const response = await axios.post('http://localhost:3000/api/verification/send-email-otp', {
      email: testEmail
    });
    
    console.log('✅ Email OTP Response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 SUCCESS: Email verification system is working!');
      console.log('📧 Check your email for the OTP message');
      
      if (response.data.debug?.otp) {
        console.log('💡 Development OTP:', response.data.debug.otp);
        console.log('\n🧪 To test verification, run:');
        console.log(`node -e "const axios = require('axios'); axios.post('http://localhost:3000/api/verification/verify-email-otp', {email: '${testEmail}', otp: '${response.data.debug.otp}'}).then(r => console.log('Verification:', r.data)).catch(e => console.log('Error:', e.response?.data));"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Email Test Failed:', error.response?.data || error.message);
    console.log('\n🛠  Troubleshooting:');
    console.log('1. Make sure backend server is running (npm start)');
    console.log('2. Check your Gmail credentials in .env file');
    console.log('3. Verify Gmail app password is set correctly');
    console.log('4. Ensure EMAIL_ENABLED=true in .env file');
  }
}

// Run the test
testEmailVerification();