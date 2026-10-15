require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'production';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

module.exports = {
  isProd,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 8080,
  mongoUrl: () => required('MONGO_URL'),
  jwtSecret: () => required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of front-end origins allowed to call the API.
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  smtp: process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.MAIL_FROM || 'Expenso <no-reply@expenso.app>',
      }
    : null,
};
