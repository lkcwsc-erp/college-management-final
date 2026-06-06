/* ============================================================
   scholarshipController.js
   Complete Scholarship Management — LKCWSC College ERP
   ============================================================ */

const ScholarshipMaster = require('../models/ScholarshipMaster');
const Admission         = require('../models/Admission');
const XLSX              = require('xlsx');


/* ============================================================
   1. SCHOLARSHIP MASTER — CRUD
   ============================================================ */

// POST /api/scholarships/master
exports.createScholarshipMaster = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, scholarshipAmount, description, createdBy } = req.body;

    if (!category || !courseType || !admissionYear || !academicYear || scholarshipAmount == null) {
      return res.status(400).json({
        success: false,
        message: 'Fields required: category, courseType, admissionYear, academicYear, scholarshipAmount',
      });
    }

    const scholarship = await ScholarshipMaster.create({
      category,
      courseType,
      admissionYear,
      academicYear,
      scholarshipAmount,
      description: description || '',
      createdBy: createdBy || '',
    });

    return res.status(201).json({ success: true, message: 'Scholarship master created', scholarship });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This combination of category + course + year + academicYear already exists',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/scholarships/master
exports.getAllScholarshipMasters = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, isActive } = req.query;
    const filter = {};
    if (category)      filter.category      = category;
    if (courseType)    filter.courseType     = courseType;
    if (admissionYear) filter.admissionYear  = admissionYear;
    if (academicYear)  filter.academicYear   = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const scholarships = await ScholarshipMaster.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: scholarships.length, scholarships });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/scholarships/master/:id
exports.getScholarshipMasterById = async (req, res) => {
  try {
    const scholarship = await ScholarshipMaster.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, scholarship });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/scholarships/master/:id
