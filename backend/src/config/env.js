require('dotenv').config();

function mustGet(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  ALLOW_DEV_FALLBACKS: process.env.ALLOW_DEV_FALLBACKS
    ? process.env.ALLOW_DEV_FALLBACKS === 'true'
    : process.env.NODE_ENV !== 'production',

  MONGODB_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',

  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || '',
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
};

// Fail fast only for critical runtime values.
const critical = [
  ['MONGO_URI', process.env.MONGO_URI || env.MONGODB_URI],
  ['JWT_SECRET', env.JWT_SECRET],
  ['CLOUDINARY_CLOUD_NAME', env.CLOUDINARY_CLOUD_NAME],
  ['CLOUDINARY_API_KEY', env.CLOUDINARY_API_KEY],
  ['CLOUDINARY_API_SECRET', env.CLOUDINARY_API_SECRET],
  ['EMAIL_HOST', env.EMAIL_HOST],
  ['EMAIL_PORT', env.EMAIL_PORT],
  ['EMAIL_USER', env.EMAIL_USER],
  ['EMAIL_PASS', env.EMAIL_PASS],
  ['EMAIL_FROM', env.EMAIL_FROM],
];

for (const [name, value] of critical) {
  if (!value && env.NODE_ENV !== 'test') {
    // Keep messages descriptive; missing env should be fixed by user.
    // eslint-disable-next-line no-console
    console.warn(`Warning: missing env var ${name}`);
  }
}

module.exports = { env, mustGet };

