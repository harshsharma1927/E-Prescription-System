const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
  {
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },

    // Keep symptoms in the prescription for history + PDF rendering.
    symptom_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Symptom', required: true, index: true }],

    notes: { type: String, trim: true, default: '' },

    // Cloudinary secure_url stored for internal use; never expose it publicly.
    pdf_url: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'prescriptions',
  }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);

