const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['study_material','syllabus','question_paper','elibrary','other'], default: 'study_material' },
  link:        { type: String, default: '' },
  fileUrl:     { type: String, default: '' },
  icon:        { type: String, default: '📄' },
  course:      { type: String, default: '' },
  year:        { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
