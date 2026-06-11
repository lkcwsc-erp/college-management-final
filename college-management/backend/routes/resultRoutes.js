const express = require('express');
const router = express.Router();

const {
  uploadResult,
  getMyResults,
  getResultByStudent,
  getAllResults,
  updateResult,
  deleteResult
} = require('../controllers/resultController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Upload Result
router.post(
  '/',
  protect,
  authorizeRoles('staff_exam', 'staff', 'admin', 'staff_principal'),
  uploadResult
);

// Get All Results
router.get(
  '/',
  protect,
  authorizeRoles('staff_exam', 'admin', 'staff_principal'),
  getAllResults
);

// Student Results
router.get(
  '/my',
  protect,
  authorizeRoles('student'),
  getMyResults
);

// Upload Result By Email
router.post(
  '/upload-by-email',
  protect,
  authorizeRoles('staff_exam', 'admin', 'staff_principal'),
  async (req, res) => {
    try {
      const Result = require('../models/Result');
      const Admission = require('../models/Admission');

      const { studentEmail, semester, year, subjects, courseType } = req.body;

      if (!studentEmail || !semester || !year || !subjects?.length) {
        return res.status(400).json({
          success: false,
          message: 'studentEmail, semester, year and subjects are required'
        });
      }

      const admission = await Admission.findOne({
        email: studentEmail.toLowerCase(),
        status: 'approved'
      });

      if (!admission) {
        return res.status(404).json({
          success: false,
          message: 'No approved admission found for this email'
        });
      }

      const totalMarks = subjects.reduce(
        (sum, s) => sum + (s.maxMarks || 0),
        0
      );

      const obtainedMarks = subjects.reduce(
        (sum, s) => sum + (s.obtainedMarks || 0),
        0
      );

      const percentage =
        totalMarks > 0
          ? Math.round((obtainedMarks / totalMarks) * 100 * 10) / 10
          : 0;

      let result = 'pass';

      const atkt = subjects.filter(
        s => s.obtainedMarks < (s.maxMarks * 0.35)
      );

      if (atkt.length === subjects.length) result = 'fail';
      else if (atkt.length > 0) result = 'atkt';
      else if (percentage >= 75) result = 'distinction';

      const gradedSubjects = subjects.map(subject => {
        const pct =
          subject.maxMarks > 0
            ? (subject.obtainedMarks / subject.maxMarks) * 100
            : 0;

        let grade = 'F';

        if (pct >= 75) grade = 'O';
        else if (pct >= 65) grade = 'A+';
        else if (pct >= 55) grade = 'A';
        else if (pct >= 45) grade = 'B+';
        else if (pct >= 35) grade = 'B';

        return {
          ...subject,
          grade
        };
      });

      const existing = await Result.findOne({
        admissionId: admission._id,
        semester,
        year
      });

      let savedResult;

      if (existing) {
        savedResult = await Result.findByIdAndUpdate(
          existing._id,
          {
            subjects: gradedSubjects,
            totalMarks,
            obtainedMarks,
            percentage,
            result,
            uploadedBy: req.user._id,
            courseType
          },
          { new: true }
        );
      } else {
        savedResult = await Result.create({
          admissionId: admission._id,
          student: admission._id,        // safety: agar purane schema me student required ho
          studentEmail: studentEmail.toLowerCase(),
          studentName: admission.applicantName,
          courseType: courseType || admission.courseType,
          semester,
          year,
          subjects: gradedSubjects,
          totalMarks,
          obtainedMarks,
          percentage,
          result,
          uploadedBy: req.user._id
        });
      }

      res.status(201).json({
        success: true,
        message: existing ? 'Result updated' : 'Result uploaded',
        result: savedResult
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Exam Dashboard
router.get(
  '/exam-section/all',
  protect,
  authorizeRoles('staff_exam', 'admin', 'staff_principal'),
  async (req, res) => {
    try {
      const Result = require('../models/Result');

      const results = await Result.find().sort({
        createdAt: -1
      });

      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Results By Email
router.get(
  '/by-email/:email',
  protect,
  authorizeRoles('staff_exam', 'staff_student', 'admin', 'staff_principal'),
  async (req, res) => {
    try {
      const Result = require('../models/Result');

      const results = await Result.find({
        studentEmail: req.params.email.toLowerCase()
      }).sort({
        year: -1,
        semester: -1
      });

      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Principal Results
router.get(
  '/all-results',
  protect,
  authorizeRoles('staff_principal', 'staff_exam', 'admin'),
  async (req, res) => {
    try {
      const Result = require('../models/Result');

      const results = await Result.find()
        .sort({ createdAt: -1 })
        .limit(500);

      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Student Result Routes
router.get(
  '/:studentId',
  protect,
  authorizeRoles('staff_exam', 'staff', 'admin', 'staff_principal'),
  getResultByStudent
);

router.put(
  '/:id',
  protect,
  authorizeRoles('staff_exam', 'staff', 'admin', 'staff_principal'),
  updateResult
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('staff_exam', 'admin', 'staff_principal'),
  deleteResult
);

// ── Student: Submit own result (for last degree/TC) ─────────────────────────
router.post('/student-submit', protect, async (req, res) => {
  try {
    const { semester, year, examSession, subjects, percentage, totalMarks, obtainedMarks, result } = req.body;
    const Result = require('../models/Result');
    const newResult = new Result({
      student: req.user._id,
      studentEmail: req.user.email,
      studentName: req.user.name,
      semester: Number(semester),
      year: Number(year),
      examSession,
      subjects: subjects || [],
      percentage: Number(percentage),
      totalMarks: Number(totalMarks),
      obtainedMarks: Number(obtainedMarks),
      result: result || 'pass',
      submittedByStudent: true,
      verifiedByExam: false,
    });
    await newResult.save();
    res.json({ success: true, message: 'Result submitted successfully' });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
