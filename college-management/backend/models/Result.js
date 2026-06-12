const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  // ── Current (email / admission based) system ──────────────────────────────
  // Upload Result tab in mongi se result save hota hai. Student Exam Data tab
  // inhi fields se match karke data dikhata hai.
  admissionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  studentEmail: { type: String, lowercase: true, trim: true, index: true },
  studentName:  { type: String, default: '' },
  courseType:   { type: String, default: '' },

  // ── Legacy refs (optional — purane data / student-submit ke liye) ─────────
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },

  // Subject-wise (purana) flow me semester real semester (1-6) hota hai.
  // Naye annual-result flow me yahi field academic year number (1/2/3) store karta
  // hai (subjects khaali rehte hai), taaki stale schema pe bhi data save ho jaaye.
  semester: { type: Number, default: 0 },
  year:     { type: Number, required: true },

  // Naya annual result flow: "1st Year" / "2nd Year" / "3rd Year" (display label)
  academicYear: { type: String, default: '' },

  subjects: [{
    name:          { type: String },
    maxMarks:      { type: Number },
    obtainedMarks: { type: Number },
    grade:         { type: String },
  }],

  totalMarks:    { type: Number },
  obtainedMarks: { type: Number },
  percentage:    { type: Number },

  // pass / fail / atkt / rr / distinction  (String rakha hai taaki saare values chale)
  result: { type: String, default: 'pass' },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  submittedByStudent: { type: Boolean, default: false },
  verifiedByExam:     { type: Boolean, default: false },
  examSession:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
