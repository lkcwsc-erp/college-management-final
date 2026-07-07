// controllers/feeStructureApprovalController.js

const FeeStructureApproval = require('../models/FeeStructureApproval');
const CollegeFeeStructure  = require('../models/CollegeFeeStructure');

// ── Accounts Section: Submit a NEW academic-year fee structure ──────────────
// POST /api/fee-structure-approvals/submit-year
// Body: { academicYear, sourceYear, structureData }
// Structure is NOT applied yet — Principal approves, phir Admin approves,
// tabhi adminApprove me CollegeFeeStructure DB me upsert hota hai (live).
exports.submitYearStructure = async (req, res) => {
  try {
    const { academicYear, sourceYear, structureData } = req.body;

    if (!/^\d{4}-\d{2}$/.test(academicYear || '')) {
      return res.status(400).json({ success: false, message: 'academicYear format YYYY-YY hona chahiye (e.g. 2026-27)' });
    }
    if (!structureData || !structureData['B.Sc.'] || !structureData['B.A.']) {
      return res.status(400).json({ success: false, message: 'structureData me B.Sc. aur B.A. dono chahiye' });
    }
    for (const ck of ['B.Sc.', 'B.A.']) {
      const items = structureData[ck]?.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: `${ck} ke fee items missing hain` });
      }
    }

    // Already live in DB?
    const existsLive = await CollegeFeeStructure.findOne({ academicYear, isActive: true });
    if (existsLive) {
      return res.status(409).json({ success: false, message: `${academicYear} ka fee structure already live hai` });
    }

    // Already a pending request for this year?
    const existsPending = await FeeStructureApproval.findOne({
      isNewYearStructure: true,
      academicYear,
      status: { $in: ['pending_principal', 'approved_by_principal', 'pending_admin'] },
    });
    if (existsPending) {
      return res.status(409).json({ success: false, message: `${academicYear} ke liye ek request pehle se approval me hai` });
    }

    const approval = await FeeStructureApproval.create({
      submittedBy:      req.user?.name || 'Accounts Staff',
      submittedByEmail: req.user?.email || '',
      isNewYearStructure: true,
      academicYear,
      sourceYear:  sourceYear || '',
      structureData,
      // Display fields so older UIs still show something meaningful:
      courseKey: 'YEAR',
      itemName:  `New Fee Structure — ${academicYear}`,
      status: 'pending_principal',
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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

    // New-year structure? → Admin approval par hi structure LIVE hota hai:
    // dono courses CollegeFeeStructure DB me upsert — Accounts, Collect Fees,
    // aur Scholarship (MahaDBT Receivable) sab jagah turant available.
    if (approval.isNewYearStructure && approval.structureData && approval.academicYear) {
      for (const ck of ['B.Sc.', 'B.A.']) {
        const items = approval.structureData?.[ck]?.items;
        if (!Array.isArray(items) || items.length === 0) continue;
        let doc = await CollegeFeeStructure.findOne({ courseType: ck, academicYear: approval.academicYear });
        if (doc) {
          doc.items = items;
          doc.isActive = true;
          doc.updatedBy = req.user?.name || 'Admin';
          doc.markModified('items');
          await doc.save();
        } else {
          await CollegeFeeStructure.create({
            courseType: ck,
            academicYear: approval.academicYear,
            items,
            createdBy: approval.submittedBy || 'Accounts Staff',
            isActive: true,
          });
        }
      }
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
