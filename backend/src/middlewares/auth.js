const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    return next(new AppError(401, 'Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { doctorId: decoded.doctorId };
    return next();
  } catch (err) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = { authRequired };

