Now let me create the scholarship routes:
Action: file_editor create /app/backend/routes/scholarshipRoutes.js --file-text "const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const upload = require('../utils/upload');

// ============================================================
// SCHOLARSHIP MASTER ROUTES
// ============================================================

// Create scholarship master
router.post('/master', scholarshipController.createScholarshipMaster);

// Get all scholarship masters
router.get('/master', scholarshipController.getAllScholarshipMasters);

// Get scholarship master by ID
router.get('/master/:id', scholarshipController.getScholarshipMasterById);

// Update scholarship master
router.put('/master/:id', scholarshipController.updateScholarshipMaster);

// Delete scholarship master
router.delete('/master/:id', scholarshipController.deleteScholarshipMaster);

// Import scholarship master from Excel
router.post('/master/import', upload.single('file'), scholarshipController.importScholarshipMaster);

// ============================================================
// SCHOLARSHIP STUDENT ROUTES
// ============================================================

// Auto calculate scholarship for a student
router.post('/calculate/:admissionId', scholarshipController.autoCalculateScholarship);

// Get scholarship dashboard statistics
router.get('/dashboard', scholarshipController.getScholarshipDashboard);

// Get scholarship register (list all students)
router.get('/register', scholarshipController.getScholarshipRegister);

// Export scholarship register to Excel
router.get('/register/export', scholarshipController.exportScholarshipRegister);

// Update document verification status
router.put('/document-verification/:admissionId', scholarshipController.updateDocumentVerification);

// Update scholarship status
router.put('/status/:admissionId', scholarshipController.updateScholarshipStatus);

// Get student scholarship view
router.get('/student/:studentId', scholarshipController.getStudentScholarshipView);

module.exports = router;
"
Observation: Create successful: /app/backend/routes/scholarshipRoutes.js
