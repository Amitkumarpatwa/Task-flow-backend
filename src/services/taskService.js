const taskRepository = require('../repositories/taskRepository');
const AppError = require('../utils/AppError');
const { sendEmail, buildDeadlineReminderEmail } = require('./emailService');
const Task = require('../models/Task');

class TaskService {
  /**
   * Send instant email reminder if a task's deadline is within 24 hours.
   * Runs inline (not setImmediate) so it works on Vercel serverless.
   */
  async _sendInstantReminderIfNeeded(task, userId) {
    try {
      if (!task.deadline || task.emailReminderSent) return;

      const now = new Date();
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      // Only send if deadline is within 24 hours and in the future
      if (hoursUntilDeadline <= 0 || hoursUntilDeadline > 24) return;

      // Populate user info for the email
      const User = require('../models/User');
      const user = await User.findById(userId).select('name email');
      if (!user || !user.email) return;

      const html = buildDeadlineReminderEmail(user.name, [task]);

      await sendEmail({
        to: user.email,
        subject: `⏰ TaskFlow: "${task.title}" is due soon!`,
        html
      });

      // Mark as reminded
      await Task.updateOne(
        { _id: task._id },
        { $set: { emailReminderSent: true } }
      );

      console.log(`⚡ Instant reminder sent to ${user.email} for task "${task.title}"`);
    } catch (err) {
      // Don't let email failure block the task creation/update response
      console.error('Instant reminder error (non-blocking):', err.message);
    }
  }

  async createTask(userId, taskData) {
    const newTask = await taskRepository.create({
      ...taskData,
      user: userId
    });

    // Send instant reminder if deadline is within 24 hours
    await this._sendInstantReminderIfNeeded(newTask, userId);

    return newTask;
  }

  async getTasks(user) {
    return await taskRepository.findAll({ user: user._id });
  }

  async getTaskById(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

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

    if (task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    const updatedTask = await taskRepository.update(taskId, updateData);

    // Send instant reminder if deadline changed and is within 24 hours
    if (updatedTask && updatedTask.deadline && !updatedTask.emailReminderSent) {
      await this._sendInstantReminderIfNeeded(updatedTask, user._id);
    }

    return updatedTask;
  }

  async deleteTask(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.user._id.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await taskRepository.delete(taskId);
    return null;
  }
}

module.exports = new TaskService();
