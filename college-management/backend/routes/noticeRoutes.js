const express = require('express');
const router = express.Router();
const {
  getAllNotices, createNotice, updateNotice, deleteNotice
} = require('../controllers/noticeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllNotices);
router.post('/', protect, authorizeRoles('admin', 'staff', 'staff_principal'), createNotice);
router.put('/:id', protect, authorizeRoles('admin', 'staff', 'staff_principal'), updateNotice);
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), deleteNotice);

// Student Section — get messages from Admin
router.get('/staff-student', protect, authorizeRoles('staff_student', 'staff_principal'), async (req, res) => {
  try {
    const notices = await require('../models/Notice').find({
      targetAudience: { $in: ['staff_student', 'staff', 'all'] },
      isActive: true
    }).sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mark notice as read
router.put('/mark-read/:id', protect, async (req, res) => {
  try {
    const notice = await require('../models/Notice').findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user.email } },
      { new: true }
    );
    res.json({ success: true, notice });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


module.exports = router;
