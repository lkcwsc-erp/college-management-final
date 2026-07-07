/* ============================================================
   routes/collegeFeeStructureRoutes.js
   Mounted in server.js at /api/fee-structure
   ============================================================ */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/collegeFeeStructureController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ── Seed defaults (admin only) ─────────────────────────────
router.post('/seed-defaults', protect, authorizeRoles('admin'), ctrl.seedDefaults);

// ── Create-or-update in one call (Accounts Section uses this when
//    creating/editing a whole academic year's structure, e.g. 2026-27)
// NOTE: must come before /:id
router.post('/upsert', protect, authorizeRoles('admin', 'staff_accounts'), ctrl.upsertFeeStructure);

// ── CRUD on full structure ─────────────────────────────────
// NOTE: /seed-defaults and /upsert MUST come before /:id
router.get   ('/',    ctrl.getAllFeeStructures); // public read — Scholarship Section, Accounts Section, etc. all need this
router.get   ('/:id', ctrl.getFeeStructureById);
router.post  ('/',    protect, authorizeRoles('admin', 'staff_accounts'), ctrl.createFeeStructure);
router.put   ('/:id', protect, authorizeRoles('admin', 'staff_accounts'), ctrl.updateFeeStructure);
router.delete('/:id', protect, authorizeRoles('admin'),                   ctrl.deleteFeeStructure);

// ── Individual item operations ─────────────────────────────
router.post  ('/:id/item',          protect, authorizeRoles('admin', 'staff_accounts'), ctrl.addFeeItem);
router.patch ('/:id/item',          protect, authorizeRoles('admin', 'staff_accounts'), ctrl.updateFeeItem);
router.delete('/:id/item/:itemId',  protect, authorizeRoles('admin', 'staff_accounts'), ctrl.deleteFeeItem);

module.exports = router;
