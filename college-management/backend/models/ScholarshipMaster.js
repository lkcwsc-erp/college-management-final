/* ============================================================
   models/ScholarshipMaster.js
   ============================================================ */
const mongoose = require('mongoose');

const scholarshipMasterSchema = new mongoose.Schema(
  {
    categories: [
      {
        type: String,
        enum: [
          'OPEN',
          'SC',
          'ST',
          'OBC',
          'VJ/DT(NT-A)',
          'NT-B',
          'NT-C',
          'NT-D',
          'SBC',
          'EWS',
          'SEBC',
        ],
      },
    ],
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      trim: true,
    },
    admissionYear: {
      type: String,
      required: [true, 'Admission year is required'],
      trim: true,
      enum: ['FY', 'SY', 'TY'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    mahaDBTReceivable: {
      type: Number,
      required: [true, 'MahaDBT Receivable amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    // Tuition fee only — used for OPEN category scholarship calculation
    tuitionFee: {
      type: Number,
      default: 0,
      min: [0, 'Tuition fee cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for fast lookup — not unique (same course+year can have reserved + OPEN records)
scholarshipMasterSchema.index({ courseType: 1, admissionYear: 1, academicYear: 1 });

module.exports = mongoose.model('ScholarshipMaster', scholarshipMasterSchema);
