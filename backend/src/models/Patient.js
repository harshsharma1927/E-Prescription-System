const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    reference_id: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    // Unique so we can reliably reuse reference_id for returning patients.
    phone: { type: String, trim: true, unique: true, sparse: true, index: true },

    age: { type: Number, default: null },
    gender: { type: String, trim: true, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'patients',
  }
);

module.exports = mongoose.model('Patient', PatientSchema);

