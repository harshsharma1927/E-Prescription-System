const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const {
  createMedicine,
  listMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicinesBySymptoms,
} = require('../controllers/medicine.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

router.post('/by-symptoms', authRequired, asyncHandler(getMedicinesBySymptoms));

router.post('/', authRequired, asyncHandler(createMedicine));
router.get('/', authRequired, asyncHandler(listMedicines));
router.get('/:id', authRequired, asyncHandler(getMedicine));
router.put('/:id', authRequired, asyncHandler(updateMedicine));
router.delete('/:id', authRequired, asyncHandler(deleteMedicine));

module.exports = router;

