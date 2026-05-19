const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  // Student auto-fill details
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, default: '' },
  branch: { type: String, default: '' },          // BA / BSc
  admissionYear: { type: String, default: '' },   // "1st Year"
  batch: { type: String, default: '' },           // "2026-2027"
  rollNumber: { type: String, default: '' },

  // Document Request Info
  documentType: {
    type: String,
    enum: ['ID_CARD', 'MARKSHEET', 'MIGRATION', 'TC', 'BONAFIDE'],
    required: true
  },
  documentTypeLabel: { type: String, default: '' },
  reason: { type: String, default: '' },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },

  // Workflow Status
  status: {
    type: String,
    enum: [
      'pending_accounts',
      'rejected_by_accounts',
      'approved_by_accounts',
      'pending_principal',
      'rejected_by_principal',
      'approved_by_principal',
      'pending_generation',
      'completed'
    ],
    default: 'pending_accounts'
  },

  // Accounts Section Action
  accountsApprovedBy: { type: String, default: '' },
  accountsApprovedDate: { type: Date },
  accountsNotes: { type: String, default: '' },

  // Principal Section Action (for TC only)
  principalApprovedBy: { type: String, default: '' },
  principalApprovedDate: { type: Date },
  principalNotes: { type: String, default: '' },

  // Student Section - Final Generation
  generatedBy: { type: String, default: '' },
  generatedDate: { type: Date },
  generatedDocumentFile: { type: String, default: '' },
  generationNotes: { type: String, default: '' },

  // Rejection
  rejectionReason: { type: String, default: '' },
  rejectedBy: { type: String, default: '' },
  rejectedAt: { type: String, default: '' }, // accounts / principal

}, { timestamps: true });

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
