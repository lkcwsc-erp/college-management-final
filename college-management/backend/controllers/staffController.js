const Staff = require('../models/Staff');

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true })
      .populate('user', 'name email phone photo');
    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone photo address');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user._id })
      .populate('user', 'name email phone photo address');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, message: 'Staff created successfully', staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, message: 'Staff updated successfully', staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.staffLogin = async (req, res) => {

  try {

    const { employeeId, role } = req.body;

    const staff = await Staff.findOne({
      employeeId,
      role,
      isActive: true
    });

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      staff
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
