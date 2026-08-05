const express = require('express');
const { checkAndSendDeadlineReminders } = require('../../../services/notificationService');

const router = express.Router();

const handleCron = async (req, res, next) => {
  try {
    console.log('⏰ Vercel Cron: Triggered check-deadlines endpoint');
    await checkAndSendDeadlineReminders();
    res.status(200).json({
      status: 'success',
      message: 'Deadline reminder check executed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Support /check-deadlines, /api/v1/cron/check-deadlines, and root /
router.get('/check-deadlines', handleCron);
router.get('/', handleCron);

module.exports = router;
