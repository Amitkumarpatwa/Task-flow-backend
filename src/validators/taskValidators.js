const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

exports.createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Task description is required'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status value'),
  validateResults
];

exports.updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Task description cannot be empty'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status value'),
  validateResults
];
