const path = require('path');
const { transporter } = require('../config/mailer');
const { AppError } = require('../utils/AppError');

async function sendPrescriptionEmail({ to, patientName, doctorName, referenceId, filePath }) {
  if (!to) throw new AppError(400, 'Patient email is required to send prescription');
  if (!filePath) throw new AppError(500, 'Missing PDF file path for email attachment');

  const mailOptions = {
    to,
    subject: 'Your Prescription',
    text: [
      `Dear ${patientName},`,
      '',
      'Please find your prescription attached as a PDF.',
      '',
      `Doctor: ${doctorName}`,
      `Reference ID: ${referenceId}`,
      '',
      'Please keep this Reference ID for future visits. This ID will remain the same for all your prescriptions.',
    ].join('\n'),
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath,
        contentType: 'application/pdf',
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendPrescriptionEmail };

