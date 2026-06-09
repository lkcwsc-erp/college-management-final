const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  subjects: [{
    name: { type: String },
    maxMarks: { type: Number },
    obtainedMarks: { type: Number },
    grade: { type: String },
  }],
  totalMarks: { type: Number },
  obtainedMarks: { type: Number },
  percentage: { type: Number },
  result: {
    type: String,
    enum: ['pass', 'fail', 'distinction'],
    default: 'pass'
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

  submittedByStudent: { type: Boolean, default: false },
  verifiedByExam:    { type: Boolean, default: false },
  examSession:       { type: String, default: '' },

module.exports = mongoose.model('Result', resultSchema);
