const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

const uploadFields = upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'signaturePhoto', maxCount: 1 },
  { name: 'aadharPhoto', maxCount: 1 },
  { name: 'sscMarksheet', maxCount: 1 },
  { name: 'hscMarksheet', maxCount: 1 },
  { name: 'prevYearMarksheet', maxCount: 1 },
  { name: 'gapCertificate', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'casteValidityCertificate', maxCount: 1 },
  { name: 'marriageCertificate', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'domicileCertificate', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'aparIdDocument', maxCount: 1 },
]);

// Submit admission application
router.post('/', uploadFields, async (req, res) => {
  try {
    console.log('📋 Admission form received');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'none');

    const data = { ...req.body };

    // Convert boolean strings to actual booleans
    data.hasGap = data.hasGap === 'true';
    data.hasCasteValidity = data.hasCasteValidity === 'true';
    data.declaration = data.declaration === 'true';
    data.isMarried = data.isMarried === 'true';
    data.sameAsAddress = data.sameAsAddress === 'true';
    data.feesPaid = data.feesPaid === 'true';

    // Convert numbers
    if (data.sscObtainedMarks) data.sscObtainedMarks = Number(data.sscObtainedMarks);
    if (data.sscTotalMarks) data.sscTotalMarks = Number(data.sscTotalMarks);
    if (data.sscPercentage) data.sscPercentage = Number(data.sscPercentage);
    if (data.hscObtainedMarks) data.hscObtainedMarks = Number(data.hscObtainedMarks);
    if (data.hscTotalMarks) data.hscTotalMarks = Number(data.hscTotalMarks);
    if (data.hscPercentage) data.hscPercentage = Number(data.hscPercentage);
    if (data.prevYearObtainedMarks) data.prevYearObtainedMarks = Number(data.prevYearObtainedMarks);
    if (data.prevYearTotalMarks) data.prevYearTotalMarks = Number(data.prevYearTotalMarks);
    if (data.prevYearPercentage) data.prevYearPercentage = Number(data.prevYearPercentage);
    if (data.fees) data.fees = Number(data.fees);

    // Handle all uploaded files
    if (req.files) {
      if (req.files.studentPhoto) data.studentPhoto = req.files.studentPhoto[0].filename;
      if (req.files.signaturePhoto) data.signaturePhoto = req.files.signaturePhoto[0].filename;
      if (req.files.aadharPhoto) data.aadharPhoto = req.files.aadharPhoto[0].filename;
      if (req.files.sscMarksheet) data.sscMarksheet = req.files.sscMarksheet[0].filename;
      if (req.files.hscMarksheet) data.hscMarksheet = req.files.hscMarksheet[0].filename;
      if (req.files.prevYearMarksheet) data.prevYearMarksheet = req.files.prevYearMarksheet[0].filename;
      if (req.files.gapCertificate) data.gapCertificate = req.files.gapCertificate[0].filename;
      if (req.files.casteCertificate) data.casteCertificate = req.files.casteCertificate[0].filename;
      if (req.files.casteValidityCertificate) data.casteValidityCertificate = req.files.casteValidityCertificate[0].filename;
      if (req.files.marriageCertificate) data.marriageCertificate = req.files.marriageCertificate[0].filename;
      if (req.files.bankPassbook) data.bankPassbook = req.files.bankPassbook[0].filename;
      if (req.files.domicileCertificate) data.domicileCertificate = req.files.domicileCertificate[0].filename;
      if (req.files.incomeCertificate) data.incomeCertificate = req.files.incomeCertificate[0].filename;
      if (req.files.transferCertificate) data.transferCertificate = req.files.transferCertificate[0].filename;
    }

    // Remove course if empty string (avoid ObjectId cast error)
    if (!data.course || data.course === '' || data.course === 'undefined') {
      delete data.course;
    }

    // Remove empty date fields (avoid Cast errors)
    if (!data.dateOfBirth || data.dateOfBirth === '') delete data.dateOfBirth;
    if (!data.casteValidityDate || data.casteValidityDate === '') delete data.casteValidityDate;

    const admission = await Admission.create(data);
    console.log('✅ Admission created:', admission._id);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      admission
    });

  } catch (error) {
    console.error('❌ Admission error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all admissions - Admin only
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });

    console.log(`📋 Fetched ${admissions.length} admissions`);

    res.status(200).json({
      success: true,
      count: admissions.length,
      admissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get admission by email - for student dashboard
router.get('/by-email/:email', protect, async (req, res) => {
  try {
    const admission = await Admission.findOne({ email: req.params.email })
      .populate('course', 'name type code');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'No application found' });
    }

    res.status(200).json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update admission - Admin only
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('course', 'name type');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete admission - Admin only
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Student Section Pending Admissions
router.get('/student-section/pending', async (req, res) => {

  try {

    const admissions = await Admission.find({
      studentSectionStatus: 'pending'
    });

    res.json({
      success: true,
      admissions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// Student Section Verify Admission
router.put('/student-section/verify/:id', async (req, res) => {

  try {

    await Admission.findByIdAndUpdate(
      req.params.id,
      {
        studentSectionStatus: 'verified'
      }
    );

    res.json({
      success: true,
      message: 'Admission verified successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// Principal Pending Admissions
router.get('/principal/pending', async (req, res) => {

  try {

    const admissions = await Admission.find({
      studentSectionStatus: 'verified',
      principalStatus: 'pending'
    });

    res.json({
      success: true,
      admissions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// Principal Approve Admission
router.put('/principal/approve/:id', async (req, res) => {

  try {

    await Admission.findByIdAndUpdate(
      req.params.id,
      {
        principalStatus: 'approved',
        status: 'approved'
      }
    );

    res.json({
      success: true,
      message: 'Admission approved by principal'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
module.exports = router;
