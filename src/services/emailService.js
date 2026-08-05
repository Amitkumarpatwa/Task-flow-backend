const { Resend } = require('resend');

/**
 * Get Resend client instance safely
 */
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing in environment variables');
  }
  return new Resend(apiKey);
};

/**
 * Send an email using Resend API
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    if (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      throw new Error(error.message);
    }

    console.log(`📧 Email sent to ${to}: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Build a beautiful HTML email for task deadline reminders
 * @param {string} userName - Recipient's name
 * @param {Array} tasks - Array of task objects with title, description, deadline
 * @returns {string} HTML string
 */
const buildDeadlineReminderEmail = (userName, tasks) => {
  const taskRows = tasks
    .map((task) => {
      const deadlineDate = new Date(task.deadline);
      const now = new Date();
      const hoursLeft = Math.max(0, Math.round((deadlineDate - now) / (1000 * 60 * 60)));
      const isUrgent = hoursLeft <= 6;

      const urgencyColor = isUrgent ? '#ef4444' : '#f59e0b';
      const urgencyLabel = isUrgent ? '🔴 URGENT' : '🟡 Due Soon';
      const statusColor =
        task.status === 'in-progress' ? '#3b82f6' : '#a855f7';

      return `
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="flex: 1;">
                <div style="font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 4px;">
                  ${task.title}
                </div>
                <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">
                  ${task.description ? task.description.substring(0, 100) : 'No description'}${task.description && task.description.length > 100 ? '...' : ''}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ${statusColor}22; color: ${statusColor}; text-transform: uppercase;">
                    ${task.status}
                  </span>
                  <span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ${urgencyColor}22; color: ${urgencyColor};">
                    ${urgencyLabel} — ${hoursLeft}h left
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
        ⚡ TaskFlow
      </div>
      <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
        Deadline Reminder
      </div>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(145deg, #1e293b, #1a2332); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      
      <!-- Greeting -->
      <div style="padding: 28px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px;">
          Hey ${userName} 👋
        </div>
        <div style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          You have <strong style="color: #f59e0b;">${tasks.length} task${tasks.length > 1 ? 's' : ''}</strong> approaching ${tasks.length > 1 ? 'their' : 'its'} deadline. Don't let them slip!
        </div>
      </div>

      <!-- Tasks Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${taskRows}
      </table>

      <!-- CTA -->
      <div style="padding: 24px; text-align: center;">
        <div style="font-size: 13px; color: #64748b; margin-top: 8px;">
          Log in to TaskFlow to manage your tasks and stay on track.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #475569; font-size: 12px;">
      <div>This is an automated reminder from TaskFlow.</div>
      <div style="margin-top: 4px; color: #334155;">
        © ${new Date().getFullYear()} TaskFlow. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { sendEmail, buildDeadlineReminderEmail };
