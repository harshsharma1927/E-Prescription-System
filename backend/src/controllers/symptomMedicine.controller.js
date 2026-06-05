const Joi = require('joi');
const SymptomMedicine = require('../models/SymptomMedicine');
const Medicine = require('../models/Medicine');
const { AppError } = require('../utils/AppError');

async function createMapping(req, res) {
  const schema = Joi.object({
    symptom_id: Joi.string().hex().length(24).required(),
    medicine_id: Joi.string().hex().length(24).required(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const mapping = await SymptomMedicine.create(value);
  return res.status(201).json({ status: 'success', mappingId: mapping._id });
}

async function bulkCreateMapping(req, res) {
  const schema = Joi.object({
    mappings: Joi.array()
      .items(
        Joi.object({
          symptom_id: Joi.string().hex().length(24).required(),
          medicine_id: Joi.string().hex().length(24).required(),
        })
      )
      .min(1)
      .required(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  await SymptomMedicine.insertMany(value.mappings, { ordered: false });
  return res.json({ status: 'success', created: value.mappings.length });
}

async function deleteMapping(req, res) {
  const { symptomId, medicineId } = req.params;
  const deleted = await SymptomMedicine.findOneAndDelete({
    symptom_id: symptomId,
    medicine_id: medicineId,
  });
  if (!deleted) throw new AppError(404, 'Mapping not found');
  return res.json({ status: 'success', deleted: true });
}

async function listMedicinesBySymptom(req, res) {
  const { symptomId } = req.params;

  const mappings = await SymptomMedicine.find({ symptom_id: symptomId }).select('medicine_id');
  const medicineIds = [...new Set(mappings.map((m) => String(m.medicine_id)))];
  if (medicineIds.length === 0) return res.json({ status: 'success', count: 0, results: [] });

  const medicines = await Medicine.find({ _id: { $in: medicineIds } }).sort({ created_at: -1 });

  return res.json({
    status: 'success',
    count: medicines.length,
    results: medicines.map((m) => ({ id: m._id, name: m.name, category: m.category })),
  });
}

module.exports = { createMapping, deleteMapping, listMedicinesBySymptom, bulkCreateMapping };

