// models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    // ── Core fields ──────────────────────────────────────────────────────────
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    // ── Category (expanded) ──────────────────────────────────────────────────
    category: {
      type: String,
      required: true,
      enum: [
        'academic_resources',
        'library',
        'laboratory',
        'office_administration',
        'internet_communication',
        'website_erp',
        'faculty_development',
        'student_activities',
        'scholarships_welfare',
        'building_development',
        'electrical_maintenance',
        'water_sanitation',
        'university_govt_fees',
        'it_software',
        'vehicle_travel',
        'infrastructure',
        'stationery',
        'electricity',
        'salary',
        'events',
        'maintenance',
        'other',
      ],
      default: 'other',
    },

    // ── Vendor ───────────────────────────────────────────────────────────────
    paidTo: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Payment Mode ─────────────────────────────────────────────────────────
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'online'],
      default: 'cash',
    },

    // ── Academic Year (e.g. "2025-26") ───────────────────────────────────────
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{2}$/, 'Format must be YYYY-YY, e.g. 2025-26'],
    },

    // ── Bill / Invoice upload ────────────────────────────────────────────────
    billUrl: {
      type: String,  // Cloudinary URL
      default: null,
    },
    billPublicId: {
      type: String,  // Cloudinary public_id for deletion
      default: null,
    },
    billFileName: {
      type: String,
      default: null,
    },

    // ── Remarks ──────────────────────────────────────────────────────────────
    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Audit fields ─────────────────────────────────────────────────────────
    enteredBy: {
      type: String,
      required: true,
    },
    enteredById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastModifiedBy: {
      type: String,
      default: '',
    },
    lastModifiedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast dashboard queries
ExpenseSchema.index({ academicYear: 1, date: -1 });
ExpenseSchema.index({ category: 1, academicYear: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
