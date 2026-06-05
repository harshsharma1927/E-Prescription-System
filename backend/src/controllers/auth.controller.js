const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Doctor = require('../models/Doctor');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

async function registerDoctor(req, res) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    clinicName: Joi.string().allow('', null).optional(),
    clinicAddress: Joi.string().allow('', null).optional(),
    clinicPhone: Joi.string().allow('', null).optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const existing = await Doctor.findOne({ email: value.email.toLowerCase() });
  if (existing) throw new AppError(409, 'Doctor already registered with this email');

  const doctor = await Doctor.create({
    ...value,
    clinicName: value.clinicName || '',
    clinicAddress: value.clinicAddress || '',
    clinicPhone: value.clinicPhone || '',
  });

  return res.status(201).json({
    status: 'success',
    doctor: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      clinicPhone: doctor.clinicPhone,
      created_at: doctor.created_at,
    },
  });
}

async function loginDoctor(req, res) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const doctor = await Doctor.findOne({ email: value.email.toLowerCase() });
  if (!doctor) throw new AppError(401, 'Invalid credentials');

  const ok = await doctor.comparePassword(value.password);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  const token = jwt.sign({ doctorId: doctor._id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  return res.json({
    status: 'success',
    token,
    doctor: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      clinicPhone: doctor.clinicPhone,
    },
  });
}

module.exports = { registerDoctor, loginDoctor };

