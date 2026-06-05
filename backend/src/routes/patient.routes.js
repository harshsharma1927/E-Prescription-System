const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const { getPatientByReference, getPatientHistory, searchPatients } = require('../controllers/patient.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.get('/search', authRequired, asyncHandler(searchPatients));
router.get('/:referenceId', authRequired, asyncHandler(getPatientByReference));
router.get('/:referenceId/history', authRequired, asyncHandler(getPatientHistory));

module.exports = router;

