const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicantName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  category: { type: String },

  // Married fields
  isMarried: { type: Boolean, default: false },
  husbandName: { type: String },
  guardianName: { type: String },

  casteCertificateNo: { type: String },
  casteCertificateAuthority: { type: String },
  hasCasteValidity: { type: Boolean, default: false },
  casteValidity: { type: String },
  casteValidityDate: { type: Date },

  aadharNumber: { type: String },
  aadharName: { type: String },

  aparIdNumber: { type: String },
  aparIdDocument: { type: String, default: '' },
  
  studentPhoto: { type: String, default: '' },
  aadharPhoto: { type: String, default: '' },

  sscSchoolName: { type: String },
  sscBoard: { type: String },
  sscYOP: { type: String },
  sscRollNumber: { type: String },
  sscObtainedMarks: { type: Number },
  sscTotalMarks: { type: Number },
  sscPercentage: { type: Number },
  sscGrade: { type: String },
  sscMarksheet: { type: String, default: '' },

  hscCollegeName: { type: String },
  hscBoard: { type: String },
  hscStream: { type: String },
  hscYOP: { type: String },
  hscRollNumber: { type: String },
  hscMedium: { type: String },
  hscObtainedMarks: { type: Number },
  hscTotalMarks: { type: Number },
  hscPercentage: { type: Number },
  hscGrade: { type: String },
  hscMarksheet: { type: String, default: '' },

  hasGap: { type: Boolean, default: false },
  gapYear: { type: String },
  gapReason: { type: String },
  gapCertificate: { type: String, default: '' },

  casteCertificate: { type: String, default: '' },
  casteValidityCertificate: { type: String, default: '' },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },

  preferredSubject: { type: String },

  fatherName: { type: String },
  motherName: { type: String },
  guardianPhone: { type: String },

  familyIncome: { type: String },
  referralSource: { type: String },
  message: { type: String },

  fees: { type: Number, default: 0 },
  feesPaid: { type: Boolean, default: false },
studentSectionStatus: {
  type: String,
  enum: ['pending', 'verified', 'rejected'],
  default: 'pending'
},

principalStatus: {
  type: String,
  enum: ['pending', 'approved', 'rejected'],
  default: 'pending'
},
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  appliedDate: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
