const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    /* ================================================================
       APPLICANT — BASIC CONTACT
    ================================================================ */
    applicantName: { type: String, required: [true, 'Applicant name is required'], trim: true },
    email:         { type: String, required: [true, 'Email is required'], trim: true, lowercase: true, unique: true },
    phone:         {
      type:     String,
      required: [true, 'Phone number is required'],
      trim:     true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message:   'Phone number must be exactly 10 digits',
      },
    },

    /* ================================================================
       PERSONAL DETAILS
    ================================================================ */
    dateOfBirth: { type: Date },

    // FIX: removed default:'' — required only fires when no value is provided,
    // but a default '' would silently satisfy required and bypass validation.
    placeOfBirth: {
      type:     String,
      trim:     true,
      required: [true, 'Place of Birth is required'],
    },

    gender:   { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },

    // FIX: same required+default conflict fixed for caste
    caste: {
      type:     String,
      trim:     true,
      required: [true, 'Caste is required'],
    },

    subCaste: { type: String, trim: true, default: '' },

    isDisabled: {
      type:    String,
      enum:    ['yes', 'no', ''],
      default: '',
    },

    bloodGroup:  { type: String, trim: true, default: '' },
    religion:    { type: String, trim: true, default: '' },
    nationality: { type: String, trim: true, default: 'Indian' },

    /* ================================================================
       MARITAL STATUS & HUSBAND DETAILS
    ================================================================ */
    isMarried: { type: Boolean, default: false },

    husbandName: { type: String, trim: true, default: '' },

    husbandContactNumber: {
      type:    String,
      trim:    true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^\d{10}$/.test(v),
        message:   'Husband Contact Number must be exactly 10 digits',
      },
    },

    /* ================================================================
       GUARDIAN / PARENT DETAILS
    ================================================================ */
    // FIX: same required+default conflict fixed for guardianFullName
    guardianFullName: {
      type:     String,
      trim:     true,
      required: [true, 'Guardian Full Name is required'],
    },

    guardianName:  { type: String, trim: true, default: '' },
    fatherName:    { type: String, trim: true, default: '' },
    motherName:    { type: String, trim: true, default: '' },
    guardianPhone: {
      type:    String,
      trim:    true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^\d{10}$/.test(v),
        message:   'Guardian phone must be exactly 10 digits',
      },
    },
    familyIncome: { type: String, trim: true, default: '' },

    /* ================================================================
       ADDRESS
    ================================================================ */
    address:         { type: String, trim: true, default: '' },
    houseNumber:     { type: String, trim: true, default: '' },
    streetArea:      { type: String, trim: true, default: '' },
    subdistrict:     { type: String, trim: true, default: '' },
    cityTownVillage: { type: String, trim: true, default: '' },
    district:        { type: String, trim: true, default: '' },
    state:           { type: String, trim: true, default: '' },
    pincode:         {
      type:    String,
      trim:    true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^\d{6}$/.test(v),
        message:   'Pincode must be exactly 6 digits',
      },
    },

    /* ================================================================
       AADHAR VERIFICATION
    ================================================================ */
    // FIX: added 12-digit validator — was missing in previous version
