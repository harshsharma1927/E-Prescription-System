const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const {
  createMapping,
  deleteMapping,
  listMedicinesBySymptom,
  bulkCreateMapping,
} = require('../controllers/symptomMedicine.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.post('/', authRequired, asyncHandler(createMapping));
router.post('/bulk', authRequired, asyncHandler(bulkCreateMapping));
router.get('/by-symptom/:symptomId', authRequired, asyncHandler(listMedicinesBySymptom));
router.delete('/:symptomId/:medicineId', authRequired, asyncHandler(deleteMapping));

module.exports = router;

