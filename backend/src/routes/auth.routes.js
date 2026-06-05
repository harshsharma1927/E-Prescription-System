const { Router } = require('express');
const { registerDoctor, loginDoctor } = require('../controllers/auth.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.post('/register', asyncHandler(registerDoctor));
router.post('/login', asyncHandler(loginDoctor));

module.exports = router;

