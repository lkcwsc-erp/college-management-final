const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  markAsRead,
  updateReply,
  deleteContact,
} = require('../controllers/contactController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/',                createContact);
router.get('/',                 protect, authorizeRoles('admin'), getAllContacts);
router.put('/:id/read',         protect, authorizeRoles('admin'), markAsRead);
router.put('/:id/reply',        protect, authorizeRoles('admin'), updateReply);   // ✅ NEW
router.delete('/:id',           protect, authorizeRoles('admin'), deleteContact); // ✅ NEW

module.exports = router;
