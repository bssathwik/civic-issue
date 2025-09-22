// Email Service with Nodemailer integration
// Supports both mock (development) and real email (production) modes

require('dotenv').config(); // Load environment variables
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isEnabled = process.env.EMAIL_ENABLED === 'true';
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!this.isEnabled) {
      console.log('📧 Email service is disabled (EMAIL_ENABLED=false)');
      return;
    }

    try {
      // Create Gmail SMTP transporter - Fixed API call
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      console.log('✅ Email service initialized with Gmail SMTP');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.isEnabled = false;
    }
  }
  static async sendEmail(to, subject, html, text = null) {
    // Create instance to access transporter
    const instance = new EmailService();
    
    try {
      if (!instance.isEnabled || !instance.transporter) {
        // Mock mode for development
        console.log(`📧 Mock Email to ${to}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text || 'HTML content'}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log(`✅ Mock email successfully sent to ${to}`);
        
        return {
          success: true,
          provider: 'mock',
          messageId: `email_${Date.now()}`,
          to
        };
      }

      // Real email sending with Nodemailer
      const mailOptions = {
        from: `"Civic Connect" <${process.env.EMAIL_USERNAME}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await instance.transporter.sendMail(mailOptions);
      
      console.log(`✅ Real email sent to ${to} via Gmail`);
      
      return {
        success: true,
        provider: 'gmail',
        messageId: info.messageId,
        to
      };

    } catch (error) {
      console.error(`❌ Email failed for ${to}:`, error.message);
      
      // Fallback to mock if real email fails
      console.log(`📧 Fallback: Mock Email sent to ${to}`);
      return {
        success: true,
        provider: 'mock-fallback',
        messageId: `email_fallback_${Date.now()}`,
        to,
        error: error.message
      };
    }
  }

  static async sendVerificationEmail(email, token) {
    const subject = 'Verify Your Email - Civic Issue App';
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #007BFF; text-align: center;">Civic Issue App</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h3>Email Verification Required</h3>
          <p>Thank you for registering with Civic Issue App! Please verify your email address by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://192.168.10.41:3000/api/verification/verify-email?token=${token}" 
               style="background: #007BFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <code>http://192.168.10.41:3000/api/verification/verify-email?token=${token}</code>
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>
        </div>
      </div>
    `;
    
    const text = `
      Civic Issue App - Email Verification
      
      Thank you for registering! Please verify your email by visiting:
      http://192.168.10.41:3000/api/verification/verify-email?token=${token}
      
      This link will expire in 24 hours.
    `;
    
    return await this.sendEmail(email, subject, html, text);
  }

  static async sendOTPEmail(email, otp) {
    const subject = '🔐 Your Civic Connect Verification Code';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Civic Connect - Verification Code</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  overflow: hidden;
              }
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
              }
              .content {
                  padding: 40px 30px;
                  text-align: center;
              }
              .otp-box {
                  background: #f8f9fa;
                  border: 2px dashed #667eea;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
                  font-size: 32px;
                  font-weight: bold;
                  color: #667eea;
                  letter-spacing: 8px;
              }
              .footer {
                  background: #f8f9fa;
                  padding: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #666;
              }
              .warning {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 5px;
                  padding: 15px;
                  margin: 20px 0;
                  color: #856404;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🏛️ Civic Connect</h1>
                  <p>Your trusted civic engagement platform</p>
              </div>
              
              <div class="content">
                  <h2>Email Verification</h2>
                  <p>Please use the following verification code to complete your registration:</p>
                  
                  <div class="otp-box">
                      ${otp}
                  </div>
                  
                  <div class="warning">
                      <strong>⚠️ Important:</strong>
                      <ul style="text-align: left; margin: 10px 0;">
                          <li>This code will expire in <strong>10 minutes</strong></li>
                          <li>Do not share this code with anyone</li>
                          <li>If you didn't request this code, please ignore this email</li>
                      </ul>
                  </div>
                  
                  <p>Thank you for joining Civic Connect!</p>
              </div>
              
              <div class="footer">
                  <p>This is an automated message from Civic Connect</p>
                  <p>© 2025 Civic Connect. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    const text = `
      Civic Connect - Email Verification Code
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      Do not share this code with anyone.
      
      If you didn't request this code, please ignore this email.
    `;
    
    return await this.sendEmail(email, subject, html, text);
  }
}

module.exports = EmailService;