exports.updateScholarshipMaster = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, scholarshipAmount, description, isActive, updatedBy } = req.body;
    const scholarship = await ScholarshipMaster.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Not found' });

    if (category)              scholarship.category         = category;
    if (courseType)            scholarship.courseType        = courseType;
    if (admissionYear)         scholarship.admissionYear     = admissionYear;
    if (academicYear)          scholarship.academicYear      = academicYear;
    if (scholarshipAmount != null) scholarship.scholarshipAmount = scholarshipAmount;
    if (description !== undefined) scholarship.description  = description;
    if (isActive !== undefined)    scholarship.isActive      = isActive;
    if (updatedBy)             scholarship.updatedBy         = updatedBy;

    await scholarship.save();
    return res.status(200).json({ success: true, message: 'Updated successfully', scholarship });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This combination already exists' });
    }
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

    // Find active scholarship master record
    const master = await ScholarshipMaster.findOne({
      category,
      courseType,
      admissionYear,
      academicYear: academicYear || '',
      isActive: true,
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        message: `No active scholarship master found for ${category} + ${courseType} + ${admissionYear} (${academicYear || 'any year'})`,
      });
    }

    // Update scholarship fields
    admission.scholarshipEligibleAmount = master.scholarshipAmount;
    admission.scholarshipAmount         = master.scholarshipAmount;
    admission.scholarshipPendingAmount  = master.scholarshipAmount - (admission.scholarshipReceivedAmount || 0);

    // Recalculate net payable
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
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   3. SCHOLARSHIP DASHBOARD STATISTICS
   GET /api/scholarships/dashboard
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
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalStudents,
        notFilled,
        filled,
        approved,
        rejected,
        disbursed,
        totalEligibleAmount:  eligibleAgg[0]?.total  || 0,
        totalReceivedAmount:  receivedAgg[0]?.total  || 0,
        totalPendingAmount:   pendingAgg[0]?.total   || 0,
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
    if (courseType)       filter.courseType       = courseType;
    if (category)         filter.category         = category;
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear)    filter.admissionYear    = admissionYear;
    if (academicYear)     filter.academicYear     = academicYear;

    const skip     = (parseInt(page) - 1) * parseInt(limit);
    const total    = await Admission.countDocuments(filter);

    const students = await Admission.find(filter)
      .select(
        'studentId applicantName courseType admissionYear academicYear category ' +
        'totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount ' +
        'scholarshipPendingAmount feesPaid scholarshipStatus mahaDBTAppNo email phone ' +
        'scholarshipVerifiedBy scholarshipVerifiedDate'
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
    if (courseType)       filter.courseType       = courseType;
    if (category)         filter.category         = category;
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear)    filter.admissionYear    = admissionYear;
    if (academicYear)     filter.academicYear     = academicYear;

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
      return {
        'Student ID':         s.studentId || '',
        'Student Name':       s.applicantName || '',
        'Course':             s.courseType || '',
        'Year':               s.admissionYear || '',
        'Academic Year':      s.academicYear || '',
        'Category':           s.category || '',
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
   6. IMPORT SCHOLARSHIP MASTER FROM EXCEL
   POST /api/scholarships/master/import
   ============================================================ */
exports.importScholarshipMaster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook  = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data      = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const record = await ScholarshipMaster.create({
          category:          row.Category       || row.category,
          courseType:        row.CourseType      || row['Course Type'] || row.courseType,
          admissionYear:     row.AdmissionYear   || row['Admission Year'] || row.admissionYear,
          academicYear:      row.AcademicYear    || row['Academic Year'] || row.academicYear,
          scholarshipAmount: row.ScholarshipAmount || row['Scholarship Amount'] || row.scholarshipAmount,
          description:       row.Description    || row.description || '',
          createdBy:         req.body.createdBy  || 'Excel Import',
        });
        results.success.push(`Row ${i + 2}: ${record.category} + ${record.courseType} + ${record.admissionYear} = ₹${record.scholarshipAmount}`);
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import done. ${results.success.length} created, ${results.errors.length} errors`,
      results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   7. DOCUMENT VERIFICATION
   PUT /api/scholarships/document-verification/:admissionId
   Body: { documentType, status, remark, verifiedBy }
   ============================================================ */
exports.updateDocumentVerification = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const { documentType, status, remark, verifiedBy } = req.body;

    // Map frontend documentType key → Admission model field prefix
    const docFieldMap = {
      aadhar:             'aadhar',
      casteCertificate:   'casteCertificate',
      casteValidity:      'casteValidity',
      incomeCertificate:  'incomeCertificate',
      domicile:           'domicile',
      bankPassbook:       'bankPassbook',
    };

    if (!docFieldMap[documentType]) {
      return res.status(400).json({ success: false, message: `Invalid documentType: ${documentType}` });
    }

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be: pending | verified | rejected' });
    }

    const prefix      = docFieldMap[documentType];
    const statusField = `${prefix}VerificationStatus`;
    const remarkField = `${prefix}VerificationRemark`;

    admission[statusField] = status;
    if (remark !== undefined) admission[remarkField] = remark;

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
   Body: { scholarshipStatus, scholarshipNote, scholarshipReceivedAmount, verifiedBy }
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

    // On disbursed — record received amount and recalculate pending
    if (scholarshipStatus === 'disbursed' && scholarshipReceivedAmount != null) {
      admission.scholarshipReceivedAmount = scholarshipReceivedAmount;
      admission.scholarshipPendingAmount  =
        (admission.scholarshipEligibleAmount || 0) - scholarshipReceivedAmount;
    }

    // Audit trail
    if (['approved', 'disbursed'].includes(scholarshipStatus) && verifiedBy) {
      admission.scholarshipVerifiedBy   = verifiedBy;
      admission.scholarshipVerifiedDate = new Date();
    }

    // Accounts integration: recalculate net payable when approved or disbursed
    if (['approved', 'disbursed'].includes(scholarshipStatus)) {
      // These virtual fields are used by accounts module
      // netPayable = totalFees - scholarshipAmount
      // balance    = netPayable - feesPaid
      // No separate field needed — accounts reads totalFees, scholarshipAmount, feesPaid live
    }

    await admission.save();

    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    const balance    = netPayable - (admission.feesPaid || 0);

    return res.status(200).json({
      success: true,
      message: 'Scholarship status updated',
      data: {
        scholarshipStatus:        admission.scholarshipStatus,
        scholarshipAmount:        admission.scholarshipAmount,
        scholarshipReceivedAmount: admission.scholarshipReceivedAmount,
        scholarshipPendingAmount: admission.scholarshipPendingAmount,
        netPayable,
        balance,
        scholarshipVerifiedBy:    admission.scholarshipVerifiedBy,
        scholarshipVerifiedDate:  admission.scholarshipVerifiedDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   9. UPDATE MahaDBT CREDENTIALS (scholarship staff only)
   PUT /api/scholarships/mahadbt/:admissionId
   Body: { mahaDBTUsername, mahaDBTPassword, mahaDBTMobile, mahaDBTAppNo }
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

    // Return masked password
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
   10. GET SINGLE STUDENT SCHOLARSHIP VIEW (for student dashboard)
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
      student: {
        ...admission.toObject(),
        netPayable,
        balance,
        // Password is never sent to student
        mahaDBTPassword: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   11. FEE RECEIPT DATA — scholarship breakdown for receipt
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
        studentName:      admission.applicantName,
        studentId:        admission.studentId,
        totalFees:        admission.totalFees        || 0,
        scholarshipBenefit: admission.scholarshipAmount || 0,
        netPayable,
        amountPaid:       admission.feesPaid         || 0,
        balanceRemaining: balance,
        scholarshipStatus: admission.scholarshipStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
