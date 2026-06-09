const express = require('express');
const router = express.Router();
const {
  getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/facultyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllFaculty);
router.get('/:id', getFacultyById);
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), createFaculty);
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), updateFaculty);
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), deleteFaculty);

module.exports = router;
