// controllers/feeStructureApprovalController.js

const FeeStructureApproval = require('../models/FeeStructureApproval');
const CollegeFeeStructure  = require('../models/CollegeFeeStructure');

const BASE_STRUCT_YEAR = '2025-26';

// ── Accounts Section: Submit an item add / edit / delete for approval ───────
// Works for BOTH the base year and any custom year — every fee-structure
// change goes through Principal → Admin before it is applied anywhere.
exports.submitApproval = async (req, res) => {
  try {
    const { courseKey, itemId, itemName, itemSection, oldAmounts, newAmounts, isNewItem, isDeletion, academicYear } = req.body;
    if (!courseKey || !itemId || !itemName || !newAmounts) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const ay = academicYear || BASE_STRUCT_YEAR;

    // Cancel any previous pending request for same item + same year
    await FeeStructureApproval.updateMany(
      { courseKey, itemId, academicYear: ay, status: { $in: ['pending_principal', 'approved_by_principal', 'pending_admin'] } },
      { $set: { status: 'rejected_by_admin', adminNote: 'Superseded by new request' } }
    );

    const approval = await FeeStructureApproval.create({
      submittedBy: req.user?.name || 'Accounts Staff',
      submittedByEmail: req.user?.email || '',
      courseKey, itemId, itemName, itemSection,
      academicYear: ay,
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

    const existsLive = await CollegeFeeStructure.findOne({ academicYear, isActive: true });
    if (existsLive) {
      return res.status(409).json({ success: false, message: `${academicYear} ka fee structure already live hai` });
    }

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
      courseKey: 'YEAR',
      itemName:  `New Fee Structure — ${academicYear}`,
      status: 'pending_principal',
    });

    res.status(201).json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Accounts Section: Submit deletion of an ENTIRE academic-year structure ──
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
      status: { $in: ['pending_principal', 'approved_by_principal', 'pending_admin'] },
    });
    if (existsPending) {
      return res.status(409).json({ success: false, message: `${academicYear} ke liye delete request pehle se pending hai` });
    }

    const approval = await FeeStructureApproval.create({
      submittedBy:      req.user?.name || 'Accounts Staff',
      submittedByEmail: req.user?.email || '',
      isYearDeletion: true,
      academicYear,
      courseKey: 'YEAR_DELETE',
      itemName:  `Delete Fee Structure — ${academicYear}`,
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

// ── Admin: Approve (FINAL — applies the change) ──────────────────────────────
exports.adminApprove = async (req, res) => {
  try {
    const approval = await FeeStructureApproval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Not found' });
    if (approval.status !== 'pending_admin') {
      return res.status(400).json({ success: false, message: 'Not pending admin approval' });
    }

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
            createdBy: approval.submittedBy || 'Accounts Staff',
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
          createdBy: approval.submittedBy || 'Accounts Staff',
          isActive: true,
        });
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
