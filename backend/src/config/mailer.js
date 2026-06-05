const nodemailer = require('nodemailer');
const { env } = require('./env');

function hasEmailConfig() {
  const invalid = [undefined, null, '', 'your_email@gmail.com', 'your_app_password'];
  return !invalid.includes(env.EMAIL_USER) && !invalid.includes(env.EMAIL_PASS) && !!env.EMAIL_HOST && !!env.EMAIL_PORT;
}

const transporter = hasEmailConfig()
  ? nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT || 587),
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({
      // Development fallback: preserves attachment generation but does not send externally.
      jsonTransport: true,
    });

module.exports = { transporter };

