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
