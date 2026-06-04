// models/FeeStructureApproval.js

const mongoose = require('mongoose');

const feeStructureApprovalSchema = new mongoose.Schema({
  // Who submitted
  submittedBy: { type: String, required: true },       // accounts staff name
  submittedByEmail: { type: String },

  // What changed
  courseKey: { type: String, required: true },          // 'B.Sc.' or 'B.A.'
  itemId: { type: String, required: true },             // fee item id e.g. 'bsc_c1'
  itemName: { type: String, required: true },
  itemSection: { type: String },                        // 'University' or 'College'
  oldAmounts: [Number],                                 // 6 values [s1..s6]
  newAmounts: [Number],                                 // 6 values [s1..s6]
  isNewItem: { type: Boolean, default: false },         // true if brand new item

  // Approval flow:  pending_principal → approved_by_principal → pending_admin → approved / rejected
  status: {
    type: String,
    enum: ['pending_principal', 'approved_by_principal', 'rejected_by_principal', 'pending_admin', 'approved', 'rejected_by_admin'],
    default: 'pending_principal',
  },

  principalNote: { type: String, default: '' },
  adminNote: { type: String, default: '' },

  principalApprovedAt: { type: Date },
  adminApprovedAt:     { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('FeeStructureApproval', feeStructureApprovalSchema);
