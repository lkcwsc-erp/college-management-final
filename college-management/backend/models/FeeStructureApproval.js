const mongoose = require('mongoose');

const feeStructureApprovalSchema = new mongoose.Schema({
  courseKey:    { type: String },
  itemId:       { type: String },
  itemName:     { type: String },
  newAmounts:   [Number],
  submittedBy:  { type: String },
  status:       { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  reviewedBy:   { type: String },
  reviewedAt:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('FeeStructureApproval', feeStructureApprovalSchema);
