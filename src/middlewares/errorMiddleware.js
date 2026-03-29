const AppError = require('../utils/AppError');

// Express automatically knows this is an error handling middleware because it has 4 parameters
module.exports = (err, req, res, next) => {
  console.error('ERROR 💥', err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handling Mongoose Validation errors specifically
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join('. ');
    err = new AppError(`Invalid input data. ${message}`, 400);
  }
  
  // Handling MongoDB duplicate fields error
  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    err = new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
  }

  // Handling invalid JWT token error
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again!', 401);
  }

  // Handling expired JWT token error
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your token has expired! Please log in again.', 401);
  }

  // Send Response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.isOperational ? err.message : 'Something went very wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
