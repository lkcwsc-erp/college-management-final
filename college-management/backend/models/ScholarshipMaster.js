const mongoose = require('mongoose');

const scholarshipMasterSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['OPEN', 'SC', 'ST', 'OBC', 'VJ/DT(NT-A)', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'EWS', 'SEBC'],
    },
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      trim: true,
      // e.g. "B.Sc", "B.A", "B.Com"
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
      // e.g. "2025-26"
    },
    // MahaDBT receivable amount — what govt reimburses to student
    scholarshipAmount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: [0, 'Amount cannot be negative'],
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

// Unique: one entry per category + course + year + academicYear
scholarshipMasterSchema.index(
  { category: 1, courseType: 1, admissionYear: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('ScholarshipMaster', scholarshipMasterSchema);
