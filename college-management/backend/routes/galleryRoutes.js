const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery
} = require('../controllers/galleryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Multer storage config — saves files to uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'gallery-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
  }
});

// Routes
router.get('/', getAllGallery);
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), upload.single('image'), createGallery);
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), upload.single('image'), updateGallery);
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), deleteGallery);

module.exports = router;
