const axios = require('axios');
const fs = require('fs');
const path = require('path');

const Prescription = require('../models/Prescription');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const { createPrescription } = require('../services/prescription.service');

const getPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prescription = await Prescription.findById(id);
  if (!prescription) throw new AppError(404, 'Prescription not found');

  if (String(prescription.doctor_id) !== String(req.user.doctorId)) {
    throw new AppError(403, 'Forbidden');
  }

  if (!prescription.pdf_url || prescription.pdf_url === 'PENDING_UPLOAD') {
    throw new AppError(404, 'PDF not ready');
  }

  if (prescription.pdf_url.startsWith('local://')) {
    const relative = prescription.pdf_url.replace('local://', '');
    const absPath = path.join(__dirname, '..', '..', relative);
    if (!fs.existsSync(absPath)) throw new AppError(404, 'Local PDF not found');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prescription_${id}.pdf"`);
    fs.createReadStream(absPath).pipe(res);
    return;
  }

  const response = await axios.get(prescription.pdf_url, { responseType: 'stream' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="prescription_${id}.pdf"`);

  // Stream the Cloudinary raw asset to the authenticated doctor.
  response.data.pipe(res);
});

const postCreate = asyncHandler(async (req, res) => {
  const result = await createPrescription({
    doctorId: req.user.doctorId,
    patient: req.body.patient,
    symptom_ids: req.body.symptom_ids,
    medicines: req.body.medicines,
    notes: req.body.notes,
  });

  return res.status(201).json({ status: 'success', ...result });
});

module.exports = { postCreate, getPdf };

