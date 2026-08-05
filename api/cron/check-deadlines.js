require('dotenv').config();

const connectDB = require('../../src/config/db');
const Task = require('../../src/models/Task');
require('../../src/models/User');
const { sendEmail, buildDeadlineReminderEmail } = require('../../src/services/emailService');

let isDbConnected = false;

/**
 * Standalone Vercel Serverless Function for deadline checks.
 * This bypasses Express entirely for maximum reliability on Vercel.
 * Triggered by: Vercel Cron Jobs, cron-job.org, or manual browser visit.
 */
module.exports = async (req, res) => {
  try {
    // Connect to DB if not already connected
    if (!isDbConnected) {
      await connectDB();
      isDbConnected = true;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log(`🔔 [${now.toISOString()}] Cron: Checking for tasks with upcoming deadlines...`);

    // Find non-completed tasks with deadlines in the next 24 hours (or up to 1hr overdue)
    const upcomingTasks = await Task.find({
      status: { $ne: 'completed' },
      deadline: {
        $ne: null,
        $gte: oneHourAgo,
        $lte: twentyFourHoursLater
      },
      emailReminderSent: false
    }).populate('user', 'name email');

    if (upcomingTasks.length === 0) {
      console.log('✅ No upcoming deadline tasks found. All clear!');
      return res.status(200).json({
        status: 'success',
        message: 'No tasks with upcoming deadlines found.',
        checked_at: now.toISOString()
      });
    }

    console.log(`📋 Found ${upcomingTasks.length} task(s) with upcoming deadlines.`);

    // Group tasks by user
    const tasksByUser = {};
    for (const task of upcomingTasks) {
      if (!task.user || !task.user.email) continue;

      const userId = task.user._id.toString();
      if (!tasksByUser[userId]) {
        tasksByUser[userId] = {
          userName: task.user.name,
          userEmail: task.user.email,
          tasks: []
        };
      }
      tasksByUser[userId].tasks.push(task);
    }

    // Send one email per user
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const userId of Object.keys(tasksByUser)) {
      const { userName, userEmail, tasks } = tasksByUser[userId];

      try {
        const html = buildDeadlineReminderEmail(userName, tasks);

        await sendEmail({
          to: userEmail,
          subject: `⏰ TaskFlow: ${tasks.length} task${tasks.length > 1 ? 's' : ''} due soon!`,
          html
        });

        // Mark all these tasks as reminded
        const taskIds = tasks.map((t) => t._id);
        await Task.updateMany(
          { _id: { $in: taskIds } },
          { $set: { emailReminderSent: true } }
        );

        console.log(`✅ Reminder sent to ${userEmail} for ${tasks.length} task(s).`);
        emailsSent++;
      } catch (emailError) {
        console.error(`❌ Failed to send reminder to ${userEmail}:`, emailError.message);
        emailsFailed++;
      }
    }

    console.log('🏁 Deadline reminder check completed.');

    return res.status(200).json({
      status: 'success',
      message: `Deadline check complete. Emails sent: ${emailsSent}, failed: ${emailsFailed}.`,
      tasks_found: upcomingTasks.length,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      checked_at: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Cron function error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
