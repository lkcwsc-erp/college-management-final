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
  marksheetSemester: { type: String, default: '' },
  marksheetSession:  { type: String, default: '' },
  marksheetYear:     { type: String, default: '' },
  // Marksheet specific
  marksheetSemester:    { type: String, default: '' }, // Sem I, Sem II, etc.
  marksheetSession:     { type: String, default: '' }, // 'mar_apr' | 'nov_dec'
  marksheetYear:        { type: String, default: '' }, // e.g. 2025
  marksheetAcadYear:    { type: String, default: '' }, // e.g. 2025-26

  // ─── WORKFLOW STATUS ─────────────────────────────────────────────────────
  // TC:        pending_accounts → pending_exam → pending_principal → pending_generation → completed
  // Bonafide:  pending_accounts → pending_generation → completed
  // Every type starts at pending_accounts (fee collection), then routes on:
  //   TC:                          pending_exam → pending_principal → pending_generation → completed
  //   Migration/Marksheet/Prov.Deg/Degree: pending_exam → completed (issued by Exam Section)
  //   Bonafide/ID Card/Degree Form: pending_generation → completed (issued by Student Section)
  status: {
    type: String,
    enum: [
      'pending_accounts',       // waiting for Accounts to collect fee
      'rejected_by_accounts',   // Accounts rejected
      'pending_exam',           // waiting for Exam Section to verify result (TC only)
      'rejected_by_exam',       // Exam Section rejected
      'pending_principal',      // waiting for Principal approval (TC only)
      'rejected_by_principal',  // Principal rejected
      'pending_generation',     // approved — waiting for Student Section to generate
      'completed'               // issued to student
    ],
    default: 'pending_accounts'
  },

  // Accounts Section
  accountsApprovedBy:   { type: String, default: '' },
  accountsApprovedDate: { type: Date },
  accountsNotes:        { type: String, default: '' },

  // Exam Section (TC only)
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
