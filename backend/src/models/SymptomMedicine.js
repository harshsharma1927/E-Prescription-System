const mongoose = require('mongoose');

const SymptomMedicineSchema = new mongoose.Schema(
  {
    symptom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Symptom', required: true, index: true },
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'symptom_medicines',
  }
);

SymptomMedicineSchema.index({ symptom_id: 1, medicine_id: 1 }, { unique: true });

module.exports = mongoose.model('SymptomMedicine', SymptomMedicineSchema);

