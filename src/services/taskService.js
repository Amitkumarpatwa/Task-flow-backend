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
    // Each user only sees their own tasks
    return await taskRepository.findAll({ user: user._id });
  }

  async getTaskById(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Ensure the task belongs to this user
    if (task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to view this task', 403);
    }

    return task;
  }

  async updateTask(taskId, updateData, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Ensure the task belongs to this user
    if (task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    const updatedTask = await taskRepository.update(taskId, updateData);
    return updatedTask;
  }

  async deleteTask(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Ensure the task belongs to this user
    if (task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await taskRepository.delete(taskId);
    return null;
  }
}

module.exports = new TaskService();
