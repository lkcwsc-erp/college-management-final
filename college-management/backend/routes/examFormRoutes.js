const express = require('express');
const router  = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ExamSettings      = require('../models/ExamSettings');
const ExamFormRequest   = require('../models/ExamFormRequest');
const PublishedExamForm = require('../models/PublishedExamForm');
const Admission         = require('../models/Admission');

// ── helpers ───────────────────────────────────────────────────────────────────
const getSettings = async () => {
  let s = await ExamSettings.findOne({ key: 'global' });
  if (!s) s = await ExamSettings.create({ key: 'global' });
  return s;
};

// semester "4th" -> 2 ;  "1st"/"2nd" -> 1 ; "3rd"/"4th" -> 2 ; "5th"/"6th" -> 3
const semToYearNum = (sem) => {
  const n = parseInt(String(sem).replace(/\D/g, ''), 10) || 0;
  return Math.max(1, Math.ceil(n / 2));
};
const yearNumToLabel = (y) => ({ 1: '1st Year', 2: '2nd Year', 3: '3rd Year' }[y] || '');

// student's stored admissionYear ('1st Year' / 'Direct Second Year' / ...) -> 1/2/3
const admissionYearToNum = (ay) => {
  const s = String(ay || '').toLowerCase();
  if (s.includes('3') || s.includes('third')) return 3;
  if (s.includes('2') || s.includes('second')) return 2;
  if (s.includes('1') || s.includes('first')) return 1;
  return 0;
};

// normalize course: 'B.A.' / 'BA' / 'Bachelor of Arts' -> 'ba'
const normCourse = (c) => {
  const s = String(c || '').toLowerCase();
  if (s.includes('b.sc') || s.includes('bsc') || s.includes('science')) return 'bsc';
  if (s.includes('b.a')  || s.includes('ba')  || s.includes('arts'))    return 'ba';
  return s.replace(/[^a-z0-9]/g, '');
};

// ─────────────────────────────────────────────────────────────────────────────
// (legacy) GET/PUT exam-settings — kept for backward compatibility
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-settings', protect, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/exam-settings', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const settings = await getSettings();
    const allowed = [
      'regularEnabled','backlogEnabled',
      'regularCourse','regularSemester','regularExamEvent',
      'backlogCourse','backlogSemester','backlogExamEvent',
    ];
    allowed.forEach(k => { if (req.body[k] !== undefined) settings[k] = req.body[k]; });
    settings.lastUpdatedBy = req.user?.name || 'Staff';
    settings.lastUpdatedAt = new Date();
    await settings.save();
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/results/exam-form/publish  (exam section + admin)
// body: { formType, course, semester, examEvent }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/exam-form/publish', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { formType, course, semester, examEvent } = req.body;
    if (!formType || !course || !semester || !examEvent)
      return res.status(400).json({ success: false, message: 'formType, course, semester and examEvent are required.' });
    if (!['regular', 'backlog'].includes(formType))
      return res.status(400).json({ success: false, message: 'Invalid formType.' });

    const yearNum = semToYearNum(semester);
    const data = {
      formType, course, semester, examEvent,
      yearNum,
      admissionYear: yearNumToLabel(yearNum),
      publishedBy: req.user?.name || 'Exam Section',
      active: true,
    };

    // upsert (re-publishing the same combo just re-activates it)
    const published = await PublishedExamForm.findOneAndUpdate(
      { formType, course, semester, examEvent },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: 'Exam form published for students!', published });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/published  (exam section + admin)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/published', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    // includeInactive=true -> unpublished (active:false) forms bhi aate hai
    // (Exam Form Submissions tab inhe use karta hai taaki record gayab na ho).
    const filter = req.query.includeInactive === 'true' ? {} : { active: true };
    const published = await PublishedExamForm.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, published });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/results/exam-form/published/:id  (unpublish)
