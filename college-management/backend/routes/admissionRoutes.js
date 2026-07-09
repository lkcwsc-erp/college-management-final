const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Admission = require('../models/Admission');
const WalkinReceipt = require('../models/WalkinReceipt');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// ── Email transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"LKCWSC Admissions" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('📧 Email sent to:', to);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
};

// ── Upload fields ────────────────────────────────────────────────────────────
const uploadFields = upload.fields([
  { name: 'studentPhoto',           maxCount: 1 },
  { name: 'signaturePhoto',         maxCount: 1 },
  { name: 'aadharPhoto',            maxCount: 1 },
  { name: 'sscMarksheet',           maxCount: 1 },
  { name: 'hscMarksheet',           maxCount: 1 },
  { name: 'prevYearMarksheet',      maxCount: 1 },
  { name: 'gapCertificate',         maxCount: 1 },
  { name: 'casteCertificate',       maxCount: 1 },
  { name: 'casteValidityCertificate', maxCount: 1 },
  { name: 'marriageCertificate',    maxCount: 1 },
  { name: 'bankPassbook',           maxCount: 1 },
  { name: 'domicileCertificate',    maxCount: 1 },
  { name: 'incomeCertificate',      maxCount: 1 },
  { name: 'transferCertificate',    maxCount: 1 },
  { name: 'aparIdDocument',         maxCount: 1 },
  { name: 'twelfthTC',              maxCount: 1 },
  { name: 'gapyeardocument',        maxCount: 1 },
]);

