const Joi = require('joi');
const Medicine = require('../models/Medicine');
const SymptomMedicine = require('../models/SymptomMedicine');
const { AppError } = require('../utils/AppError');

async function createMedicine(req, res) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    category: Joi.string().trim().allow('', null).optional(),
  });
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const medicine = await Medicine.create({
    name: value.name,
    category: value.category || '',
  });

  return res.status(201).json({
    status: 'success',
    medicine: {
      id: medicine._id,
      name: medicine.name,
      category: medicine.category,
      created_at: medicine.created_at,
    },
  });
}

async function listMedicines(req, res) {
  const medicines = await Medicine.find({}).sort({ created_at: -1 }).limit(200);
  return res.json({
    status: 'success',
    count: medicines.length,
    results: medicines.map((m) => ({
      id: m._id,
      name: m.name,
      category: m.category,
      created_at: m.created_at,
    })),
  });
}

async function getMedicine(req, res) {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new AppError(404, 'Medicine not found');
  return res.json({
    status: 'success',
    medicine: {
      id: medicine._id,
      name: medicine.name,
      category: medicine.category,
      created_at: medicine.created_at,
      updated_at: medicine.updated_at,
    },
  });
}

async function updateMedicine(req, res) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    category: Joi.string().trim().allow('', null).optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const medicine = await Medicine.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!medicine) throw new AppError(404, 'Medicine not found');

  return res.json({
    status: 'success',
    medicine: {
      id: medicine._id,
      name: medicine.name,
      category: medicine.category,
      created_at: medicine.created_at,
      updated_at: medicine.updated_at,
    },
  });
}

async function deleteMedicine(req, res) {
  const deleted = await Medicine.findByIdAndDelete(req.params.id);
  if (!deleted) throw new AppError(404, 'Medicine not found');
  return res.json({ status: 'success', deleted: true });
}

// Doctor selects symptoms -> system fetches matching medicines.
async function getMedicinesBySymptoms(req, res) {
  const schema = Joi.object({
    symptomIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const mappings = await SymptomMedicine.find({ symptom_id: { $in: value.symptomIds } }).select('medicine_id');
  const medicineIds = [...new Set(mappings.map((m) => String(m.medicine_id)))];
  if (medicineIds.length === 0) {
    return res.json({ status: 'success', count: 0, results: [] });
  }

  const medicines = await Medicine.find({ _id: { $in: medicineIds } }).sort({ created_at: -1 });

  return res.json({
    status: 'success',
    count: medicines.length,
    results: medicines.map((m) => ({ id: m._id, name: m.name, category: m.category })),
  });
}

module.exports = {
  createMedicine,
  listMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicinesBySymptoms,
};

