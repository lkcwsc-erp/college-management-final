const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  studentFullName: { type: String, required: true, trim: true },
  gender: { type: String, required: true, enum: ['female', 'male', 'other'] },
  dateOfBirth: { type: Date, required: false },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'credentials_issued', 'converted', 'rejected'],
    default: 'pending'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
