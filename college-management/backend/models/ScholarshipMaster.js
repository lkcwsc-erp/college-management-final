Now let me create the backend models and controllers. I'll start by creating all the necessary backend files:
Action: file_editor create /app/backend/models/ScholarshipMaster.js --file-text "const mongoose = require('mongoose');

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
    scholarshipAmount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: [0, 'Scholarship amount cannot be negative'],
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
    createdBy: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique combinations
scholarshipMasterSchema.index(
  { category: 1, courseType: 1, admissionYear: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('ScholarshipMaster', scholarshipMasterSchema);
"
Observation: Create successful: /app/backend/models/ScholarshipMaster.js
