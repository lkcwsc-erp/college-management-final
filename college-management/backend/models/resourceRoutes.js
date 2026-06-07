const express = require('express');
const router  = express.Router();
const Resource = require('../models/Resource');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public — website
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Principal — create
router.post('/', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const r = await Resource.create({ ...req.body, createdBy: req.user.name || req.user.email });
    res.status(201).json({ success: true, resource: r });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Principal — update
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const r = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, resource: r });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Principal — delete
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
