import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Admissions.css';

/* ============================================================
   FILE SIZE LIMITS (bytes) — Maharashtra college standard
   ============================================================ */
const FILE_LIMITS = {
  studentPhoto: 250 * 1024,
  signaturePhoto: 100 * 1024,
  aadharPhoto: 1024 * 1024,
  sscMarksheet: 1024 * 1024,
  hscMarksheet: 1024 * 1024,
  prevYearMarksheet: 1024 * 1024,
  gapCertificate: 1024 * 1024,
  gapyeardocument: 1024 * 1024,
  casteCertificate: 1024 * 1024,
  casteValidityCertificate: 1024 * 1024,
  marriageCertificate: 1024 * 1024,
  bankPassbook: 1024 * 1024,
  domicileCertificate: 1024 * 1024,
  incomeCertificate: 1024 * 1024,
  transferCertificate: 1024 * 1024,
  aparIdDocument: 1024 * 1024,
};

const formatLimit = (bytes) => {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
};

/* ============================================================
   SUBJECTS by Course
   ============================================================ */
const SUBJECTS_BY_COURSE = {
  BA: [
    'History', 'Marathi', 'English', 'Hindi',
    'Economics', 'Political Science', 'Sociology',
    'Geography', 'Public Administration', 'Psychology'
  ],
  BSc: [
    'Physics', 'Chemistry', 'Mathematics',
    'Botany', 'Zoology', 'Computer Science',
    'Microbiology', 'Biotechnology', 'Electronics', 'Statistics'
  ],
};

/* ============================================================
   FILE UPLOAD BOX — module-level component
   Must NOT be defined inside Admissions — doing so creates a new
   component type on every render, unmounting it and breaking refs.
   ============================================================ */
