const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  validateRegister,
  validateLogin
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

// Protected routes
router.use(authenticate);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/avatar', uploadSingle('avatar'), updateAvatar);
router.put('/change-password', changePassword);

module.exports = router;