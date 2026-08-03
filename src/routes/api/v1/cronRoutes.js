const express = require('express');
const { checkAndSendDeadlineReminders } = require('../../../services/notificationService');

const router = express.Router();

// GET /api/v1/cron/check-deadlines
// Endpoint triggered automatically by Vercel Cron Jobs (or external cron services)
router.get('/check-deadlines', async (req, res, next) => {
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
});

module.exports = router;
