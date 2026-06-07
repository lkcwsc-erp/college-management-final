// models/DocFeeType.js
const mongoose = require('mongoose');

const DocFeeTypeSchema = new mongoose.Schema({
  label:      { type: String, required: true, trim: true },
  key:        { type: String, required: true, unique: true, trim: true },
  price:      { type: Number, required: true, min: 0 },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isDefault:  { type: Boolean, default: false }, // default ones cannot be deleted
  addedBy:    { type: String, default: '' },
  addedById:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: String, default: '' },
  approvedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedReason: { type: String, default: '' },
  approvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('DocFeeType', DocFeeTypeSchema);
