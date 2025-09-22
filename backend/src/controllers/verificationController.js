const User = require('../models/User');
const SMSService = require('../services/smsService');
const EmailService = require('../services/emailService');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Phone OTP (SMS)
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number'
      });
    }

    // Check if phone is already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already registered'
      });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiry
    otpStore.set(`phone:${phone}`, { otp, expiryTime });

    // Send SMS using SMS service
    try {
      await SMSService.sendOTP(phone, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        // In production, remove this debug info
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } catch (smsError) {
      console.error('SMS sending failed:', smsError.message);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify Phone OTP
const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const storedData = otpStore.get(`phone:${phone}`);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(`phone:${phone}`);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // OTP verified successfully
    otpStore.delete(`phone:${phone}`);
    
    // Mark phone as verified (you might want to store this in database)
    otpStore.set(`verified:phone:${phone}`, { verified: true, timestamp: Date.now() });

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

// Send Email OTP
const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiry
    otpStore.set(`email:${email}`, { otp, expiryTime });

    // Send OTP via email using EmailService
    try {
      await EmailService.sendOTPEmail(email, otp);
      
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email address',
        // In production, remove this debug info
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
};

// Verify Email OTP
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const storedData = otpStore.get(`email:${email}`);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Verification code not found or expired. Please request a new code.'
      });
    }

    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(`email:${email}`);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // OTP verified successfully
    otpStore.delete(`email:${email}`);
    
    // Mark email as verified (you might want to store this in database)
    otpStore.set(`verified:email:${email}`, { verified: true, timestamp: Date.now() });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

// Check if phone/email is verified
const checkVerificationStatus = (phone, email) => {
  const phoneVerified = otpStore.has(`verified:phone:${phone}`);
  const emailVerified = otpStore.has(`verified:email:${email}`);
  return { phoneVerified, emailVerified };
};

module.exports = {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendEmailOTP,
  verifyEmailOTP,
  checkVerificationStatus
};