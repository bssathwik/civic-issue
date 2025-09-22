const { body, param, query, validationResult } = require('express-validator');

// Helper function to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  checkValidation
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidation
];

// Admin creation validation
const validateAdminCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'field_worker'])
    .withMessage('Role must be either admin or field_worker'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements'),
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Coordinates must be valid longitude/latitude values'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),
  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  body('preferences.language')
    .optional()
    .isIn(['en', 'hi', 'es', 'fr', 'de'])
    .withMessage('Language must be a supported language code'),
  checkValidation
];

// Issue validation rules
const validateCreateIssue = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Issue title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn([
      'road_maintenance',
      'street_lighting',
      'water_supply',
      'garbage_collection',
      'drainage',
      'public_transport',
      'traffic_management',
      'parks_recreation',
      'healthcare',
      'education',
      'safety_security',
      'noise_pollution',
      'air_pollution',
      'electricity',
      'sewerage',
      'construction',
      'other'
    ])
    .withMessage('Please select a valid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please select a valid priority'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numeric'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous flag must be boolean'),
  checkValidation
];

const validateUpdateIssue = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn([
      'road_maintenance',
      'street_lighting',
      'water_supply',
      'garbage_collection',
      'drainage',
      'public_transport',
      'traffic_management',
      'parks_recreation',
      'healthcare',
      'education',
      'safety_security',
      'noise_pollution',
      'air_pollution',
      'other'
    ])
    .withMessage('Please select a valid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please select a valid priority'),
  body('status')
    .optional()
    .isIn(['reported', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'])
    .withMessage('Please select a valid status'),
  checkValidation
];

// Comment validation
const validateComment = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  checkValidation
];

// ID validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  checkValidation
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'upvotes', '-upvotes', 'priority', '-priority'])
    .withMessage('Invalid sort parameter'),
  checkValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateAdminCreation,
  validateCreateIssue,
  validateUpdateIssue,
  validateComment,
  validateId,
  validatePagination,
  checkValidation
};