// SOFT delete: form ko active:false karta hai (record delete NAHI hota).
// Students ko form dikhna band ho jata hai, par Exam Form Submissions tab me
// uska record + paid students ka data wesa hi rehta hai. Permanent delete ke
// liye alag se "Edit/Delete" (group delete) use hota hai.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/exam-form/published/:id', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    await PublishedExamForm.findByIdAndUpdate(req.params.id, { $set: { active: false } });
    res.json({ success: true, message: 'Exam form unpublished.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/available  (student)
// returns published forms that match the student's course + year,
// each tagged with whether the student has already submitted it.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/available', protect, authorizeRoles('student'), async (req, res) => {
  try {
   const admission = await Admission.findOne({
  email: req.user.email,
  $or: [{ status: 'approved' }, { studentSectionStatus: 'verified' }],
});
    if (!admission)
      return res.json({ success: true, forms: [] });

 const myCourseN = normCourse(admission.courseType);
    const myYearNum = admissionYearToNum(admission.admissionYear);

    const published = await PublishedExamForm.find({ active: true }).sort({ createdAt: -1 });

    // match course (format-tolerant) + year
    const matched = published.filter(p =>
      normCourse(p.course) === myCourseN &&
      (!myYearNum || !p.yearNum || p.yearNum === myYearNum)
    );
    const myReqs = await ExamFormRequest.find({ studentEmail: req.user.email });

    const forms = matched.map(p => {
      const submitted = myReqs.find(r =>
        r.formType === p.formType && r.semester === p.semester && r.examEvent === p.examEvent
      );
      return {
        _id:        p._id,
        formType:   p.formType,
        course:     p.course,
        semester:   p.semester,
        examEvent:  p.examEvent,
        admissionYear: p.admissionYear,
        submitted:  !!submitted,
        request:    submitted || null,
      };
    });

    res.json({ success: true, forms });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/results/exam-form/submit  (student)
// body: { publishedFormId }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/exam-form/submit', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { publishedFormId } = req.body;
    if (!publishedFormId)
      return res.status(400).json({ success: false, message: 'publishedFormId is required.' });

    const published = await PublishedExamForm.findById(publishedFormId);
    if (!published || !published.active)
      return res.status(404).json({ success: false, message: 'This exam form is no longer available.' });

    const admission = await Admission.findOne({ email: req.user.email, status: 'approved' });
    if (!admission)
      return res.status(404).json({ success: false, message: 'No approved admission found.' });

    // safety: form must match the student's course
    if (published.course && admission.courseType && published.course !== admission.courseType)
      return res.status(403).json({ success: false, message: 'This form is not meant for your course.' });

    const existing = await ExamFormRequest.findOne({
      studentEmail: req.user.email,
      formType:     published.formType,
      semester:     published.semester,
      examEvent:    published.examEvent,
    });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already filled this exam form.' });

    const formReq = await ExamFormRequest.create({
      studentEmail:  req.user.email,
      studentName:   admission.applicantName,
      studentId:     admission.studentId   || '',
      prnNumber:     admission.prnNumber   || '',
      course:        admission.courseType  || published.course,
      admissionYear: admission.admissionYear || published.admissionYear,
      semester:      published.semester,
      examEvent:     published.examEvent,
      mobileNo:      admission.phone || '',
      formType:      published.formType,
    });

    res.status(201).json({ success: true, message: 'Exam form submitted successfully!', request: formReq });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/my  (student – own requests)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/my', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const requests = await ExamFormRequest.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/all  (accounts + exam + admin)
// supports filters: formType, course, feeStatus, search (prn / studentId / name)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/all', protect, authorizeRoles('staff_accounts', 'staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { formType, course, feeStatus, search } = req.query;
    const filter = {};
    if (formType)  filter.formType  = formType;
    if (course)    filter.course    = new RegExp(`^${course}$`, 'i');
    if (feeStatus) filter.feeStatus = feeStatus;
    if (search)    filter.$or = [
      { studentName: new RegExp(search, 'i') },
      { studentId:   new RegExp(search, 'i') },
      { prnNumber:   new RegExp(search, 'i') },
      { studentEmail:new RegExp(search, 'i') },
    ];
    const requests = await ExamFormRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/results/exam-form/collect-fee/:id  (accounts + admin)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/exam-form/collect-fee/:id', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { amount, paymentMode, transactionId } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });

    const formReq = await ExamFormRequest.findById(req.params.id);
    if (!formReq)
      return res.status(404).json({ success: false, message: 'Request not found.' });
    if (formReq.feeStatus === 'collected')
      return res.status(400).json({ success: false, message: 'Fee already collected.' });

    const receiptNo   = 'EXF' + Date.now().toString().slice(-7);
    const collectedBy = req.user?.name || 'Accounts';

    formReq.feeStatus      = 'collected';
    formReq.feeAmount      = Number(amount);
    formReq.feeReceiptNo   = receiptNo;
    formReq.feeCollectedBy = collectedBy;
    formReq.feeCollectedAt = new Date();
    formReq.paymentMode    = paymentMode || 'cash';
    await formReq.save();

    // record in student feeLedger (year + semester + amount stored each time)
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
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/exam-form/by-student/:email  (staff – detail view)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exam-form/by-student/:email', protect,
  authorizeRoles('staff_exam', 'staff_accounts', 'staff_student', 'staff_principal', 'admin'),
  async (req, res) => {
    try {
      const requests = await ExamFormRequest.find({
        studentEmail: req.params.email.toLowerCase()
      }).sort({ createdAt: -1 });
      res.json({ success: true, requests });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/results/exam-form/group  (exam + admin + principal)
// body: { formType, course, semester, examEvent }
// Ek poore exam form ka record delete karta hai — us form ke saare student
// submissions + (agar abhi published hai to) published entry bhi.
// NOTE: Unpublish is route ko call NAHI karta — unpublish par submissions safe
// rehte hai. Records sirf yahan se explicitly delete hote hai.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/exam-form/group', protect, authorizeRoles('staff_exam', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { formType, course, semester, examEvent } = req.body || {};
    if (!formType || !course || !semester || !examEvent)
      return res.status(400).json({ success: false, message: 'formType, course, semester and examEvent are required.' });

    const want = normCourse(course);

    // matching student submissions delete karo (course ko format-tolerant match karke)
    const reqs   = await ExamFormRequest.find({ formType, semester, examEvent });
    const reqIds = reqs.filter(r => normCourse(r.course) === want).map(r => r._id);
    const delReqs = await ExamFormRequest.deleteMany({ _id: { $in: reqIds } });

    // agar abhi bhi published hai to wo entry bhi delete karo
    const pubs   = await PublishedExamForm.find({ formType, semester, examEvent });
    const pubIds = pubs.filter(p => normCourse(p.course) === want).map(p => p._id);
    await PublishedExamForm.deleteMany({ _id: { $in: pubIds } });

    res.json({ success: true, message: 'Exam form record deleted.', deletedCount: delReqs.deletedCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
