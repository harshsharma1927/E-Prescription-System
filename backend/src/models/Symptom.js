const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true, unique: true },
    category: { type: String, trim: true, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'symptoms',
  }
);

module.exports = mongoose.model('Symptom', SymptomSchema);

