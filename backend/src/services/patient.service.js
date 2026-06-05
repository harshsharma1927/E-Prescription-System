const Joi = require('joi');
const Patient = require('../models/Patient');
const { generateReferenceId } = require('../utils/referenceId');
const { AppError } = require('../utils/AppError');

async function findOrCreatePatient({ phone, email, name, age, gender }) {
  const schema = Joi.object({
    phone: Joi.string().trim().optional(),
    email: Joi.string().email().trim().optional(),
    name: Joi.string().trim().min(2).optional(),
    age: Joi.number().optional().allow(null),
    gender: Joi.string().trim().optional().allow(null, ''),
  });

  const { value, error } = schema.validate({ phone, email, name, age, gender }, { abortEarly: false });
  if (error) throw new AppError(400, 'Invalid patient data', error.details.map((d) => d.message));

  const normalizedPhone = value.phone ? value.phone : undefined;
  const normalizedEmail = value.email ? value.email.toLowerCase() : undefined;

  if (!normalizedPhone && !normalizedEmail) {
    throw new AppError(400, 'Provide at least `phone` or `email` to identify the patient');
  }

  const phonePatient = normalizedPhone ? await Patient.findOne({ phone: normalizedPhone }) : null;
  const emailPatient = normalizedEmail ? await Patient.findOne({ email: normalizedEmail }) : null;

  // If both match but they are different documents, we cannot safely reuse a single reference_id.
  if (phonePatient && emailPatient && String(phonePatient._id) !== String(emailPatient._id)) {
    throw new AppError(
      409,
      'Patient collision detected',
      'Phone and email belong to different patient records. Please resolve duplicates.'
    );
  }

  const existing = phonePatient || emailPatient;
  if (existing) {
    // Reuse reference_id; only update missing fields.
    const update = {
      ...(value.name ? { name: value.name } : {}),
      ...(value.age !== undefined ? { age: value.age } : {}),
      ...(value.gender ? { gender: value.gender } : {}),
      ...(normalizedEmail && !existing.email ? { email: normalizedEmail } : {}),
      ...(normalizedPhone && !existing.phone ? { phone: normalizedPhone } : {}),
    };

    await Patient.updateOne({ _id: existing._id }, { $set: update });
    const refreshed = await Patient.findById(existing._id);
    return refreshed;
  }

  if (!value.name) {
    throw new AppError(400, 'New patient requires `name`');
  }

  const reference_id = generateReferenceId();
  // Extra safety: ensure uniqueness by retrying on rare duplicate key collisions.
  const maxAttempts = 5;
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const ref = attempt === 0 ? reference_id : generateReferenceId();
    try {
      const created = await Patient.create({
        reference_id: ref,
        name: value.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        age: value.age ?? null,
        gender: value.gender ?? null,
      });
      return created;
    } catch (err) {
      lastErr = err;
      // eslint-disable-next-line no-continue
      if (err && err.code === 11000) continue;
      throw err;
    }
  }
  throw new AppError(500, 'Failed to generate unique patient reference_id', lastErr?.message);
}

module.exports = { findOrCreatePatient };

