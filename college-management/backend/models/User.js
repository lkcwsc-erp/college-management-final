const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  firstName: { type: String, trim: true },
  middleName: { type: String, trim: true, default: '' },
  lastName: { type: String, trim: true, default: '' },
  aadharNumber: { type: String, sparse: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  plainPassword: { type: String, default: '' },
  role: {
    type: String,
   enum: [
  'student',
  'staff',
  'staff_student',
  'staff_accounts',
  'staff_exam',
  'staff_scholarship',
  'staff_principal',
  'admin'
],
    default: 'student'
  },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  photo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
