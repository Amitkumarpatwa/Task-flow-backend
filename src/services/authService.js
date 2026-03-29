const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class AuthService {
  // Generate JWT Token
  signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  async registerUser(userData) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    // Role cannot be explicitly set to admin by default unless allowed by your business rules
    // For this simple project, we might let them specify or strictly enforce 'user'
    const newUser = await userRepository.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user'
    });

    // Remove password from output
    newUser.password = undefined;

    const token = this.signToken(newUser._id);
    return { user: newUser, token };
  }

  async loginUser(email, password) {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 2) Check if user exists && password is correct
    // We pass true to include the password in the query result for comparison
    const user = await userRepository.findByEmail(email, true);

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 3) If everything ok, send token to client
    const token = this.signToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    return { user, token };
  }
}

module.exports = new AuthService();
