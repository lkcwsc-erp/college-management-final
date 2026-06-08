const mongoose = require('mongoose');

// Each "Publish exam form for students" action by the Examination Section
// creates ONE document here. This allows multiple forms to be published at the
// same time (e.g. BA 4th Sem Regular + BSc 2nd Sem Regular together), and lets
// students see ONLY the forms that match their own course + year.
const publishedExamFormSchema = new mongoose.Schema({
  formType:      { type: String, enum: ['regular', 'backlog'], required: true },
  course:        { type: String, required: true },          // 'BA' / 'BSc'
  semester:      { type: String, required: true },          // '1st' ... '6th'
  yearNum:       { type: Number, required: true },          // 1 / 2 / 3 (derived from semester)
  admissionYear: { type: String, default: '' },             // '1st Year' / '2nd Year' / '3rd Year'
  examEvent:     { type: String, required: true },          // 'April-May 2026'
  publishedBy:   { type: String, default: '' },
  active:        { type: Boolean, default: true },
}, { timestamps: true });

// Prevent publishing the exact same form twice
publishedExamFormSchema.index(
  { formType: 1, course: 1, semester: 1, examEvent: 1 },
  { unique: true }
);

module.exports = mongoose.model('PublishedExamForm', publishedExamFormSchema);
