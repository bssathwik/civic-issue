# SMS & Email Verification Setup Guide

## 📱 SMS Verification with Twilio

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Twilio Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Get a Twilio phone number:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number (free trial gives you one)

### Step 3: Configure Environment
1. Open `backend/.env` file
2. Update these values:
   ```
   SMS_ENABLED=true
   TWILIO_ACCOUNT_SID=your_actual_account_sid
   TWILIO_AUTH_TOKEN=your_actual_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

### Step 4: Test SMS
1. Restart the backend server
2. Test the endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/verification/send-phone-otp \
   -H "Content-Type: application/json" \
   -d '{"phone": "your_phone_number"}'
   ```

## 📧 Email Verification (Coming Soon)
- Will be implemented with services like SendGrid or AWS SES
- Set `EMAIL_ENABLED=true` when ready

## 🔧 Development Mode
- When `SMS_ENABLED=false`, the system uses mock SMS
- OTP codes are displayed in console logs for testing
- No real SMS charges incurred

## 🚀 Production Notes
- Enable SMS in production by setting `SMS_ENABLED=true`
- Protect your Twilio credentials
- Monitor SMS usage and costs
- Consider SMS rate limiting for production

## 🛠 Troubleshooting
1. **SMS not sending**: Check Twilio credentials and account balance
2. **Invalid phone number**: Ensure correct format (+91XXXXXXXXXX for India)
3. **Console errors**: Check backend logs for detailed error messages

## 💡 Features Implemented
✅ Phone OTP generation and sending  
✅ OTP verification  
✅ Twilio integration with fallback  
✅ Mock SMS for development  
⏳ Email verification (planned)  
⏳ SMS rate limiting (planned)  