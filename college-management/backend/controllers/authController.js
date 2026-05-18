const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { sendOTPEmail, generateOTP } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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
    const { firstName, middleName, lastName, email, phone, dateOfBirth } = req.body;

    if (!firstName || !email || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and date of birth are required'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const password = generateStudentPassword(firstName, dateOfBirth);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'student',
      dateOfBirth,
      firstName,
      middleName: middleName || '',
      lastName: lastName || ''
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      generatedPassword: password,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
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

// ===== STEP 1: LOGIN — Verify CAPTCHA + password, then send OTP =====
exports.login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

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

    // ✅ UPDATED: Find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() } // "email" field can also be username
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

    // 🔐 If user is STAFF (any type) or ADMIN → send OTP
    const staffRoles = ['staff', 'staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship'];
    if (staffRoles.includes(user.role) || user.role === 'admin') {
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
        email: user.email // always return actual email for OTP verify step
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

    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

// ===== ADMIN: Create Staff Login =====
exports.createStaff = async (req, res) => {
  try {
    const { name, username, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and role are required'
      });
    }

    const validRoles = ['staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // ✅ Check email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // ✅ Check username already exists (if provided)
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
      plainPassword: password, // ✅ store plain for admin view
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
        plainPassword: user.plainPassword, // ✅ return to show in modal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: Get All Staff =====
exports.getAllStaff = async (req, res) => {
  try {
    const staffRoles = ['staff', 'staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship'];
    // ✅ include plainPassword in select (remove -password but keep plainPassword)
    const staff = await User.find({ role: { $in: staffRoles } })
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

    const staffRoles = ['staff', 'staff_student', 'staff_accounts', 'staff_exam', 'staff_scholarship'];
    if (!staffRoles.includes(user.role)) {
      return res.status(400).json({ success: false, message: 'Not a staff user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: Update Staff ✅ NEW =====
exports.updateStaff = async (req, res) => {
  try {
    const { name, username, email, phone } = req.body;

    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    // ✅ Check email conflict (exclude self)
    if (email && email !== staff.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use by another user' });
      }
    }

    // ✅ Check username conflict (exclude self)
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