const FileUploadBox = ({
  fieldName, label, accept, required, hint,
  uploadedFiles, uploadPreviews, fileErrors, onFileChange,
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(fieldName, file);
  };

  const hasError = fileErrors[fieldName];
  const file = uploadedFiles[fieldName];
  const preview = uploadPreviews[fieldName];
  const sizeLimit = FILE_LIMITS[fieldName];
  const limitHint = sizeLimit ? `Max ${formatLimit(sizeLimit)}` : '';

  return (
    <div className="upload-form-group">
      <label className="upload-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <div
        className={
          'upload-box-modern' +
          (dragging ? ' dragging' : '') +
          (hasError ? ' has-error' : '') +
          (preview ? ' has-file' : '')
        }
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        {preview ? (
          <div className="upload-preview-wrapper">
            {file?.type?.startsWith('image/') ? (
              <img src={preview} alt={label} className="upload-preview-img" />
            ) : (
              <div className="upload-pdf-block">
                <span className="upload-pdf-icon">📄</span>
                <span className="upload-pdf-name">
                  {file?.name?.length > 22 ? file.name.slice(0, 22) + '…' : file?.name}
                </span>
              </div>
            )}
            <div className="upload-file-info-row">
              <span className="file-success-pill">✓ Uploaded</span>
              <span className="file-size-pill">{file && (file.size / 1024).toFixed(1) + ' KB'}</span>
            </div>
            <p className="upload-change-text">Click to change</p>
          </div>
        ) : (
          <div className="upload-empty">
            <div className="upload-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p className="upload-main-text">Drop file or <span>browse</span></p>
            <p className="upload-sub-text">{hint || 'JPG, PNG, PDF'}{limitHint && ' · ' + limitHint}</p>
          </div>
        )}
      </div>
      {hasError && <div className="file-error-message">{hasError}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/*,.pdf'}
        onChange={(e) => onFileChange(fieldName, e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
};

const Admissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('process');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sscError, setSscError] = useState('');
  const [hscError, setHscError] = useState('');
  const [fileErrors, setFileErrors] = useState({});

  // Enquiry form state
  const [enquiryData, setEnquiryData] = useState({
    studentFullName: '',
    gender: '',
    email: '',
    phone: '',
    message: '',
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState('');
  const [enquiryError, setEnquiryError] = useState('');

  const [formData, setFormData] = useState({
    // Personal
    applicantName: '', email: '', phone: '',

    // Address (new clean fields)
    houseNumber: '', streetArea: '',
    subdistrict: '', cityTownVillage: '',
    district: '', state: '', pincode: '',

    // APAR ID
    aparIdNumber: '',
    dateOfBirth: '', gender: '', category: '',
    bloodGroup: '', religion: '', nationality: 'Indian',
    isMarried: false,

    husbandName: '',
    guardianName: '',
    // Aadhar
    aadharNumber: '', aadharName: '',

    // SSC
    sscSchoolName: '', sscBoard: '', sscYOP: '',
    sscRollNumber: '', sscObtainedMarks: '', sscTotalMarks: '',
    sscPercentage: '', sscGrade: '',

    // HSC
    hscCollegeName: '', hscBoard: '', hscStream: '', hscYOP: '',
    hscRollNumber: '', hscMedium: '', hscObtainedMarks: '',
    hscTotalMarks: '', hscPercentage: '', hscGrade: '',

    // Gap
    hasGap: false, gapFromYear: '', gapToYear: '', gapTotalYears: '', gapReason: '',

    // Course & Year
    courseType: '',      // 'BA' or 'BSc'
    admissionYear: '',   // '1st Year' / '2nd Year' / '3rd Year'
    course: '',          // backend course _id
    primarySubject: '',
    optionalSubjects: '',

    // Previous college (2nd / 3rd year)
    prevCollegeName: '', prevCollegeYear: '', tcNumber: '',
    prevYearObtainedMarks: '', prevYearTotalMarks: '', prevYearPercentage: '',

    // Bank
    bankAccountHolder: '', bankAccountNumber: '', bankIFSC: '',
    bankName: '', bankBranch: '',

    // Guardian
    fatherName: '', motherName: '', guardianPhone: '',
    familyIncome: '',

    // Caste
    casteCertificateNo: '', casteCertificateAuthority: '',
    hasCasteValidity: false, casteValidity: '', casteValidityDate: '',

    // Extra
    referralSource: '', message: '', reference: '',
    declaration: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    studentPhoto: null, signaturePhoto: null, aadharPhoto: null,
    sscMarksheet: null, hscMarksheet: null, prevYearMarksheet: null,
    gapCertificate: null, casteCertificate: null, casteValidityCertificate: null,
    marriageCertificate: null, bankPassbook: null,
    domicileCertificate: null, incomeCertificate: null, transferCertificate: null,
    gapyeardocument: null,
    aparIdDocument: null,
  });

  const [uploadPreviews, setUploadPreviews] = useState({
    studentPhoto: '', signaturePhoto: '', aadharPhoto: '',
    sscMarksheet: '', hscMarksheet: '', prevYearMarksheet: '',
    gapCertificate: '', casteCertificate: '', casteValidityCertificate: '',
    marriageCertificate: '', bankPassbook: '',
    domicileCertificate: '', incomeCertificate: '', transferCertificate: '',
    gapyeardocument: '',
    aparIdDocument: '',
  });

  /* ============================================================
     Load courses + prefill user
     ============================================================ */
  useEffect(() => {
    API.get('/courses').then(res => {
      const list = res.data.courses || [];
      setCourses(list);
      const params = new URLSearchParams(window.location.search);
      const courseType = params.get('course');
      if (courseType) {
        const matched = list.find(c => c.type === courseType);
        if (matched) {
          setFormData(prev => ({ ...prev, course: matched._id, courseType: matched.type }));
          if (user) setActiveTab('apply');
        }
      }
    }).catch(() => {});

    if (user) {
      setFormData(prev => ({
        ...prev,
        applicantName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  /* Auto-calc gap years */
  useEffect(() => {
    if (formData.hasGap && formData.gapFromYear && formData.gapToYear) {
      const from = parseInt(formData.gapFromYear);
      const to = parseInt(formData.gapToYear);
      if (to >= from) {
        setFormData(prev => ({ ...prev, gapTotalYears: (to - from + 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, gapTotalYears: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasGap, formData.gapFromYear, formData.gapToYear]);

  /* Auto-calc previous year percentage */
  useEffect(() => {
    const obt = parseFloat(formData.prevYearObtainedMarks);
    const tot = parseFloat(formData.prevYearTotalMarks);
    if (obt && tot && tot > 0 && obt <= tot) {
      setFormData(prev => ({ ...prev, prevYearPercentage: ((obt / tot) * 100).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, prevYearPercentage: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.prevYearObtainedMarks, formData.prevYearTotalMarks]);

  /* When courseType changes → map to backend _id + reset subject */
  useEffect(() => {
    if (formData.courseType && courses.length > 0) {
      const matched = courses.find(c => c.type === formData.courseType);
      if (matched) {
        setFormData(prev => ({ ...prev, course: matched._id, primarySubject: '' }));
      } else {
        setFormData(prev => ({ ...prev, primarySubject: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.courseType, courses]);

  /* ============================================================
     HELPERS
     ============================================================ */
  const calculateGrade = (percentage) => {
    const pct = parseFloat(percentage);
    if (isNaN(pct)) return '';
    if (pct >= 75) return 'Distinction';
    if (pct >= 60) return 'First Class';
    if (pct >= 45) return 'Second Class';
    return 'Pass Class';
  };

  const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sscYOP') {
      setFormData({ ...formData, [name]: value, hscYOP: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSscMarksChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (updated.sscObtainedMarks && updated.sscTotalMarks) {
      if (Number(updated.sscObtainedMarks) > Number(updated.sscTotalMarks)) {
        setSscError('❌ Obtained marks cannot be more than total marks!');
      } else {
        setSscError('');
        const pct = ((updated.sscObtainedMarks / updated.sscTotalMarks) * 100).toFixed(2);
        updated.sscPercentage = pct;
        updated.sscGrade = calculateGrade(pct);
      }
    }
    setFormData(updated);
  };

  const handleHscMarksChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (updated.hscObtainedMarks && updated.hscTotalMarks) {
      if (Number(updated.hscObtainedMarks) > Number(updated.hscTotalMarks)) {
        setHscError('❌ Obtained marks cannot be more than total marks!');
      } else {
        setHscError('');
        const pct = ((updated.hscObtainedMarks / updated.hscTotalMarks) * 100).toFixed(2);
        updated.hscPercentage = pct;
        updated.hscGrade = calculateGrade(pct);
      }
    }
    setFormData(updated);
  };

  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    const maxSize = FILE_LIMITS[fieldName];
    if (maxSize && file.size > maxSize) {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: `❌ File too large! Max ${formatLimit(maxSize)} allowed. Your file: ${(file.size / 1024).toFixed(1)} KB.`
      }));
      setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
      setUploadPreviews(prev => ({ ...prev, [fieldName]: '' }));
      return;
    }
    setFileErrors(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreviews(prev => ({ ...prev, [fieldName]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSubmit triggered');
    setError('');
    setSuccess('');

    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!user) {
      console.warn('❌ No user logged in');
      setError('Please login before submitting the application.');
      setActiveTab('process');
      return;
    }
    if (!formData.declaration) { setError('Please accept the declaration to submit.'); scrollTop(); return; }
    if (sscError || hscError) { setError('Please fix marks validation errors before submitting.'); scrollTop(); return; }
    if (!formData.phone || formData.phone.length !== 10) { setError('Please enter a valid 10 digit mobile number.'); scrollTop(); return; }
    if (formData.guardianPhone && formData.guardianPhone.length !== 10) { setError('Please enter a valid 10 digit guardian mobile number.'); scrollTop(); return; }
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12) { setError('Please enter a valid 12 digit Aadhar number.'); scrollTop(); return; }

    // New address field validations
    if (!formData.houseNumber.trim()) { setError('Please enter House Number.'); scrollTop(); return; }
    if (!formData.streetArea.trim()) { setError('Please enter Street / Area.'); scrollTop(); return; }
    if (!formData.subdistrict.trim()) { setError('Please enter Subdistrict / Tehsil.'); scrollTop(); return; }
    if (!formData.cityTownVillage.trim()) { setError('Please enter City / Town / Village.'); scrollTop(); return; }
    if (!formData.district.trim()) { setError('Please enter District.'); scrollTop(); return; }
    if (!formData.state.trim()) { setError('Please select State.'); scrollTop(); return; }
    if (!formData.pincode || formData.pincode.length !== 6) { setError('Please enter a valid 6 digit pincode.'); scrollTop(); return; }

    // APAR ID validation
    if (!formData.aparIdNumber.trim()) { setError('Please enter APAR ID Number.'); scrollTop(); return; }
    if (!uploadedFiles.aparIdDocument) { setError('Please upload APAR ID Document.'); scrollTop(); return; }

    if (!formData.courseType || !formData.admissionYear) { setError('Please select Course and Admission Year.'); scrollTop(); return; }
    if (formData.bankIFSC && !validateIFSC(formData.bankIFSC)) {
      setError('Please enter a valid IFSC code (format: SBIN0001234).');
      scrollTop(); return;
    }
    if (Object.keys(fileErrors).length > 0) {
      setError('Please fix file upload errors before submitting.');
      scrollTop(); return;
    }

    const requiredDocs = {
      studentPhoto: 'Student Passport Photo',
      signaturePhoto: 'Student Signature',
      aadharPhoto: 'Aadhaar Card',
      sscMarksheet: 'SSC (10th) Marksheet',
      hscMarksheet: 'HSC (12th) Marksheet',
    };
    for (const [key, label] of Object.entries(requiredDocs)) {
      if (!uploadedFiles[key]) {
        setError(`Please upload ${label} before submitting.`);
        scrollTop(); return;
      }
    }
    console.log('✅ All required documents uploaded');

    if (formData.admissionYear === '2nd Year' || formData.admissionYear === '3rd Year') {
      if (!uploadedFiles.prevYearMarksheet) {
        setError(`Please upload Previous Year Marksheet (required for ${formData.admissionYear}).`);
        scrollTop(); return;
      }
      if (!uploadedFiles.transferCertificate) {
        setError('Please upload Transfer Certificate / TC (required for direct admission).');
        scrollTop(); return;
      }
    }

    if (formData.hasGap && !uploadedFiles.gapyeardocument) {
      setError('Please upload Gap Year Document.');
      scrollTop(); return;
    }
    if (formData.category && formData.category !== 'general' && !uploadedFiles.casteCertificate) {
      setError('Please upload Caste Certificate.');
      scrollTop(); return;
    }
    if (formData.isMarried && !uploadedFiles.marriageCertificate) {
      setError('Please upload Marriage Certificate.');
      scrollTop(); return;
    }

    console.log('✅ All validations passed — building FormData');
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== '') {
          submitData.append(key, typeof val === 'boolean' ? String(val) : val);
        }
      });
      Object.keys(uploadedFiles).forEach((key) => {
        if (uploadedFiles[key]) {
          submitData.append(key, uploadedFiles[key]);
          console.log(`📎 File appended: ${key} → ${uploadedFiles[key].name}`);
        }
      });

      // Do NOT set Content-Type manually — axios sets multipart/form-data + boundary automatically
      console.log('📤 POSTing to /admissions...');
      const response = await API.post('/admissions', submitData);
      console.log('📥 Response:', response.data);

      if (response.data.success) {
        setSuccess('✅ Application submitted successfully! Redirecting to dashboard...');
        scrollTop();
        setTimeout(() => navigate('/student/dashboard'), 2500);
      } else {
        setError(response.data.message || 'Submission failed. Please try again.');
        scrollTop();
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit. Please check your connection and try again.';
      setError(msg);
      scrollTop();
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = Array.from({ length: 15 }, (_, i) => 2026 - i);
  const isDirectAdmission = formData.admissionYear === '2nd Year' || formData.admissionYear === '3rd Year';

  // Enquiry form submit handler
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess('');

    if (!enquiryData.studentFullName.trim()) {
      setEnquiryError('Please enter your full name.');
      return;
    }
    if (!enquiryData.gender) {
      setEnquiryError('Please select your gender.');
      return;
    }
    if (!enquiryData.email.trim()) {
      setEnquiryError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryData.email)) {
      setEnquiryError('Please enter a valid email address.');
      return;
    }
    if (!enquiryData.phone.trim() || enquiryData.phone.length !== 10) {
      setEnquiryError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setEnquiryLoading(true);
    try {
      const payload = {
        studentFullName: enquiryData.studentFullName.trim(),
        gender: enquiryData.gender,
        email: enquiryData.email.trim(),
        phone: enquiryData.phone.trim(),
        dateOfBirth: '2000-01-01', // default placeholder (backend requires it)
        notes: enquiryData.message.trim(),
      };
      const res = await API.post('/enquiries', payload);
      if (res.data.success) {
        setEnquirySuccess('✅ Enquiry submitted successfully! Our staff will contact you soon.');
        setEnquiryData({ studentFullName: '', gender: '', email: '', phone: '', message: '' });
      } else {
        setEnquiryError(res.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setEnquiryError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div>
      <Navbar />

      <div className="page-header">
        <h1>Admissions 2025-26</h1>
        <p>Join Late Kalpana Chawla Mahila Senior Science &amp; Arts College, Gangakhed</p>
      </div>

      <section className="admissions-tabs container">

        <div className="tab-buttons">
          <button className={activeTab === 'process' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('process')}>📋 Admission Process</button>
          <button className={activeTab === 'dates' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('dates')}>📅 Important Dates</button>
          <button className={activeTab === 'documents' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('documents')}>📄 Documents Required</button>
          <button className={activeTab === 'apply' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('apply')}>✍️ Apply Online</button>
          <button className={activeTab === 'enquiry' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('enquiry')}>💬 Enquiry Form</button>
        </div>

        {/* ============= PROCESS TAB ============= */}
        {activeTab === 'process' && (
          <div className="tab-content">
            <h2>Admission Process</h2>
            <div className="process-steps">
              {[
                { step: '01', title: 'Register / Login', desc: 'First create your account on our website. Click Register and fill your basic details. If you already have an account, login directly.' },
                { step: '02', title: 'Fill Application Form', desc: 'Complete the online application form with personal details, academic information and Aadhar details.' },
                { step: '03', title: 'Upload Documents', desc: 'Upload required documents: Aadhar Card, SSC/HSC Marksheets, Photo, Signature, Caste Certificate (if applicable).' },
                { step: '04', title: 'Submit & Pay Fees', desc: 'Submit your application. After approval by admin, pay the admission fees at the college office.' },
                { step: '05', title: 'Check Status', desc: 'Login to your student dashboard to check your application status — Pending, Approved or Rejected.' },
              ].map((item, i) => (
                <div className="process-step" key={i}>
                  <div className="step-number">{item.step}</div>
                  <div className="step-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <div className="auth-prompt-card auth-prompt-info">
                <p className="auth-prompt-title">🔐 You need to login or register before applying</p>
                <div className="auth-prompt-actions">
                  <a href="/register" className="btn btn-primary">📝 Register Now</a>
                  <a href="/login" className="btn btn-secondary">🔑 Login</a>
                </div>
              </div>
            )}
            {user && (
              <div className="auth-prompt-card auth-prompt-success">
                <p className="auth-prompt-title success">✅ You are logged in as {user.name}! Ready to apply.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('apply')}>✍️ Start Application</button>
              </div>
            )}
          </div>
        )}

        {/* ============= DATES TAB ============= */}
        {activeTab === 'dates' && (
          <div className="tab-content">
            <h2>Important Dates 2025-26</h2>
            <div className="dates-table">
              {[
                { event: 'Application Form Available', date: 'June 1, 2026' },
                { event: 'Last Date to Apply', date: 'July 15, 2026' },
                { event: 'First Merit List', date: 'July 20, 2026' },
                { event: 'Admission Confirmation', date: 'July 20-25, 2026' },
                { event: 'Second Merit List', date: 'July 28, 2026' },
                { event: 'Commencement of Classes', date: 'August 1, 2026' },
                { event: 'Last Date for Admission', date: 'August 15, 2026' },
              ].map((item, i) => (
                <div className="date-row" key={i}>
                  <span className="date-event">{item.event}</span>
                  <span className="date-value">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============= DOCUMENTS TAB ============= */}
        {activeTab === 'documents' && (
          <div className="tab-content">
            <h2>Documents Required</h2>
            <div className="documents-grid">
              {[
                { icon: '📸', title: 'Student Photo', desc: 'Recent passport size photo (Max 250 KB)' },
                { icon: '✍️', title: 'Signature', desc: 'Signature on white paper (Max 100 KB)' },
                { icon: '🪪', title: 'Aadhar Card', desc: 'Clear photo or PDF of Aadhar card' },
                { icon: '📄', title: '10th Marksheet', desc: 'SSC marksheet copy' },
                { icon: '📄', title: '12th Marksheet', desc: 'HSC marksheet copy' },
                { icon: '🏦', title: 'Bank Passbook', desc: 'Student bank account first page' },
                { icon: '🏠', title: 'Domicile Certificate', desc: 'Maharashtra domicile certificate' },
                { icon: '💰', title: 'Income Certificate', desc: 'Family income certificate' },
                { icon: '📜', title: 'Leaving Certificate / TC', desc: 'School/college leaving certificate' },
                { icon: '📋', title: 'Caste Certificate', desc: 'Required for reserved category' },
                { icon: '💍', title: 'Marriage Certificate', desc: 'Required for married students' },
                { icon: '📅', title: 'Gap Certificate', desc: 'Only for gap year students' },
              ].map((doc, i) => (
                <div className="document-card" key={i}>
                  <span className="doc-icon">{doc.icon}</span>
                  <div>
                    <h4>{doc.title}</h4>
                    <p>{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============= APPLY TAB ============= */}
        {activeTab === 'apply' && (
          <div className="tab-content">
            <h2>Online Application Form</h2>

            {!user && (
              <div className="login-required-card">
                <p className="login-required-icon">🔐</p>
                <h3>Login Required</h3>
                <p className="login-required-text">You must be logged in to submit the application form.</p>
                <div className="auth-prompt-actions">
                  <a href="/register" className="btn btn-primary">📝 Register Now</a>
                  <a href="/login" className="btn btn-secondary">🔑 Login</a>
                </div>
              </div>
            )}

            {user && (
              <>
                {success && <div className="form-success">{success}</div>}
                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="apply-form-card">

                  {/* ===== PERSONAL INFO ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">👤 Personal Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="applicantName" placeholder="As per Aadhar card"
                          value={formData.applicantName} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" name="dateOfBirth"
                          value={formData.dateOfBirth} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                          <option value="">Select Gender</option>
                           <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                          <option value="">Select Category</option>
                          <option value="general">General</option>
                          <option value="sc">SC</option>
                          <option value="st">ST</option>
                          <option value="obc">OBC</option>
                          <option value="nt">NT</option>
                          <option value="vjnt">VJNT</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                          <option value="">Select</option>
                          <option value="A+">A+</option><option value="A-">A-</option>
                          <option value="B+">B+</option><option value="B-">B-</option>
                          <option value="O+">O+</option><option value="O-">O-</option>
                          <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Religion</label>
                        <select name="religion" value={formData.religion} onChange={handleChange}>
                          <option value="">Select</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Muslim">Muslim</option>
                          <option value="Christian">Christian</option>
                          <option value="Sikh">Sikh</option>
                          <option value="Buddhist">Buddhist</option>
                          <option value="Jain">Jain</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nationality *</label>
                        <input type="text" name="nationality"
                          value={formData.nationality} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Mobile Number *</label>
                        <input type="tel" placeholder="10 digit mobile number"
                          value={formData.phone}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setFormData({ ...formData, phone: val });
                          }} required />
                        {formData.phone && formData.phone.length < 10 && (
                          <small className="inline-error">Enter 10 digit number</small>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input type="email" name="email" placeholder="Your email"
                          value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>

               {/* Marital Status */}
<div className="checkbox-row">
  <label className="checkbox-label">
    <input
      type="checkbox"
      checked={formData.isMarried}
      onChange={e =>
        setFormData({
          ...formData,
          isMarried: e.target.checked
        })
      }
    />
    <span>💍 I am married</span>
  </label>
</div>

{/* Husband Full Name - only if married */}
{formData.isMarried && (
  <div className="form-group">
    <label>Husband Full Name</label>
    <input
      type="text"
      placeholder="Enter Husband Full Name"
      value={formData.husbandName || ''}
      onChange={(e) =>
        setFormData({
          ...formData,
          husbandName: e.target.value
        })
      }
    />
  </div>
)}

{/* Guardian Full Name */}
<div className="form-group">
  <label>Guardian Full Name</label>
  <input
    type="text"
    placeholder="Enter Guardian Full Name"
    value={formData.guardianName || ''}
    onChange={(e) =>
      setFormData({
        ...formData,
        guardianName: e.target.value
      })
    }
  />
</div>

</div>
                 {/* ===== GUARDIAN ===== */}
<div className="form-section">
  <h3 className="form-section-title">
    👨‍👩‍👧 Guardian / Parent Details
  </h3>

  <div className="form-row">
    <div className="form-group">
      <label>Father's Name *</label>
      <input
        type="text"
        name="fatherName"
        placeholder="Father's full name"
        value={formData.fatherName}
        onChange={handleChange}
        required
      />
    </div>

    <div className="form-group">
      <label>Mother's Name *</label>
      <input
        type="text"
        name="motherName"
        placeholder="Mother's full name"
        value={formData.motherName}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Guardian's Mobile *</label>
      <input
        type="tel"
        placeholder="10 digit mobile number"
        value={formData.guardianPhone}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 10) {
            setFormData({
              ...formData,
              guardianPhone: val
            });
          }
        }}
        required
      />
      {formData.guardianPhone &&
        formData.guardianPhone.length < 10 && (
          <small className="inline-error">
            Enter 10 digit number
          </small>
      )}
    </div>

    <div className="form-group">
      <label>Annual Family Income</label>
      <select
        name="familyIncome"
        value={formData.familyIncome}
        onChange={handleChange}
      >
        <option value="">Select Range</option>
        <option value="below1lakh">
          Below ₹1 Lakh
        </option>
        <option value="1to2.5lakh">
          ₹1 - 2.5 Lakh
        </option>
        <option value="2.5to5lakh">
          ₹2.5 - 5 Lakh
        </option>
        <option value="above5lakh">
          Above ₹5 Lakh
        </option>
      </select>
    </div>
  </div>
</div> 
                  {/* ===== ADDRESS ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">🏠 Address Details</h3>

                    {/* Row 1: House Number + Street/Area */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>House Number *</label>
                        <input
                          type="text"
                          name="houseNumber"
                          placeholder="e.g. 12, Flat No. 3"
                          value={formData.houseNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Street / Area *</label>
                        <input
                          type="text"
                          name="streetArea"
                          placeholder="e.g. Gandhi Nagar, Main Road"
                          value={formData.streetArea}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Row 2: Subdistrict + City/Town/Village */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subdistrict / Tehsil *</label>
                        <input
                          type="text"
                          name="subdistrict"
                          placeholder="e.g. Gangakhed"
                          value={formData.subdistrict}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>City / Town / Village *</label>
                        <input
                          type="text"
                          name="cityTownVillage"
                          placeholder="e.g. Gangakhed"
                          value={formData.cityTownVillage}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Row 3: District + State */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>District *</label>
                        <input
                          type="text"
                          name="district"
                          placeholder="e.g. Parbhani"
                          value={formData.district}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Ladakh">Ladakh</option>
                          <option value="Lakshadweep">Lakshadweep</option>
                          <option value="Puducherry">Puducherry</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Pincode (single field, half-width) */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="pincode"
                          placeholder="6 digit pincode"
                          value={formData.pincode}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 6) setFormData({ ...formData, pincode: val });
                          }}
                          maxLength={6}
                          required
                        />
                        {formData.pincode && formData.pincode.length < 6 && (
                          <small className="inline-error">Enter 6 digit pincode</small>
                        )}
                      </div>
                      <div className="form-group" />
                    </div>
                  </div>
                  {/* ===== AADHAR ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">🪪 Aadhar Verification</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Aadhar Card Number *</label>
                        <input type="text" placeholder="12 digit Aadhar number"
                          value={formData.aadharNumber}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 12) setFormData({ ...formData, aadharNumber: val });
                          }}
                          maxLength="12" required />
                        <small className="field-hint">Enter 12 digits without spaces</small>
                      </div>
                      <div className="form-group">
                        <label>Name on Aadhar *</label>
                        <input type="text" name="aadharName" placeholder="Exactly as on Aadhar card"
                          value={formData.aadharName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="info-note">
                      <span>ℹ️</span>
                      <p>Your Aadhar details are kept confidential as per government guidelines.</p>
                    </div>
                  </div>

                  {/* ===== APAAR ID ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">🪪 APAAR ID Details</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>APAAR ID Number *</label>
                        <input
                          type="text"
                          name="APAARIdNumber"
                          placeholder="Enter your APAAR ID number"
                          value={formData.APAARIdNumber}
                          onChange={handleChange}
                          required
                        />
                        <small className="field-hint">APAAR ID is issued by the government for academic records.</small>
                      </div>
                      <div className="form-group" />
                    </div>
                    <div className="upload-grid-two">
                      <FileUploadBox
                        fieldName="apaarIdDocument"
                        label="📋 APAAR ID Document"
                        accept="image/*,.pdf"
                        required={true}
                        hint="JPG, PNG or PDF · Max 1 MB"
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    </div>
                    <div className="info-note">
                      <span>ℹ️</span>
                      <p>Upload a clear copy of your APAAR ID document (front page). Accepted formats: JPG, PNG, PDF.</p>
                    </div>
                  </div>

                  {/* ===== SSC ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📗 SSC — 10th Standard Details</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>School Name *</label>
                        <input type="text" name="sscSchoolName" placeholder="Full name of your school"
                          value={formData.sscSchoolName} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Board *</label>
                        <select name="sscBoard" value={formData.sscBoard} onChange={handleChange} required>
                          <option value="">Select Board</option>
                          <option value="Maharashtra State Board">Maharashtra State Board</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Year of Passing *</label>
                        <select name="sscYOP" value={formData.sscYOP} onChange={handleChange} required>
                          <option value="">Select Year</option>
                          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Seat / Roll Number</label>
                        <input type="text" name="sscRollNumber" placeholder="Exam seat number"
                          value={formData.sscRollNumber} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Marks Obtained *</label>
                        <input type="number" placeholder="e.g. 420" min="0" required
                          value={formData.sscObtainedMarks}
                          onChange={e => handleSscMarksChange('sscObtainedMarks', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Total Marks *</label>
                        <input type="number" placeholder="e.g. 600" min="0" required
                          value={formData.sscTotalMarks}
                          onChange={e => handleSscMarksChange('sscTotalMarks', e.target.value)} />
                      </div>
                    </div>
                    {sscError && <div className="marks-error">{sscError}</div>}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Percentage (Auto)</label>
                        <input type="text" value={formData.sscPercentage} readOnly
                          placeholder="Auto calculated"
                          className={formData.sscPercentage ? 'auto-filled' : ''} />
                      </div>
                      <div className="form-group">
                        <label>Grade / Class (Auto)</label>
                        <input type="text" value={formData.sscGrade} readOnly
                          placeholder="Auto calculated"
                          className={formData.sscGrade ? 'auto-filled' : ''} />
                      </div>
                    </div>
                    {formData.sscPercentage && !sscError && (
                      <div className="auto-calc">
                        ✅ <strong>{formData.sscPercentage}%</strong> — <strong>{formData.sscGrade}</strong>
                      </div>
                    )}
                  </div>

                  {/* ===== HSC ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📘 HSC — 12th Standard Details</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>College Name *</label>
                        <input type="text" name="hscCollegeName" placeholder="Full name of your junior college"
                          value={formData.hscCollegeName} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Board *</label>
                        <select name="hscBoard" value={formData.hscBoard} onChange={handleChange} required>
                          <option value="">Select Board</option>
                          <option value="Maharashtra State Board">Maharashtra State Board</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Stream *</label>
                        <select name="hscStream" value={formData.hscStream} onChange={handleChange} required>
                          <option value="">Select Stream</option>
                          <option value="Arts">Arts</option>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Vocational">Vocational</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Year of Passing *</label>
                        <select name="hscYOP" value={formData.hscYOP} onChange={handleChange} required disabled={!formData.sscYOP}>
                          <option value="">{formData.sscYOP ? 'Select Year' : 'Select SSC year first'}</option>
                          {yearOptions
                            .filter(y => !formData.sscYOP || y > parseInt(formData.sscYOP))
                            .map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {formData.sscYOP && (
                          <small className="field-hint">💡 Must be after SSC year ({formData.sscYOP})</small>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Seat / Roll Number</label>
                        <input type="text" name="hscRollNumber" placeholder="Exam seat number"
                          value={formData.hscRollNumber} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Medium of Instruction</label>
                        <select name="hscMedium" value={formData.hscMedium} onChange={handleChange}>
                          <option value="">Select Medium</option>
                          <option value="Marathi">Marathi</option>
                          <option value="Hindi">Hindi</option>
                          <option value="English">English</option>
                          <option value="Urdu">Urdu</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Marks Obtained *</label>
                        <input type="number" placeholder="e.g. 350" min="0" required
                          value={formData.hscObtainedMarks}
                          onChange={e => handleHscMarksChange('hscObtainedMarks', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Total Marks *</label>
                        <input type="number" placeholder="e.g. 500" min="0" required
                          value={formData.hscTotalMarks}
                          onChange={e => handleHscMarksChange('hscTotalMarks', e.target.value)} />
                      </div>
                    </div>
                    {hscError && <div className="marks-error">{hscError}</div>}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Percentage (Auto)</label>
                        <input type="text" value={formData.hscPercentage} readOnly
                          placeholder="Auto calculated"
                          className={formData.hscPercentage ? 'auto-filled' : ''} />
                      </div>
                      <div className="form-group">
                        <label>Grade / Class (Auto)</label>
                        <input type="text" value={formData.hscGrade} readOnly
                          placeholder="Auto calculated"
                          className={formData.hscGrade ? 'auto-filled' : ''} />
                      </div>
                    </div>
                    {formData.hscPercentage && !hscError && (
                      <div className="auto-calc">
                        ✅ <strong>{formData.hscPercentage}%</strong> — <strong>{formData.hscGrade}</strong>
                      </div>
                    )}
                  </div>

                  {/* ===== GAP YEAR ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📅 Gap Year Information</h3>
                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={formData.hasGap}
                          onChange={e => setFormData({
                            ...formData, hasGap: e.target.checked,
                            gapFromYear: e.target.checked ? formData.gapFromYear : '',
                            gapToYear: e.target.checked ? formData.gapToYear : '',
                            gapTotalYears: e.target.checked ? formData.gapTotalYears : '',
                            gapReason: e.target.checked ? formData.gapReason : '',
                          })} />
                        <span>I have a gap year between my education</span>
                      </label>
                    </div>

                    {formData.hasGap && (
                      <div className="conditional-block">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Gap From Year *</label>
                            <select name="gapFromYear" value={formData.gapFromYear}
                              onChange={handleChange} required>
                              <option value="">Select Year</option>
                              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Gap To Year *</label>
                            <select name="gapToYear" value={formData.gapToYear}
                              onChange={handleChange} required disabled={!formData.gapFromYear}>
                              <option value="">{formData.gapFromYear ? 'Select Year' : 'Select From year first'}</option>
                              {yearOptions
                                .filter(y => !formData.gapFromYear || y >= parseInt(formData.gapFromYear))
                                .map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        {formData.gapTotalYears && (
                          <div className="auto-calc">
                            ✅ Total Gap: <strong>{formData.gapTotalYears} year(s)</strong>
                          </div>
                        )}
                        <div className="form-group">
                          <label>Reason for Gap *</label>
                          <select name="gapReason" value={formData.gapReason}
                            onChange={handleChange} required>
                            <option value="">Select Reason</option>
                            <option value="health">Health Issues</option>
                            <option value="family">Family Reasons</option>
                            <option value="financial">Financial Reasons</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="info-note warning-note">
                          <span>⚠️</span>
                          <p>Gap certificate is mandatory for students with gap year.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== COURSE & YEAR SELECTION ===== */}
                  <div className="form-section highlight-section">
                    <h3 className="form-section-title">📚 Course &amp; Year Selection</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Course *</label>
                        <select name="courseType" value={formData.courseType}
                          onChange={handleChange} required>
                          <option value="">Select Course</option>
                          <option value="BA">Bachelor of Arts (BA)</option>
                          <option value="BSc">Bachelor of Science (BSc)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Admission Year *</label>
                        <select name="admissionYear" value={formData.admissionYear}
                          onChange={handleChange} required>
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year (Fresh)</option>
                          <option value="2nd Year">2nd Year (Direct)</option>
                          <option value="3rd Year">3rd Year (Direct)</option>
                        </select>
                      </div>
                    </div>

                    {formData.courseType && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Primary Subject / Specialization *</label>
                          <select name="primarySubject" value={formData.primarySubject}
                            onChange={handleChange} required>
                            <option value="">Select Subject</option>
                            {(SUBJECTS_BY_COURSE[formData.courseType] || []).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <small className="field-hint">
                            💡 Subjects available for {formData.courseType}
                          </small>
                        </div>
                        <div className="form-group">
                          <label>Optional Subjects</label>
                          <input type="text" name="optionalSubjects"
                            placeholder="e.g. English, Marathi (comma separated)"
                            value={formData.optionalSubjects} onChange={handleChange} />
                        </div>
                      </div>
                    )}

                    {/* Direct Admission - Previous College */}
                    {isDirectAdmission && (
                      <div className="conditional-block">
                        <div className="info-note warning-note">
                          <span>📌</span>
                          <p>
                            You selected <strong>{formData.admissionYear}</strong> (direct admission).
                            Please provide your previous college details.
                          </p>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Previous College Name *</label>
                            <input type="text" name="prevCollegeName"
                              placeholder="Full name of previous college"
                              value={formData.prevCollegeName}
                              onChange={handleChange} required />
                          </div>
                          <div className="form-group">
                            <label>Previous Year (Passing) *</label>
                            <select name="prevCollegeYear" value={formData.prevCollegeYear}
                              onChange={handleChange} required>
                              <option value="">Select Year</option>
                              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>TC Number *</label>
                            <input type="text" name="tcNumber"
                              placeholder="Transfer Certificate number"
                              value={formData.tcNumber} onChange={handleChange} required />
                          </div>
                          <div className="form-group">
                            <label>Percentage (Auto)</label>
                            <input type="text" value={formData.prevYearPercentage} readOnly
                              placeholder="Auto calculated"
                              className={formData.prevYearPercentage ? 'auto-filled' : ''} />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Previous Year Marks Obtained *</label>
                            <input type="number" name="prevYearObtainedMarks" min="0"
                              placeholder="e.g. 480"
                              value={formData.prevYearObtainedMarks}
                              onChange={handleChange} required />
                          </div>
                          <div className="form-group">
                            <label>Previous Year Total Marks *</label>
                            <input type="number" name="prevYearTotalMarks" min="0"
                              placeholder="e.g. 600"
                              value={formData.prevYearTotalMarks}
                              onChange={handleChange} required />
                          </div>
                        </div>
                        <div className="upload-grid-two">
                          <FileUploadBox fieldName="prevYearMarksheet"
                            label="📄 Previous Year Marksheet"
                            accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                          <FileUploadBox fieldName="transferCertificate"
                            label="📜 Transfer Certificate (TC)"
                            accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== CASTE CERTIFICATE ===== */}
                  {['sc', 'st', 'obc', 'nt', 'vjnt'].includes(formData.category) && (
                    <div className="form-section">
                      <h3 className="form-section-title">📋 Caste Certificate Details</h3>
                      <div className="info-note warning-note">
                        <span>ℹ️</span>
                        <p>You belong to reserved category. Please provide caste certificate details.</p>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Caste Certificate Number</label>
                          <input type="text" name="casteCertificateNo"
                            placeholder="Certificate number"
                            value={formData.casteCertificateNo} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Issuing Authority</label>
                          <input type="text" name="casteCertificateAuthority"
                            placeholder="e.g. Tehsildar, Gangakhed"
                            value={formData.casteCertificateAuthority} onChange={handleChange} />
                        </div>
                      </div>
                      <FileUploadBox fieldName="casteCertificate" label="📋 Caste Certificate"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />

                      <div className="checkbox-row">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={formData.hasCasteValidity}
                            onChange={e => setFormData({ ...formData, hasCasteValidity: e.target.checked })} />
                          <span>I have a Caste Validity Certificate</span>
                        </label>
                      </div>

                      {formData.hasCasteValidity && (
                        <div className="conditional-block">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Validity Certificate Number</label>
                              <input type="text" name="casteValidity"
                                placeholder="Validity certificate number"
                                value={formData.casteValidity} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Valid Until</label>
                              <input type="date" name="casteValidityDate"
                                value={formData.casteValidityDate} onChange={handleChange} />
                            </div>
                          </div>
                          <FileUploadBox fieldName="casteValidityCertificate"
                            label="✅ Caste Validity Certificate" accept="image/*,.pdf" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== BANK DETAILS ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">🏦 Bank Account Details</h3>
                    <p className="section-subtitle">Required for scholarship and refund processing</p>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input type="text" name="bankAccountHolder"
                          placeholder="As per bank passbook"
                          value={formData.bankAccountHolder} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Account Number *</label>
                        <input type="text" name="bankAccountNumber"
                          placeholder="Bank account number"
                          value={formData.bankAccountNumber}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 18) setFormData({ ...formData, bankAccountNumber: val });
                          }} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>IFSC Code *</label>
                        <input type="text" name="bankIFSC"
                          placeholder="e.g. SBIN0001234"
                          value={formData.bankIFSC}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            if (val.length <= 11) setFormData({ ...formData, bankIFSC: val });
                          }}
                          maxLength="11" />
                        {formData.bankIFSC && formData.bankIFSC.length === 11 && !validateIFSC(formData.bankIFSC) && (
                          <small className="inline-error">Invalid IFSC format</small>
                        )}
                        {formData.bankIFSC && validateIFSC(formData.bankIFSC) && (
                          <small className="success-hint">✅ Valid IFSC</small>
                        )}
                        <small className="field-hint">11 chars: 4 letters + 0 + 6 alphanumeric</small>
                      </div>
                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input type="text" name="bankName"
                          placeholder="e.g. State Bank of India"
                          value={formData.bankName} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Branch Name</label>
                      <input type="text" name="bankBranch"
                        placeholder="e.g. Gangakhed Main Branch"
                        value={formData.bankBranch} onChange={handleChange} />
                    </div>
                  </div>

                  {/* ===== ADDITIONAL DOCS ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📂 Additional Supporting Documents</h3>
                    <p className="section-subtitle">Recommended for scholarship and verification</p>
                    <div className="upload-grid-two">
                      <FileUploadBox fieldName="domicileCertificate"
                        label="🏠 Domicile Certificate" accept="image/*,.pdf" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadBox fieldName="incomeCertificate"
                        label="💰 Income Certificate" accept="image/*,.pdf" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  </div>
                   {/* ===== PHOTO & SIGNATURE ===== */}
               <div className="form-section">
                    <h3 className="form-section-title">📸 Photo &amp; Signature</h3>
                    <div className="upload-grid-two">
                      <FileUploadBox fieldName="studentPhoto" label="📸 Student Passport Photo"
                        accept="image/*" required={true} hint="Passport size, JPG/PNG" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadBox fieldName="signaturePhoto" label="✍️ Student Signature"
                        accept="image/*" required={true} hint="Sign on white paper, JPG/PNG" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    </div>
                    {formData.isMarried && (
                      <FileUploadBox fieldName="marriageCertificate" label="💍 Marriage Certificate"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    )}
                  </div>

                  {/* ===== UPLOAD DOCUMENTS ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📄 Upload Documents</h3>
                    <div className="upload-grid-two">
                      <FileUploadBox fieldName="aadharPhoto" label="🪪 Aadhaar Card Upload"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadBox fieldName="sscMarksheet" label="📄 SSC Marksheet Upload"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    </div>
                    <div className="upload-grid-two">
                      <FileUploadBox fieldName="hscMarksheet" label="📄 HSC Marksheet Upload"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                      <FileUploadBox fieldName="bankPassbook" label="🏦 Bank Passbook Upload"
                        accept="image/*,.pdf" 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    </div>
                    {formData.hasGap && (
                      <FileUploadBox fieldName="gapyeardocument" label="📅 Gap Year Document Upload"
                        accept="image/*,.pdf" required={true} 
                        uploadedFiles={uploadedFiles}
                        uploadPreviews={uploadPreviews}
                        fileErrors={fileErrors}
                        onFileChange={handleFileChange}
                      />
                    )}
                  </div> 
                    {/* ===== ADDITIONAL INFO ===== */}
                  <div className="form-section">
                    <h3 className="form-section-title">📝 Additional Information</h3>
                    <div className="form-group">
                      <label>How did you hear about us?</label>
                      <select name="referralSource" value={formData.referralSource} onChange={handleChange}>
                        <option value="">Select option</option>
                        <option value="friend">Friend / Relative</option>
                        <option value="school">School Teacher</option>
                        <option value="social_media">Social Media</option>
                        <option value="newspaper">Newspaper</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Additional Message</label>
                      <textarea name="message" rows="3"
                        placeholder="Any special requirements..."
                        value={formData.message} onChange={handleChange} />
                    </div>
                  </div>
{/* ===== REFERENCE TAB ===== */}
<div className="form-section">
  <h3 className="form-section-title">🔖 Reference</h3>

  <textarea
    name="reference"
    placeholder="Type reference details here..."
    value={formData.reference}
    onChange={handleChange}
    rows={8}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "15px",
      outline: "none",
      resize: "vertical"
    }}
  />
</div>      
                   {/* ===== DECLARATION ===== */}
                  <div className="form-section declaration-section">
                    <h3 className="form-section-title">✅ Declaration</h3>
                    <div className="declaration-box">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={formData.declaration}
                          onChange={e => setFormData({ ...formData, declaration: e.target.checked })} />
                        <span>
                          I hereby declare that all information provided is true and correct.
                          I understand that false information may result in cancellation of admission.
                          I agree to abide by all rules and regulations of Late Kalpana Chawla
                          Mahila Senior Science &amp; Arts College, Gangakhed.
                        </span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                    {loading ? '⏳ Submitting Application...' : '🚀 Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ============= ENQUIRY TAB ============= */}
        {activeTab === 'enquiry' && (
          <div className="tab-content">
            <h2>💬 Admission Enquiry Form</h2>
            <p style={{ color: '#555', marginBottom: '24px', fontSize: '15px' }}>
              Have questions about admissions? Fill this form and our Student Section staff will contact you shortly.
            </p>

            {enquirySuccess && (
              <div className="form-success" style={{ marginBottom: '20px' }}>
                {enquirySuccess}
              </div>
            )}
            {enquiryError && (
              <div className="form-error" style={{ marginBottom: '20px' }}>
                {enquiryError}
              </div>
            )}

            <div className="apply-form-card" style={{ maxWidth: '620px' }}>
              <div className="form-section">
                <h3 className="form-section-title">📋 Your Details</h3>

                {/* Full Name */}
                <div className="form-group">
                  <label>Full Name (As Per 12th Marksheet) *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name exactly as on 12th marksheet"
                    value={enquiryData.studentFullName}
                    onChange={e => setEnquiryData({ ...enquiryData, studentFullName: e.target.value })}
                  />
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    value={enquiryData.gender}
                    onChange={e => setEnquiryData({ ...enquiryData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email ID *</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={enquiryData.email}
                    onChange={e => setEnquiryData({ ...enquiryData, email: e.target.value })}
                  />
                </div>

                {/* Mobile */}
                <div className="form-group">
                  <label>Mobile No. *</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={enquiryData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setEnquiryData({ ...enquiryData, phone: val });
                    }}
                  />
                  {enquiryData.phone && enquiryData.phone.length < 10 && (
                    <small className="inline-error">Enter 10 digit number</small>
                  )}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label>Message / Your Query</label>
                  <textarea
                    rows="4"
                    placeholder="Write your question or message here (e.g. which course to choose, fee structure, documents needed, etc.)"
                    value={enquiryData.message}
                    onChange={e => setEnquiryData({ ...enquiryData, message: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  onClick={handleEnquirySubmit}
                  disabled={enquiryLoading}
                  className="btn btn-primary submit-btn"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {enquiryLoading ? '⏳ Submitting...' : '📨 Submit Enquiry'}
                </button>

                <div className="info-note" style={{ marginTop: '16px' }}>
                  <span>ℹ️</span>
                  <p>Our Student Section staff will review your enquiry and contact you within 1-2 working days.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
      <Footer />
    </div>
  );
};

export default Admissions;
