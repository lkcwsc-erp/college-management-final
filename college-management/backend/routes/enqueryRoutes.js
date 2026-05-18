const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../controllers/enqueryControllers');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public - student form submit karega
router.post('/', submitEnquiry);

// Protected - staff dekhega
router.get('/', protect, authorizeRoles('staff_student', 'admin'), getAllEnquiries);
router.put('/:id', protect, authorizeRoles('staff_student', 'admin'), updateEnquiryStatus);
router.delete('/:id', protect, authorizeRoles('staff_student', 'admin'), deleteEnquiry);

module.exports = router;
