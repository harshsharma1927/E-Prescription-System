const mongoose = require('mongoose');

const PrescriptionMedicineSchema = new mongoose.Schema(
  {
    prescription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true, index: true },
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },

    dosage: { type: String, trim: true, default: '' },
    frequency: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    potency: { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'prescription_medicines',
  }
);

// Allow duplicate medicine within same prescription if needed (but usually unique).
PrescriptionMedicineSchema.index({ prescription_id: 1, medicine_id: 1 });

module.exports = mongoose.model('PrescriptionMedicine', PrescriptionMedicineSchema);

