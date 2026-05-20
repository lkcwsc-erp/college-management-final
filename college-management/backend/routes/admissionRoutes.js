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

// ========== STUDENT: Submit Admission ==========
router.post('/', uploadFields, async (req, res) => {
  try {
    console.log('📋 Admission form received');
    const data = { ...req.body };

    // Convert boolean strings
    data.hasGap = data.hasGap === 'true';
    data.hasCasteValidity = data.hasCasteValidity === 'true';
    data.declaration = data.declaration === 'true';
    data.isMarried = data.isMarried === 'true';
    data.sameAsAddress = data.sameAsAddress === 'true';
    data.feesPaid = data.feesPaid === 'true';

    // Convert numbers
    ['sscObtainedMarks', 'sscTotalMarks', 'sscPercentage',
     'hscObtainedMarks', 'hscTotalMarks', 'hscPercentage',
     'prevYearObtainedMarks', 'prevYearTotalMarks', 'prevYearPercentage',
     'fees'].forEach(f => {
      if (data[f]) data[f] = Number(data[f]);
    });

    // Handle uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          data[field] = req.files[field][0].filename;
        }
      });
    }

    // Clean empty fields
    if (!data.course || data.course === '' || data.course === 'undefined') delete data.course;
    if (!data.dateOfBirth || data.dateOfBirth === '') delete data.dateOfBirth;
    if (!data.casteValidityDate || data.casteValidityDate === '') delete data.casteValidityDate;

    // Workflow status
    data.studentSectionStatus = 'pending';
    data.status = 'pending';

    const admission = await Admission.create(data);
    console.log('✅ Admission created:', admission._id);

    res.status(201).json({
      success: true,
      message: 'Application submitted! Awaiting Student Section review.',
      admission
    });

  } catch (error) {
    console.error('❌ Admission error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ADMIN: Get All ==========
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: admissions.length, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT: Get by Email ==========
router.get('/by-email/:email', protect, async (req, res) => {
  try {
    const admission = await Admission.findOne({ email: req.params.email })
      .populate('course', 'name type code');
    if (!admission) {
      return res.status(404).json({ success: false, message: 'No application found' });
    }
    res.json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT SECTION: View Pending Admissions ==========
router.get('/student-section/pending', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const admissions = await Admission.find({ studentSectionStatus: 'pending' })
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT SECTION: View All ==========
router.get('/student-section/all', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT SECTION: Approve & Forward to Principal ==========
router.put('/staff-approve/:id', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    if (admission.studentSectionStatus !== 'pending')
      return res.status(400).json({ success: false, message: 'Already processed' });
    }

    admission.studentSectionStatus = 'verified';
    admission.staffNotes = notes || '';
    admission.staffApprovedBy = req.user.name || req.user.email;
    admission.staffApprovedDate = new Date();
    await admission.save();

    res.json({
      success: true,
      message: '✅ Approved! Forwarded to Principal for final approval.',
      admission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT SECTION: Reject ==========
router.put('/staff-reject/:id', protect, authorizeRoles('staff_student', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason required' });
    }
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        studentSectionStatus: 'rejected',
        status: 'rejected',
        staffNotes: reason,
        staffApprovedBy: req.user.name || req.user.email,
        staffApprovedDate: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );
    res.json({ success: true, message: 'Application rejected.', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: View Pending Admissions ==========
router.get('/principal/pending', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const admissions = await Admission.find({ studentSectionStatus: 'verified', status: 'pending' })
      .populate('course', 'name type code')
      .sort({ staffApprovedDate: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: View All Processed ==========
router.get('/principal/all', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const admissions = await Admission.find({
     $or: [{ studentSectionStatus: 'verified' }, { status: 'approved' }]
    })
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: Final Approve + Generate Student ID ==========
router.put('/principal-approve/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
   if (admission.studentSectionStatus !== 'verified')
      return res.status(400).json({ success: false, message: 'Not yet approved by Student Section' });
    }
    if (admission.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Already approved' });
    }

    // Generate unique Student ID: LKCWSC/YEAR/COURSE/RANDOM
    const year = new Date().getFullYear();

const courseName = admission.preferredSubject
  ? admission.preferredSubject.substring(0,3).toUpperCase()
  : 'GEN';

const randomNum = Math.floor(100 + Math.random() * 900);

const studentId = `${courseName}${year}${randomNum}`;
    admission.status = 'approved';
    admission.principalApprovedBy = req.user.name || req.user.email;
    admission.principalApprovedDate = new Date();
    admission.principalNotes = notes || '';
    admission.studentId = studentId;
    await admission.save();

    res.json({
      success: true,
      message: `✅ Admission approved! Student ID: ${studentId}`,
      admission,
      studentId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: Reject ==========
router.put('/principal-reject/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason required' });
    }
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        principalApprovedBy: req.user.name || req.user.email,
        principalApprovedDate: new Date(),
        principalNotes: reason,
        rejectionReason: reason
      },
      { new: true }
    );
    res.json({ success: true, message: 'Application rejected by Principal.', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE (Admin) ==========
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('course', 'name type');
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== DELETE ==========
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
