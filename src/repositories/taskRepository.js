const Task = require('../models/Task');

class TaskRepository {
  async findAll(query = {}) {
    return await Task.find(query).populate('user', 'name email');
  }

  async findById(id) {
    return await Task.findById(id).populate('user', 'name email');
  }

  async create(taskData) {
    return await Task.create(taskData);
  }

  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after', // Return the updated document (Mongoose 9 style)
      runValidators: true // Run model validators on update
    });
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();
