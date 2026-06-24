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

  // Backlog (KT) exam form ke liye — student jitne semester ke backlog bharta hai
  // unka data yahan store hota hai. Har semester par ₹700 exam fee lagti hai
  // (Accounts Section collect karte waqt). Regular form me ye khaali rehta hai.
  backlogSemesters: [{
    semester: { type: String, default: '' },         // e.g. "3rd"
    subjects: [{
      name: { type: String, default: '' },           // Subject Name
      code: { type: String, default: '' },           // Subject Code
    }],
  }],

  // Fee collection by Accounts Section
  feeStatus:       { type: String, enum: ['pending', 'collected'], default: 'pending' },
  feeAmount:       { type: Number, default: 0 },
  feeReceiptNo:    { type: String, default: '' },
  feeCollectedBy:  { type: String, default: '' },
  feeCollectedAt:  { type: Date },
  paymentMode:     { type: String, default: 'cash' },
}, { timestamps: true });
 
module.exports = mongoose.model('ExamFormRequest', examFormRequestSchema);
