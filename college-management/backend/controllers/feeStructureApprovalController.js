// controllers/feeStructureApprovalController.js

const FeeStructureApproval = require('../models/FeeStructureApproval');
const CollegeFeeStructure  = require('../models/CollegeFeeStructure');

const BASE_STRUCT_YEAR = '2025-26';

// Requests submitted from the Scholarship section go Accounts → Principal
// (final). Everything else (Accounts Section itself) goes the original
// Principal → Admin (final) chain.
const initialStatusFor = (role) => (role === 'staff_scholarship' ? 'pending_accounts' : 'pending_principal');
const IN_FLIGHT_STATUSES = ['pending_accounts', 'approved_by_accounts', 'pending_principal', 'approved_by_principal', 'pending_admin'];

// ── Accounts / Scholarship: Submit an item add / edit / delete for approval ─
// Works for BOTH the base year and any custom year — every fee-structure
// change goes through its approval chain before it is applied anywhere.
exports.submitApproval = async (req, res) => {
  try {
    const { courseKey, itemId, itemName, itemSection, oldAmounts, newAmounts, isNewItem, isDeletion, academicYear } = req.body;
    if (!courseKey || !itemId || !itemName || !newAmounts) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const ay = academicYear || BASE_STRUCT_YEAR;

    // Cancel any previous pending request for same item + same year
    await FeeStructureApproval.updateMany(
      { courseKey, itemId, academicYear: ay, status: { $in: IN_FLIGHT_STATUSES } },
      { $set: { status: 'rejected_by_admin', adminNote: 'Superseded by new request' } }
    );

    const approval = await FeeStructureApproval.create({
      submittedBy: req.user?.name || 'Staff',
      submittedByEmail: req.user?.email || '',
      submitterRole: req.user?.role || '',
      courseKey, itemId, itemName, itemSection,
      academicYear: ay,
      oldAmounts: oldAmounts || [],
      newAmounts,
      isNewItem: !!isNewItem,
      isDeletion: !!isDeletion,
      status: initialStatusFor(req.user?.role),
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Accounts / Scholarship: Submit a NEW academic-year fee structure ────────
// POST /api/fee-structure-approvals/submit-year
// Body: { academicYear, sourceYear, structureData }
// Structure is NOT applied yet — it goes through its approval chain, only
// then is it upserted into the CollegeFeeStructure DB (live).
exports.submitYearStructure = async (req, res) => {
  try {
    const { academicYear, sourceYear, structureData } = req.body;

    if (!/^\d{4}-\d{2}$/.test(academicYear || '')) {
      return res.status(400).json({ success: false, message: 'academicYear must be in YYYY-YY format (e.g. 2026-27)' });
    }
    if (!structureData || !structureData['B.Sc.'] || !structureData['B.A.']) {
      return res.status(400).json({ success: false, message: 'structureData must include both B.Sc. and B.A.' });
    }
    for (const ck of ['B.Sc.', 'B.A.']) {
      const items = structureData[ck]?.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: `${ck} ke fee items missing hain` });
      }
    }

    const existsLive = await CollegeFeeStructure.findOne({ academicYear, isActive: true });
    if (existsLive) {
      return res.status(409).json({ success: false, message: `${academicYear} ka fee structure already live hai` });
    }

    const existsPending = await FeeStructureApproval.findOne({
      isNewYearStructure: true,
      academicYear,
      status: { $in: IN_FLIGHT_STATUSES },
    });
    if (existsPending) {
      return res.status(409).json({ success: false, message: `A request for ${academicYear} is already awaiting approval` });
    }

    const approval = await FeeStructureApproval.create({
      submittedBy:      req.user?.name || 'Staff',
      submittedByEmail: req.user?.email || '',
      submitterRole:    req.user?.role || '',
      isNewYearStructure: true,
      academicYear,
      sourceYear:  sourceYear || '',
      structureData,
      courseKey: 'YEAR',
      itemName:  `New Fee Structure — ${academicYear}`,
      status: initialStatusFor(req.user?.role),
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Accounts / Scholarship: Submit deletion of an ENTIRE academic-year structure ──
// POST /api/fee-structure-approvals/submit-year-delete
// Body: { academicYear }
// Base year (2025-26) can never be deleted.
exports.submitYearDeletion = async (req, res) => {
  try {
    const { academicYear } = req.body;
    if (!academicYear) return res.status(400).json({ success: false, message: 'academicYear required' });
    if (academicYear === BASE_STRUCT_YEAR) {
      return res.status(400).json({ success: false, message: 'Base year (2025-26) delete nahi ho sakta' });
    }

    const existsPending = await FeeStructureApproval.findOne({
      isYearDeletion: true,
      academicYear,
      status: { $in: IN_FLIGHT_STATUSES },
    });
    if (existsPending) {
      return res.status(409).json({ success: false, message: `A delete request for ${academicYear} is already pending` });
    }

    const approval = await FeeStructureApproval.create({
      submittedBy:      req.user?.name || 'Staff',
      submittedByEmail: req.user?.email || '',
      submitterRole:    req.user?.role || '',
      isYearDeletion: true,
      academicYear,
      courseKey: 'YEAR_DELETE',
      itemName:  `Delete Fee Structure — ${academicYear}`,
      status: initialStatusFor(req.user?.role),
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all approvals (submitter can see their own via ?myOnly=true) ────────
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.myOnly === 'true' && req.user?.email) {
      filter.submittedByEmail = req.user.email;
    }
    const approvals = await FeeStructureApproval.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, approvals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Shared: apply an approved change to the live CollegeFeeStructure DB ─────
async function applyApproval(approval, req) {
  // ── Case 1: brand-new academic-year structure ──────────────────────────
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
          createdBy: approval.submittedBy || 'Staff',
          isActive: true,
        });
      }
    }
  }

  // ── Case 2: delete an entire academic-year structure ────────────────────
  else if (approval.isYearDeletion && approval.academicYear) {
    await CollegeFeeStructure.deleteMany({ academicYear: approval.academicYear });
  }

  // ── Case 3: single fee-item add / edit / delete (any academic year) ────
  else if (approval.courseKey && approval.itemId && approval.academicYear) {
    let doc = await CollegeFeeStructure.findOne({ courseType: approval.courseKey, academicYear: approval.academicYear });
    if (doc) {
      const items = doc.items || [];
      if (approval.isDeletion) {
        doc.items = items.filter(it => it.id !== approval.itemId);
      } else if (approval.isNewItem) {
        if (!items.find(it => it.id === approval.itemId)) {
          doc.items = [...items, { id: approval.itemId, name: approval.itemName, section: approval.itemSection || 'College', s: approval.newAmounts }];
        }
      } else {
        doc.items = items.map(it => it.id === approval.itemId ? { ...(it.toObject ? it.toObject() : it), s: approval.newAmounts } : it);
      }
      doc.updatedBy = req.user?.name || 'Admin';
      doc.markModified('items');
      await doc.save();
    } else if (approval.isNewItem || !approval.isDeletion) {
      // Structure doc doesn't exist yet for this course+year — create it
      // with just this one item (edge case: first item ever for a fresh year).
      await CollegeFeeStructure.create({
        courseType: approval.courseKey,
        academicYear: approval.academicYear,
        items: [{ id: approval.itemId, name: approval.itemName, section: approval.itemSection || 'College', s: approval.newAmounts }],
        createdBy: approval.submittedBy || 'Staff',
        isActive: true,
      });
    }
  }
}

// ── Accounts: Approve (step 1 for Scholarship-submitted requests) ───────────
exports.accountsApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_accounts') {
      return res.status(400).json({ success: false, message: 'Not pending Accounts approval' });
    }
    approval.status = 'pending_principal';
    approval.accountsNote = req.body.note || '';
    approval.accountsApprovedAt = new Date();
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Accounts: Reject ─────────────────────────────────────────────────────────
exports.accountsReject = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    approval.status = 'rejected_by_accounts';
    approval.accountsNote = req.body.reason || 'Rejected by Accounts';
    await approval.save();
    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Principal: Approve ───────────────────────────────────────────────────────
// Accounts-submitted requests move on to Admin. Scholarship-submitted
// requests end here — Accounts → Principal is their full chain — so the
// change is applied immediately.
exports.principalApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_principal') {
      return res.status(400).json({ success: false, message: 'Not pending principal approval' });
    }
    approval.principalNote = req.body.note || '';
    approval.principalApprovedAt = new Date();

    if (approval.submitterRole === 'staff_scholarship') {
      await applyApproval(approval, req);
      approval.status = 'approved';
    } else {
      approval.status = 'pending_admin';
    }
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

// ── Admin: Approve (FINAL for Accounts-submitted requests) ──────────────────
exports.adminApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_admin') {
      return res.status(400).json({ success: false, message: 'Not pending admin approval' });
    }

    await applyApproval(approval, req);

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
    const accountsPending  = await FeeStructureApproval.countDocuments({ status: 'pending_accounts' });
    const principalPending = await FeeStructureApproval.countDocuments({ status: 'pending_principal' });
    const adminPending     = await FeeStructureApproval.countDocuments({ status: 'pending_admin' });
    res.json({ success: true, accountsPending, principalPending, adminPending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
