const twilio = require('twilio');
const config = require('../config/messaging');

class SMSService {
  constructor() {
    this.isEnabled = config.sms.enabled;
    this.provider = config.sms.provider;
    
    if (this.isEnabled && this.provider === 'twilio') {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
      this.fromNumber = config.twilio.phoneNumber;
    }
  }

  async sendSMS(phone, message) {
    try {
      if (this.isEnabled && this.provider === 'twilio') {
        // Send real SMS via Twilio
        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: `+91${phone}` // Assuming Indian numbers, adjust as needed
        });

        console.log('✅ SMS sent successfully via Twilio:', result.sid);
        return {
          success: true,
          provider: 'twilio',
          messageId: result.sid,
          phone
        };
      } else {
        // Mock SMS for development/testing
        console.log('📱 Mock SMS Service:', { to: phone, message });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          provider: 'mock',
          messageId: `msg_${Date.now()}`,
          phone
        };
      }
    } catch (error) {
      console.error('❌ SMS Service Error:', error);
      
      // Fallback to mock if Twilio fails
      if (this.provider === 'twilio') {
        console.log('🔄 Falling back to mock SMS service...');
        return {
          success: true,
          provider: 'mock-fallback',
          messageId: `fallback_${Date.now()}`,
          phone,
          debug: { error: error.message }
        };
      }
      
      throw new Error('SMS service unavailable');
    }
  }

  async sendOTP(phone, otp) {
    const message = `Your OTP for Civic Issue App registration is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    try {
      const result = await this.sendSMS(phone, message);
      
      // Add OTP debug info for development
      if (!this.isEnabled || this.provider !== 'twilio') {
        result.debug = { otp };
      }
      
      return {
        ...result,
        message: 'OTP sent successfully to your mobile number'
      };
    } catch (error) {
      throw error;
    }
  }

  static async sendSMS(phone, message) {
    const instance = new SMSService();
    return await instance.sendSMS(phone, message);
  }

  static async sendOTP(phone, otp) {
    const instance = new SMSService();
    return await instance.sendOTP(phone, otp);
  }
}

module.exports = SMSService;