// routes/feeStructureApprovalRoutes.js
const express = require('express');
const router  = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/feeStructureApprovalController');

// ── Accounts Section: submit a fee-structure edit for approval ──────────────
router.post('/submit', protect, authorizeRoles('staff_accounts', 'admin'), ctrl.submitApproval);

// ── Accounts Section: submit a NEW academic-year FULL structure for approval ─
router.post('/submit-year', protect, authorizeRoles('staff_accounts', 'admin'), ctrl.submitYearStructure);

// ── Accounts Section: submit deletion of an ENTIRE academic-year structure ──
router.post('/submit-year-delete', protect, authorizeRoles('staff_accounts', 'admin'), ctrl.submitYearDeletion);

// ── List approvals (Accounts see own via ?myOnly=true; Principal/Admin see all)
router.get('/', protect, authorizeRoles('staff_accounts', 'staff_principal', 'admin'), ctrl.getAll);

// ── Pending counts for dashboard badges ─────────────────────────────────────
router.get('/pending-counts', protect, authorizeRoles('staff_principal', 'admin'), ctrl.getPendingCounts);

// ── Principal: approve / reject (step 1) ────────────────────────────────────
router.put('/:id/principal-approve', protect, authorizeRoles('staff_principal', 'admin'), ctrl.principalApprove);
router.put('/:id/principal-reject',  protect, authorizeRoles('staff_principal', 'admin'), ctrl.principalReject);

// ── Admin: approve / reject (step 2 — final) ────────────────────────────────
router.put('/:id/admin-approve', protect, authorizeRoles('admin'), ctrl.adminApprove);
router.put('/:id/admin-reject',  protect, authorizeRoles('admin'), ctrl.adminReject);

module.exports = router;
