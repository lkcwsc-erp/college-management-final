const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'exam', 'admission', 'event', 'holiday'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'student', 'staff'],
    default: 'all'
  },
  attachment: { type: String, default: '' },
  isActive:          { type: Boolean, default: true },
  specificRecipients: [{ type: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiryDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
