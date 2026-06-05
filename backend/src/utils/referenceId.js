const crypto = require('crypto');

function generateReferenceId() {
  // Stable format, generated only when creating a brand-new patient.
  // Example: RX-20260320-A1B2C3D4E5F6
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const rand = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `RX-${datePart}-${rand}`;
}

module.exports = { generateReferenceId };