// ========== STUDENT: Submit Admission ==========
router.post('/', uploadFields, async (req, res) => {
  try {
    console.log('📋 Admission form received');
    const data = { ...req.body };

    data.hasGap            = data.hasGap            === 'true';
    data.hasCasteValidity  = data.hasCasteValidity  === 'true';
    data.declaration       = data.declaration       === 'true';
    data.isMarried         = data.isMarried         === 'true';
    data.sameAsAddress     = data.sameAsAddress     === 'true';
    data.feesPaid          = data.feesPaid          === 'true';

    ['sscObtainedMarks','sscTotalMarks','sscPercentage',
     'hscObtainedMarks','hscTotalMarks','hscPercentage',
     'prevYearObtainedMarks','prevYearTotalMarks','prevYearPercentage',
     'fees'].forEach(f => { if (data[f]) data[f] = Number(data[f]); });

    if (req.files) {
      Object.keys(req.files).forEach(field => {
        if (req.files[field]?.[0]) data[field] = req.files[field][0].path;
      });
    }

    if (!data.course        || data.course        === 'undefined') delete data.course;
    if (!data.dateOfBirth   || data.dateOfBirth   === '')          delete data.dateOfBirth;
    if (!data.casteValidityDate || data.casteValidityDate === '')  delete data.casteValidityDate;

    data.studentSectionStatus = 'pending';
    data.principalStatus      = 'pending';
    data.status               = 'pending';

    // 🔄 Re-apply handling: check if an application already exists for this email
    let admission;
    if (data.email) {
      const existing = await Admission.findOne({ email: data.email }).sort({ createdAt: -1 });

      if (existing) {
        // Already approved (or Student ID generated) → block duplicate submission
        if (existing.status === 'approved' || existing.studentId) {
          return res.status(400).json({
            success: false,
            message: 'You already have an approved admission. Re-apply is not allowed.'
          });
        }
        // Still under review → block duplicate submission
        if (existing.status === 'pending') {
          return res.status(400).json({
            success: false,
            message: 'Your application is already submitted and under review. Please wait for the result.'
          });
        }
        // Previous application was rejected → allow re-apply by updating the SAME record
        if (existing.status === 'rejected') {
          // clear old rejection info so the dashboard shows a fresh "pending" status
          data.rejectionReason   = '';
          data.staffNotes        = '';
          data.staffApprovedBy   = '';
          data.staffApprovedDate = null;
          data.studentId         = '';

          admission = await Admission.findByIdAndUpdate(
            existing._id,
            { ...data },
            { new: true, runValidators: true }
          );
          console.log('🔄 Admission re-applied (updated):', admission._id);

          return res.status(200).json({
            success: true,
            message: 'Application re-submitted! Awaiting Student Section review.',
            admission
          });
        }
      }
    }

    admission = await Admission.create(data);
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
router.get('/', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
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
      .sort({ createdAt: -1 })
      .populate('course', 'name type code');
    if (!admission)
      return res.status(404).json({ success: false, message: 'No application found' });
    res.json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== STUDENT SECTION: View Pending ==========
router.get('/student-section/pending', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
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
router.get('/student-section/all', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('course', 'name type code')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ========== STUDENT SECTION: Approved Students ==========
router.get(
  '/student-section/approved',
  protect,
  authorizeRoles('staff_student', 'admin', 'staff_principal'),
  async (req, res) => {
    try {
      const admissions = await Admission.find({ status: 'approved' })
        .populate('course', 'name type code')
        .sort({ createdAt: -1 });

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
  }
);

// ========== STUDENT SECTION: Approve & Forward to Principal ==========
router.put('/staff-approve/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { notes } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission)
      return res.status(404).json({ success: false, message: 'Application not found' });
    if (admission.studentSectionStatus !== 'pending')
      return res.status(400).json({ success: false, message: 'Already processed' });

    admission.studentSectionStatus = 'verified';
    admission.staffNotes           = notes || '';
    admission.staffApprovedBy      = req.user.name || req.user.email;
    admission.staffApprovedDate    = new Date();
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
router.put('/staff-reject/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason)
      return res.status(400).json({ success: false, message: 'Rejection reason required' });

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        studentSectionStatus: 'rejected',
        status:               'rejected',
        staffNotes:           reason,
        staffApprovedBy:      req.user.name || req.user.email,
        staffApprovedDate:    new Date(),
        rejectionReason:      reason,
      },
      { new: true }
    );

    // Email student
    if (admission?.email) {
      await sendEmail(
        admission.email,
        '❌ Admission Application - Action Required | LKCWSC',
        `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <h2 style="color:#C62828;">❌ Admission Application Update</h2>
          <p>Dear <strong>${admission.applicantName}</strong>,</p>
          <p>Your admission application has been reviewed by our Student Section staff.</p>
          <div style="background:#ffebee;padding:16px;border-radius:8px;border-left:4px solid #C62828;margin:16px 0;">
            <strong>Status:</strong> Not Approved<br/>
            <strong>Reason:</strong> ${reason}
          </div>
          <p>Please contact the college for further guidance or reapply after addressing the above issue.</p>
          <p style="color:#888;font-size:13px;margin-top:24px;">Late Kalpana Chawla Women's Senior College<br/>This is an automated email.</p>
        </div>
        `
      );
    }

    res.json({ success: true, message: 'Application rejected.', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: View Pending ==========
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

// ========== PRINCIPAL: View All ==========
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

// ========== PRINCIPAL: Final Approve + Generate Student ID + Email ==========
router.put('/principal-approve/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const admission = await Admission.findById(req.params.id);

    if (!admission)
      return res.status(404).json({ success: false, message: 'Application not found' });
    if (admission.studentSectionStatus !== 'verified')
      return res.status(400).json({ success: false, message: 'Not approved by Student Section' });
    if (admission.status === 'approved')
      return res.status(400).json({ success: false, message: 'Already approved' });

    // Generate Student ID — serial number
    const year       = new Date().getFullYear();
    const courseName = admission.courseType
      ? admission.courseType.toUpperCase()
      : 'GEN';

    // Count how many students already have a studentId → next serial
    const approvedCount = await Admission.countDocuments({
      studentId: { $exists: true, $ne: null, $ne: '' }
    });
    const serialNum  = String(approvedCount + 1).padStart(3, '0');
    const studentId  = `${courseName}${year}${serialNum}`;

    admission.status                = 'approved';
    admission.principalStatus       = 'approved';
    admission.principalApprovedBy   = req.user.name || req.user.email;
    admission.principalApprovedDate = new Date();
    admission.principalNotes        = notes || '';
    admission.studentId             = studentId;
    await admission.save();

    // ── Send email to student ──────────────────────────────────────────────
    if (admission.email) {
      await sendEmail(
        admission.email,
        '🎉 Admission Approved — Your Student ID | LKCWSC',
        `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#2E7D32;margin:0;">🎉 Congratulations!</h1>
            <p style="color:#555;font-size:16px;">Your admission has been approved!</p>
          </div>

          <p>Dear <strong>${admission.applicantName}</strong>,</p>
          <p>We are delighted to inform you that your admission application to <strong>Late Kalpana Chawla Women's Senior College</strong> has been approved by the Principal.</p>

          <div style="background:#e8f5e9;padding:20px;border-radius:10px;border-left:5px solid #2E7D32;margin:20px 0;text-align:center;">
            <p style="margin:0;font-size:14px;color:#555;">Your Unique Student ID</p>
            <h2 style="margin:8px 0;color:#1565C0;font-size:32px;letter-spacing:4px;">${studentId}</h2>
            <p style="margin:0;font-size:12px;color:#888;">Please save this ID — it will be needed for all college activities</p>
          </div>

          <div style="background:#f8faff;padding:16px;border-radius:8px;margin:16px 0;">
            <h4 style="color:#1565C0;margin:0 0 10px 0;">📋 Application Details</h4>
            <p style="margin:4px 0;font-size:14px;"><strong>Name:</strong> ${admission.applicantName}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Course:</strong> ${admission.preferredSubject || 'Not specified'}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Approved On:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Approved By:</strong> Principal, LKCWSC</p>
          </div>

          <div style="background:#fff3e0;padding:14px;border-radius:8px;border-left:4px solid #E65100;margin:16px 0;">
            <h4 style="color:#E65100;margin:0 0 8px 0;">📌 Next Steps</h4>
            <ul style="margin:0;padding-left:18px;color:#555;font-size:14px;line-height:1.8;">
              <li>Visit the college office with original documents</li>
              <li>Complete fee payment process</li>
              <li>Collect your student ID card</li>
              <li>Login to student portal using your registered email</li>
            </ul>
          </div>

          ${notes ? `<div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:16px 0;font-size:13px;color:#555;"><strong>Principal's Note:</strong> ${notes}</div>` : ''}

          <p style="color:#555;">Welcome to the LKCWSC family! We wish you a bright and successful academic journey.</p>

          <div style="border-top:1px solid #eee;padding-top:16px;margin-top:24px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0;">Late Kalpana Chawla Women's Senior College</p>
            <p style="color:#888;font-size:12px;margin:4px 0;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
        `
      );
    }

    res.json({
      success: true,
      message: `✅ Admission approved! Student ID: ${studentId}. Email sent to student.`,
      studentId,
      admission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRINCIPAL: Reject + Email ==========
router.put('/principal-reject/:id', protect, authorizeRoles('staff_principal', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason)
      return res.status(400).json({ success: false, message: 'Rejection reason required' });

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        status:                 'rejected',
        principalApprovedBy:    req.user.name || req.user.email,
        principalApprovedDate:  new Date(),
        principalNotes:         reason,
        rejectionReason:        reason,
      },
      { new: true }
    );

    // Email student
    if (admission?.email) {
      await sendEmail(
        admission.email,
        '❌ Admission Application Update | LKCWSC',
        `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <h2 style="color:#C62828;">❌ Admission Application Update</h2>
          <p>Dear <strong>${admission.applicantName}</strong>,</p>
          <p>After careful review, the Principal has made a decision regarding your admission application.</p>
          <div style="background:#ffebee;padding:16px;border-radius:8px;border-left:4px solid #C62828;margin:16px 0;">
            <strong>Status:</strong> Not Approved by Principal<br/>
            <strong>Reason:</strong> ${reason}
          </div>
          <p>Please visit the college office for further information or to discuss your options.</p>
          <p style="color:#888;font-size:13px;margin-top:24px;">Late Kalpana Chawla Women's Senior College<br/>This is an automated email.</p>
        </div>
        `
      );
    }

    res.json({ success: true, message: 'Application rejected by Principal.', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== MARK ADMISSION FEES PAID ==========
router.put('/mark-fees-paid/:id', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { fees, paymentMode, transactionId, receiptNo, collectedBy, feeType, feeTypeLabel, semester, year, totalFees, scholarshipAmount, feeHeads } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    // Add entry to ledger
    admission.feeLedger.push({
      receiptNo: receiptNo || '',
      feeType: feeType || 'admission',
      feeTypeLabel: feeTypeLabel || '',
      amount: fees || 0,
      paymentMode: paymentMode || 'cash',
      transactionId: transactionId || '',
      collectedBy: collectedBy || '',
      paidAt: new Date(),
      semester: semester || '',
      year: year || '',
      feeHeads: Array.isArray(feeHeads) ? feeHeads : [],
    });

    // Update totals
    admission.fees = (admission.fees || 0) + (fees || 0);
    if (totalFees !== undefined) admission.totalFees = totalFees;
    if (scholarshipAmount !== undefined) admission.scholarshipAmount = scholarshipAmount;

    // Mark as paid if fully paid
    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    if (netPayable > 0 && admission.fees >= netPayable) admission.feesPaid = true;
    else if (netPayable === 0) admission.feesPaid = true;

    // Update lastFeePayment for backward compat
    admission.lastFeePayment = {
      paidAt: new Date(),
      paymentMode: paymentMode || 'cash',
      transactionId: transactionId || '',
      receiptNo: receiptNo || '',
      collectedBy: collectedBy || '',
    };

    await admission.save();
    res.json({ success: true, message: 'Fee recorded successfully', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== WALK-IN / OLD STUDENT — Save Fee Receipt ==========
// Old/walk-in students may have no Admission record, so their receipts are stored
// in a dedicated WalkinReceipt collection (instead of Admission.feeLedger).
router.post('/receipts/walkin', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const b = req.body || {};
    const receipt = await WalkinReceipt.create({
      receiptNo:     b.receiptNo || 'OS' + Date.now().toString().slice(-6),
      studentName:   b.studentName || '',
      phone:         b.phone || '',
      prnNo:         b.prnNo || '',
      rollNo:        b.rollNo || '',
      course:        b.course || '',
      admissionYear: b.admissionYear || '',
      feeType:       b.feeType || '',
      feeTypeLabel:  b.feeTypeLabel || '',
      lineItems:     Array.isArray(b.lineItems) ? b.lineItems : [],
      amount:        Number(b.amount) || 0,
      paymentMode:   b.paymentMode || 'cash',
      transactionId: b.transactionId || '',
      notes:         b.notes || '',
      collectedBy:   b.collectedBy || (req.user?.name || 'Accounts Staff'),
      paidAt:        b.paidAt ? new Date(b.paidAt) : new Date(),
    });
    res.status(201).json({ success: true, message: 'Walk-in receipt saved', receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== WALK-IN / OLD STUDENT — List Receipts ==========
router.get('/receipts/walkin/all', protect, authorizeRoles('staff_accounts','staff_student','staff_exam','staff_scholarship','staff_principal','admin'), async (req, res) => {
  try {
    const receipts = await WalkinReceipt.find().sort({ paidAt: -1 });
    res.json({ success: true, receipts, total: receipts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ALL STAFF — View Payment Receipts ==========
router.get('/receipts/all', protect, authorizeRoles('staff_accounts','staff_student','staff_exam','staff_scholarship','staff_principal','admin'), async (req, res) => {
  try {
    const admissions = await Admission.find({
      'feeLedger.0': { $exists: true }
    }).select('applicantName email studentId courseType admissionYear feeLedger fees feesPaid')
      .sort({ updatedAt: -1 });

    // Flatten ledger into receipt list
    const receipts = [];
    admissions.forEach(adm => {
      (adm.feeLedger || []).forEach(p => {
        receipts.push({
          receiptNo:     p.receiptNo,
          studentName:   adm.applicantName,
          studentEmail:  adm.email,
          studentId:     adm.studentId,
          courseType:    adm.courseType,
          admissionYear: p.year || adm.admissionYear,
          feeType:       p.feeType,
          feeTypeLabel:  p.feeTypeLabel,
          amount:        p.amount,
          paymentMode:   p.paymentMode,
          transactionId: p.transactionId,
          collectedBy:   p.collectedBy,
          paidAt:        p.paidAt,
          semester:      p.semester,
          isWalkin:      false,
        });
      });
    });

    // Merge in Walk-in / Old Student receipts so they also show in Payment History
    const walkins = await WalkinReceipt.find().sort({ paidAt: -1 });
    walkins.forEach(w => {
      receipts.push({
        receiptNo:     w.receiptNo,
        studentName:   w.studentName,
        studentEmail:  '',
        studentId:     w.prnNo || w.rollNo || '',
        prnNo:         w.prnNo || '',
        rollNo:        w.rollNo || '',
        courseType:    w.course,
        admissionYear: w.admissionYear,
        feeType:       w.feeType,
        feeTypeLabel:  w.feeTypeLabel,
        amount:        w.amount,
        paymentMode:   w.paymentMode,
        transactionId: w.transactionId,
        collectedBy:   w.collectedBy,
        paidAt:        w.paidAt,
        semester:      '',
        isWalkin:      true,
      });
    });

    receipts.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    res.json({ success: true, receipts, total: receipts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/scholarship-section/all', protect, authorizeRoles('staff_scholarship', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const admissions = await Admission.find({ status: 'approved' })
      .populate('course', 'name type')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE MAHADBT CREDENTIALS ==================================
router.put('/update-mahadbt/:id', protect, authorizeRoles('staff_scholarship', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { mahaDBTUsername, mahaDBTPassword, mahaDBTAppNo, scholarshipStatus, scholarshipNote, scholarshipAmount } = req.body;
    const update = {};
    if (mahaDBTUsername !== undefined)  update.mahaDBTUsername  = mahaDBTUsername;
    if (mahaDBTPassword !== undefined)  update.mahaDBTPassword  = mahaDBTPassword;
    if (mahaDBTAppNo    !== undefined)  update.mahaDBTAppNo     = mahaDBTAppNo;
    if (scholarshipStatus)              update.scholarshipStatus = scholarshipStatus;
    if (scholarshipNote !== undefined)  update.scholarshipNote  = scholarshipNote;
    if (scholarshipAmount !== undefined) update.scholarshipAmount = Number(scholarshipAmount) || 0;
    const admission = await Admission.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!admission) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'MahaDBT data updated', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== READ-ONLY STUDENT VIEW (all staff except student_section & principal already have) =
router.get('/staff-view/all', protect, authorizeRoles('staff_exam', 'staff_scholarship', 'staff_accounts', 'staff_student', 'staff_principal', 'admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const admissions = await Admission.find({ status: { $in: ['approved', 'tc_issued'] } })
      .populate('course', 'name type')
      .sort({ applicantName: 1 });

    // For student section — attach plainPassword from User model if not in Admission
    const isStudentSection = req.user.role === 'staff_student' || req.user.role === 'admin';
    let result = admissions.map(a => a.toObject());

    if (isStudentSection) {
      const emails = result.filter(a => !a.plainPassword).map(a => a.email).filter(Boolean);
      if (emails.length > 0) {
        const users = await User.find({ email: { $in: emails } }).select('email plainPassword');
        const userMap = {};
        users.forEach(u => { userMap[u.email] = u.plainPassword || ''; });
        result = result.map(a => ({
          ...a,
          plainPassword: a.plainPassword || userMap[a.email] || '',
        }));
      }
    }

    res.json({ success: true, admissions: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put('/update-scholarship/:id', protect, authorizeRoles('staff_accounts', 'staff_scholarship', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { scholarshipAmount, scholarshipStatus, scholarshipNote } = req.body;
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        ...(scholarshipAmount !== undefined && { scholarshipAmount }),
        ...(scholarshipStatus  && { scholarshipStatus }),
        ...(scholarshipNote    && { scholarshipNote }),
      },
      { new: true }
    );
    if (!admission) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Scholarship updated', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET ALL APPROVED ADMISSIONS (for Accounts) ==========
router.get('/accounts-section/all', protect, authorizeRoles('staff_accounts', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const admissions = await Admission.find({ status: 'approved' })
      .populate('course', 'name type code fees')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE PRN / ABC ID ==========
router.put('/update-prn/:id', protect, authorizeRoles('staff_student', 'staff_principal', 'admin'), async (req, res) => {
  try {
    const { prnNumber, aparIdNumber } = req.body;
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { ...(prnNumber !== undefined && { prnNumber }), ...(aparIdNumber !== undefined && { aparIdNumber }) },
      { new: true }
    );
    if (!admission) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'PRN/ABC ID updated successfully', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CARRY FORWARD (SY / TY) ==========
router.put('/carry-forward/:id', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { newYear } = req.body; // '2nd Year' or '3rd Year'
    const validYears = ['2nd Year', '3rd Year'];
    if (!validYears.includes(newYear))
      return res.status(400).json({ success: false, message: 'Invalid year. Must be 2nd Year or 3rd Year.' });
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { admissionYear: newYear },
      { new: true }
    );
    if (!admission) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: `Student promoted to ${newYear}`, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE STUDENT DOCUMENTS (Student Section) ==========
router.put('/update-documents/:id', protect, authorizeRoles('staff_student', 'staff_principal', 'admin'), async (req, res) => {
  try {
    const allowed = [
      'aadharNumber','aadharName','aadharPhoto','aparIdNumber','aparIdDocument',
      'sscMarksheet','hscMarksheet','casteCertificate','casteValidityCertificate',
      'incomeCertificate','domicileCertificate','gapCertificate','gapyeardocument',
      'transferCertificate','prevYearMarksheet','bankPassbook','studentPhoto',
      'signaturePhoto','marriageCertificate',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const admission = await Admission.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!admission) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Documents updated', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET RESULTS BY EMAIL (for carry forward check) ==========
router.get('/results-by-email/:email', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const Result = require('../models/Result');
    const Student = require('../models/Student');
    const User = require('../models/User');
    const userDoc = await User.findOne({ email: req.params.email });
    if (!userDoc) return res.json({ success: true, results: [] });
    const student = await Student.findOne({ user: userDoc._id });
    if (!student) return res.json({ success: true, results: [] });
    const results = await Result.find({ student: student._id }).sort({ year: -1, semester: -1 });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
  
// ========== DELETE ==========
router.delete('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const User = require('../models/User');
    const admission = await Admission.findByIdAndDelete(req.params.id);
    // Also remove the student's login account so a deleted student can no longer log in
    if (admission?.email) {
      await User.deleteOne({ email: admission.email.toLowerCase(), role: 'student' });
    }
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE (Admin) — must be LAST to avoid catching named routes ==========
router.put('/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name type');
    if (!admission)
      return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ── Delete request from Student Section (goes to Admin) ───────────────────
router.post('/request-delete', protect, authorizeRoles('staff_student', 'admin', 'staff_principal'), async (req, res) => {
  try {
    const { admissionId, studentName, studentEmail, studentId, reason, requestedBy } = req.body;
    // Store as a pending delete request in the admission record
    await Admission.findByIdAndUpdate(admissionId, {
      deleteRequested: true,
      deleteReason: reason,
      deleteRequestedBy: requestedBy || req.user.name,
      deleteRequestedAt: new Date(),
    });
    res.json({ success: true, message: 'Delete request sent to Admin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin approves delete ──────────────────────────────────────────────────
router.delete('/admin-delete/:id', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const User = require('../models/User');
    const admission = await Admission.findByIdAndDelete(req.params.id);
    // Also remove the student's login account so a deleted student can no longer log in
    if (admission?.email) {
      await User.deleteOne({ email: admission.email.toLowerCase(), role: 'student' });
    }
    res.json({ success: true, message: 'Student record deleted by Admin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Get pending delete requests (Admin) ───────────────────────────────────
router.get('/pending-deletes', protect, authorizeRoles('admin', 'staff_principal'), async (req, res) => {
  try {
    const pending = await Admission.find({ deleteRequested: true }).select('applicantName email studentId deleteReason deleteRequestedBy deleteRequestedAt');
    res.json({ success: true, pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
