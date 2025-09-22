// Twilio Configuration
module.exports = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Your Twilio phone number
  },
  
  // SMS Configuration
  sms: {
    enabled: process.env.SMS_ENABLED === 'true' || false, // Set to true when you have Twilio credentials
    provider: 'twilio', // or 'mock' for testing
  },
  
  // Email Configuration (for future use)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true' || false,
    provider: 'mock', // Will add real email provider later
  }
};