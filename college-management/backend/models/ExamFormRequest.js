const mongoose = require('mongoose');
 
const examFormRequestSchema = new mongoose.Schema({
  studentEmail:    { type: String, required: true, lowercase: true },
  studentName:     { type: String, required: true },
  studentId:       { type: String, default: '' },
  prnNumber:       { type: String, default: '' },
  course:          { type: String, required: true }, // BA / BSc
  admissionYear:   { type: String, required: true }, // 1st Year / 2nd Year / 3rd Year
  semester:        { type: String, required: true }, // e.g. "4th"
  examEvent:       { type: String, required: true }, // e.g. "April-May 2026"
  mobileNo:        { type: String, default: '' },
  formType:        { type: String, enum: ['regular', 'backlog'], required: true },
 
  // Fee collection by Accounts Section
  feeStatus:       { type: String, enum: ['pending', 'collected'], default: 'pending' },
  feeAmount:       { type: Number, default: 0 },
  feeReceiptNo:    { type: String, default: '' },
  feeCollectedBy:  { type: String, default: '' },
  feeCollectedAt:  { type: Date },
  paymentMode:     { type: String, default: 'cash' },
}, { timestamps: true });
 
module.exports = mongoose.model('ExamFormRequest', examFormRequestSchema);
