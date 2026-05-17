const express = require('express');
const router = express.Router();
const {
  register,
  registerStudent,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
  changePassword,
  getAllStudentUsers,
  deleteStudentUser,
  createStaff,
  getAllStaff,
  deleteStaff
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Admin-only
router.post('/register', protect, authorizeRoles('admin'), register);

// Admin: Staff Management
router.post('/create-staff', protect, authorizeRoles('admin'), createStaff);
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);
router.delete('/staff/:id', protect, authorizeRoles('admin'), deleteStaff);

// Staff/Admin
router.post('/register-student', protect, authorizeRoles('staff', 'staff_student', 'admin'), registerStudent);
router.get('/students', protect, authorizeRoles('staff', 'staff_student', 'admin'), getAllStudentUsers);
router.delete('/students/:id', protect, authorizeRoles('staff', 'staff_student', 'admin'), deleteStudentUser);

// Authenticated user
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
