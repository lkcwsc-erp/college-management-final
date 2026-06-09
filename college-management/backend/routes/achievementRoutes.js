const express = require('express');
const router  = express.Router();
const Achievement = require('../models/Achievement');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Admin — all including inactive
router.get('/all', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, achievements });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Public — website (only active)
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, achievements });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin — create
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const a = await Achievement.create({ ...req.body, createdBy: req.user.name || req.user.email });
    res.status(201).json({ success: true, achievement: a });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin — update
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const a = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, achievement: a });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin — delete
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
