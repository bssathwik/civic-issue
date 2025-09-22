# Gmail Email Verification Setup Guide

## 📧 How to Set Up Gmail for Email Verification

### Step 1: Enable 2-Factor Authentication
1. **Go to Google Account**: https://myaccount.google.com/
2. **Click "Security"** on the left sidebar
3. **Enable 2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. **Go to Security Settings**: https://myaccount.google.com/security
2. **Click "2-Step Verification"**
3. **Scroll down to "App passwords"**
4. **Click "Select app"** → Choose "Mail"
5. **Click "Select device"** → Choose "Other (Custom name)"
6. **Type**: "Civic Connect App"
7. **Click "GENERATE"**
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File
```env
# Email Configuration (Gmail/Nodemailer)
EMAIL_ENABLED=true
EMAIL_USERNAME=your-actual-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Step 4: Test Email Verification

#### Option 1: Quick Test (Mock Mode)
```bash
# Set EMAIL_ENABLED=false in .env for mock mode
node test-email-verification.js
```

#### Option 2: Real Email Test
```bash
# Set EMAIL_ENABLED=true with real Gmail credentials
node test-email-verification.js
```

#### Option 3: Manual API Test
```bash
# Send email OTP
curl -X POST http://localhost:3000/api/verification/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'

# Verify email OTP
curl -X POST http://localhost:3000/api/verification/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "otp": "123456"}'
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - Use App Password instead of enabling less secure apps
   - This method is more secure and recommended by Google

3. **Email not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check if Gmail SMTP limits are exceeded

4. **Connection timeout**
   - Check internet connection
   - Verify Gmail SMTP settings (smtp.gmail.com:587)

### Gmail SMTP Settings:
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Security**: TLS/STARTTLS
- **Authentication**: Required

## 📧 Features Available:

1. **Email OTP Verification**
   - Beautiful HTML email templates
   - 10-minute expiry
   - Secure 6-digit codes

2. **Welcome Emails** (Optional)
   - Sent after successful registration
   - Professional branded design

3. **Fallback System**
   - Automatic fallback to mock mode if email fails
   - Development-friendly with debug info

## 🎯 Next Steps:

1. Set up Gmail App Password
2. Update .env with your credentials
3. Test email verification
4. Integrate with mobile app registration
5. (Optional) Customize email templates

## 📝 Example Email Template Preview:

The system sends beautifully formatted emails with:
- Civic Connect branding
- Clear OTP display
- Security warnings
- Professional styling
- Mobile-responsive design

Happy emailing! 📧✨