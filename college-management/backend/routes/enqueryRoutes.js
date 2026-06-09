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
router.get('/', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), getAllEnquiries);
router.put('/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), updateEnquiryStatus);
router.delete('/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), deleteEnquiry);

module.exports = router;
