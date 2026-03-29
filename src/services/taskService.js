const taskRepository = require('../repositories/taskRepository');
const AppError = require('../utils/AppError');

class TaskService {
  async createTask(userId, taskData) {
    const newTask = await taskRepository.create({
      ...taskData,
      user: userId
    });
    return newTask;
  }

  async getTasks(user) {
    let query = {};
    
    // If user is not admin, only fetch their own tasks
    if (user.role !== 'admin') {
      query = { user: user._id };
    }
    
    return await taskRepository.findAll(query);
  }

  async getTaskById(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Check ownership if not admin
    if (user.role !== 'admin' && task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to view this task', 403);
    }

    return task;
  }

  async updateTask(taskId, updateData, user) {
    // First find the task to check permissions
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Check ownership if not admin
    if (user.role !== 'admin' && task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    // Perform update
    const updatedTask = await taskRepository.update(taskId, updateData);
    return updatedTask;
  }

  async deleteTask(taskId, user) {
    // First find the task to check permissions
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Check ownership if not admin
    if (user.role !== 'admin' && task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await taskRepository.delete(taskId);
    return null;
  }
}

module.exports = new TaskService();
