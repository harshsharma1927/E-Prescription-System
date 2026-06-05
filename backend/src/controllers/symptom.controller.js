const Joi = require('joi');
const Symptom = require('../models/Symptom');
const { AppError } = require('../utils/AppError');

async function createSymptom(req, res) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    category: Joi.string().trim().allow('', null).optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const symptom = await Symptom.create({ name: value.name, category: value.category || '' });
  return res.status(201).json({
    status: 'success',
    symptom: { id: symptom._id, name: symptom.name, category: symptom.category, created_at: symptom.created_at },
  });
}

async function listSymptoms(req, res) {
  const symptoms = await Symptom.find({}).sort({ created_at: -1 }).limit(200);
  return res.json({
    status: 'success',
    count: symptoms.length,
    results: symptoms.map((s) => ({ id: s._id, name: s.name, category: s.category, created_at: s.created_at })),
  });
}

async function getSymptom(req, res) {
  const symptom = await Symptom.findById(req.params.id);
  if (!symptom) throw new AppError(404, 'Symptom not found');
  return res.json({
    status: 'success',
    symptom: {
      id: symptom._id,
      name: symptom.name,
      category: symptom.category,
      created_at: symptom.created_at,
      updated_at: symptom.updated_at,
    },
  });
}

async function updateSymptom(req, res) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    category: Joi.string().trim().allow('', null).optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const symptom = await Symptom.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!symptom) throw new AppError(404, 'Symptom not found');
  return res.json({ status: 'success', symptom: { id: symptom._id, name: symptom.name, category: symptom.category } });
}

async function deleteSymptom(req, res) {
  const deleted = await Symptom.findByIdAndDelete(req.params.id);
  if (!deleted) throw new AppError(404, 'Symptom not found');
  return res.json({ status: 'success', deleted: true });
}

module.exports = { createSymptom, listSymptoms, getSymptom, updateSymptom, deleteSymptom };

