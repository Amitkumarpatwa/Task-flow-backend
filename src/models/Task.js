const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a task description'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A task must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
