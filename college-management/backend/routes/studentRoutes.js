const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudentById, getMyProfile,
  createStudent, updateStudent, deleteStudent
} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('admin', 'staff', 'staff_student', 'staff_principal', 'staff_accounts', 'staff_exam', 'staff_scholarship'), getAllStudents);
router.get('/my-profile', protect, authorizeRoles('student'), getMyProfile);
router.get('/:id', protect, authorizeRoles('admin', 'staff', 'staff_student', 'staff_principal', 'staff_accounts', 'staff_exam', 'staff_scholarship'), getStudentById);
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), createStudent);
router.put('/:id', protect, authorizeRoles('admin', 'staff', 'staff_principal'), updateStudent);
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), deleteStudent);

module.exports = router;
