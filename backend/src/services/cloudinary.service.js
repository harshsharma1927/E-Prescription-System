const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function hasCloudinaryConfig() {
  const invalid = [undefined, null, '', 'your_cloud_name', 'your_api_key', 'your_api_secret'];
  return (
    !invalid.includes(env.CLOUDINARY_CLOUD_NAME) &&
    !invalid.includes(env.CLOUDINARY_API_KEY) &&
    !invalid.includes(env.CLOUDINARY_API_SECRET)
  );
}

function persistLocalPdf(filePath, publicId) {
  const sanitized = String(publicId || 'prescriptions/local').replace(/[^\w/-]/g, '_');
  const outputDir = path.join(__dirname, '..', '..', 'storage', path.dirname(sanitized));
  const outputPath = path.join(outputDir, `${path.basename(sanitized)}.pdf`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(filePath, outputPath);
  const rel = path.relative(path.join(__dirname, '..', '..'), outputPath).replace(/\\/g, '/');
  return `local://${rel}`;
}

async function uploadRawFile({ filePath, publicId }) {
  if (!fs.existsSync(filePath)) throw new AppError(400, `Local PDF file not found: ${filePath}`);

  if (!hasCloudinaryConfig()) {
    if (!env.ALLOW_DEV_FALLBACKS) {
      throw new AppError(500, 'Cloudinary credentials are missing');
    }
    return persistLocalPdf(filePath, publicId);
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      public_id: publicId,
    });
    return result.secure_url;
  } catch (err) {
    if (!env.ALLOW_DEV_FALLBACKS) throw err;
    return persistLocalPdf(filePath, publicId);
  }
}

module.exports = { uploadRawFile };

