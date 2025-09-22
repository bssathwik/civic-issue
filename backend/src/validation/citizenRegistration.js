const Joi = require('joi');

// Validation schema for citizen registration
const citizenRegistrationSchema = Joi.object({
  // Basic Information
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'string.pattern.base': 'Name can only contain letters and spaces'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password'
    }),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number'
    }),

  // Personal Details
  dateOfBirth: Joi.date()
    .max('now')
    .min('1900-01-01')
    .required()
    .messages({
      'date.base': 'Please enter a valid date of birth',
      'date.max': 'Date of birth cannot be in the future',
      'date.min': 'Please enter a valid date of birth',
      'any.required': 'Date of birth is required'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .required()
    .messages({
      'any.only': 'Please select a valid gender option',
      'any.required': 'Gender is required'
    }),

  occupation: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Occupation is required',
      'string.min': 'Occupation must be at least 2 characters long',
      'string.max': 'Occupation cannot exceed 50 characters'
    }),

  // Address Information
  address: Joi.object({
    street: Joi.string()
      .min(5)
      .max(200)
      .trim()
      .required()
      .messages({
        'string.empty': 'Street address is required',
        'string.min': 'Street address must be at least 5 characters long',
        'string.max': 'Street address cannot exceed 200 characters'
      }),

    area: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Area is required',
        'string.min': 'Area must be at least 2 characters long',
        'string.max': 'Area cannot exceed 100 characters'
      }),

    city: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City cannot exceed 50 characters'
      }),

    state: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'State is required',
        'string.min': 'State must be at least 2 characters long',
        'string.max': 'State cannot exceed 50 characters'
      }),

    pincode: Joi.string()
      .pattern(/^[1-9][0-9]{5}$/)
      .required()
      .messages({
        'string.empty': 'Pincode is required',
        'string.pattern.base': 'Please enter a valid 6-digit pincode'
      }),

    ward: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Ward is required',
        'string.min': 'Ward must be at least 1 character long',
        'string.max': 'Ward cannot exceed 50 characters'
      }),

    landmark: Joi.string()
      .max(200)
      .trim()
      .optional()
      .messages({
        'string.max': 'Landmark cannot exceed 200 characters'
      })
  }).required(),

  // Location Coordinates
  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180))
      .length(2)
      .required()
      .messages({
        'array.length': 'Location coordinates must contain exactly 2 values (longitude, latitude)',
        'number.min': 'Invalid coordinates',
        'number.max': 'Invalid coordinates',
        'any.required': 'Location coordinates are required'
      })
  }).required(),

  // Emergency Contact
  emergencyContact: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.empty': 'Emergency contact name is required',
        'string.min': 'Emergency contact name must be at least 2 characters long',
        'string.max': 'Emergency contact name cannot exceed 50 characters',
        'string.pattern.base': 'Emergency contact name can only contain letters and spaces'
      }),

    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.empty': 'Emergency contact phone is required',
        'string.pattern.base': 'Please enter a valid 10-digit mobile number for emergency contact'
      }),

    relation: Joi.string()
      .valid('father', 'mother', 'spouse', 'sibling', 'child', 'friend', 'relative', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid relationship',
        'any.required': 'Relationship with emergency contact is required'
      })
  }).required(),

  // Optional Aadhar Number
  aadharNumber: Joi.string()
    .pattern(/^\d{12}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Aadhar number must be exactly 12 digits'
    }),

  // Notification Preferences
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).optional(),
    language: Joi.string()
      .valid('en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'or')
      .default('en')
      .optional()
  }).optional(),

  // Terms and Privacy
  agreeToTerms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must agree to the terms and conditions',
      'any.required': 'Please accept the terms and conditions'
    }),

  agreeToPrivacy: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must agree to the privacy policy',
      'any.required': 'Please accept the privacy policy'
    })
});

// Validation schema for profile update (all fields optional except required ones)
const profileUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .optional(),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional(),

  dateOfBirth: Joi.date()
    .max('now')
    .min('1900-01-01')
    .optional(),

  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .optional(),

  occupation: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional(),

  address: Joi.object({
    street: Joi.string().min(5).max(200).trim().optional(),
    area: Joi.string().min(2).max(100).trim().optional(),
    city: Joi.string().min(2).max(50).trim().optional(),
    state: Joi.string().min(2).max(50).trim().optional(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).optional(),
    ward: Joi.string().min(1).max(50).trim().optional(),
    landmark: Joi.string().max(200).trim().optional()
  }).optional(),

  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180))
      .length(2)
      .optional()
  }).optional(),

  emergencyContact: Joi.object({
    name: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z\s]+$/).optional(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
    relation: Joi.string()
      .valid('father', 'mother', 'spouse', 'sibling', 'child', 'friend', 'relative', 'other')
      .optional()
  }).optional(),

  aadharNumber: Joi.string()
    .pattern(/^\d{12}$/)
    .optional(),

  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional()
    }).optional(),
    language: Joi.string()
      .valid('en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'or')
      .optional()
  }).optional()
});

// Age validation helper
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Custom validation function
const validateCitizenRegistration = (data) => {
  const { error, value } = citizenRegistrationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, data: null };
  }

  // Additional validations
  const age = calculateAge(value.dateOfBirth);
  if (age < 18) {
    return {
      isValid: false,
      errors: [{ field: 'dateOfBirth', message: 'You must be at least 18 years old to register' }],
      data: null
    };
  }

  // Validate coordinates are within India (approximate bounds)
  const [lng, lat] = value.location.coordinates;
  if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
    return {
      isValid: false,
      errors: [{ field: 'location.coordinates', message: 'Location must be within India' }],
      data: null
    };
  }

  return { isValid: true, errors: [], data: value };
};

const validateProfileUpdate = (data) => {
  const { error, value } = profileUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, data: null };
  }

  return { isValid: true, errors: [], data: value };
};

module.exports = {
  validateCitizenRegistration,
  validateProfileUpdate,
  citizenRegistrationSchema,
  profileUpdateSchema,
  calculateAge
};