// utils/expenseUpload.js
// Separate multer config for expense bill/invoice uploads.
// Max file size: 200 KB  |  Accepted types: PDF, JPG, PNG

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext   = path.extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';
    return {
      folder:        'college-expense-bills',
      resource_type: isPdf ? 'raw' : 'image',
      public_id:     `bill-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      format:        isPdf ? 'pdf' : undefined,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only PDF, JPG, and PNG files are allowed for bill uploads.'));
};

const expenseUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter,
});

module.exports = expenseUpload;
