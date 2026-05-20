const Admission = require('../models/Admission');


// Student Submit Form
exports.createAdmission = async (req, res) => {

  try {

    const admission = await Admission.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Admission submitted successfully',
      admission
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Get All Forms
exports.getAllAdmissions = async (req, res) => {

  try {

    const admissions = await Admission.find()
      .populate('course');

    res.status(200).json({
      success: true,
      admissions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Approve
exports.staffApprove = async (req, res) => {

  try {

    const admission = await Admission.findById(req.params.id);

    admission.studentSectionStatus = 'verified';

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Approved by staff'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Staff Reject
exports.staffReject = async (req, res) => {

  try {

    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);

    admission.studentSectionStatus = 'rejected';

    admission.studentSectionRemark = reason;

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Rejected by staff'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Principal Approve
exports.principalApprove = async (req, res) => {

  try {

    const admission = await Admission.findById(req.params.id);

    const uniqueId = `CSMC${Date.now()}`;

    admission.principalStatus = 'approved';

    admission.status = 'approved';

    admission.studentId = uniqueId;

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Admission Approved',
      studentId: uniqueId
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Principal Reject
exports.principalReject = async (req, res) => {

  try {

    const { reason } = req.body;

    const admission = await Admission.findById(req.params.id);

    admission.principalStatus = 'rejected';

    admission.principalRemark = reason;

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Rejected by principal'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
