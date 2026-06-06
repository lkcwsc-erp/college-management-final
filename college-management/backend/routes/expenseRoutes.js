// routes/expenseRoutes.js
const { protect } = require('../middleware/authMiddleware');
const express    = require('express');
const router     = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload     = require('../utils/expenseUpload');   // separate upload config (200 KB limit)
const ctrl       = require('../controllers/expenseController');

// All expense routes require authentication
// Allowed roles: accounts, admin, principal
const allowed = protect; // add: authorizeRoles('accounts','admin','principal') if role middleware supports it

// Dashboard stats
router.get('/dashboard', allowed, ctrl.getDashboardStats);

// Export data (for PDF/Excel generation on frontend)
router.get('/export', allowed, ctrl.exportData);

// CRUD
router.get('/',       allowed, ctrl.getExpenses);
router.post('/',      allowed, upload.single('bill'), ctrl.createExpense);
router.put('/:id',    allowed, upload.single('bill'), ctrl.updateExpense);
router.delete('/:id', allowed, ctrl.deleteExpense);

module.exports = router;
