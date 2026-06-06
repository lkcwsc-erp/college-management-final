//Server.js


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://dev.lkcwsc.vnssorg.com',
    'https://lkcwsc.vnssorg.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/enquiries', require('./routes/enqueryRoutes'));

app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/document-requests', require('./routes/documentRequestRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));

app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/document-requests', require('./routes/documentRequestRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));

// 👇 YE NAYI LINE ADD KARO
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

app.get('/', (req, res) => {
  res.json({ message: '🎓 Late Kalpana Chawla Mahila College API Running!' });
});

app.get('/', (req, res) => {
  res.json({ message: '🎓 Late Kalpana Chawla Mahila College API Running!' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
