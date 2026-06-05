
/* ============================================================
   CREATE SCHOLARSHIP MASTER
   ============================================================ */
exports.createScholarshipMaster = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, scholarshipAmount, description, createdBy } = req.body;

    // Validation
    if (!category || !courseType || !admissionYear || !academicYear || scholarshipAmount == null) {
      return res.status(400).json({
        success: false,
        message: 'All fields (category, courseType, admissionYear, academicYear, scholarshipAmount) are required',
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

    return res.status(201).json({
      success: true,
      message: 'Scholarship master created successfully',
      scholarship,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This combination of category, course type, admission year, and academic year already exists',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   GET ALL SCHOLARSHIP MASTERS
   ============================================================ */
exports.getAllScholarshipMasters = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (courseType) filter.courseType = courseType;
    if (admissionYear) filter.admissionYear = admissionYear;
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const scholarships = await ScholarshipMaster.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      scholarships,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   GET SCHOLARSHIP MASTER BY ID
   ============================================================ */
exports.getScholarshipMasterById = async (req, res) => {
  try {
    const scholarship = await ScholarshipMaster.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship master not found' });
    }

    return res.status(200).json({ success: true, scholarship });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   UPDATE SCHOLARSHIP MASTER
   ============================================================ */
exports.updateScholarshipMaster = async (req, res) => {
  try {
    const { category, courseType, admissionYear, academicYear, scholarshipAmount, description, isActive, updatedBy } =
      req.body;

    const scholarship = await ScholarshipMaster.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship master not found' });
    }

    if (category) scholarship.category = category;
    if (courseType) scholarship.courseType = courseType;
    if (admissionYear) scholarship.admissionYear = admissionYear;
    if (academicYear) scholarship.academicYear = academicYear;
    if (scholarshipAmount != null) scholarship.scholarshipAmount = scholarshipAmount;
    if (description !== undefined) scholarship.description = description;
    if (isActive !== undefined) scholarship.isActive = isActive;
    if (updatedBy) scholarship.updatedBy = updatedBy;

    await scholarship.save();

    return res.status(200).json({
      success: true,
      message: 'Scholarship master updated successfully',
      scholarship,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This combination already exists',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   DELETE SCHOLARSHIP MASTER
   ============================================================ */
exports.deleteScholarshipMaster = async (req, res) => {
  try {
    const scholarship = await ScholarshipMaster.findByIdAndDelete(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship master not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Scholarship master deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   AUTO CALCULATE SCHOLARSHIP FOR STUDENT
   ============================================================ */
exports.autoCalculateScholarship = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    // Extract required fields
    const { category, courseType, admissionYear, academicYear } = admission;

    if (!category || !courseType || !admissionYear) {
      return res.status(400).json({
        success: false,
        message: 'Student record is missing category, course type, or admission year',
      });
    }

    // Find matching scholarship master
    const scholarshipMaster = await ScholarshipMaster.findOne({
      category,
      courseType,
      admissionYear,
      academicYear: academicYear || new Date().getFullYear().toString(),
      isActive: true,
    });

    if (!scholarshipMaster) {
      return res.status(404).json({
        success: false,
        message: `No scholarship found for ${category} + ${courseType} + ${admissionYear}`,
      });
    }

    // Update admission with eligible amount
    admission.scholarshipEligibleAmount = scholarshipMaster.scholarshipAmount;
    admission.scholarshipAmount = scholarshipMaster.scholarshipAmount;
    admission.scholarshipPendingAmount = scholarshipMaster.scholarshipAmount - (admission.scholarshipReceivedAmount || 0);

    await admission.save();

    return res.status(200).json({
      success: true,
      message: 'Scholarship calculated successfully',
      scholarshipEligibleAmount: admission.scholarshipEligibleAmount,
      scholarshipAmount: admission.scholarshipAmount,
      scholarshipPendingAmount: admission.scholarshipPendingAmount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   SCHOLARSHIP DASHBOARD STATISTICS
   ============================================================ */
exports.getScholarshipDashboard = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;

    // Total students
    const totalStudents = await Admission.countDocuments(filter);

    // Count by scholarship status
    const notFilled = await Admission.countDocuments({ ...filter, scholarshipStatus: 'not_filled' });
    const filled = await Admission.countDocuments({ ...filter, scholarshipStatus: 'filled' });
    const approved = await Admission.countDocuments({ ...filter, scholarshipStatus: 'approved' });
    const rejected = await Admission.countDocuments({ ...filter, scholarshipStatus: 'rejected' });
    const disbursed = await Admission.countDocuments({ ...filter, scholarshipStatus: 'disbursed' });

    // Calculate amounts
    const eligibleAmountResult = await Admission.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$scholarshipEligibleAmount' } } },
    ]);
    const totalEligibleAmount = eligibleAmountResult.length > 0 ? eligibleAmountResult[0].total : 0;

    const receivedAmountResult = await Admission.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$scholarshipReceivedAmount' } } },
    ]);
    const totalReceivedAmount = receivedAmountResult.length > 0 ? receivedAmountResult[0].total : 0;

    const pendingAmountResult = await Admission.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$scholarshipPendingAmount' } } },
    ]);
    const totalPendingAmount = pendingAmountResult.length > 0 ? pendingAmountResult[0].total : 0;

    return res.status(200).json({
      success: true,
      dashboard: {
        totalStudents,
        notFilled,
        filled,
        approved,
        rejected,
        disbursed,
        totalEligibleAmount,
        totalReceivedAmount,
        totalPendingAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   SCHOLARSHIP REGISTER - List all students with scholarship info
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

    // Search by name, student ID, or email
    if (search) {
      filter.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (courseType) filter.courseType = courseType;
    if (category) filter.category = category;
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear) filter.admissionYear = admissionYear;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await Admission.find(filter)
      .select(
        'studentId applicantName courseType admissionYear category totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount scholarshipPendingAmount fees scholarshipStatus email phone'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admission.countDocuments(filter);

    // Calculate balance for each student
    const studentsWithBalance = students.map((student) => {
      const netPayable = (student.totalFees || 0) - (student.scholarshipAmount || 0);
      const balance = netPayable - (student.fees || 0);
      return {
        ...student.toObject(),
        netPayable,
        balance,
      };
    });

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      students: studentsWithBalance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   UPDATE DOCUMENT VERIFICATION STATUS
   ============================================================ */
exports.updateDocumentVerification = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { documentType, status, remark, verifiedBy } = req.body;

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    const validDocuments = [
      'aadhar',
      'casteCertificate',
      'casteValidity',
      'incomeCertificate',
      'domicile',
      'bankPassbook',
    ];

    if (!validDocuments.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Update verification status
    const statusField = `${documentType}VerificationStatus`;
    const remarkField = `${documentType}VerificationRemark`;

    admission[statusField] = status;
    if (remark) admission[remarkField] = remark;

    // If verifying, record who verified
    if (status === 'verified' && verifiedBy) {
      admission.scholarshipVerifiedBy = verifiedBy;
      admission.scholarshipVerifiedDate = new Date();
    }

    await admission.save();

    return res.status(200).json({
      success: true,
      message: 'Document verification updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   UPDATE SCHOLARSHIP STATUS
   ============================================================ */
exports.updateScholarshipStatus = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { scholarshipStatus, scholarshipNote, scholarshipReceivedAmount, verifiedBy } = req.body;

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    const validStatuses = ['not_filled', 'filled', 'approved', 'rejected', 'disbursed'];
    if (!validStatuses.includes(scholarshipStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid scholarship status' });
    }

    admission.scholarshipStatus = scholarshipStatus;
    if (scholarshipNote !== undefined) admission.scholarshipNote = scholarshipNote;

    // If disbursed, update received amount
    if (scholarshipStatus === 'disbursed' && scholarshipReceivedAmount != null) {
      admission.scholarshipReceivedAmount = scholarshipReceivedAmount;
      admission.scholarshipPendingAmount = admission.scholarshipEligibleAmount - scholarshipReceivedAmount;
    }

    // Record who approved/disbursed
    if (['approved', 'disbursed'].includes(scholarshipStatus) && verifiedBy) {
      admission.scholarshipVerifiedBy = verifiedBy;
      admission.scholarshipVerifiedDate = new Date();
    }

    await admission.save();

    return res.status(200).json({
      success: true,
      message: 'Scholarship status updated successfully',
      admission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   EXPORT SCHOLARSHIP REGISTER TO EXCEL
   ============================================================ */
exports.exportScholarshipRegister = async (req, res) => {
  try {
    const { courseType, category, scholarshipStatus, admissionYear, academicYear } = req.query;

    const filter = {};
    if (courseType) filter.courseType = courseType;
    if (category) filter.category = category;
    if (scholarshipStatus) filter.scholarshipStatus = scholarshipStatus;
    if (admissionYear) filter.admissionYear = admissionYear;
    if (academicYear) filter.academicYear = academicYear;

    const students = await Admission.find(filter)
      .select(
        'studentId applicantName courseType admissionYear category totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount scholarshipPendingAmount fees scholarshipStatus email phone'
      )
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const data = students.map((student) => {
      const netPayable = (student.totalFees || 0) - (student.scholarshipAmount || 0);
      const balance = netPayable - (student.fees || 0);
      return {
        'Student ID': student.studentId || '',
        'Student Name': student.applicantName || '',
        Course: student.courseType || '',
        Year: student.admissionYear || '',
        Category: student.category || '',
        'Total Fees': student.totalFees || 0,
        'Scholarship Amount': student.scholarshipAmount || 0,
        'Eligible Amount': student.scholarshipEligibleAmount || 0,
        'Received Amount': student.scholarshipReceivedAmount || 0,
        'Pending Amount': student.scholarshipPendingAmount || 0,
        'Paid Fees': student.fees || 0,
        Balance: balance,
        Status: student.scholarshipStatus || '',
        Email: student.email || '',
        Phone: student.phone || '',
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scholarship Register');

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=scholarship_register.xlsx');
    return res.send(excelBuffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   IMPORT SCHOLARSHIP MASTER FROM EXCEL
   ============================================================ */
exports.importScholarshipMaster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: [],
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const scholarship = await ScholarshipMaster.create({
          category: row.Category || row.category,
          courseType: row.CourseType || row['Course Type'] || row.courseType,
          admissionYear: row.AdmissionYear || row['Admission Year'] || row.admissionYear,
          academicYear: row.AcademicYear || row['Academic Year'] || row.academicYear,
          scholarshipAmount: row.ScholarshipAmount || row['Scholarship Amount'] || row.scholarshipAmount,
          description: row.Description || row.description || '',
          createdBy: req.body.createdBy || 'Import',
        });
        results.success.push(`Row ${i + 2}: ${scholarship.category} - ${scholarship.courseType} - ${scholarship.admissionYear}`);
      } catch (error) {
        results.errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import completed. ${results.success.length} records created, ${results.errors.length} errors`,
      results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   GET STUDENT SCHOLARSHIP VIEW
   ============================================================ */
exports.getStudentScholarshipView = async (req, res) => {
  try {
    const { studentId } = req.params;

    const admission = await Admission.findOne({ studentId }).select(
      'applicantName studentId courseType admissionYear category totalFees scholarshipAmount scholarshipEligibleAmount scholarshipReceivedAmount scholarshipPendingAmount fees scholarshipStatus mahaDBTAppNo'
    );

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const netPayable = (admission.totalFees || 0) - (admission.scholarshipAmount || 0);
    const balance = netPayable - (admission.fees || 0);

    return res.status(200).json({
      success: true,
      student: {
        ...admission.toObject(),
        netPayable,
        balance,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
"
Observation: Create successful: /app/backend/controllers/scholarshipController.js
