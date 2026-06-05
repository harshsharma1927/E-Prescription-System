const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const { postCreate, getPdf } = require('../controllers/prescription.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.post('/', authRequired, postCreate);
router.get('/:id/pdf', authRequired, getPdf);

module.exports = router;

