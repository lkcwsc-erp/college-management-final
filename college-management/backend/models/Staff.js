const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  employeeId: {
    type: String,
    required: true,
    unique: true
  },

  department: {
    type: String,
    required: true
  },

  designation: {
    type: String
  },

  qualification: {
    type: String
  },

  experience: {
    type: Number
  },

  joiningDate: {
    type: Date
  },

  subjects: [{
    type: String
  }],

  role: {
    type: String,
    required: true,
    enum: [
      'student-section',
      'accounts',
      'exam',
      'scholarship',
      'principal'
    ]
  },

  isActive: {
    type: Boolean,
    default: true
  },

}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
