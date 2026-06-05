const Joi = require('joi');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Symptom = require('../models/Symptom');
const PrescriptionMedicine = require('../models/PrescriptionMedicine');
const { AppError } = require('../utils/AppError');
const Doctor = require('../models/Doctor');

async function getPatientByReference(req, res) {
  const referenceId = req.params.referenceId;
  const patient = await Patient.findOne({ reference_id: referenceId });
  if (!patient) throw new AppError(404, 'Patient not found');

  return res.json({
    status: 'success',
    patient: {
      id: patient._id,
      reference_id: patient.reference_id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      created_at: patient.created_at,
      updated_at: patient.updated_at,
    },
  });
}

async function getPatientHistory(req, res) {
  const referenceId = req.params.referenceId;
  const patient = await Patient.findOne({ reference_id: referenceId });
  if (!patient) throw new AppError(404, 'Patient not found');

  const prescriptions = await Prescription.find({ patient_id: patient._id })
    .sort({ created_at: -1 })
    .populate({ path: 'doctor_id', select: 'name email clinicName clinicAddress clinicPhone' })
    .populate({ path: 'symptom_ids', select: 'name category' });

  const prescriptionIds = prescriptions.map((p) => p._id);
  const pmDocs = await PrescriptionMedicine.find({ prescription_id: { $in: prescriptionIds } }).populate({
    path: 'medicine_id',
    select: 'name category',
  });

  const pmByPrescription = new Map();
  for (const pm of pmDocs) {
    const key = String(pm.prescription_id);
    if (!pmByPrescription.has(key)) pmByPrescription.set(key, []);
    pmByPrescription.get(key).push({
      medicine_id: pm.medicine_id._id,
      name: pm.medicine_id.name,
      category: pm.medicine_id.category,
      dosage: pm.dosage,
      frequency: pm.frequency,
      duration: pm.duration,
      potency: pm.potency,
      instructions: pm.instructions,
      created_at: pm.created_at,
    });
  }

  return res.json({
    status: 'success',
    patient: {
      id: patient._id,
      reference_id: patient.reference_id,
      name: patient.name,
    },
    history: prescriptions.map((p) => ({
      prescription_id: p._id,
      created_at: p.created_at,
      notes: p.notes,
      doctor: {
        id: p.doctor_id._id,
        name: p.doctor_id.name,
        email: p.doctor_id.email,
        clinicName: p.doctor_id.clinicName,
        clinicAddress: p.doctor_id.clinicAddress,
        clinicPhone: p.doctor_id.clinicPhone,
      },
      symptoms: p.symptom_ids.map((s) => ({
        symptom_id: s._id,
        name: s.name,
        category: s.category,
      })),
      medicines: pmByPrescription.get(String(p._id)) || [],
    })),
  });
}

async function searchPatients(req, res) {
  const schema = Joi.object({
    phone: Joi.string().trim().optional(),
    email: Joi.string().email().optional(),
    name: Joi.string().trim().optional(),
    reference_id: Joi.string().trim().optional(),
  });

  const { error, value } = schema.validate(req.query, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const { phone, email, name, reference_id } = value;

  if (!phone && !email && !name && !reference_id) {
    throw new AppError(400, 'Provide at least one search field');
  }

  let query;
  if (reference_id) query = { reference_id };
  else if (phone) query = { phone };
  else if (email) query = { email: email.toLowerCase() };
  else query = { name: { $regex: new RegExp(name, 'i') } };

  const patients = await Patient.find(query).limit(20).sort({ created_at: -1 });

  return res.json({
    status: 'success',
    count: patients.length,
    results: patients.map((p) => ({
      id: p._id,
      reference_id: p.reference_id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      age: p.age,
      gender: p.gender,
      created_at: p.created_at,
    })),
  });
}

module.exports = { getPatientByReference, getPatientHistory, searchPatients };

