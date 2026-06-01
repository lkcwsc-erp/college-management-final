const express = require('express');
const router  = express.Router();
const Attendance = require('../models/Attendance');
const Admission  = require('../models/Admission');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const EXAM_STAFF = ['staff_exam', 'staff_student', 'staff_principal', 'admin'];

// ── Get students list for attendance (all approved admissions) ────────────────
router.get('/students', protect, authorizeRoles(...EXAM_STAFF), async (req, res) => {
  try {
    const admissions = await Admission.find({ status: 'approved' })
      .select('applicantName email studentId courseType admissionYear')
      .sort({ applicantName: 1 });
    res.json({ success: true, students: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Get attendance for a specific date + subject ──────────────────────────────
router.get('/by-date', protect, authorizeRoles(...EXAM_STAFF), async (req, res) => {
  try {
    const { date, subject } = req.query;
    if (!date || !subject)
      return res.status(400).json({ success: false, message: 'date and subject required' });
    const records = await Attendance.find({ date, subject });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Bulk mark attendance for a date + subject ────────────────────────────────
// Body: { date, subject, session, records: [{ studentEmail, studentName, studentId, courseType, admissionYear, status }] }
router.post('/bulk', protect, authorizeRoles(...EXAM_STAFF), async (req, res) => {
  try {
    const { date, subject, session, records } = req.body;
    if (!date || !subject || !records?.length)
      return res.status(400).json({ success: false, message: 'date, subject and records required' });

    const markedBy = req.user.name || req.user.email;
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentEmail: r.studentEmail, date, subject },
        update: {
          $set: {
            studentEmail: r.studentEmail,
            studentName:  r.studentName  || '',
            studentId:    r.studentId    || '',
            courseType:   r.courseType   || '',
            admissionYear: r.admissionYear || '',
            date, subject,
            session: session || 'full_day',
            status:  r.status || 'absent',
            markedBy,
            notes:   r.notes || '',
          }
        },
        upsert: true,
      }
    }));

    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: `Attendance saved for ${records.length} students.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Get attendance report (by subject, date range) ───────────────────────────
router.get('/report', protect, authorizeRoles(...EXAM_STAFF), async (req, res) => {
  try {
    const { subject, fromDate, toDate, studentEmail } = req.query;
    const filter = {};
    if (subject)      filter.subject = subject;
    if (studentEmail) filter.studentEmail = studentEmail.toLowerCase();
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = fromDate;
      if (toDate)   filter.date.$lte = toDate;
    }
    const records = await Attendance.find(filter).sort({ date: -1, studentName: 1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Get all subjects (distinct) ───────────────────────────────────────────────
router.get('/subjects', protect, authorizeRoles(...EXAM_STAFF), async (req, res) => {
  try {
    const subjects = await Attendance.distinct('subject');
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Student's own attendance ───────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentEmail: req.user.email }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
