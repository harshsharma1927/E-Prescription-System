const { AppError } = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err instanceof AppError ? err.message : 'Internal server error';

  const payload = {
    status: 'error',
    message,
  };

  if (err.details) payload.details = err.details;

  // Mongoose validation / duplicate key errors.
  if (err && err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    payload.status = 'error';
    payload.message = 'Duplicate key error';
  }

  if (err && err.name === 'ValidationError') {
    statusCode = 400;
    payload.message = 'Validation error';
  }

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };

