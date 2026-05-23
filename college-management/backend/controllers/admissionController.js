const Admission = require('../models/Admission');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendApprovalEmail } = require('../utils/emailService');


// Student Submit Form
exports.createAdmission = async (req, res) => {

  try {

    const admission = await Admission.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Admission submitted successfully',
      admission
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Get All Forms
exports.getAllAdmissions = async (req, res) => {

  try {

    const admissions = await Admission.find()
      .populate('course');

    res.status(200).json({
      success: true,
      admissions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Approve
exports.staffApprove = async (req, res) => {

  try {

    const admission = await Admission.findById(req.params.id);

    admission.studentSectionStatus = 'verified';

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Approved by staff'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Reject
exports.staffReject = async (req, res) => {

  try {

    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);

    admission.studentSectionStatus = 'rejected';

    admission.studentSectionRemark = reason;

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Rejected by staff'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Principal Approve
exports.principalApprove = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    // Unique Student ID generate karo
    const uniqueId = `CSMC${Date.now()}`;

    admission.principalStatus = 'approved';
    admission.status = 'approved';
    admission.studentId = uniqueId;
    await admission.save();

    // ===== USER ACCOUNT BANANA (agar pehle se nahi hai) =====
    let user = await User.findOne({ email: admission.email });

    if (!user) {
      // Password generate karo: first 4 letters of name + @ + DOB DDYY
      const namePart = (admission.applicantName || 'stud').replace(/\s+/g, '').substring(0, 4).toLowerCase();
      let dobPart = '0101';
      if (admission.dateOfBirth) {
        const dob = new Date(admission.dateOfBirth);
        const dd = String(dob.getDate()).padStart(2, '0');
        const yy = String(dob.getFullYear()).slice(-2);
        dobPart = `${dd}${yy}`;
      }
      const generatedPassword = `${namePart}@${dobPart}`;

      user = await User.create({
        name: admission.applicantName,
        email: admission.email,
        password: generatedPassword,
        phone: admission.phone || '',
        role: 'student',
        studentId: uniqueId,
        firstName: admission.applicantName?.split(' ')[0] || '',
        lastName: admission.applicantName?.split(' ').slice(-1)[0] || '',
      });
    }

    // ===== STUDENT RECORD BANANA (sabhi 5 sections ke liye) =====
    const existingStudent = await Student.findOne({ user: user._id });

    if (!existingStudent) {
      // Auto roll number generate karo
      const lastStudent = await Student.findOne().sort({ createdAt: -1 });
      let rollNumber = 'STU0001';
      if (lastStudent && lastStudent.rollNumber) {
        const lastNum = parseInt(lastStudent.rollNumber.replace(/\D/g, '')) + 1;
        rollNumber = 'STU' + String(lastNum).padStart(4, '0');
      }

      await Student.create({
        user: user._id,
        rollNumber,
        admissionYear: new Date().getFullYear(),
        dateOfBirth: admission.dateOfBirth ? new Date(admission.dateOfBirth) : undefined,
        gender: admission.gender || undefined,
        isActive: true,
        studentId: uniqueId,
        course: admission.courseType || '',
        feesPaid: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admission Approved — Student account created in all sections',
      studentId: uniqueId,
      userCreated: !existingStudent,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Principal Reject
exports.principalReject = async (req, res) => {

  try {

    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);

    admission.principalStatus = 'rejected';

    admission.principalRemark = reason;

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Rejected by principal'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
