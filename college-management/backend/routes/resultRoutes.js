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

router.post('/', protect, authorizeRoles('staff_exam', 'staff', 'admin'), uploadResult);

router.get('/', protect, authorizeRoles('staff_exam', 'admin'), getAllResults);

router.get('/my', protect, authorizeRoles('student'), getMyResults);

// Upload result by student email
router.post('/upload-by-email', protect, authorizeRoles('staff_exam', 'admin'), async (req, res) => {
const Result = require('../models/Result');
const Admission = require('../models/Admission');

try {
const { studentEmail, semester, year, subjects, courseType } = req.body;

```
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

const totalMarks = subjects.reduce((s, sub) => s + (sub.maxMarks || 0), 0);
const obtainedMarks = subjects.reduce((s, sub) => s + (sub.obtainedMarks || 0), 0);

const percentage =
  totalMarks > 0
    ? Math.round((obtainedMarks / totalMarks) * 100 * 10) / 10
    : 0;

const atkt = subjects.filter(
  s => s.obtainedMarks < (s.maxMarks * 0.35)
);

let result = 'pass';

if (atkt.length === subjects.length) result = 'fail';
else if (atkt.length > 0) result = 'atkt';
else if (percentage >= 75) result = 'distinction';

const gradedSubjects = subjects.map(s => {
  const pct =
    s.maxMarks > 0
      ? (s.obtainedMarks / s.maxMarks) * 100
      : 0;

  let grade = 'F';

  if (pct >= 75) grade = 'O';
  else if (pct >= 65) grade = 'A+';
  else if (pct >= 55) grade = 'A';
  else if (pct >= 45) grade = 'B+';
  else if (pct >= 35) grade = 'B';

  return { ...s, grade };
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
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message
});
}
});

// Exam Section Dashboard
router.get(
'/exam-section/all',
protect,
authorizeRoles('staff_exam', 'admin'),
async (req, res) => {
const Result = require('../models/Result');

```
try {
  const results = await Result.find().sort({ createdAt: -1 });

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
```

}
);

// Results By Email
router.get(
'/by-email/:email',
protect,
authorizeRoles('staff_exam', 'staff_student', 'admin'),
async (req, res) => {
const Result = require('../models/Result');

```
try {
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
```

}
);

// Principal Result View
router.get(
'/all-results',
protect,
authorizeRoles('staff_principal', 'staff_exam', 'admin'),
async (req, res) => {
try {
const Result = require('../models/Result');

```
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
```

}
);

// Student Result Routes (Keep Last)
router.get(
'/:studentId',
protect,
authorizeRoles('staff_exam', 'staff', 'admin'),
getResultByStudent
);

router.put(
'/:id',
protect,
authorizeRoles('staff_exam', 'staff', 'admin'),
updateResult
);

router.delete(
'/:id',
protect,
authorizeRoles('staff_exam', 'admin'),
deleteResult
);

module.exports = router;
