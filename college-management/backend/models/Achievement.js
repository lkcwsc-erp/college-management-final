const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '🏆' },
  category:    { type: String, enum: ['academic','sports','cultural','award','other'], default: 'academic' },
  year:        { type: String, default: '' },
  photo:       { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
