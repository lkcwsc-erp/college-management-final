// controllers/docFeeTypeController.js
const DocFeeType = require('../models/DocFeeType');

const DEFAULT_DOC_FEES = [
  { key: 'BONAFIDE',  label: '📋 Bonafide Certificate',      price: 30,  isDefault: true, status: 'approved' },
  { key: 'ID_CARD',   label: '🪪 ID Card',                   price: 100, isDefault: true, status: 'approved' },
  { key: 'MARKSHEET', label: '📄 Marksheet',                 price: 50,  isDefault: true, status: 'approved' },
  { key: 'MIGRATION', label: '📜 Migration Certificate',     price: 200, isDefault: true, status: 'approved' },
  { key: 'TC',        label: '🎓 Transfer Certificate (TC)', price: 150, isDefault: true, status: 'approved' },
];

// Seed defaults if not exist
exports.seedDefaults = async () => {
  for (const d of DEFAULT_DOC_FEES) {
    await DocFeeType.findOneAndUpdate({ key: d.key }, d, { upsert: true, new: true });
  }
};

// GET /api/doc-fee-types — all (accounts/principal)
exports.getAll = async (req, res) => {
  try {
    const docs = await DocFeeType.find().sort({ createdAt: 1 });
    res.json({ success: true, docFeeTypes: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/doc-fee-types/approved — only approved (for collect fees)
exports.getApproved = async (req, res) => {
  try {
    const docs = await DocFeeType.find({ status: 'approved' }).sort({ createdAt: 1 });
    res.json({ success: true, docFeeTypes: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/doc-fee-types — accounts adds new (goes to pending)
exports.create = async (req, res) => {
  try {
    const { label, price } = req.body;
    if (!label || price === undefined) {
      return res.status(400).json({ success: false, message: 'Label and price required.' });
    }
    const key = 'CUSTOM_' + label.replace(/\s+/g, '_').toUpperCase() + '_' + Date.now();
    const doc = await DocFeeType.create({
      label: label.trim(), key, price: Number(price),
      status: 'pending',
      addedBy: req.user?.name || 'Accounts Staff',
      addedById: req.user?._id,
    });
    res.status(201).json({ success: true, message: 'Submitted for approval.', docFeeType: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/doc-fee-types/:id/approve — principal/admin approves
exports.approve = async (req, res) => {
  try {
    const doc = await DocFeeType.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    doc.status = 'approved';
    doc.approvedBy = req.user?.name || '';
    doc.approvedById = req.user?._id;
    doc.approvedAt = new Date();
    await doc.save();
    res.json({ success: true, message: 'Approved.', docFeeType: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/doc-fee-types/:id/reject — principal/admin rejects
exports.reject = async (req, res) => {
  try {
    const doc = await DocFeeType.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    doc.status = 'rejected';
    doc.rejectedReason = req.body.reason || '';
    await doc.save();
    res.json({ success: true, message: 'Rejected.', docFeeType: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/doc-fee-types/:id — update price (accounts, goes pending again)
exports.updatePrice = async (req, res) => {
  try {
    const doc = await DocFeeType.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    doc.price = Number(req.body.price) || doc.price;
    doc.label = req.body.label || doc.label;
    if (!doc.isDefault) doc.status = 'pending'; // needs re-approval
    doc.approvedBy = '';
    doc.approvedAt = null;
    await doc.save();
    res.json({ success: true, message: 'Updated, pending approval.', docFeeType: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/doc-fee-types/:id
exports.remove = async (req, res) => {
  try {
    const doc = await DocFeeType.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    if (doc.isDefault) return res.status(400).json({ success: false, message: 'Default document types cannot be deleted.' });
    await doc.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
