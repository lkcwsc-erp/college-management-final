const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  subject:     { type: String, required: true },
  message:     { type: String, required: true },
  isRead:      { type: Boolean, default: false },
  adminReply:  { type: String, default: '' },      // ✅ NEW
  repliedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt:   { type: Date },                     // ✅ NEW
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
