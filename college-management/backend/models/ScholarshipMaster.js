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

// One entry per course + year + academic year
scholarshipMasterSchema.index(
  {
    courseType: 1,
    admissionYear: 1,
    academicYear: 1,
  },
  {
    unique: false,
  }
);

module.exports = mongoose.model(
  'ScholarshipMaster',
  scholarshipMasterSchema
);
