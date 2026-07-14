const mongoose = require('mongoose');

const feeStructureApprovalSchema = new mongoose.Schema({
  courseKey:    { type: String },
  itemId:       { type: String },
  itemName:     { type: String },
  itemSection:  { type: String },          // 'University' | 'College'
  oldAmounts:   [Number],                  // 6 semester amounts before edit
  newAmounts:   [Number],                  // 6 semester amounts after edit
  isNewItem:    { type: Boolean, default: false },
  isDeletion:   { type: Boolean, default: false },  // delete this fee item (after approval)

  // Which academic year's structure this item edit/delete belongs to
  // (e.g. '2025-26' base year, or a custom year like '2026-27').
  // Defaults to the base year for backward compatibility with older records.
  academicYear: { type: String, default: '' },

  // ── New academic-year FULL structure approval ─────────────────────────
  // Accounts Section creates a new year's fee structure (copy or Excel) →
  // Principal approves → Admin approves → only then does the structure go live.
  isNewYearStructure: { type: Boolean, default: false },
  sourceYear:         { type: String, default: '' },   // which year it was copied from
  structureData:       { type: mongoose.Schema.Types.Mixed, default: null },
  // structureData shape: { 'B.Sc.': { label, items:[{id,name,section,s:[6]}] }, 'B.A.': {...} }

  // ── Whole academic-year DELETE approval ────────────────────────────────
  // Accounts Section requests deleting an entire year's structure →
  // Principal approves → Admin approves → only then is the structure removed from the DB.
  isYearDeletion:     { type: Boolean, default: false },

  submittedBy:      { type: String },
  submittedByEmail: { type: String },

  // Two-step approval workflow: Accounts → Principal → Admin → applied
  status: {
    type: String,
    enum: [
      'pending_principal',
      'approved_by_principal',
      'pending_admin',
      'approved',
      'rejected_by_principal',
      'rejected_by_admin',
    ],
    default: 'pending_principal',
  },

  principalNote:       { type: String, default: '' },
  principalApprovedAt: { type: Date },
  adminNote:           { type: String, default: '' },
  adminApprovedAt:     { type: Date },

  // legacy fields (kept for backward compatibility)
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('FeeStructureApproval', feeStructureApprovalSchema);
