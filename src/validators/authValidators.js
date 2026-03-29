const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Middleware to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResults
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResults
];
