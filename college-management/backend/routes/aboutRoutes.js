const express = require('express');
const router = express.Router();
const { getAbout, updateAbout } = require('../controllers/aboutController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/', getAbout);
router.put('/', protect, authorizeRoles('admin', 'staff_principal'), updateAbout);

router.post('/upload-photo', protect, authorizeRoles('admin', 'staff_principal'),
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      res.status(200).json({
        success: true,
        message: 'Photo uploaded successfully',
        photoUrl,
        filename: req.file.filename
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
