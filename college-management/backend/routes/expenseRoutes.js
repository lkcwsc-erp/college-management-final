// routes/expenseRoutes.js
const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload   = require('../utils/expenseUpload');
const ctrl     = require('../controllers/expenseController');

const allowed = protect;

router.get('/dashboard', allowed, ctrl.getDashboardStats);
router.get('/export',    allowed, ctrl.exportData);
router.get('/',          allowed, ctrl.getExpenses);
router.post('/',         allowed, upload.single('bill'), ctrl.createExpense);
router.put('/:id',       allowed, upload.single('bill'), ctrl.updateExpense);
router.delete('/:id',    allowed, ctrl.deleteExpense);

module.exports = router;
