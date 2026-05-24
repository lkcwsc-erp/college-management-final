const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { sendOTPEmail, generateOTP } = require('../utils/emailService');
 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
 
// ===== STAFF ROLES CONSTANT =====
const STAFF_ROLES = ['staff', 'staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship', 'staff_principal'];
const VALID_STAFF_ROLES = ['staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship', 'staff_principal'];
 
// ===== AUTO PASSWORD GENERATOR =====
const generateStudentPassword = (firstName, dob) => {
  const namePart = firstName.toLowerCase().slice(0, 4);
  const date = new Date(dob);
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${namePart}@${dd}${yy}`;
};
 
// ===== STAFF/ADMIN: Register a New Student =====
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, middleName, lastName, aadharNumber, phone, dateOfBirth } = req.body;

    if (!firstName || !aadharNumber || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'First name, Aadhar number and date of birth are required'
      });
    }

    // Aadhar 12 digits validation
    if (!/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number must be exactly 12 digits'
      });
    }

    // Duplicate Aadhar check
    const aadharExists = await User.findOne({ aadharNumber });
    if (aadharExists) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Aadhar number already exists'
      });
    }

    const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const password = generateStudentPassword(firstName, dateOfBirth);

    // Auto-generate email from aadhar
    const email = `student${aadharNumber}@lkcwsc.ac.in`;

    const user = await User.create({
      name,
      email,
      aadharNumber,
      password,
      phone,
      role: 'student',
      dateOfBirth,
      firstName,
      middleName: middleName || '',
      lastName: lastName || ''
    });

    // Student collection mein bhi save karo
    const lastStudent = await Student.findOne().sort({ createdAt: -1 });
    let rollNumber = 'STU0001';
    if (lastStudent && lastStudent.rollNumber) {
      const lastNum = parseInt(lastStudent.rollNumber.replace(/\D/g, '')) + 1;
      rollNumber = 'STU' + String(lastNum).padStart(4, '0');
    }
    await Student.create({
      user: user._id,
      rollNumber,
      admissionYear: new Date().getFullYear(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      generatedPassword: password,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        aadharNumber: user.aadharNumber,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== Register Staff/Admin =====
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getAllStudentUsers = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.deleteStudentUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== STEP 1: LOGIN =====
exports.login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
 
    // Pehle user dhundho
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });
 
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }
 
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }
 
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
 
    // 🔐 CAPTCHA sirf Staff aur Admin ke liye — Student ke liye nahi
    if (STAFF_ROLES.includes(user.role) || user.role === 'admin') {
      if (!captchaToken) {
        return res.status(400).json({
          success: false,
          message: 'Please complete the CAPTCHA verification.'
        });
      }
 
      try {
        const captchaResponse = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          {
            params: {
              secret: process.env.RECAPTCHA_SECRET_KEY,
              response: captchaToken
            }
          }
        );
 
        if (!captchaResponse.data.success) {
          return res.status(400).json({
            success: false,
            message: 'CAPTCHA verification failed. Please try again.'
          });
        }
      } catch (captchaError) {
        console.error('CAPTCHA error:', captchaError.message);
        return res.status(500).json({
          success: false,
          message: 'CAPTCHA service unavailable. Please try again.'
        });
      }
    }
 
    // 🔐 If user is STAFF (any type including Principal) or ADMIN → send OTP
    if (STAFF_ROLES.includes(user.role) || user.role === 'admin') {
      await OTP.deleteMany({ email: user.email.toLowerCase() });
 
      const otp = generateOTP();
 
      await OTP.create({
        email: user.email.toLowerCase(),
        otp,
        purpose: 'login'
      });
 
      const emailResult = await sendOTPEmail(user.email, otp, user.name);
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again or contact admin.'
        });
      }
 
      return res.status(200).json({
        success: true,
        otpRequired: true,
        message: `OTP has been sent to ${user.email}. Please check your inbox.`,
        email: user.email
      });
    }
 
    // For STUDENTS — direct login
    res.status(200).json({
      success: true,
      otpRequired: false,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== STEP 2: VERIFY OTP =====
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
 
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
 
    // Username ya email dono se user dhundho
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpRecord = await OTP.findOne({ email: user.email.toLowerCase() });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or not found. Please request a new one.'
      });
    }
 
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many wrong attempts. Please request a new OTP.'
      });
    }
 
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Wrong OTP. ${remaining} attempts remaining.`
      });
    }
 
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'OTP verified! Login successful.',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== RESEND OTP =====
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
 
    await OTP.deleteMany({ email: email.toLowerCase() });
 
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp, purpose: 'login' });
 
    const emailResult = await sendOTPEmail(email, otp, user.name);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email.'
      });
    }
 
    res.status(200).json({
      success: true,
      message: `New OTP sent to ${email}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== ADMIN: Create Staff Login (includes Principal) =====
exports.createStaff = async (req, res) => {
  try {
    const { name, username, email, password, phone, role } = req.body;
 
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and role are required'
      });
    }
 
    if (!VALID_STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: ' + VALID_STAFF_ROLES.join(', ')
      });
    }
 
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }
 
    if (username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken'
        });
      }
    }
 
    const user = await User.create({
      name,
      username: username ? username.toLowerCase() : undefined,
      email,
      password,
      plainPassword: password,
      phone: phone || '',
      role
    });
 
    res.status(201).json({
      success: true,
      message: 'Staff created successfully!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plainPassword: user.plainPassword,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== ADMIN: Get All Staff (includes Principal) =====
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select('-password')
      .sort({ createdAt: -1 });
 
    res.status(200).json({
      success: true,
      count: staff.length,
      staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== ADMIN: Delete Staff =====
exports.deleteStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
 
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(400).json({ success: false, message: 'Not a staff user' });
    }
 
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ===== ADMIN: Update Staff =====
exports.updateStaff = async (req, res) => {
  try {
    const { name, username, email, phone } = req.body;
 
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
 
    if (email && email !== staff.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use by another user' });
      }
    }
 
    if (username && username !== staff.username) {
      const usernameExists = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
    }
 
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || staff.name,
        username: username ? username.toLowerCase() : staff.username,
        email: email || staff.email,
        phone: phone || staff.phone,
      },
      { new: true }
    ).select('-password');
 
    res.status(200).json({
      success: true,
      message: 'Staff updated successfully!',
      staff: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
