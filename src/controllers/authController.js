const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

class AuthController {
  // @desc    Register a new user
  // @route   POST /api/v1/auth/register
  // @access  Public
  register = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    
    // Pass to service layer
    const result = await authService.registerUser({ name, email, password, role });

    res.status(201).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  });

  // @desc    Login user
  // @route   POST /api/v1/auth/login
  // @access  Public
  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Pass to service layer
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  });
}

module.exports = new AuthController();
