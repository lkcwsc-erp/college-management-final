const express = require('express');
const router  = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ExamSettings    = require('../models/ExamSettings');
const ExamFormRequest = require('../models/ExamFormRequest');
const Admission       = require('../models/Admission');

// ── helper: get or create settings doc ───────────────────────────────────────
const getSettings = async () => {
  let s = await ExamSettings.findOne({ key: 'global' });
  if (!s) s = await ExamSettings.create({ key: 'global' });
  return s;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/results/exam-settings  (all staff + student)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-settings', protect, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT  /api/results/exam-settings  (exam section + admin)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/exam-settings', protect, authorizeRoles('staff_exam', 'admin'), async (req, res) => {
  try {
    const settings = await getSettings();
    const allowed = [
      'regularEnabled','backlogEnabled',
      'regularCourse','regularSemester','regularExamEvent',
      'backlogCourse','backlogSemester','backlogExamEvent',
    ];
    allowed.forEach(k => { if (req.body[k] !== undefined) settings[k] = req.body[k]; });
    settings.lastUpdatedBy  = req.user?.name || 'Staff';
    settings.lastUpdatedAt  = new Date();
    await settings.save();
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/results/exam-form/submit  (student)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/exam-form/submit', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { formType } = req.body;
    const settings = await getSettings();

    if (formType === 'regular' && !settings.regularEnabled)
      return res.status(400).json({ success: false, message: 'Regular exam form is not open yet.' });
    if (formType === 'backlog' && !settings.backlogEnabled)
      return res.status(400).json({ success: false, message: 'Backlog exam form is not open yet.' });

    const admission = await Admission.findOne({ email: req.user.email, status: 'approved' });
    if (!admission)
      return res.status(404).json({ success: false, message: 'No approved admission found.' });

    const semester  = formType === 'regular' ? settings.regularSemester  : settings.backlogSemester;
    const examEvent = formType === 'regular' ? settings.regularExamEvent  : settings.backlogExamEvent;

    const existing = await ExamFormRequest.findOne({
      studentEmail: req.user.email, formType, semester, examEvent
    });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already submitted this form.' });

    const formReq = await ExamFormRequest.create({
      studentEmail: req.user.email,
      studentName:  admission.applicantName,
      studentId:    admission.studentId   || '',
      prnNumber:    admission.prnNumber   || '',
      course:       admission.courseType  || '',
      admissionYear:admission.admissionYear || '',
      semester,
      examEvent,
      mobileNo:     admission.phone || '',
      formType,
    });

    res.status(201).json({ success: true, message: 'Exam form submitted successfully!', request: formReq });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/my  (student – own requests)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/my', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const requests = await ExamFormRequest.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/all  (accounts + exam + admin)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/all', protect, authorizeRoles('staff_accounts', 'staff_exam', 'admin'), async (req, res) => {
  try {
    const { formType, course, feeStatus, search } = req.query;
    const filter = {};
    if (formType)  filter.formType  = formType;
    if (course)    filter.course    = new RegExp(course, 'i');
    if (feeStatus) filter.feeStatus = feeStatus;
    if (search)    filter.$or = [
      { studentName: new RegExp(search, 'i') },
      { studentId:   new RegExp(search, 'i') },
      { prnNumber:   new RegExp(search, 'i') },
      { studentEmail:new RegExp(search, 'i') },
    ];
    const requests = await ExamFormRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/results/exam-form/collect-fee/:id  (accounts + admin)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/exam-form/collect-fee/:id', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const { amount, paymentMode, transactionId } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });

    const formReq = await ExamFormRequest.findById(req.params.id);
    if (!formReq)
      return res.status(404).json({ success: false, message: 'Request not found.' });
    if (formReq.feeStatus === 'collected')
      return res.status(400).json({ success: false, message: 'Fee already collected.' });

    const receiptNo    = 'EXF' + Date.now().toString().slice(-7);
    const collectedBy  = req.user?.name || 'Accounts';

    formReq.feeStatus      = 'collected';
    formReq.feeAmount      = Number(amount);
    formReq.feeReceiptNo   = receiptNo;
    formReq.feeCollectedBy = collectedBy;
    formReq.feeCollectedAt = new Date();
    formReq.paymentMode    = paymentMode || 'cash';
    await formReq.save();

    // Also record in student feeLedger
    await Admission.findOneAndUpdate(
      { email: formReq.studentEmail },
      { $push: { feeLedger: {
        receiptNo,
        feeType:      'exam_form',
        feeTypeLabel: `Exam Form Fee (${formReq.formType === 'regular' ? 'Regular' : 'Backlog'} - ${formReq.semester} Sem - ${formReq.examEvent})`,
        amount:       Number(amount),
        paymentMode:  paymentMode || 'cash',
        transactionId: transactionId || '',
        collectedBy,
        paidAt:       new Date(),
        semester:     formReq.semester,
      }}}
    );

    res.json({ success: true, message: 'Fee collected!', receiptNo, request: formReq });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/by-student/:email  (staff – for detail view)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/by-student/:email', protect,
  authorizeRoles('staff_exam', 'staff_accounts', 'staff_student', 'staff_principal', 'admin'),
  async (req, res) => {
    try {
      const requests = await ExamFormRequest.find({
        studentEmail: req.params.email.toLowerCase()
      }).sort({ createdAt: -1 });
      res.json({ success: true, requests });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

module.exports = router;
