const Admission = require('../models/Admission');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendApprovalEmail } = require('../utils/emailService');

/* ============================================================
   HELPER — normalise board name
   Handles old records saved with the short name so they are
   automatically upgraded to the full official name on save.
   ============================================================ */
const BOARD_ALIAS = {
  'Maharashtra State Board':
    'Maharashtra State Board of Secondary and Higher Secondary Education',
};

const normaliseBoard = (value) =>
  BOARD_ALIAS[value?.trim()] || value?.trim() || '';

/* ============================================================
   HELPER — safely read a multer file path
   req.files is populated by multer.fields([...]) middleware.
   Returns empty string when the field was not uploaded.
   ============================================================ */
const filePath = (files, fieldName) => {
  if (!files || !files[fieldName] || !files[fieldName][0]) return '';
  // Use .path for diskStorage, or .location for S3/cloudStorage
  return files[fieldName][0].path || files[fieldName][0].location || '';
};


/* ============================================================
   CREATE — Student submits admission form
   ============================================================ */
exports.createAdmission = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || {};

    /* ----------------------------------------------------------
       1. REQUIRED FIELD VALIDATION
    ---------------------------------------------------------- */

    // Basic contact
    if (!body.applicantName?.trim())
      return res.status(400).json({ success: false, message: 'Applicant name is required.' });
    if (!body.email?.trim())
      return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!body.phone?.trim() || !/^\d{10}$/.test(body.phone.trim()))
      return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is required.' });

    // Personal details
    if (!body.placeOfBirth?.trim())
      return res.status(400).json({ success: false, message: 'Place of Birth is required.' });
    if (!body.caste?.trim())
      return res.status(400).json({ success: false, message: 'Caste is required.' });
    if (!body.isDisabled || !['yes', 'no'].includes(body.isDisabled))
      return res.status(400).json({ success: false, message: 'Please indicate disability status (yes / no).' });

    // Guardian
    if (!body.guardianFullName?.trim())
      return res.status(400).json({ success: false, message: 'Guardian Full Name is required.' });

  // Aadhar — format validation
    if (!body.aadharNumber?.trim() || !/^\d{12}$/.test(body.aadharNumber.trim()))
      return res.status(400).json({ success: false, message: 'A valid 12-digit Aadhar number is required.' });

    // Aadhar — uniqueness check
    const existingAadhar = await Admission.findOne({ aadharNumber: body.aadharNumber.trim() });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhar number is already registered with another student.',
      });
    }

    // APAAR ID — numeric only, exactly 12 digits
    const aparId = body.aparIdNumber?.trim() || '';
    if (!aparId)
      return res.status(400).json({ success: false, message: 'APAAR ID Number is required.' });
    if (!/^\d+$/.test(aparId))
      return res.status(400).json({ success: false, message: 'APAAR ID must contain digits only — no letters or special characters.' });
    if (aparId.length !== 12)
      return res.status(400).json({
        success: false,
        message: `APAAR ID must be exactly 12 digits. You entered ${aparId.length}.`,
      });

    // Course & year
    if (!body.courseType?.trim())
      return res.status(400).json({ success: false, message: 'Please select a Course.' });
    if (!body.admissionYear?.trim())
      return res.status(400).json({ success: false, message: 'Please select Admission Year.' });

    // Husband contact (conditional — only validated if married and a value is provided)
    const isMarried = body.isMarried === 'true' || body.isMarried === true;
    if (isMarried && body.husbandContactNumber?.trim()) {
      if (!/^\d{10}$/.test(body.husbandContactNumber.trim()))
        return res.status(400).json({ success: false, message: 'Husband Contact Number must be exactly 10 digits.' });
    }

    // Guardian phone (optional but must be 10 digits if provided)
    if (body.guardianPhone?.trim() && !/^\d{10}$/.test(body.guardianPhone.trim()))
      return res.status(400).json({ success: false, message: 'Guardian mobile number must be exactly 10 digits.' });

    // Pincode
    if (!body.pincode?.trim() || !/^\d{6}$/.test(body.pincode.trim()))
      return res.status(400).json({ success: false, message: 'A valid 6-digit pincode is required.' });

    /* ----------------------------------------------------------
       2. BOARD NAME NORMALISATION
       Upgrades any old short name to the full official name.
    ---------------------------------------------------------- */
    const sscBoard = normaliseBoard(body.sscBoard);
    const hscBoard = normaliseBoard(body.hscBoard);

    /* ----------------------------------------------------------
       3. BUILD ADMISSION DOCUMENT
    ---------------------------------------------------------- */
    const admissionData = {

      // ── Basic contact ──────────────────────────────────────
      applicantName:  body.applicantName.trim(),
      email:          body.email.trim().toLowerCase(),
      phone:          body.phone.trim(),

      // ── Personal details ───────────────────────────────────
      dateOfBirth:    body.dateOfBirth    || undefined,
      placeOfBirth:   body.placeOfBirth.trim(),
      gender:         body.gender?.trim() || '',
      category:       body.category?.trim() || '',
      caste:          body.caste.trim(),
      subCaste:       body.subCaste?.trim() || '',
      isDisabled:     body.isDisabled,
      bloodGroup:     body.bloodGroup?.trim() || '',
      religion:       body.religion?.trim() || '',
      nationality:    body.nationality?.trim() || 'Indian',

      // ── Marital & husband ──────────────────────────────────
      isMarried,
      husbandName:           isMarried ? (body.husbandName?.trim() || '')           : '',
      husbandContactNumber:  isMarried ? (body.husbandContactNumber?.trim() || '')  : '',

      // ── Guardian / parent ──────────────────────────────────
      guardianFullName: body.guardianFullName.trim(),
      guardianName:     body.guardianName?.trim()  || '',
      fatherName:       body.fatherName?.trim()    || '',
      motherName:       body.motherName?.trim()    || '',
      guardianPhone:    body.guardianPhone?.trim()  || '',
      familyIncome:     body.familyIncome?.trim()   || '',

      // ── Address ────────────────────────────────────────────
      address:         body.address?.trim()         || '',
      houseNumber:     body.houseNumber?.trim()      || '',
      streetArea:      body.streetArea?.trim()       || '',
      subdistrict:     body.subdistrict?.trim()      || '',
      cityTownVillage: body.cityTownVillage?.trim()  || '',
      district:        body.district?.trim()         || '',
      state:           body.state?.trim()            || '',
      pincode:         body.pincode.trim(),

      // ── Aadhar ─────────────────────────────────────────────
      aadharNumber: body.aadharNumber.trim(),
      aadharName:   body.aadharName?.trim() || '',

      // ── APAAR ID ───────────────────────────────────────────
      aparIdNumber:   aparId,                             // already validated above
      aparIdDocument: filePath(files, 'aparIdDocument'),  // uploaded file path

      // ── SSC ────────────────────────────────────────────────
      sscSchoolName:    body.sscSchoolName?.trim()    || '',
      sscBoard,                                            // normalised value
      sscYOP:           body.sscYOP?.trim()           || '',
      sscRollNumber:    body.sscRollNumber?.trim()    || '',
      sscObtainedMarks: body.sscObtainedMarks ? Number(body.sscObtainedMarks) : null,
      sscTotalMarks:    body.sscTotalMarks    ? Number(body.sscTotalMarks)    : null,
      sscPercentage:    body.sscPercentage    ? Number(body.sscPercentage)    : null,
      sscGrade:         body.sscGrade?.trim() || '',

      // ── HSC ────────────────────────────────────────────────
      hscCollegeName:   body.hscCollegeName?.trim()   || '',
      hscBoard,                                            // normalised value
      hscStream:        body.hscStream?.trim()        || '',
      hscYOP:           body.hscYOP?.trim()           || '',
      hscRollNumber:    body.hscRollNumber?.trim()    || '',
      hscMedium:        body.hscMedium?.trim()        || '',
      hscObtainedMarks: body.hscObtainedMarks ? Number(body.hscObtainedMarks) : null,
      hscTotalMarks:    body.hscTotalMarks    ? Number(body.hscTotalMarks)    : null,
      hscPercentage:    body.hscPercentage    ? Number(body.hscPercentage)    : null,
      hscGrade:         body.hscGrade?.trim() || '',

      // ── Gap year ───────────────────────────────────────────
      hasGap:       body.hasGap === 'true' || body.hasGap === true,
      gapFromYear:  body.gapFromYear?.trim()  || '',
      gapToYear:    body.gapToYear?.trim()    || '',
      gapTotalYears:body.gapTotalYears?.trim()|| '',
      gapReason:    body.gapReason?.trim()    || '',

      // ── Caste certificate ──────────────────────────────────
      casteCertificateNo:        body.casteCertificateNo?.trim()        || '',
      casteCertificateAuthority: body.casteCertificateAuthority?.trim() || '',
      hasCasteValidity:          body.hasCasteValidity === 'true' || body.hasCasteValidity === true,
      casteValidity:             body.casteValidity?.trim()             || '',
      casteValidityDate:         body.casteValidityDate                 || undefined,

      // ── Course & year ──────────────────────────────────────
      course:           body.course           || undefined,
      courseType:       body.courseType.trim(),
      admissionYear:    body.admissionYear.trim(),
      primarySubject:   body.primarySubject?.trim()   || '',
      optionalSubjects: body.optionalSubjects?.trim() || '',
      preferredSubject: body.preferredSubject?.trim() || '',

      // ── Previous college (direct admissions) ───────────────
      prevCollegeName:       body.prevCollegeName?.trim()       || '',
      prevCollegeYear:       body.prevCollegeYear?.trim()       || '',
      tcNumber:              body.tcNumber?.trim()              || '',
      prevYearObtainedMarks: body.prevYearObtainedMarks ? Number(body.prevYearObtainedMarks) : null,
      prevYearTotalMarks:    body.prevYearTotalMarks    ? Number(body.prevYearTotalMarks)    : null,
      prevYearPercentage:    body.prevYearPercentage    ? Number(body.prevYearPercentage)    : null,

      // ── Bank details (all optional) ────────────────────────
      bankAccountHolder: body.bankAccountHolder?.trim() || '',
      bankAccountNumber: body.bankAccountNumber?.trim() || '',
      bankIFSC:          body.bankIFSC?.trim()          || '',
      bankName:          body.bankName?.trim()           || '',
      bankBranch:        body.bankBranch?.trim()         || '',

      // ── Additional info ────────────────────────────────────
      referralSource: body.referralSource?.trim() || '',
      reference:      body.reference?.trim()      || '',
      message:        body.message?.trim()        || '',
      declaration:    body.declaration === 'true' || body.declaration === true,

      // ── Uploaded file paths ────────────────────────────────
      studentPhoto:            filePath(files, 'studentPhoto'),
      signaturePhoto:          filePath(files, 'signaturePhoto'),
      aadharPhoto:             filePath(files, 'aadharPhoto'),
      sscMarksheet:            filePath(files, 'sscMarksheet'),
      hscMarksheet:            filePath(files, 'hscMarksheet'),
      prevYearMarksheet:       filePath(files, 'prevYearMarksheet'),
      gapCertificate:          filePath(files, 'gapCertificate'),
      gapyeardocument:         filePath(files, 'gapyeardocument'),
      casteCertificate:        filePath(files, 'casteCertificate'),
      casteValidityCertificate:filePath(files, 'casteValidityCertificate'),
      marriageCertificate:     filePath(files, 'marriageCertificate'),
      bankPassbook:            filePath(files, 'bankPassbook'),
      domicileCertificate:     filePath(files, 'domicileCertificate'),
      incomeCertificate:       filePath(files, 'incomeCertificate'),
      transferCertificate:     filePath(files, 'transferCertificate'),
      twelfthTC:               filePath(files, 'twelfthTC'),
    };

 /* ----------------------------------------------------------
       4. EMAIL UNIQUENESS CHECK
    ---------------------------------------------------------- */
    const existingAdmission = await Admission.findOne({ email: body.email.trim().toLowerCase() });
    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: 'This email is already used by another student. Please use a different email address.',
      });
    }

    /* ----------------------------------------------------------
       5. SAVE TO DATABASE
    ---------------------------------------------------------- */
    const admission = await Admission.create(admissionData);

    return res.status(201).json({
      success: true,
      message: 'Admission submitted successfully',
      admission,
    });

  } catch (error) {
    // Mongoose validation errors — return the first message cleanly
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0]?.message || error.message;
      return res.status(400).json({ success: false, message: firstMessage });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   GET ALL — Staff views all submitted forms
   ============================================================ */
