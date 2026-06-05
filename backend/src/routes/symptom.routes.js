const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const { createSymptom, listSymptoms, getSymptom, updateSymptom, deleteSymptom } = require('../controllers/symptom.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.post('/', authRequired, asyncHandler(createSymptom));
router.get('/', authRequired, asyncHandler(listSymptoms));
router.get('/:id', authRequired, asyncHandler(getSymptom));
router.put('/:id', authRequired, asyncHandler(updateSymptom));
router.delete('/:id', authRequired, asyncHandler(deleteSymptom));

module.exports = router;

