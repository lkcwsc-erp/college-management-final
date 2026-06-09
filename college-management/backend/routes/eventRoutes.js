const express = require('express');
const router = express.Router();
const {
  getAllEvents, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllEvents);
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), createEvent);
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), updateEvent);
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), deleteEvent);

module.exports = router;
