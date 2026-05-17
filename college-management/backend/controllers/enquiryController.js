const Enquiry = require('../models/Enquiry');

// Submit new enquiry (Public)
exports.submitEnquiry = async (req, res) => {
  try {
    const { studentFullName, gender, dateOfBirth, email, phone } = req.body;

    if (!studentFullName || !gender || !dateOfBirth || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const enquiry = await Enquiry.create({
      studentFullName,
      gender,
      dateOfBirth,
      email,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully!',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all enquiries (Staff/Admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update enquiry status (Staff/Admin)
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete enquiry (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
