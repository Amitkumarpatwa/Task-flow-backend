const cron = require('node-cron');
const { checkAndSendDeadlineReminders } = require('../services/notificationService');

/**
 * Initialize all cron jobs for the application.
 * Call this after the database connection is established.
 */
const initCronJobs = () => {
  // Run deadline reminder check every hour
  // Cron expression: '0 * * * *' = at minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Cron: Running deadline reminder check...');
    await checkAndSendDeadlineReminders();
  });

  console.log('🕐 Cron jobs initialized — deadline reminders will check every hour.');

  // Also run once immediately on server start (after a short delay for DB warmup)
  setTimeout(async () => {
    console.log('⏰ Cron: Running initial deadline reminder check...');
    await checkAndSendDeadlineReminders();
  }, 5000);
};

module.exports = { initCronJobs };
