const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

/** Sends the password reset code. Returns false when no email server is set up. */
async function sendResetCode(email, code) {
  if (!env.smtp) return false;
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject: 'Your Expenso password reset code',
    text: `Your code is ${code}. It expires in 15 minutes. If you did not ask to reset your password, you can ignore this email.`,
  });
  return true;
}

module.exports = { sendResetCode };
