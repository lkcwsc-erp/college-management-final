const mongoose = require('mongoose');

const examSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  regularEnabled:   { type: Boolean, default: false },
  backlogEnabled:   { type: Boolean, default: false },
  regularCourse:    { type: String, default: '' },
  regularSemester:  { type: String, default: '' },
  regularExamEvent: { type: String, default: '' },
  backlogCourse:    { type: String, default: '' },
  backlogSemester:  { type: String, default: '' },
  backlogExamEvent: { type: String, default: '' },
  lastUpdatedBy:    { type: String, default: '' },
  lastUpdatedAt:    { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ExamSettings', examSettingsSchema);
