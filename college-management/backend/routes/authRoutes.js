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
  deleteStaff,
  updateStaff, // ✅ ADDED
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
router.put('/staff/:id', protect, authorizeRoles('admin'), updateStaff); // ✅ ADDED
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

// ── Send credentials email to student ──────────────────────────────────────
router.post('/send-credentials', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const { studentEmail, studentName, username, password } = req.body;
    if (!studentEmail || !username || !password)
      return res.status(400).json({ success: false, message: 'studentEmail, username and password are required' });
    const { sendCredentialsEmail } = require('../utils/emailService');
    const result = await sendCredentialsEmail(studentEmail, studentName || 'Student', username, password);
    if (result.success) {
      res.json({ success: true, message: `Credentials sent to ${studentEmail}` });
    } else {
      res.status(500).json({ success: false, message: 'Email failed: ' + result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: Send message to staff/students ───────────────────────────────────
router.post('/send-message', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const { recipients, subject, message } = req.body; // recipients: [{email, name}]
    if (!recipients?.length || !subject || !message)
      return res.status(400).json({ success: false, message: 'recipients, subject and message required' });

    const { sendMessageEmail } = require('../utils/emailService');
    const fromName = req.user.name || 'Admin';
    const results = await Promise.allSettled(
      recipients.map(r => sendMessageEmail(r.email, r.name || r.email, subject, message, fromName))
    );
    const sent     = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed   = results.length - sent;
    res.json({ success: true, message: `Sent: ${sent}, Failed: ${failed}`, sent, failed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
