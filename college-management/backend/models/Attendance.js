const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Link via admission email (works without Student profile)
  studentEmail:  { type: String, required: true, lowercase: true, trim: true },
  studentName:   { type: String, default: '' },
  studentId:     { type: String, default: '' },
  courseType:    { type: String, default: '' },
  admissionYear: { type: String, default: '' },

  date:     { type: String, required: true },  // 'YYYY-MM-DD'
  subject:  { type: String, required: true, trim: true },
  status:   { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
  session:  { type: String, enum: ['morning', 'afternoon', 'full_day'], default: 'full_day' },
  markedBy: { type: String, default: '' },
  notes:    { type: String, default: '' },
}, { timestamps: true });

// Unique per student per date per subject
attendanceSchema.index({ studentEmail: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
