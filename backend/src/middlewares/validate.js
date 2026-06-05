function validateJoi(schema) {
  return function validateMiddleware(req, res, next) {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      });
    }

    req.body = value;
    return next();
  };
}

module.exports = { validateJoi };