aadharNumber: {
      type:     String,
      trim:     true,
      default:  '',
      unique:   true,
      sparse:   true,
      validate: {
        validator: (v) => v === '' || /^\d{12}$/.test(v),
        message:   'Aadhar number must be exactly 12 digits',
      },
    },
    aadharName:  { type: String, trim: true, default: '' },
    aadharPhoto: { type: String, default: '' },

    /* ================================================================
       APAAR ID
    ================================================================ */
    aparIdNumber: {
      type:    String,
      trim:    true,
      default: '',
      validate: [
        {
          validator: (v) => v === '' || /^\d+$/.test(v),
          message:   'APAAR ID must contain digits only — no letters or special characters',
        },
        {
          validator: (v) => v === '' || v.length === 12,
          message:   'APAAR ID must be exactly 12 digits',
        },
      ],
    },

    aparIdDocument: { type: String, default: '' },

    /* ================================================================
       SSC (10th) DETAILS
    ================================================================ */
    sscSchoolName:    { type: String, trim: true, default: '' },
    sscBoard:         { type: String, trim: true, default: '' },
    sscYOP:           { type: String, trim: true, default: '' },
    sscRollNumber:    { type: String, trim: true, default: '' },
    sscObtainedMarks: { type: Number, default: null },
    sscTotalMarks:    { type: Number, default: null },
    sscPercentage:    { type: Number, default: null },
    sscGrade:         { type: String, trim: true, default: '' },
    sscMarksheet:     { type: String, default: '' },

    /* ================================================================
       HSC (12th) DETAILS
    ================================================================ */
    hscCollegeName:   { type: String, trim: true, default: '' },
    hscBoard:         { type: String, trim: true, default: '' },
    hscStream:        { type: String, trim: true, default: '' },
    hscYOP:           { type: String, trim: true, default: '' },
    hscRollNumber:    { type: String, trim: true, default: '' },
    hscMedium:        { type: String, trim: true, default: '' },
    hscObtainedMarks: { type: Number, default: null },
    hscTotalMarks:    { type: Number, default: null },
    hscPercentage:    { type: Number, default: null },
    hscGrade:         { type: String, trim: true, default: '' },
    hscMarksheet:     { type: String, default: '' },

    /* ================================================================
       GAP YEAR
    ================================================================ */
    hasGap:          { type: Boolean, default: false },
    gapFromYear:     { type: String, trim: true, default: '' },
    gapToYear:       { type: String, trim: true, default: '' },
    gapTotalYears:   { type: String, trim: true, default: '' },
    gapYear:         { type: String, trim: true, default: '' }, // legacy — kept for old records
    gapReason:       { type: String, trim: true, default: '' },
    gapCertificate:  { type: String, default: '' },
    gapyeardocument: { type: String, default: '' },

    /* ================================================================
       CASTE CERTIFICATE DETAILS
    ================================================================ */
    casteCertificateNo:        { type: String, trim: true, default: '' },
    casteCertificateAuthority: { type: String, trim: true, default: '' },
    hasCasteValidity:          { type: Boolean, default: false },
    casteValidity:             { type: String, trim: true, default: '' },
    casteValidityDate:         { type: Date },
    casteCertificate:          { type: String, default: '' },
    casteValidityCertificate:  { type: String, default: '' },

    /* ================================================================
       COURSE & YEAR SELECTION
    ================================================================ */
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Course',
    },
    courseType:       { type: String, trim: true, default: '' },
    admissionYear:    { type: String, trim: true, default: '' },
    primarySubject:   { type: String, trim: true, default: '' },
    optionalSubjects: { type: String, trim: true, default: '' },
    preferredSubject: { type: String, trim: true, default: '' },

    /* ================================================================
       PREVIOUS COLLEGE (Direct Admission — 2nd / 3rd Year)
    ================================================================ */
    prevCollegeName:       { type: String, trim: true, default: '' },
    prevCollegeYear:       { type: String, trim: true, default: '' },
    tcNumber:              { type: String, trim: true, default: '' },
    prevYearObtainedMarks: { type: Number, default: null },
    prevYearTotalMarks:    { type: Number, default: null },
    prevYearPercentage:    { type: Number, default: null },
    prevYearMarksheet:     { type: String, default: '' },
    transferCertificate:   { type: String, default: '' },

    /* ================================================================
       BANK DETAILS — all optional
    ================================================================ */
    bankAccountHolder: { type: String, trim: true, default: '' },
    bankAccountNumber: { type: String, trim: true, default: '' },
    bankIFSC:          {
      type:    String,
      trim:    true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
        message:   'Invalid IFSC code format (e.g. SBIN0001234)',
      },
    },
    bankName:     { type: String, trim: true, default: '' },
    bankBranch:   { type: String, trim: true, default: '' },
    bankPassbook: { type: String, default: '' },

    /* ================================================================
       DOCUMENT FILE PATHS
    ================================================================ */
    studentPhoto:            { type: String, default: '' },
    signaturePhoto:          { type: String, default: '' },
    domicileCertificate:     { type: String, default: '' },
    incomeCertificate:       { type: String, default: '' },
    marriageCertificate:     { type: String, default: '' },
    twelfthTC:               { type: String, default: '' }, // 12th TC upload

    /* ================================================================
       ADDITIONAL INFO
    ================================================================ */
    referralSource: { type: String, trim: true, default: '' },
    reference:      { type: String, trim: true, default: '' },
    message:        { type: String, trim: true, default: '' },
    declaration:    { type: Boolean, default: false },

    /* ================================================================
       FEES
    ================================================================ */
    totalFees:          { type: Number, default: 0 },   // Official semester total
    scholarshipAmount:  { type: Number, default: 0 },   // Scholarship deduction
    plainPassword:      { type: String, default: '' },   // For Student Section visibility
    fees:               { type: Number, default: 0 },   // Total amount paid so far
    feesPaid:                  { type: Number, default: 0 },
    scholarshipEligibleAmount: { type: Number, default: 0 },
    scholarshipReceivedAmount: { type: Number, default: 0 },
    scholarshipPendingAmount:  { type: Number, default: 0 },
    academicYear:              { type: String, default: '' },
    scholarshipVerifiedBy:     { type: String, default: '' },
    scholarshipVerifiedDate:   { type: Date },

    // Full ledger of every payment
    feeLedger: [{
      receiptNo:     { type: String, default: '' },
      feeType:       { type: String, default: 'admission' },
      feeTypeLabel:  { type: String, default: '' },
      amount:        { type: Number, default: 0 },
      paymentMode:   { type: String, default: 'cash' },
      transactionId: { type: String, default: '' },
      collectedBy:   { type: String, default: '' },
      paidAt:        { type: Date, default: Date.now },
      semester:      { type: String, default: '' },
      year:          { type: String, default: '' },
      feeHeads:      { type: [String], default: [] }, // which fee heads this payment covers (e.g. ['Tuition Fee','Library Fee'])
    }],
    lastFeePayment: {
      paidAt:        { type: Date },
      paymentMode:   { type: String, default: '' },
      transactionId: { type: String, default: '' },
      receiptNo:     { type: String, default: '' },
      collectedBy:   { type: String, default: '' },
    },

    /* ================================================================
       ADMIN WORKFLOW — STATUS & REMARKS
    ================================================================ */
    studentId:  { type: String, default: '' },
    prnNumber:  { type: String, default: '' },
    scholarshipStatus: {
      type: String,
      enum: ['not_filled', 'filled', 'approved', 'rejected', 'disbursed'],
      default: 'not_filled',
    },
    scholarshipNote:     { type: String, default: '' },
    aadharVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    aadharVerificationRemark: { type: String, default: '' },

    casteCertificateVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    casteCertificateVerificationRemark: { type: String, default: '' },

    casteValidityVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    casteValidityVerificationRemark: { type: String, default: '' },

    incomeCertificateVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    incomeCertificateVerificationRemark: { type: String, default: '' },

    domicileVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    domicileVerificationRemark: { type: String, default: '' },

    bankPassbookVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    bankPassbookVerificationRemark: { type: String, default: '' },
    mahaDBTUsername:     { type: String, default: '' },
    mahaDBTPassword:     { type: String, default: '' },
    mahaDBTMobile:     { type: String, default: '' },
    mahaDBTAppNo:        { type: String, default: '' },

    studentSectionRemark: { type: String, default: '' },
    principalRemark:      { type: String, default: '' },
    tcIssued:             { type: Boolean, default: false },
    deleteRequested:      { type: Boolean, default: false },
    deleteReason:         { type: String, default: '' },
    deleteRequestedBy:    { type: String, default: '' },
    deleteRequestedAt:    { type: Date },
    tcIssuedDate:         { type: Date },

    studentSectionStatus: {
      type:    String,
      enum:    ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    principalStatus: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    appliedDate: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// PERFORMANCE FIX: these fields are filtered on in almost every admissions
// list query (staff/principal/student dashboards). Without indexes, MongoDB
// scans the entire collection every time -> gets slower as data grows.
admissionSchema.index({ status: 1, studentSectionStatus: 1 });
admissionSchema.index({ principalStatus: 1 });
admissionSchema.index({ email: 1 });
admissionSchema.index({ createdAt: -1 });
admissionSchema.index({ studentId: 1 });

module.exports = mongoose.model('Admission', admissionSchema);
