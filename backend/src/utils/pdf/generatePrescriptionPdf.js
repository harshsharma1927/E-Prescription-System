const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

async function generatePrescriptionPdf({
  doctor,
  patient,
  referenceId,
  createdAt,
  symptoms,
  medicines,
  notes,
  outputPath,
}) {
  ensureDirForFile(outputPath);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const left = 50;
  const right = doc.page.width - 50;
  const width = right - left;

  // Doctor header block.
  doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(doctor.name || 'Doctor Name', left, 48, {
    width,
    align: 'center',
  });
  doc.font('Helvetica').fontSize(12).fillColor('#334155');
  if (doctor.clinicName) {
    doc.text(doctor.clinicName, left, 78, { width, align: 'center' });
  }
  const contactLine = [doctor.clinicAddress, doctor.clinicPhone, doctor.email].filter(Boolean).join(' | ');
  if (contactLine) doc.text(contactLine, left, doctor.clinicName ? 95 : 82, { width, align: 'center' });

  // Top separator.
  const headerBottomY = 125;
  doc.moveTo(left, headerBottomY).lineTo(right, headerBottomY).lineWidth(1).strokeColor('#94a3b8').stroke();

  // Patient and date row.
  const infoY = headerBottomY + 14;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
  doc.text('Patient:', left, infoY);
  doc.font('Helvetica').text(patient.name || '-', left + 42, infoY, { width: 170 });
  doc.font('Helvetica-Bold').text('Age/Sex:', left + 230, infoY);
  doc.font('Helvetica').text(`${patient.age ?? '-'} / ${patient.gender || '-'}`, left + 275, infoY, { width: 90 });
  doc.font('Helvetica-Bold').text('Date:', left + 378, infoY);
  doc.font('Helvetica').text(formatDate(createdAt || new Date()), left + 410, infoY);

  const refY = infoY + 18;
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#065f46').text(`REFERENCE ID: ${referenceId}`, left, refY, {
    width,
    align: 'left',
  });
  if (patient.phone || patient.email) {
    doc.font('Helvetica').fontSize(9).fillColor('#334155').text(
      `Contact: ${patient.phone || '-'}${patient.phone && patient.email ? ' | ' : ''}${patient.email || ''}`,
      left,
      refY + 16
    );
  }

  // Rx block.
  const rxY = refY + 48;
  doc.font('Helvetica-Bold').fontSize(32).fillColor('#0f766e').text('R', left, rxY);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f766e').text('x', left + 18, rxY + 4);

  let cursorY = rxY + 10;
  doc.fontSize(10).fillColor('#111827');
  (medicines || []).forEach((m, idx) => {
    cursorY += 28;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`${idx + 1}. ${m.name}`, left + 36, cursorY, {
      width: width - 36,
    });
    cursorY += 14;
    doc.font('Helvetica').fontSize(10).fillColor('#334155').text(
      `${m.dosage || '-'} | ${m.frequency || '-'} | ${m.duration || '-'}${m.potency ? ` | ${m.potency}` : ''}`,
      left + 36,
      cursorY
    );
    if (m.instructions) {
      cursorY += 13;
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#475569').text(`Instructions: ${m.instructions}`, left + 36, cursorY, {
        width: width - 36,
      });
    }
  });

  // Footer clinical notes.
  cursorY += 24;
  const symptomsText = (symptoms || []).map((s) => (s.category ? `${s.name} (${s.category})` : s.name)).join(', ');
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text('Symptoms:', left, cursorY);
  doc.font('Helvetica').fontSize(10).text(symptomsText || '-', left + 55, cursorY, { width: width - 55 });
  cursorY += 18;
  doc.font('Helvetica-Bold').text('Notes:', left, cursorY);
  doc.font('Helvetica').text(notes && notes.trim() ? notes.trim() : '-', left + 35, cursorY, { width: width - 35 });

  // Signature area.
  const signY = doc.page.height - 95;
  doc.moveTo(right - 170, signY).lineTo(right - 20, signY).lineWidth(0.8).strokeColor('#64748b').stroke();
  doc.font('Helvetica').fontSize(9).fillColor('#475569').text('Doctor Signature', right - 150, signY + 4, {
    width: 130,
    align: 'center',
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = { generatePrescriptionPdf };

