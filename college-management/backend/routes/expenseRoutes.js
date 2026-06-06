// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/expenseUpload');
const ctrl = require('../controllers/expenseController');

// All expense routes require authentication
const allowed = protect;

// Dashboard stats
router.get('/dashboard', allowed, ctrl.getDashboardStats);

// Export data
router.get('/export', allowed, ctrl.exportData);

// CRUD
router.get('/', allowed, ctrl.getExpenses);
router.post('/', allowed, upload.single('bill'), ctrl.createExpense);
router.put('/:id', allowed, upload.single('bill'), ctrl.updateExpense);
router.delete('/:id', allowed, ctrl.deleteExpense);

module.exports = router;
