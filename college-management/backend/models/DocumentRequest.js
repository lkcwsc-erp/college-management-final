const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  // Student details
  student:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName:      { type: String, required: true },
  studentEmail:     { type: String, required: true },
  studentPhone:     { type: String, default: '' },
  branch:           { type: String, default: '' },
  admissionYear:    { type: String, default: '' },
  batch:            { type: String, default: '' },
  rollNumber:       { type: String, default: '' },

  // Document type
  documentType: {
    type: String,
    enum: ['ID_CARD', 'MARKSHEET', 'MIGRATION', 'TC', 'BONAFIDE', 'PROVISIONAL_DEGREE', 'DEGREE', 'DEGREE_FORM'],
    required: true
  },
  documentTypeLabel: { type: String, default: '' },
  reason:            { type: String, default: '' },
  urgency:           { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  // Marksheet specific
  marksheetSemester:    { type: String, default: '' }, // Sem I, Sem II, etc.
  marksheetSession:     { type: String, default: '' }, // 'mar_apr' | 'nov_dec'
  marksheetYear:        { type: String, default: '' }, // e.g. 2025
  marksheetAcadYear:    { type: String, default: '' }, // e.g. 2025-26

  // ─── WORKFLOW STATUS ─────────────────────────────────────────────────────
  // Every request now starts at Accounts (fee collection), then routes onward
  // by document type:
  //   TC:                  pending_accounts → pending_exam → pending_principal → pending_generation → completed
  //   Bonafide:             pending_accounts → pending_generation → completed
  //   ID Card:              pending_accounts → pending_generation → completed
  //   Degree Form:           pending_accounts → pending_generation → completed
  //   Marksheet:             pending_accounts → pending_exam → completed
  //   Provisional Degree:    pending_accounts → pending_exam → completed
  //   Degree Certificate:    pending_accounts → pending_exam → completed
  //   Migration:             pending_accounts → pending_exam → completed
  status: {
    type: String,
    enum: [
      'pending_accounts',       // waiting for Accounts to collect fee
      'rejected_by_accounts',   // Accounts rejected
      'pending_exam',           // waiting for Exam Section
      'rejected_by_exam',       // Exam Section rejected
      'pending_principal',      // waiting for Principal approval (TC only)
      'rejected_by_principal',  // Principal rejected
      'pending_generation',     // approved — waiting for Student Section to generate
      'completed'               // issued to student
    ],
    default: 'pending_accounts'
  },

  // ─── FEE COLLECTION (Accounts Section) ──────────────────────────────────
  // Auto-picked from the approved DocFeeType matching this documentType at
  // the time Accounts approves the request. If no fee is configured for the
  // type, feeCollected stays false and feeAmount stays 0 — no fee is charged.
  feeAmount:          { type: Number, default: 0 },
  feeCollected:       { type: Boolean, default: false },
  feeCollectedBy:     { type: String, default: '' },
  feeCollectedDate:   { type: Date },

  // Accounts Section
  accountsApprovedBy:   { type: String, default: '' },
  accountsApprovedDate: { type: Date },
  accountsNotes:        { type: String, default: '' },

  // Exam Section
  examVerifiedBy:       { type: String, default: '' },
  examVerifiedDate:     { type: Date },
  examNotes:            { type: String, default: '' },
  examResultStatus:     { type: String, default: '' }, // pass/fail/atkt

  // Principal (TC only)
  principalApprovedBy:   { type: String, default: '' },
  principalApprovedDate: { type: Date },
  principalNotes:        { type: String, default: '' },

  // Student Section - Final Generation
  generatedBy:           { type: String, default: '' },
  generatedDate:         { type: Date },
  generatedDocumentFile: { type: String, default: '' },
  generationNotes:       { type: String, default: '' },

  // Rejection
  rejectionReason: { type: String, default: '' },
  rejectedBy:      { type: String, default: '' },
  rejectedAt:      { type: String, default: '' },

  // TC / Degree — Last exam details (filled by student)
  lastExamYear:     { type: String, default: '' },
  lastExamSem:      { type: String, default: '' },
  lastExamSession:  { type: String, default: '' },
  lastExamResult:   { type: String, default: '' },
  lastExamPercent:  { type: String, default: '' },
  lastExamCollege:  { type: String, default: '' },

  // Provisional Degree / Degree extra fields
  provYear:         { type: String, default: '' },
  provSession:      { type: String, default: '' },
  provCourse:       { type: String, default: '' },

  // Migration extra fields
  migrateTo:        { type: String, default: '' },
  migrateFor:       { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
