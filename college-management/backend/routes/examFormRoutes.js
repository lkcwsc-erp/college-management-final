const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ── In-memory exam settings (replace with DB model if needed) ────────────────
// Using a simple JSON file approach for persistence
const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, '../data/examSettings.json');

const readSettings = () => {
  try {
    if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) return {
      regularEnabled: false, backlogEnabled: false,
      regularCourse: '', regularSemester: '', regularExamEvent: '',
      backlogCourse: '', backlogSemester: '', backlogExamEvent: '',
      lastUpdatedBy: '', lastUpdatedAt: null
    };
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch { return {
    regularEnabled: false, backlogEnabled: false,
    regularCourse: '', regularSemester: '', regularExamEvent: '',
    backlogCourse: '', backlogSemester: '', backlogExamEvent: '',
    lastUpdatedBy: '', lastUpdatedAt: null
  }; }
};

const writeSettings = (data) => {
  try {
    if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
  } catch(e) { console.error('Settings write error:', e); }
};

// GET exam settings (public - student dashboard needs it too)
router.get('/exam-settings', protect, async (req, res) => {
  try {
    const settings = readSettings();
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT exam settings (exam section only)
router.put('/exam-settings', protect, authorizeRoles('staff_exam', 'admin'), async (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body, lastUpdatedBy: req.user?.name || 'Staff', lastUpdatedAt: new Date() };
    writeSettings(updated);
    res.json({ success: true, settings: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Exam Form Requests ────────────────────────────────────────────────────────

// POST - Student submits exam form
router.post('/exam-form/submit', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const ExamFormRequest = require('../models/ExamFormRequest');
    const Admission = require('../models/Admission');

    const { formType } = req.body;
    const settings = readSettings();

    // Check if form is open
    if (formType === 'regular' && !settings.regularEnabled) {
      return res.status(400).json({ success: false, message: 'Regular exam form is not open yet.' });
    }
    if (formType === 'backlog' && !settings.backlogEnabled) {
      return res.status(400).json({ success: false, message: 'Backlog exam form is not open yet.' });
    }

    // Get student admission info
    const admission = await Admission.findOne({ email: req.user.email, status: 'approved' });
    if (!admission) {
      return res.status(404).json({ success: false, message: 'No approved admission found.' });
    }

    // Check if already submitted this semester/event
    const course = formType === 'regular' ? settings.regularCourse : settings.backlogCourse;
    const semester = formType === 'regular' ? settings.regularSemester : settings.backlogSemester;
    const examEvent = formType === 'regular' ? settings.regularExamEvent : settings.backlogExamEvent;

    const existing = await ExamFormRequest.findOne({
      studentEmail: req.user.email,
      formType,
      semester,
      examEvent
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted this form.' });
    }

    const formReq = await ExamFormRequest.create({
      studentEmail: req.user.email,
      studentName: admission.applicantName,
      studentId: admission.studentId || '',
      prnNumber: admission.prnNumber || '',
      course: admission.courseType || course,
      admissionYear: admission.admissionYear || '',
      semester,
      examEvent,
      mobileNo: admission.phone || '',
      formType,
    });

    res.status(201).json({ success: true, message: 'Exam form submitted successfully!', request: formReq });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET - Student gets their exam form requests
router.get('/exam-form/my', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const ExamFormRequest = require('../models/ExamFormRequest');
    const requests = await ExamFormRequest.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET - Accounts section gets all requests (with optional filters)
router.get('/exam-form/all', protect, authorizeRoles('staff_accounts', 'staff_exam', 'admin'), async (req, res) => {
  try {
    const ExamFormRequest = require('../models/ExamFormRequest');
    const { formType, course, feeStatus, search } = req.query;

    const filter = {};
    if (formType) filter.formType = formType;
    if (course) filter.course = new RegExp(course, 'i');
    if (feeStatus) filter.feeStatus = feeStatus;
    if (search) {
      filter.$or = [
        { studentName: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { prnNumber: new RegExp(search, 'i') },
        { studentEmail: new RegExp(search, 'i') },
      ];
    }

    const requests = await ExamFormRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT - Accounts collects exam fee
router.put('/exam-form/collect-fee/:id', protect, authorizeRoles('staff_accounts', 'admin'), async (req, res) => {
  try {
    const ExamFormRequest = require('../models/ExamFormRequest');
    const Admission = require('../models/Admission');
    const { amount, paymentMode, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const formReq = await ExamFormRequest.findById(req.params.id);
    if (!formReq) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (formReq.feeStatus === 'collected') {
      return res.status(400).json({ success: false, message: 'Fee already collected.' });
    }

    // Generate receipt number
    const receiptNo = 'EXF' + Date.now().toString().slice(-7);
    const collectedBy = req.user?.name || 'Accounts';

    // Update form request
    formReq.feeStatus = 'collected';
    formReq.feeAmount = amount;
    formReq.feeReceiptNo = receiptNo;
    formReq.feeCollectedBy = collectedBy;
    formReq.feeCollectedAt = new Date();
    formReq.paymentMode = paymentMode || 'cash';
    await formReq.save();

    // Also add to student feeLedger in Admission
    await Admission.findOneAndUpdate(
      { email: formReq.studentEmail },
      {
        $push: {
          feeLedger: {
            receiptNo,
            feeType: 'exam_form',
            feeTypeLabel: `Exam Form Fee (${formReq.formType === 'regular' ? 'Regular' : 'Backlog'} - ${formReq.semester} Sem - ${formReq.examEvent})`,
            amount: Number(amount),
            paymentMode: paymentMode || 'cash',
            transactionId: transactionId || '',
            collectedBy,
            paidAt: new Date(),
            semester: formReq.semester,
          }
        }
      }
    );

    res.json({ success: true, message: 'Fee collected successfully!', receiptNo, request: formReq });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET - Exam section sees form submission by student (for StudentViewFull)
router.get('/exam-form/by-student/:email', protect, authorizeRoles('staff_exam', 'staff_accounts', 'staff_student', 'admin'), async (req, res) => {
  try {
    const ExamFormRequest = require('../models/ExamFormRequest');
    const requests = await ExamFormRequest.find({ studentEmail: req.params.email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
