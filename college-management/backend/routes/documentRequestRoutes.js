const express = require('express');
const router  = express.Router();
const DocumentRequest = require('../models/DocumentRequest');
const Admission       = require('../models/Admission');
const DocFeeType      = require('../models/DocFeeType');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const DOC_LABELS = {
  ID_CARD:           '🪪 ID Card',
  MARKSHEET:         '📄 Marksheet',
  MIGRATION:         '📜 Migration Certificate',
  TC:                '🎓 Transfer Certificate (TC)',
  BONAFIDE:          '📋 Bonafide Certificate',
  PROVISIONAL_DEGREE:'📜 Provisional Degree Certificate',
  DEGREE:            '🎓 Degree Certificate',
  DEGREE_FORM:       '📝 Degree Form',
};

// ─────────────────────────────────────────────────────────────────────────────
// Approval routing table — where a request goes AFTER Accounts approves it.
// 'exam'       → Exam Section (pending_exam)
// 'generation' → Student Section (pending_generation)
// TC is handled as a special case below (Exam → Principal → Student Section).
// ─────────────────────────────────────────────────────────────────────────────
const AFTER_ACCOUNTS = {
  TC:                  'exam',
  MIGRATION:           'exam',
  MARKSHEET:           'exam',
  PROVISIONAL_DEGREE:  'exam',
  DEGREE:              'exam',
  BONAFIDE:            'generation',
  ID_CARD:             'generation',
  DEGREE_FORM:         'generation',
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────────────────────────────────────────

// Submit request — every document type now starts at Accounts for fee verification.
router.post('/', protect, async (req, res) => {
  try {
    const { documentType, reason, urgency, marksheetSemester, marksheetSession, marksheetYear, marksheetAcadYear, lastExamYear, lastExamSem, lastExamSession, lastExamResult, lastExamPercent, lastExamCollege, provYear, provSession, provCourse, migrateTo, migrateFor } = req.body;
    if (!Object.keys(DOC_LABELS).includes(documentType))
      return res.status(400).json({ success: false, message: 'Invalid document type' });

    const admission = await Admission.findOne({ email: req.user.email });

    const data = {
      student:           req.user._id,
      studentName:       req.user.name,
      studentEmail:      req.user.email,
      studentPhone:       req.user.phone || '',
      documentType,
      documentTypeLabel: DOC_LABELS[documentType],
      reason:            reason || '',
      urgency:           urgency || 'normal',
      marksheetSemester: marksheetSemester || '',
      marksheetSession:  marksheetSession  || '',
      marksheetYear:     marksheetYear     || '',
      marksheetAcadYear: marksheetAcadYear || '',
      lastExamYear:      lastExamYear      || '',
      lastExamSem:       lastExamSem       || '',
      lastExamSession:   lastExamSession   || '',
      lastExamResult:    lastExamResult    || '',
      lastExamPercent:   lastExamPercent   || '',
      lastExamCollege:   lastExamCollege   || '',
      provYear:          provYear          || '',
      provSession:       provSession       || '',
      provCourse:        provCourse        || '',
      migrateTo:         migrateTo         || '',
      migrateFor:        migrateFor        || '',
      status:            'pending_accounts',
    };

    if (admission) {
      data.branch       = admission.courseType || '';
      data.admissionYear = admission.admissionYear || '';
      data.rollNumber   = admission.rollNumber || '';
      const y = new Date().getFullYear();
      data.batch = `${y}-${y + 1}`;
    }

    const request = await DocumentRequest.create(data);

    res.status(201).json({
      success: true,
      message: 'Request submitted! Waiting for Accounts Section to verify and collect fees.',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// My requests
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

router.get('/accounts/all', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [{ status: 'pending_accounts' }, { accountsApprovedBy: { $ne: '' } }]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accounts approves — auto-collects the configured fee for this document type
// (if one exists and is approved), then routes to Exam Section or Student
// Section depending on the document type.
router.put('/accounts/approve/:id', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (request.status !== 'pending_accounts')
      return res.status(400).json({ success: false, message: 'Not pending in Accounts' });

    // Auto-collect fee from the approved fee structure, if one is configured
    // for this document type. If none is mentioned in the fee structure, no
    // fee is charged.
    const feeType = await DocFeeType.findOne({ key: request.documentType, status: 'approved' });
    if (feeType) {
      request.feeAmount        = feeType.price;
      request.feeCollected     = true;
      request.feeCollectedBy   = req.user.name || req.user.email;
      request.feeCollectedDate = new Date();
    } else {
      request.feeAmount    = 0;
      request.feeCollected = false;
    }

    const nextStage = AFTER_ACCOUNTS[request.documentType] || 'generation';
    request.status              = nextStage === 'exam' ? 'pending_exam' : 'pending_generation';
    request.accountsApprovedBy   = req.user.name || req.user.email;
    request.accountsApprovedDate = new Date();
    request.accountsNotes        = notes || '';
    await request.save();

    res.json({
      success: true,
      message: feeType
        ? `✅ Fee of ₹${feeType.price} collected! Forwarded to ${nextStage === 'exam' ? 'Examination Section' : 'Student Section'}.`
        : `✅ Verified (no fee configured). Forwarded to ${nextStage === 'exam' ? 'Examination Section' : 'Student Section'}.`,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/accounts/reject/:id', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status:              'rejected_by_accounts',
      rejectionReason:     reason || 'Rejected by Accounts',
      rejectedBy:          req.user.name || req.user.email,
      rejectedAt:          'accounts',
      accountsApprovedBy:  req.user.name || req.user.email,
      accountsApprovedDate: new Date(),
      accountsNotes:       reason || '',
    }, { new: true });
    res.json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXAM SECTION
// ─────────────────────────────────────────────────────────────────────────────

// All requests for Exam Section (TC / Migration / Marksheet / Provisional Degree / Degree)
router.get('/exam/all', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [
        { status: 'pending_exam' },
        { examVerifiedBy: { $ne: '' } },
      ]
    }).sort({ createdAt: -1 }).lean();

    // Attach PRN / Student Unique ID / Academic Year from the Admission record (matched by email)
    const emails = [...new Set(requests.map(r => r.studentEmail).filter(Boolean))];
    const admissions = await Admission.find({ email: { $in: emails } })
      .select('email prnNumber studentId academicYear').lean();
    const admMap = {};
    admissions.forEach(a => { admMap[a.email] = a; });

    const enriched = requests.map(r => {
      const a = admMap[r.studentEmail] || {};
      return {
        ...r,
        prnNumber:    a.prnNumber || '',
        studentId:    a.studentId || '',
        academicYear: r.marksheetAcadYear || a.academicYear || '',
      };
    });

    res.status(200).json({ success: true, requests: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Exam Section approves
// TC → pending_principal
// Migration / Marksheet / Provisional Degree / Degree → completed (issued here)
router.put('/exam/approve/:id', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { notes, resultStatus } = req.body;
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (request.status !== 'pending_exam')
      return res.status(400).json({ success: false, message: 'Not pending in Exam Section' });

    const isTC = request.documentType === 'TC';
    // TC → Principal. Everything else that reaches Exam Section (Migration,
    // Marksheet, Provisional Degree, Degree) is issued directly here.
    request.status           = isTC ? 'pending_principal' : 'completed';
    request.examVerifiedBy   = req.user.name || req.user.email;
    request.examVerifiedDate = new Date();
    request.examNotes        = notes || '';
    request.examResultStatus = resultStatus || '';
    if (!isTC) {
      request.generatedBy   = req.user.name || req.user.email;
      request.generatedDate = new Date();
    }
    await request.save();

    res.json({
      success: true,
      message: isTC
        ? '✅ Result verified! TC forwarded to Principal for approval.'
        : `✅ ${request.documentTypeLabel || request.documentType} verified and issued by Examination Section.`,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/exam/reject/:id', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status:          'rejected_by_exam',
      rejectionReason: reason || 'Rejected by Examination Section',
      rejectedBy:      req.user.name || req.user.email,
      rejectedAt:      'exam',
      examVerifiedBy:  req.user.name || req.user.email,
      examVerifiedDate: new Date(),
      examNotes:       reason || '',
    }, { new: true });
    res.json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

router.get('/principal/pending', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ status: 'pending_principal' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/principal/all', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [{ status: 'pending_principal' }, { principalApprovedBy: { $ne: '' } }]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Principal approves → pending_generation (TC only reaches here)
router.put('/principal/approve/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (request.status !== 'pending_principal')
      return res.status(400).json({ success: false, message: 'Not pending in Principal' });

    request.status              = 'pending_generation';
    request.principalApprovedBy   = req.user.name || req.user.email;
    request.principalApprovedDate = new Date();
    request.principalNotes        = notes || '';
    await request.save();

    res.json({ success: true, message: '✅ Approved! Forwarded to Student Section.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/principal/reject/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status:               'rejected_by_principal',
      rejectionReason:      reason || 'Rejected by Principal',
      rejectedBy:           req.user.name || req.user.email,
      rejectedAt:           'principal',
      principalApprovedBy:  req.user.name || req.user.email,
      principalApprovedDate: new Date(),
      principalNotes:       reason || '',
    }, { new: true });
    res.json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT SECTION
// ─────────────────────────────────────────────────────────────────────────────

router.get('/student-section/all', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      $or: [{ status: 'pending_generation' }, { status: 'completed' }]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student Section issues the document (Bonafide, ID Card, Degree Form directly;
// TC after it has cleared Accounts → Exam → Principal).
router.put('/student-section/complete/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status:        'completed',
      generatedBy:   req.user.name || req.user.email,
      generatedDate: new Date(),
      generationNotes: notes || '',
    }, { new: true });

    // If TC issued — mark student as inactive (TC issued = left college).
    // This flag is read by StudentViewFull.js, which is shared across every
    // staff dashboard (Accounts, Examination, Scholarship, Student Section,
    // Principal, Admin), so "TC Issued" becomes visible everywhere at once.
    if (request && request.documentType === 'TC') {
      await Admission.findOneAndUpdate(
        { email: request.studentEmail },
        { tcIssued: true, tcIssuedDate: new Date(), status: 'tc_issued' }
      );
    }

    res.json({ success: true, message: '✅ Document issued to student!', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: any staff section viewing a student's full record can pull their
// document-request history (e.g. so "TC issued" shows up everywhere, not
// just in Student Section's own tab).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/by-student', protect, authorizeRoles('staff_accounts', 'staff_exam', 'staff_principal', 'staff_student', 'staff_scholarship', 'admin'), async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });
    const requests = await DocumentRequest.find({ studentEmail: email }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    await DocumentRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
router.get('/admin/all', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      status: { $nin: ['pending_accounts','pending_exam'] }
    }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/admin/approve/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const doc = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status: 'pending_principal',
      adminNotes: req.body.notes || '',
      adminApprovedDate: new Date(),
      adminApprovedBy: req.user.name,
    }, { new: true });
    res.json({ success: true, request: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/admin/reject/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const doc = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status: 'rejected_by_admin',
      adminNotes: req.body.reason || '',
    }, { new: true });
    res.json({ success: true, request: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Student Section forwards new doc type requests to Admin
router.put('/student-section/forward/:id', protect, authorizeRoles('staff_student', 'staff_principal'), async (req, res) => {
  try {
    const doc = await DocumentRequest.findByIdAndUpdate(req.params.id, {
      status: 'pending_admin',
      studentSectionNotes: req.body.notes || '',
      studentSectionDate: new Date(),
    }, { new: true });
    res.json({ success: true, request: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


module.exports = router;
