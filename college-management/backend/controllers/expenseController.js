// controllers/expenseController.js
const Expense     = require('../models/Expense');
const { cloudinary } = require('../utils/upload');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: current academic year string  e.g. "2025-26"
// ─────────────────────────────────────────────────────────────────────────────
function currentAcademicYear() {
  const now   = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year  = now.getFullYear();
  // Academic year starts in June/July in Maharashtra colleges
  if (month >= 6) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/expenses  — create a new expense
// ─────────────────────────────────────────────────────────────────────────────
exports.createExpense = async (req, res) => {
  try {
    const {
      description, amount, date, category, paidTo,
      paymentMode, academicYear, remarks,
    } = req.body;

    if (!description || !amount || !date || !academicYear) {
      return res.status(400).json({ success: false, message: 'Description, amount, date and academic year are required.' });
    }

    const billData = {};
    if (req.file) {
      billData.billUrl       = req.file.path;
      billData.billPublicId  = req.file.filename;
      billData.billFileName  = req.file.originalname;
    }

    const expense = await Expense.create({
      description: description.trim(),
      amount: Number(amount),
      date: new Date(date),
      category:      category      || 'other',
      paidTo:        paidTo        || '',
      paymentMode:   paymentMode   || 'cash',
      academicYear:  academicYear.trim(),
      remarks:       remarks       || '',
      enteredBy:     req.user?.name   || 'Accounts Staff',
      enteredById:   req.user?._id,
      ...billData,
    });

    res.status(201).json({ success: true, message: 'Expense recorded successfully.', expense });
  } catch (err) {
    console.error('createExpense:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/expenses  — list with filters + search + pagination
// Query params: academicYear, category, paymentMode, search, startDate, endDate, page, limit
// ─────────────────────────────────────────────────────────────────────────────
exports.getExpenses = async (req, res) => {
  try {
    const {
      academicYear, category, paymentMode,
      search, startDate, endDate,
      page = 1, limit = 50,
    } = req.query;

    const filter = {};

    if (academicYear)  filter.academicYear = academicYear;
    if (category)      filter.category     = category;
    if (paymentMode)   filter.paymentMode  = paymentMode;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { paidTo:      { $regex: search, $options: 'i' } },
        { remarks:     { $regex: search, $options: 'i' } },
      ];
    }

    const total    = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), limit: Number(limit), expenses });
  } catch (err) {
    console.error('getExpenses:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/expenses/dashboard  — statistics for dashboard cards
// ─────────────────────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const now         = new Date();
    const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
    const acadYear    = req.query.academicYear || currentAcademicYear();

    // Total today
    const [todayResult] = await Expense.aggregate([
      { $match: { date: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Total this month
    const [monthResult] = await Expense.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Total this academic year
    const [yearResult] = await Expense.aggregate([
      { $match: { academicYear: acadYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Category-wise summary for academic year
    const categoryWise = await Expense.aggregate([
      { $match: { academicYear: acadYear } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        today:        todayResult?.total  || 0,
        thisMonth:    monthResult?.total  || 0,
        academicYear: yearResult?.total   || 0,
        categoryWise,
        currentAcademicYear: acadYear,
      },
    });
  } catch (err) {
    console.error('getDashboardStats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/expenses/:id  — update (full edit)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

    const allowedFields = [
      'description', 'amount', 'date', 'category',
      'paidTo', 'paymentMode', 'academicYear', 'remarks',
    ];
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) expense[f] = req.body[f];
    });

    // Handle new bill upload
    if (req.file) {
      // Delete old file from Cloudinary if exists
      if (expense.billPublicId) {
        try { await cloudinary.uploader.destroy(expense.billPublicId, { resource_type: 'raw' }); } catch (_) {}
      }
      expense.billUrl      = req.file.path;
      expense.billPublicId = req.file.filename;
      expense.billFileName = req.file.originalname;
    }

    expense.lastModifiedBy   = req.user?.name || 'Accounts Staff';
    expense.lastModifiedById = req.user?._id;

    await expense.save();
    res.json({ success: true, message: 'Expense updated.', expense });
  } catch (err) {
    console.error('updateExpense:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/expenses/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

    // Delete bill from Cloudinary
    if (expense.billPublicId) {
      try { await cloudinary.uploader.destroy(expense.billPublicId, { resource_type: 'raw' }); } catch (_) {}
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    console.error('deleteExpense:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/expenses/export/excel  — returns JSON data for Excel generation
// (Frontend uses this data with xlsx/SheetJS to generate the .xlsx file)
// ─────────────────────────────────────────────────────────────────────────────
exports.exportData = async (req, res) => {
  try {
    const { academicYear, startDate, endDate, category } = req.query;
    const filter = {};
    if (academicYear)  filter.academicYear = academicYear;
    if (category)      filter.category     = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    const rows = expenses.map((e, i) => ({
      'Sr. No.':        i + 1,
      'Date':           new Date(e.date).toLocaleDateString('en-IN'),
      'Description':    e.description,
      'Category':       e.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      'Paid To':        e.paidTo || '',
      'Payment Mode':   e.paymentMode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      'Amount (₹)':     e.amount,
      'Academic Year':  e.academicYear,
      'Remarks':        e.remarks || '',
      'Entered By':     e.enteredBy,
      'Created On':     new Date(e.createdAt).toLocaleString('en-IN'),
      'Last Modified By': e.lastModifiedBy || '',
      'Bill Attached':  e.billUrl ? 'Yes' : 'No',
    }));

    res.json({ success: true, rows, totalAmount: expenses.reduce((s, e) => s + e.amount, 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
