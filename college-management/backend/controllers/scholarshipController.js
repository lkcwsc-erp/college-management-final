/* ============================================================
   scholarshipController.js
   Complete Scholarship Management — LKCWSC College ERP
   ============================================================ */

const ScholarshipMaster = require('../models/ScholarshipMaster');
const Admission         = require('../models/Admission');
const XLSX              = require('xlsx');

// Reserved categories — get full MahaDBT benefit
const RESERVED_CATEGORIES = ['SC','ST','OBC','SBC','NT-B','NT-C','NT-D','VJ/DT(NT-A)','EWS','SEBC'];


/* ============================================================
   1. SCHOLARSHIP MASTER — CRUD
   ============================================================ */

// POST /api/scholarships/master
exports.createScholarshipMaster = async (req, res) => {
  try {
    const {
      categories,
      category,           // backward compat — old frontend may send single string
      courseType,
      admissionYear,
      academicYear,
      scholarshipAmount,  // frontend sends this name
      mahaDBTReceivable,  // or this
      description,
      createdBy,
    } = req.body;

    // Resolve categories array
    const resolvedCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : category
        ? [category]
        : [];

    if (resolvedCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one category is required',
      });
    }

    if (!courseType || !admissionYear || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Fields required: courseType, admissionYear, academicYear',
      });
    }

    // Support both field names from frontend
    const amount = mahaDBTReceivable ?? scholarshipAmount;
    if (amount == null) {
      return res.status(400).json({
        success: false,
        message: 'scholarshipAmount (mahaDBTReceivable) is required',
      });
    }

    const scholarship = await ScholarshipMaster.create({
      categories:       resolvedCategories,
      courseType,
      admissionYear,
      academicYear,
      mahaDBTReceivable: Number(amount),
      description:      description || '',
      createdBy:        createdBy || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship master created',
      // Return with scholarshipAmount alias so frontend works without changes
      scholarship: _withAlias(scholarship),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/scholarships/master
exports.getAllScholarshipMasters = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, isActive } = req.query;
    const filter = {};

    // category filter works on the categories array
    if (category) filter.categories = { $elemMatch: { $regex: new RegExp(`^${category}$`, 'i') } };
    if (courseType)    filter.courseType    = courseType;
    if (admissionYear) filter.admissionYear = admissionYear;
    if (academicYear)  filter.academicYear  = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const raw = await ScholarshipMaster.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: raw.length,
      scholarships: raw.map(_withAlias),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/scholarships/master/:id
exports.getScholarshipMasterById = async (req, res) => {
  try {
    const scholarship = await ScholarshipMaster.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, scholarship: _withAlias(scholarship) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// PUT /api/scholarships/master/:id
exports.updateScholarshipMaster = async (req, res) => {
  try {
    const {
      categories,
      category,
      courseType,
      admissionYear,
      academicYear,
      scholarshipAmount,
      mahaDBTReceivable,
      description,
      isActive,
      updatedBy,
    } = req.body;

    const scholarship = await ScholarshipMaster.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Not found' });

    // Update categories — support both array and single string
    const resolvedCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : category
        ? [category]
        : null;

    if (resolvedCategories)   scholarship.categories      = resolvedCategories;
    if (courseType)           scholarship.courseType       = courseType;
    if (admissionYear)        scholarship.admissionYear    = admissionYear;
    if (academicYear)         scholarship.academicYear     = academicYear;

    const amount = mahaDBTReceivable ?? scholarshipAmount;
    if (amount != null)       scholarship.mahaDBTReceivable = Number(amount);

    if (description !== undefined) scholarship.description = description;
    if (isActive !== undefined)    scholarship.isActive    = isActive;
    if (updatedBy)                 scholarship.updatedBy   = updatedBy;

    await scholarship.save();

    return res.status(200).json({
      success: true,
      message: 'Updated successfully',
      scholarship: _withAlias(scholarship),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE /api/scholarships/master/:id
exports.deleteScholarshipMaster = async (req, res) => {
  try {
    const scholarship = await ScholarshipMaster.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   2. AUTO CALCULATE SCHOLARSHIP FOR A STUDENT
   POST /api/scholarships/calculate/:admissionId
   ============================================================ */
exports.autoCalculateScholarship = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const { category, courseType, admissionYear, academicYear } = admission;

    if (!category || !courseType || !admissionYear) {
      return res.status(400).json({
        success: false,
        message: 'Student record is missing category, courseType, or admissionYear',
      });
    }

    // Find master — academicYear optional, matches latest if not set
    const masterQuery = {
      categories: { $elemMatch: { $regex: new RegExp(`^${category}$`, 'i') } },
      courseType,
      admissionYear,
      isActive: true,
    };
    // If academicYear is set, try exact match first
    let master = null;
    if (academicYear) {
      master = await ScholarshipMaster.findOne({ ...masterQuery, academicYear });
    }
    // Fallback: any academic year
    if (!master) {
      master = await ScholarshipMaster.findOne(masterQuery).sort({ academicYear: -1 });
    }

    if (!master) {
      return res.status(404).json({
        success: false,
        message: `No active scholarship master found for ${category} + ${courseType} + ${admissionYear} (${academicYear || 'any year'})`,
      });
    }

    const isReserved = RESERVED_CATEGORIES.some(
      r => r.toLowerCase() === (category || '').toLowerCase()
    );

    let eligibleAmount;
    if (isReserved) {
      // Reserved categories: full MahaDBT benefit
      eligibleAmount = master.mahaDBTReceivable;
    } else {
      // OPEN category: scholarship = Tuition Fee only
      // Use tuitionFee field if available, otherwise fall back to mahaDBTReceivable
      eligibleAmount = admission.tuitionFee || master.mahaDBTReceivable || 0;
    }

    admission.scholarshipEligibleAmount = eligibleAmount;
    admission.scholarshipAmount         = eligibleAmount;
    admission.scholarshipPendingAmount  = eligibleAmount - (admission.scholarshipReceivedAmount || 0);

    const netPayable = (admission.totalFees || 0) - admission.scholarshipAmount;
    const balance    = netPayable - (admission.feesPaid || 0);

    await admission.save();

    return res.status(200).json({
      success: true,
      message: 'Scholarship auto-calculated successfully',
      data: {
        scholarshipEligibleAmount: admission.scholarshipEligibleAmount,
        scholarshipAmount:         admission.scholarshipAmount,
        scholarshipPendingAmount:  admission.scholarshipPendingAmount,
        totalFees:                 admission.totalFees,
        netPayable,
        balance,
        categoryType:              isReserved ? 'reserved' : 'open',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   3. SCHOLARSHIP DASHBOARD STATISTICS
   GET /api/scholarships/dashboard
   — Extended with caste-wise breakdown and MahaDBT receivable
   ============================================================ */
exports.getScholarshipDashboard = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;

    const [
      totalStudents,
      notFilled,
      filled,
      approved,
      rejected,
      disbursed,
      eligibleAgg,
      receivedAgg,
      pendingAgg,
      // ── NEW: caste-wise admission counts ──────────────────
      casteWiseCounts,
      // ── NEW: caste-wise scholarship amounts ───────────────
      casteWiseAmounts,
      // ── NEW: caste-wise form status breakdown ─────────────
      casteWiseStatus,
      // ── NEW: course-wise counts ───────────────────────────
      courseWiseCounts,
    ] = await Promise.all([
      Admission.countDocuments(filter),
      Admission.countDocuments({ ...filter, scholarshipStatus: 'not_filled' }),
      Admission.countDocuments({ ...filter, scholarshipStatus: 'filled' }),
      Admission.countDocuments({ ...filter, scholarshipStatus: 'approved' }),
      Admission.countDocuments({ ...filter, scholarshipStatus: 'rejected' }),
      Admission.countDocuments({ ...filter, scholarshipStatus: 'disbursed' }),
      Admission.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$scholarshipEligibleAmount' } } }]),
      Admission.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$scholarshipReceivedAmount' } } }]),
      Admission.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$scholarshipPendingAmount'  } } }]),

      // Caste-wise total admissions
      Admission.aggregate([
        { $match: filter },
        { $group: {
          _id: { $toUpper: '$category' },
          count: { $sum: 1 },
        }},
        { $sort: { count: -1 } },
      ]),

      // Caste-wise scholarship amounts
      Admission.aggregate([
        { $match: filter },
        { $group: {
          _id: { $toUpper: '$category' },
          totalEligible: { $sum: '$scholarshipEligibleAmount' },
          totalReceived: { $sum: '$scholarshipReceivedAmount' },
          totalPending:  { $sum: '$scholarshipPendingAmount'  },
          count:         { $sum: 1 },
        }},
        { $sort: { count: -1 } },
      ]),

      // Caste-wise form status (filled vs not_filled)
      Admission.aggregate([
        { $match: filter },
        { $group: {
          _id: {
            category: { $toUpper: '$category' },
            status:    '$scholarshipStatus',
          },
          count: { $sum: 1 },
        }},
      ]),

      // Course-wise admission counts
      Admission.aggregate([
        { $match: filter },
        { $group: {
          _id: '$courseType',
          count:    { $sum: 1 },
          filled:   { $sum: { $cond: [{ $ne: ['$scholarshipStatus', 'not_filled'] }, 1, 0] } },
          notFilled:{ $sum: { $cond: [{ $eq: ['$scholarshipStatus', 'not_filled'] }, 1, 0] } },
        }},
        { $sort: { count: -1 } },
      ]),
    ]);

    // ── Transform caste-wise status into a nested map ──────
    // { SC: { not_filled: 10, filled: 5, approved: 3, ... }, ... }
    const casteStatusMap = {};
    casteWiseStatus.forEach(({ _id, count }) => {
      const cat = _id.category || 'UNKNOWN';
      const st  = _id.status   || 'not_filled';
      if (!casteStatusMap[cat]) casteStatusMap[cat] = {};
      casteStatusMap[cat][st] = count;
    });

    // ── Merge caste counts + amounts + status into one array ──
    const amountMap = {};
    casteWiseAmounts.forEach(a => {
      amountMap[a._id || 'UNKNOWN'] = {
        totalEligible: a.totalEligible || 0,
        totalReceived: a.totalReceived || 0,
        totalPending:  a.totalPending  || 0,
      };
    });

    const casteBreakdown = casteWiseCounts.map(({ _id, count }) => {
      const cat    = _id || 'UNKNOWN';
      const amt    = amountMap[cat] || { totalEligible: 0, totalReceived: 0, totalPending: 0 };
      const status = casteStatusMap[cat] || {};
      const filledCount = (status.filled || 0) + (status.approved || 0) +
                          (status.rejected || 0) + (status.disbursed || 0);
      return {
        category:      cat,
        totalAdmissions: count,
        formFilled:    filledCount,
        formNotFilled: status.not_filled || 0,
        approved:      status.approved   || 0,
        rejected:      status.rejected   || 0,
        disbursed:     status.disbursed  || 0,
        totalEligibleAmount: amt.totalEligible,
        totalReceivedAmount: amt.totalReceived,
        totalPendingAmount:  amt.totalPending,
      };
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        // ── Existing summary ──
        totalStudents,
        notFilled,
        filled,
        approved,
        rejected,
        disbursed,
        totalEligibleAmount: eligibleAgg[0]?.total || 0,
        totalReceivedAmount: receivedAgg[0]?.total || 0,
        totalPendingAmount:  pendingAgg[0]?.total  || 0,
        // ── NEW: breakdown arrays ──
        casteBreakdown,    // [{category, totalAdmissions, formFilled, formNotFilled, ...amounts}]
        courseBreakdown: courseWiseCounts.map(c => ({
          course:     c._id || 'Unknown',
          count:      c.count,
          filled:     c.filled,
          notFilled:  c.notFilled,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   4. SCHOLARSHIP REGISTER — paginated list
   GET /api/scholarships/register
   ============================================================ */
exports.getScholarshipRegister = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      courseType,
      category,
      scholarshipStatus,
      admissionYear,
      academicYear,
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { studentId:     { $regex: search, $options: 'i' } },
        { email:         { $regex: search, $options: 'i' } },
      ];
    }
    if (courseType)        filter.courseType        = courseType;
    if (category)          filter.category          = { $regex: new RegExp(`^${category}$`, 'i') };
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear)     filter.admissionYear     = admissionYear;
    if (academicYear)      filter.academicYear      = academicYear;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Admission.countDocuments(filter);

    const students = await Admission.find(filter)
      .select(
        'studentId applicantName courseType admissionYear academicYear category ' +
        'totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount ' +
        'scholarshipPendingAmount feesPaid scholarshipStatus mahaDBTAppNo email phone ' +
        'scholarshipVerifiedBy scholarshipVerifiedDate scholarshipNote ' +
        'mahaDBTUsername mahaDBTPassword mahaDBTMobile ' +
        'fatherName motherName dateOfBirth gender ' +
        'aadharPhoto casteCertificate casteValidityCertificate ' +
        'incomeCertificate domicileCertificate bankPassbook ' +
        'aadharVerificationStatus aadharVerificationRemark ' +
        'casteCertificateVerificationStatus casteCertificateVerificationRemark ' +
        'casteValidityVerificationStatus casteValidityVerificationRemark ' +
        'incomeCertificateVerificationStatus incomeCertificateVerificationRemark ' +
        'domicileVerificationStatus domicileVerificationRemark ' +
        'bankPassbookVerificationStatus bankPassbookVerificationRemark'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const rows = students.map((s) => {
      const netPayable = (s.totalFees || 0) - (s.scholarshipAmount || 0);
      const balance    = netPayable - (s.feesPaid || 0);
      return { ...s.toObject(), netPayable, balance };
    });

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      students: rows,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   5. EXPORT SCHOLARSHIP REGISTER — Excel
   GET /api/scholarships/register/export
   ============================================================ */
exports.exportScholarshipRegister = async (req, res) => {
  try {
    const { courseType, category, scholarshipStatus, admissionYear, academicYear } = req.query;

    const filter = {};
    if (courseType)        filter.courseType        = courseType;
    if (category)          filter.category          = { $regex: new RegExp(`^${category}$`, 'i') };
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear)     filter.admissionYear     = admissionYear;
    if (academicYear)      filter.academicYear      = academicYear;

    const students = await Admission.find(filter)
      .select(
        'studentId applicantName courseType admissionYear academicYear category ' +
        'totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount ' +
        'scholarshipPendingAmount feesPaid scholarshipStatus mahaDBTAppNo email phone'
      )
      .sort({ createdAt: -1 });

    const data = students.map((s) => {
      const netPayable = (s.totalFees || 0) - (s.scholarshipAmount || 0);
      const balance    = netPayable - (s.feesPaid || 0);
      const isReserved = RESERVED_CATEGORIES.some(
        r => r.toLowerCase() === (s.category || '').toLowerCase()
      );
      return {
        'Student ID':         s.studentId || '',
        'Student Name':       s.applicantName || '',
        'Course':             s.courseType || '',
        'Year':               s.admissionYear || '',
        'Academic Year':      s.academicYear || '',
        'Category':           s.category || '',
        'Category Type':      isReserved ? 'Reserved' : 'OPEN',
        'Total Fees':         s.totalFees || 0,
        'Scholarship Amount': s.scholarshipAmount || 0,
        'Eligible Amount':    s.scholarshipEligibleAmount || 0,
        'Received Amount':    s.scholarshipReceivedAmount || 0,
        'Pending Amount':     s.scholarshipPendingAmount || 0,
        'Paid Fees':          s.feesPaid || 0,
        'Net Payable':        netPayable,
        'Balance':            balance,
        'Scholarship Status': s.scholarshipStatus || '',
        'MahaDBT App No':     s.mahaDBTAppNo || '',
        'Email':              s.email || '',
        'Phone':              s.phone || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scholarship Register');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=scholarship_register.xlsx');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   6. IMPORT — kept for route compatibility but disabled
   POST /api/scholarships/master/import
   ============================================================ */
exports.importScholarshipMaster = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Excel import has been disabled. Please use the form to add records.',
  });
};


/* ============================================================
   7. DOCUMENT VERIFICATION
   PUT /api/scholarships/document-verification/:admissionId
   ============================================================ */
exports.updateDocumentVerification = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const { documentType, status, remark, verifiedBy } = req.body;

    const docFieldMap = {
      aadhar:            'aadhar',
      casteCertificate:  'casteCertificate',
      casteValidity:     'casteValidity',
      incomeCertificate: 'incomeCertificate',
      domicile:          'domicile',
      bankPassbook:      'bankPassbook',
    };

    if (!docFieldMap[documentType]) {
      return res.status(400).json({ success: false, message: `Invalid documentType: ${documentType}` });
    }
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be: pending | verified | rejected' });
    }

    const prefix      = docFieldMap[documentType];
    admission[`${prefix}VerificationStatus`] = status;
    if (remark !== undefined) admission[`${prefix}VerificationRemark`] = remark;

    if (status === 'verified' && verifiedBy) {
      admission.scholarshipVerifiedBy   = verifiedBy;
      admission.scholarshipVerifiedDate = new Date();
    }

    await admission.save();
    return res.status(200).json({ success: true, message: 'Document verification updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   8. UPDATE SCHOLARSHIP STATUS
   PUT /api/scholarships/status/:admissionId
   ============================================================ */
exports.updateScholarshipStatus = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const { scholarshipStatus, scholarshipNote, scholarshipReceivedAmount, verifiedBy } = req.body;

    const validStatuses = ['not_filled', 'filled', 'approved', 'rejected', 'disbursed'];
    if (!validStatuses.includes(scholarshipStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid scholarshipStatus value' });
    }

    admission.scholarshipStatus = scholarshipStatus;
    if (scholarshipNote !== undefined) admission.scholarshipNote = scholarshipNote;

    if (scholarshipStatus === 'disbursed' && scholarshipReceivedAmount != null) {
      admission.scholarshipReceivedAmount = scholarshipReceivedAmount;
      admission.scholarshipPendingAmount  =
        (admission.scholarshipEligibleAmount || 0) - scholarshipReceivedAmount;
    }

    if (['approved', 'disbursed'].includes(scholarshipStatus) && verifiedBy) {
      admission.scholarshipVerifiedBy   = verifiedBy;
      admission.scholarshipVerifiedDate = new Date();
    }

    await admission.save();

    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    const balance    = netPayable - (admission.feesPaid || 0);

    return res.status(200).json({
      success: true,
      message: 'Scholarship status updated',
      data: {
        scholarshipStatus:         admission.scholarshipStatus,
        scholarshipAmount:         admission.scholarshipAmount,
        scholarshipReceivedAmount: admission.scholarshipReceivedAmount,
        scholarshipPendingAmount:  admission.scholarshipPendingAmount,
        netPayable,
        balance,
        scholarshipVerifiedBy:     admission.scholarshipVerifiedBy,
        scholarshipVerifiedDate:   admission.scholarshipVerifiedDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   9. UPDATE MahaDBT CREDENTIALS
   PUT /api/scholarships/mahadbt/:admissionId
   ============================================================ */
exports.updateMahaDBTCredentials = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const { mahaDBTUsername, mahaDBTPassword, mahaDBTMobile, mahaDBTAppNo } = req.body;

    if (mahaDBTUsername !== undefined) admission.mahaDBTUsername = mahaDBTUsername;
    if (mahaDBTPassword !== undefined) admission.mahaDBTPassword = mahaDBTPassword;
    if (mahaDBTMobile   !== undefined) admission.mahaDBTMobile   = mahaDBTMobile;
    if (mahaDBTAppNo    !== undefined) admission.mahaDBTAppNo    = mahaDBTAppNo;

    await admission.save();

    return res.status(200).json({
      success: true,
      message: 'MahaDBT credentials updated',
      data: {
        mahaDBTUsername: admission.mahaDBTUsername,
        mahaDBTPassword: '••••••••',
        mahaDBTMobile:   admission.mahaDBTMobile,
        mahaDBTAppNo:    admission.mahaDBTAppNo,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   10. STUDENT SCHOLARSHIP VIEW
   GET /api/scholarships/student/:studentId
   ============================================================ */
exports.getStudentScholarshipView = async (req, res) => {
  try {
    const admission = await Admission.findOne({ studentId: req.params.studentId }).select(
      'applicantName studentId courseType admissionYear academicYear category ' +
      'totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount ' +
      'scholarshipPendingAmount feesPaid scholarshipStatus mahaDBTAppNo ' +
      'scholarshipVerifiedBy scholarshipVerifiedDate'
    );
    if (!admission) return res.status(404).json({ success: false, message: 'Student not found' });

    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    const balance    = netPayable - (admission.feesPaid || 0);

    return res.status(200).json({
      success: true,
      student: { ...admission.toObject(), netPayable, balance, mahaDBTPassword: undefined },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   11. FEE RECEIPT DATA
   GET /api/scholarships/receipt/:admissionId
   ============================================================ */
exports.getScholarshipReceiptData = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId).select(
      'applicantName studentId totalFees scholarshipAmount feesPaid ' +
      'scholarshipStatus scholarshipEligibleAmount scholarshipReceivedAmount scholarshipPendingAmount'
    );
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    const balance    = netPayable - (admission.feesPaid || 0);

    return res.status(200).json({
      success: true,
      receipt: {
        studentName:        admission.applicantName,
        studentId:          admission.studentId,
        totalFees:          admission.totalFees          || 0,
        scholarshipBenefit: admission.scholarshipAmount  || 0,
        netPayable,
        amountPaid:         admission.feesPaid           || 0,
        balanceRemaining:   balance,
        scholarshipStatus:  admission.scholarshipStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   HELPER — add scholarshipAmount alias for frontend compat
   Model stores: mahaDBTReceivable
   Frontend expects: scholarshipAmount
   ============================================================ */
function _withAlias(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.scholarshipAmount = obj.mahaDBTReceivable;  // alias
  // Also add primary category for frontend backward compat
  if (obj.categories?.length > 0 && !obj.category) {
    obj.category = obj.categories[0];
  }
  return obj;
}
