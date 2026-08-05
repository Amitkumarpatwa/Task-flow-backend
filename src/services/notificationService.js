const Task = require('../models/Task');
require('../models/User'); // Register User model for populate
const { sendEmail, buildDeadlineReminderEmail } = require('./emailService');

/**
 * Check for tasks approaching their deadline and send reminder emails.
 * 
 * Logic:
 * 1. Find all non-completed tasks with a deadline within the next 24 hours
 *    that haven't already received a reminder email.
 * 2. Group tasks by user.
 * 3. Send one email per user with all their upcoming tasks.
 * 4. Mark those tasks as emailReminderSent = true.
 */
const checkAndSendDeadlineReminders = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log(`🔔 [${now.toISOString()}] Checking for tasks with upcoming deadlines...`);

    // Find tasks that are:
    // - Not completed
    // - Have a deadline set
    // - Deadline is between 1 hour ago and 24 hours from now
    // - Haven't already received an email reminder
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
      return;
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
      } catch (emailError) {
        console.error(`❌ Failed to send reminder to ${userEmail}:`, emailError.message);
        // Don't mark as sent if email failed — retry next cycle
      }
    }

    console.log('🏁 Deadline reminder check completed.');
  } catch (error) {
    console.error('❌ Error in checkAndSendDeadlineReminders:', error.message);
  }
};

module.exports = { checkAndSendDeadlineReminders };