exports.getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().populate('course');

    return res.status(200).json({ success: true, admissions });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   STAFF APPROVE
   ============================================================ */
exports.staffApprove = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission)
      return res.status(404).json({ success: false, message: 'Admission not found.' });

    admission.studentSectionStatus = 'verified';
    await admission.save();

    return res.status(200).json({ success: true, message: 'Approved by staff.' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   STAFF REJECT
   ============================================================ */
exports.staffReject = async (req, res) => {
  try {
    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);
    if (!admission)
      return res.status(404).json({ success: false, message: 'Admission not found.' });

    admission.studentSectionStatus = 'rejected';
    admission.studentSectionRemark = reason || '';
    await admission.save();

    return res.status(200).json({ success: true, message: 'Rejected by staff.' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   PRINCIPAL APPROVE
   Creates User + Student records on approval.
   ============================================================ */
exports.principalApprove = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission)
      return res.status(404).json({ success: false, message: 'Admission not found.' });

    // Generate unique student ID in COURSE+YEAR+4digit format (e.g. BCA20260001)
    const courseCode = (admission.courseType || 'GEN')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    const yearCode = (admission.admissionYear || String(new Date().getFullYear())).toString().slice(-2);
    const idPrefix = `${courseCode}${yearCode}`;

    const lastWithPrefix = await Student.findOne({
      studentId: new RegExp(`^${idPrefix}\\d{4}$`),
    }).sort({ studentId: -1 });

    let nextSeq = 1;
    if (lastWithPrefix?.studentId) {
      nextSeq = parseInt(lastWithPrefix.studentId.slice(-4), 10) + 1;
    }

    const uniqueId = `${idPrefix}${String(nextSeq).padStart(4, '0')}`;

    admission.principalStatus = 'approved';
    admission.status          = 'approved';
    admission.studentId       = uniqueId;
    await admission.save();

    // ── Create User account if not already present ───────────
    let user = await User.findOne({ email: admission.email });
    let userCreated = false;

    if (!user) {
      // Password: first 4 letters of name (lowercase) + @ + DDYY from DOB
      const namePart = (admission.applicantName || 'stud')
        .replace(/\s+/g, '')
        .substring(0, 4)
        .toLowerCase();

      let dobPart = '0101';
      if (admission.dateOfBirth) {
        const dob = new Date(admission.dateOfBirth);
        const dd  = String(dob.getDate()).padStart(2, '0');
        const yy  = String(dob.getFullYear()).slice(-2);
        dobPart   = `${dd}${yy}`;
      }

      user = await User.create({
        name:       admission.applicantName,
        email:      admission.email,
        password:   `${namePart}@${dobPart}`,
        phone:      admission.phone || '',
        role:       'student',
        studentId:  uniqueId,
        firstName:  admission.applicantName?.split(' ')[0]       || '',
        lastName:   admission.applicantName?.split(' ').slice(-1)[0] || '',
      });

      userCreated = true;
    }

    // ── Create Student record if not already present ─────────
    const existingStudent = await Student.findOne({ user: user._id });

    if (!existingStudent) {
      // Auto-generate roll number
      const lastStudent = await Student.findOne().sort({ createdAt: -1 });
      let rollNumber = 'STU0001';
      if (lastStudent?.rollNumber) {
        const lastNum = parseInt(lastStudent.rollNumber.replace(/\D/g, '')) + 1;
        rollNumber    = 'STU' + String(lastNum).padStart(4, '0');
      }

      await Student.create({
        user:          user._id,
        rollNumber,
        admissionYear: new Date().getFullYear(),
        dateOfBirth:   admission.dateOfBirth ? new Date(admission.dateOfBirth) : undefined,
        gender:        admission.gender  || undefined,
        isActive:      true,
        studentId:     uniqueId,
        course:        admission.courseType || '',
        feesPaid:      false,
      });
    }

    return res.status(200).json({
      success:     true,
      message:     'Admission approved — student account created in all sections.',
      studentId:   uniqueId,
      userCreated,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   PRINCIPAL REJECT
   ============================================================ */
exports.principalReject = async (req, res) => {
  try {
    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);
    if (!admission)
      return res.status(404).json({ success: false, message: 'Admission not found.' });

    admission.principalStatus = 'rejected';
    admission.principalRemark = reason || '';
    await admission.save();

    return res.status(200).json({ success: true, message: 'Rejected by principal.' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
