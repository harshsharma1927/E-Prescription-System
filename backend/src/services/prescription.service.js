const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const PrescriptionMedicine = require('../models/PrescriptionMedicine');
const Symptom = require('../models/Symptom');
const Medicine = require('../models/Medicine');
const SymptomMedicine = require('../models/SymptomMedicine');

const { AppError } = require('../utils/AppError');
const { generatePrescriptionPdf } = require('../utils/pdf/generatePrescriptionPdf');
const { uploadRawFile } = require('./cloudinary.service');
const { sendPrescriptionEmail } = require('./email.service');
const { findOrCreatePatient } = require('./patient.service');

async function createPrescription({ doctorId, patient, symptom_ids, medicines, notes }) {
  const schema = Joi.object({
    patient: Joi.object({
      phone: Joi.string().trim().optional(),
      email: Joi.string().email().trim().optional(),
      name: Joi.string().min(2).trim().optional(),
      age: Joi.number().optional().allow(null),
      gender: Joi.string().trim().optional().allow(null, ''),
    }).required(),
    symptom_ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    medicines: Joi.array()
      .items(
        Joi.object({
          medicine_id: Joi.string().hex().length(24).required(),
          dosage: Joi.string().allow('', null).required(),
          frequency: Joi.string().allow('', null).required(),
          duration: Joi.string().allow('', null).required(),
          potency: Joi.string().allow('', null).optional(),
          instructions: Joi.string().allow('', null).optional(),
        })
      )
      .min(1)
      .required(),
    notes: Joi.string().allow('', null).optional(),
  });

  const { value, error } = schema.validate({ patient, symptom_ids, medicines, notes }, { abortEarly: false });
  if (error) throw new AppError(400, 'Validation error', error.details.map((d) => d.message));

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError(401, 'Doctor not found');

  const uniqueSymptomIds = [...new Set(value.symptom_ids.map((id) => String(id)))];
  if (uniqueSymptomIds.length !== value.symptom_ids.length) {
    throw new AppError(400, 'Duplicate symptom_ids are not allowed');
  }

  const symptomDocs = await Symptom.find({ _id: { $in: uniqueSymptomIds } });
  if (symptomDocs.length !== uniqueSymptomIds.length) {
    throw new AppError(400, 'One or more symptoms are invalid');
  }

  const medicineIds = value.medicines.map((m) => m.medicine_id);
  const uniqueMedicineIds = [...new Set(medicineIds.map((id) => String(id)))];
  if (uniqueMedicineIds.length !== medicineIds.length) {
    throw new AppError(400, 'Duplicate medicines are not allowed in a single prescription');
  }

  const medicineDocs = await Medicine.find({ _id: { $in: uniqueMedicineIds } });
  if (medicineDocs.length !== uniqueMedicineIds.length) {
    throw new AppError(400, 'One or more medicines are invalid');
  }

  // Ensure each selected medicine is linked to at least one selected symptom.
  const mappings = await SymptomMedicine.find({
    symptom_id: { $in: uniqueSymptomIds },
    medicine_id: { $in: uniqueMedicineIds },
  });
  const allowed = new Set(mappings.map((m) => String(m.medicine_id)));
  const invalidMedicine = value.medicines.find((m) => !allowed.has(String(m.medicine_id)));
  if (invalidMedicine) {
    throw new AppError(
      400,
      'Selected medicine does not match selected symptoms',
      'Ensure medicines are fetched based on chosen symptoms.'
    );
  }

  const createdAtForPdf = new Date();
  const pdfFilePath = path.join(
    __dirname,
    '..',
    '..',
    'tmp',
    `prescription_${doctorId}_${Date.now()}_${Math.random().toString(16).slice(2)}.pdf`
  );

  let prescriptionDoc;
  try {
    const patientDoc = await findOrCreatePatient(value.patient);

    // Create prescription first (pdf_url will be updated after generation).
    prescriptionDoc = await Prescription.create({
      patient_id: patientDoc._id,
      doctor_id: doctor._id,
      symptom_ids: uniqueSymptomIds,
      notes: value.notes || '',
      pdf_url: 'PENDING_UPLOAD',
    });

    await PrescriptionMedicine.insertMany(
      value.medicines.map((m) => ({
        prescription_id: prescriptionDoc._id,
        medicine_id: m.medicine_id,
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
        potency: m.potency || '',
        instructions: m.instructions || '',
      }))
    );

    // Reload patient for consistent reference_id + latest fields.
    const patientFresh = await Patient.findById(patientDoc._id);

    // Prepare medicines list for PDF in the same order the doctor selected.
    const medicineById = new Map(medicineDocs.map((d) => [String(d._id), d]));
    const medicinesForPdf = value.medicines.map((m) => {
      const med = medicineById.get(String(m.medicine_id));
      return {
        name: med.name,
        category: med.category,
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
        potency: m.potency || '',
        instructions: m.instructions || '',
      };
    });

    const symptomsForPdf = symptomDocs.map((s) => ({ _id: s._id, name: s.name, category: s.category }));

    await generatePrescriptionPdf({
      doctor: {
        name: doctor.name,
        email: doctor.email,
        clinicName: doctor.clinicName,
        clinicAddress: doctor.clinicAddress,
        clinicPhone: doctor.clinicPhone,
      },
      patient: {
        name: patientFresh.name,
        email: patientFresh.email,
        phone: patientFresh.phone,
        age: patientFresh.age,
        gender: patientFresh.gender,
      },
      referenceId: patientFresh.reference_id,
      createdAt: prescriptionDoc.created_at || createdAtForPdf,
      symptoms: symptomsForPdf,
      medicines: medicinesForPdf,
      notes: value.notes || '',
      outputPath: pdfFilePath,
    });

    const secureUrl = await uploadRawFile({
      filePath: pdfFilePath,
      publicId: `prescriptions/${prescriptionDoc._id}/${Date.now()}`,
    });

    await Prescription.updateOne({ _id: prescriptionDoc._id }, { $set: { pdf_url: secureUrl } });

    // Send email attachment (no link). Reference ID must be clearly mentioned.
    if (!patientFresh.email) {
      throw new AppError(400, 'Patient email is required to send prescription email');
    }

    await sendPrescriptionEmail({
      to: patientFresh.email,
      patientName: patientFresh.name,
      doctorName: doctor.name,
      referenceId: patientFresh.reference_id,
      filePath: pdfFilePath,
    });

    return {
      prescription_id: prescriptionDoc._id,
      patient_id: patientFresh._id,
      patient_reference_id: patientFresh.reference_id,
      created_at: prescriptionDoc.created_at,
    };
  } finally {
    // Delete local file after uploading + emailing.
    try {
      if (fs.existsSync(pdfFilePath)) fs.unlinkSync(pdfFilePath);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete temp PDF:', err?.message || err);
    }
  }
}

module.exports = { createPrescription };

