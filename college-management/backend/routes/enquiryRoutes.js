const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../controllers/enquiryController');

router.post('/', submitEnquiry);
router.get('/', getAllEnquiries);
router.put('/:id', updateEnquiryStatus);
router.delete('/:id', deleteEnquiry);

module.exports = router;
