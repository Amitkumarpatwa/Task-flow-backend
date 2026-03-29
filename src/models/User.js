const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Do not return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Hash the password before saving a new or modified user
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  // Hash password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to check password validity
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
