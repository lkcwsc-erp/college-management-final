/* ============================================================
   scholarshipRoutes.js
   ============================================================ */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/scholarshipController');
const upload  = require('../utils/upload');

// ── Scholarship Master ─────────────────────────────────────
// NOTE: /master/import MUST come before /master/:id
//       (import route kept — controller returns 410 Gone)
router.post  ('/master/import', upload.single('file'), ctrl.importScholarshipMaster);
router.post  ('/master',        ctrl.createScholarshipMaster);
router.get   ('/master',        ctrl.getAllScholarshipMasters);
router.get   ('/master/:id',    ctrl.getScholarshipMasterById);
router.put   ('/master/:id',    ctrl.updateScholarshipMaster);
router.delete('/master/:id',    ctrl.deleteScholarshipMaster);

// ── Scholarship Register ───────────────────────────────────
// NOTE: /register/export MUST come before /register
router.get('/register/export', ctrl.exportScholarshipRegister);
router.get('/register',        ctrl.getScholarshipRegister);

// ── Dashboard ──────────────────────────────────────────────
router.get('/dashboard', ctrl.getScholarshipDashboard);

// ── Student Operations ─────────────────────────────────────
router.post('/calculate/:admissionId',             ctrl.autoCalculateScholarship);
router.put ('/document-verification/:admissionId', ctrl.updateDocumentVerification);
router.put ('/status/:admissionId',                ctrl.updateScholarshipStatus);
router.put ('/mahadbt/:admissionId',               ctrl.updateMahaDBTCredentials);

// ── Student View (for student dashboard) ───────────────────
router.get('/student/:studentId',   ctrl.getStudentScholarshipView);

// ── Receipt Data ───────────────────────────────────────────
router.get('/receipt/:admissionId', ctrl.getScholarshipReceiptData);

module.exports = router;
