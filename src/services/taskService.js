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
      if (!task.deadline) {
        console.log(`ℹ️ [Email System] Task "${task.title}" has no deadline. Email skipped.`);
        return;
      }
      if (task.emailReminderSent) {
        console.log(`ℹ️ [Email System] Task "${task.title}" already had an email reminder sent.`);
        return;
      }

      const now = new Date();
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      console.log(`🔍 [Email System] Checking deadline for "${task.title}": ${hoursUntilDeadline.toFixed(2)} hours left.`);

      // Only send if deadline is within 24 hours and in the future
      if (hoursUntilDeadline <= 0) {
        console.log(`ℹ️ [Email System] Deadline is in the past (${hoursUntilDeadline.toFixed(2)}h). Email skipped.`);
        return;
      }
      if (hoursUntilDeadline > 24) {
        console.log(`ℹ️ [Email System] Deadline is more than 24h away (${hoursUntilDeadline.toFixed(2)}h). Email will be sent later via Cron job.`);
        return;
      }

      // Populate user info for the email
      const User = require('../models/User');
      const user = await User.findById(userId).select('name email');
      if (!user || !user.email) {
        console.log(`❌ [Email System] User email not found for userId: ${userId}`);
        return;
      }

      console.log(`📧 [Email System] Attempting to send email to ${user.email} from ${process.env.EMAIL_FROM || 'TaskFlow <noreply@send.amitpatwa.tech>'}...`);

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

      console.log(`⚡ [Email System] Instant reminder sent successfully to ${user.email} for task "${task.title}"`);
    } catch (err) {
      console.error(`❌ [Email System Error] Failed to send instant reminder for task "${task?.title}":`, err.message || err);
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
