const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true, unique: true },
    category: { type: String, trim: true, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'medicines',
  }
);

module.exports = mongoose.model('Medicine', MedicineSchema);

