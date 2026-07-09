// controllers/feeStructureApprovalController.js

const FeeStructureApproval = require('../models/FeeStructureApproval');

// ── Accounts Section: Submit new approval request ────────────────────────────
exports.submitApproval = async (req, res) => {
  try {
    const { courseKey, itemId, itemName, itemSection, oldAmounts, newAmounts, isNewItem, isDeletion } = req.body;
    if (!courseKey || !itemId || !itemName || !newAmounts) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Cancel any previous pending request for same item
    await FeeStructureApproval.updateMany(
      { courseKey, itemId, status: { $in: ['pending_principal', 'approved_by_principal', 'pending_admin'] } },
      { $set: { status: 'rejected_by_admin', adminNote: 'Superseded by new request' } }
    );

    const approval = await FeeStructureApproval.create({
      submittedBy: req.user?.name || 'Accounts Staff',
      submittedByEmail: req.user?.email || '',
      courseKey, itemId, itemName, itemSection,
      oldAmounts: oldAmounts || [],
      newAmounts,
      isNewItem: !!isNewItem,
      isDeletion: !!isDeletion,
      status: 'pending_principal',
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all approvals (accounts can see their own) ───────────────────────────
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    // accounts staff can filter by their own email
    if (req.query.myOnly === 'true' && req.user?.email) {
      filter.submittedByEmail = req.user.email;
    }
    const approvals = await FeeStructureApproval.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, approvals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Principal: Approve ────────────────────────────────────────────────────────
exports.principalApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_principal') {
      return res.status(400).json({ success: false, message: 'Not pending principal approval' });
    }
    approval.status = 'pending_admin';
    approval.principalNote = req.body.note || '';
    approval.principalApprovedAt = new Date();
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Principal: Reject ─────────────────────────────────────────────────────────
exports.principalReject = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    approval.status = 'rejected_by_principal';
    approval.principalNote = req.body.reason || 'Rejected by Principal';
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Approve ────────────────────────────────────────────────────────────
exports.adminApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_admin') {
      return res.status(400).json({ success: false, message: 'Not pending admin approval' });
    }
    approval.status = 'approved';
    approval.adminNote = req.body.note || '';
    approval.adminApprovedAt = new Date();
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Reject ─────────────────────────────────────────────────────────────
exports.adminReject = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    approval.status = 'rejected_by_admin';
    approval.adminNote = req.body.reason || 'Rejected by Admin';
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get pending counts (for badges) ──────────────────────────────────────────
exports.getPendingCounts = async (req, res) => {
  try {
    const principalPending = await FeeStructureApproval.countDocuments({ status: 'pending_principal' });
    const adminPending     = await FeeStructureApproval.countDocuments({ status: 'pending_admin' });
    res.json({ success: true, principalPending, adminPending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
