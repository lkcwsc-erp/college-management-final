const express = require('express');
const router = express.Router();

const scholarshipController = require('../controllers/scholarshipController');
const upload = require('../utils/upload');

// Scholarship Master
router.post('/master', scholarshipController.createScholarshipMaster);
router.get('/master', scholarshipController.getAllScholarshipMasters);
router.get('/master/:id', scholarshipController.getScholarshipMasterById);
router.put('/master/:id', scholarshipController.updateScholarshipMaster);
router.delete('/master/:id', scholarshipController.deleteScholarshipMaster);

router.post(
  '/master/import',
  upload.single('file'),
  scholarshipController.importScholarshipMaster
);

// Student Scholarship
router.post('/calculate/:admissionId', scholarshipController.autoCalculateScholarship);

router.get('/dashboard', scholarshipController.getScholarshipDashboard);

router.get('/register', scholarshipController.getScholarshipRegister);

router.get('/register/export', scholarshipController.exportScholarshipRegister);

router.put(
  '/document-verification/:admissionId',
  scholarshipController.updateDocumentVerification
);

router.put(
  '/status/:admissionId',
  scholarshipController.updateScholarshipStatus
);

router.get(
  '/student/:studentId',
  scholarshipController.getStudentScholarshipView
);

module.exports = router;
