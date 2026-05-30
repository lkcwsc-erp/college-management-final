import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLLEGE_NAME = 'Late Kalpana Chawla Mahila College';
const COLLEGE_SUBTITLE = 'Senior Science & Arts College, Gangakhed';
const COLLEGE_UPI = 'lkcwsc@upi';

// ─── Official Fee Structure 2025-26 (from SNDT University circular) ───────────
const OFFICIAL_FEES = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    semesters: {
      'Sem I':   29927, 'Sem II':  750,
      'Sem III': 28207, 'Sem IV':  750,
      'Sem V':   27842, 'Sem VI':  2850,
    },
    breakdown: {
      'Sem I': [
        { label: 'Sports Fee', amt: 250 },
        { label: 'Students Development Fee', amt: 225 },
        { label: 'Students Diary Fee', amt: 50 },
        { label: 'CHETNA Fee', amt: 20 },
        { label: 'Library Fee (Database)', amt: 100 },
        { label: 'E-Suvidha Fee', amt: 100 },
        { label: 'Disaster Management Fee', amt: 10 },
        { label: 'Ashwamedh & Avishkar Fees', amt: 30 },
        { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Eligibility Fee', amt: 400 },
        { label: 'Enrolment Fee', amt: 400 },
        { label: 'Examination Fee', amt: 750 },
        { label: 'Practical Exam Fee', amt: 500 },
        { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 },
        { label: 'Tuition Fee', amt: 16500 },
        { label: 'Gymkhana Fee', amt: 700 },
        { label: 'Laboratory Fee', amt: 5250 },
        { label: 'Development Fee', amt: 500 },
        { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 100 },
        { label: 'Annual Miscellaneous Fee', amt: 250 },
        { label: 'Project Fee', amt: 0 },
        { label: 'Magazine Fee', amt: 75 },
        { label: 'Placement Fee', amt: 0 },
        { label: 'Library Fee (College)', amt: 1000 },
        { label: 'Extra-Curricular / Activity Fee', amt: 365 },
        { label: 'Computer Training Fees', amt: 300 },
        { label: 'Subject Association Fee', amt: 200 },
        { label: 'Laboratory Deposit', amt: 300 },
        { label: 'Caution Money Deposit', amt: 100 },
        { label: 'Library Deposit', amt: 500 },
      ],
      'Sem II':  [{ label: 'Enrolment Fee', amt: 750 }],
      'Sem III': [
        { label: 'Sports Fee', amt: 250 }, { label: 'Students Development Fee', amt: 225 },
        { label: 'Students Diary Fee', amt: 50 }, { label: 'Library Fee (Database)', amt: 100 },
        { label: 'E-Suvidha Fee', amt: 100 }, { label: 'Disaster Management Fee', amt: 10 },
        { label: 'Ashwamedh & Avishkar Fees', amt: 30 }, { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Examination Fee', amt: 750 }, { label: 'Practical Exam Fee', amt: 500 },
        { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 }, { label: 'Tuition Fee', amt: 16500 },
        { label: 'Gymkhana Fee', amt: 700 }, { label: 'Laboratory Fee', amt: 5250 },
        { label: 'Development Fee', amt: 500 }, { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 100 }, { label: 'Annual Miscellaneous Fee', amt: 250 },
        { label: 'Magazine Fee', amt: 75 }, { label: 'Library Fee (College)', amt: 1000 },
        { label: 'Extra-Curricular / Activity Fee', amt: 365 }, { label: 'Computer Training Fees', amt: 300 },
        { label: 'Subject Association Fee', amt: 200 },
      ],
      'Sem IV':  [{ label: 'Enrolment Fee', amt: 750 }],
      'Sem V': [
        { label: 'Sports Fee', amt: 250 }, { label: 'Students Development Fee', amt: 225 },
        { label: 'CHETNA Fee', amt: 100 }, { label: 'Library Fee (Database)', amt: 100 },
        { label: 'Disaster Management Fee', amt: 10 }, { label: 'Ashwamedh & Avishkar Fees', amt: 30 },
        { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Examination Fee', amt: 750 }, { label: 'Practical Exam Fee', amt: 500 },
        { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 }, { label: 'Tuition Fee', amt: 16500 },
        { label: 'Gymkhana Fee', amt: 700 }, { label: 'Laboratory Fee', amt: 5250 },
        { label: 'Development Fee', amt: 500 }, { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 250 }, { label: 'Project Fee', amt: 75 },
        { label: 'Placement Fee', amt: 1000 }, { label: 'Extra-Curricular / Activity Fee', amt: 300 },
        { label: 'Computer Training Fees', amt: 200 },
      ],
      'Sem VI': [
        { label: 'Enrolment Fee', amt: 750 }, { label: 'University Development Fund', amt: 200 },
        { label: 'Passing Certificate Fee', amt: 700 }, { label: 'Convocation Fee', amt: 100 },
        { label: 'Magazine Fee', amt: 500 }, { label: 'Library Fee (College)', amt: 500 },
        { label: 'Annual Field Work/Edu/Indus/Visit', amt: 100 },
      ],
    },
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    semesters: {
      '1st Sem': 13877, '2nd Sem': 750,
      '3rd Sem': 11957, '4th Sem': 750,
      '5th Sem': 12092, '6th Sem': 2450,
    },
    breakdown: {
      '1st Sem': [
        { label: 'Sports Fee', amt: 250 }, { label: 'Students Development Fee', amt: 225 },
        { label: 'Students Diary Fee', amt: 50 }, { label: 'CHETNA Fee', amt: 20 },
        { label: 'Library Fee (Database)', amt: 100 }, { label: 'E-Suvidha Fee', amt: 100 },
        { label: 'Disaster Management Fee', amt: 10 }, { label: 'Ashwamedh & Avishkar Fees', amt: 30 },
        { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Eligibility Fee', amt: 400 }, { label: 'Enrolment Fee', amt: 400 },
        { label: 'Examination Fee', amt: 750 }, { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 }, { label: 'Tuition Fee', amt: 5500 },
        { label: 'Gymkhana Fee', amt: 700 },
        { label: 'Laboratory Fee (Psychology/Geography)', amt: 300 },
        { label: 'Development Fee', amt: 500 }, { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 100 }, { label: 'Annual Miscellaneous Fee', amt: 250 },
        { label: 'Project Fee', amt: 0 }, { label: 'Magazine Fee', amt: 75 },
        { label: 'Placement Fee', amt: 1000 }, { label: 'Computer Training Fee', amt: 500 },
        { label: 'Extra-Curricular / Activity Fee', amt: 365 },
        { label: 'Subject Association Fee', amt: 200 },
        { label: 'Laboratory Deposit', amt: 500 },
        { label: 'Caution Money Deposit', amt: 100 },
        { label: 'Library Deposit', amt: 500 },
      ],
      '2nd Sem': [{ label: 'Enrolment Fee', amt: 750 }],
      '3rd Sem': [
        { label: 'Sports Fee', amt: 250 }, { label: 'Students Development Fee', amt: 225 },
        { label: 'Students Diary Fee', amt: 50 }, { label: 'Library Fee (Database)', amt: 100 },
        { label: 'E-Suvidha Fee', amt: 100 }, { label: 'Disaster Management Fee', amt: 10 },
        { label: 'Ashwamedh & Avishkar Fees', amt: 30 }, { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Examination Fee', amt: 750 }, { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 }, { label: 'Tuition Fee', amt: 5500 },
        { label: 'Gymkhana Fee', amt: 700 }, { label: 'Laboratory Fee (Psychology/Geography)', amt: 300 },
        { label: 'Development Fee', amt: 500 }, { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 100 }, { label: 'Annual Miscellaneous Fee', amt: 250 },
        { label: 'Magazine Fee', amt: 75 }, { label: 'Placement Fee', amt: 1000 },
        { label: 'Annual Field Work/Edu/Indus/Visit', amt: 500 },
        { label: 'Extra-Curricular / Activity Fee', amt: 365 }, { label: 'Subject Association Fee', amt: 200 },
      ],
      '4th Sem': [{ label: 'Enrolment Fee', amt: 750 }],
      '5th Sem': [
        { label: 'Sports Fee', amt: 250 }, { label: 'Students Development Fee', amt: 225 },
        { label: 'CHETNA Fee', amt: 100 }, { label: 'Library Fee (Database)', amt: 100 },
        { label: 'Disaster Management Fee', amt: 10 }, { label: 'Ashwamedh & Avishkar Fees', amt: 30 },
        { label: 'Swami Vivekanand Yuva Suraksha Yojana', amt: 62 },
        { label: 'Examination Fee', amt: 500 }, { label: 'Central Information Access', amt: 120 },
        { label: 'Admission Fee (College)', amt: 550 }, { label: 'Tuition Fee', amt: 5500 },
        { label: 'Gymkhana Fee', amt: 700 }, { label: 'Laboratory Fee (Psychology/Geography)', amt: 300 },
        { label: 'Development Fee', amt: 500 }, { label: 'Medical Fee', amt: 100 },
        { label: 'Identity Card Fee', amt: 250 }, { label: 'Project Fee', amt: 75 },
        { label: 'Placement Fee', amt: 1000 }, { label: 'Library Fee (College)', amt: 50 },
        { label: 'Computer Training Fee', amt: 100 },
        { label: 'Extra-Curricular / Activity Fee', amt: 200 },
        { label: 'Annual Field Work/Edu/Indus/Visit', amt: 500 },
      ],
      '6th Sem': [
        { label: 'Enrolment Fee', amt: 750 }, { label: 'University Development Fund', amt: 200 },
        { label: 'Passing Certificate Fee', amt: 700 }, { label: 'Convocation Fee', amt: 100 },
        { label: 'Magazine Fee', amt: 50 }, { label: 'Library Fee (College)', amt: 50 },
        { label: 'Annual Field Work/Edu/Indus/Visit', amt: 100 },
        { label: 'Computer Training Fee', amt: 100 },
      ],
    },
  },
};

// Helper — detect course type from admission data
const detectCourse = (adm) => {
  const ct = (adm.courseType || adm.course?.name || '').toLowerCase();
  if (ct.includes('b.sc') || ct.includes('bsc') || ct.includes('science')) return 'B.Sc.';
  if (ct.includes('b.a') || ct.includes('ba') || ct.includes('arts')) return 'B.A.';
  return null;
};

// Map admissionYear to semesters
const getSemesters = (courseKey, year) => {
  const course = OFFICIAL_FEES[courseKey];
  if (!course) return [];
  const allSems = Object.keys(course.semesters);
  if (!year) return allSems;
  if (year === '1st Year') return allSems.slice(0, 2);
  if (year === '2nd Year') return allSems.slice(2, 4);
  if (year === '3rd Year') return allSems.slice(4, 6);
  return allSems;
};

const DEFAULT_DOC_FEES = {
  BONAFIDE:  { label: '📋 Bonafide Certificate',      price: 30 },
  ID_CARD:   { label: '🪪 ID Card',                   price: 100 },
  MARKSHEET: { label: '📄 Marksheet',                 price: 50 },
  MIGRATION: { label: '📜 Migration Certificate',     price: 200 },
  TC:        { label: '🎓 Transfer Certificate (TC)', price: 150 },
};

const FEE_TYPES = [
  { key: 'admission',    label: '🎓 Admission Fee' },
  { key: 'exam',         label: '📝 Exam Fee' },
  { key: 'tc',           label: '📄 TC Fee' },
  { key: 'bonafide',     label: '📋 Bonafide Fee' },
  { key: 'degree',       label: '🏅 Degree Fee' },
  { key: 'migration',    label: '📜 Migration Fee' },
  { key: 'development',  label: '🏗️ Development Fee' },
  { key: 'library',      label: '📚 Library Fee' },
  { key: 'penalty',      label: '⚠️ Penalty' },
  { key: 'dues',         label: '💸 Dues / Arrears' },
  { key: 'other',        label: '➕ Other Fee' },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const loadDocFees = () => {
  try {
    const s = localStorage.getItem('lkcwsc_doc_fees');
    if (s) return { ...DEFAULT_DOC_FEES, ...JSON.parse(s) };
  } catch (_) {}
  return { ...DEFAULT_DOC_FEES };
};
const saveDocFees = (fees) => localStorage.setItem('lkcwsc_doc_fees', JSON.stringify(fees));

// ─── Receipt printer ──────────────────────────────────────────────────────────
// ─── Academic year helper ─────────────────────────────────────────────────────
const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${String(year + 1).slice(2)}` : `${year - 1}-${String(year).slice(2)}`;
};

// ─── ERP Verification number ──────────────────────────────────────────────────
const genVerificationNo = () => 'ERP' + Date.now().toString(36).toUpperCase().slice(-8);

// ─── Receipt printer (official format per LKCWSC document) ───────────────────
const printReceipt = (data) => {
  const vNo = genVerificationNo();
  const acadYear = data.academicYear || getAcademicYear();
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html><html><head><title>Fee Receipt — ${data.receiptNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#e8eaf6;padding:30px;display:flex;justify-content:center;align-items:flex-start}
    .page{background:white;max-width:520px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}
    /* Letterhead */
    .letterhead{border-bottom:4px double #1a237e;padding:18px 24px 12px;text-align:center}
    .trust{font-size:11px;color:#555;letter-spacing:0.5px;margin-bottom:2px}
    .college{font-size:18px;font-weight:bold;color:#1a237e;letter-spacing:0.5px;line-height:1.2;margin-bottom:3px}
    .affil{font-size:10.5px;color:#333;margin-bottom:2px}
    .contact{font-size:10px;color:#555}
    /* Title bar */
    .title-bar{background:#1a237e;color:white;text-align:center;padding:8px;font-size:14px;font-weight:bold;letter-spacing:2px}
    /* Body */
    .body{padding:18px 24px}
    /* Sections */
    .section-title{font-size:10.5px;font-weight:bold;color:#1a237e;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1a237e;padding-bottom:3px;margin:14px 0 8px}
    table{width:100%;border-collapse:collapse;margin-bottom:4px}
    td{padding:5px 8px;font-size:12px;border:1px solid #c5cae9}
    td:first-child{background:#e8eaf6;font-weight:600;color:#283593;width:42%}
    td:last-child{color:#111}
    /* Amount box */
    .amount-section{background:#e8f5e9;border:2px solid #2E7D32;border-radius:4px;padding:12px 16px;margin:14px 0;display:flex;justify-content:space-between;align-items:center}
    .amount-label{font-size:11px;color:#1b5e20;font-weight:600;text-transform:uppercase;letter-spacing:1px}
    .amount-value{font-size:26px;font-weight:bold;color:#1b5e20}
    /* PAID stamp */
    .paid-wrap{text-align:right;margin-top:4px}
    .paid-stamp{display:inline-block;border:3px solid #2E7D32;color:#2E7D32;font-size:16px;font-weight:bold;padding:4px 16px;transform:rotate(-6deg);letter-spacing:5px;opacity:0.85}
    /* Verification */
    .verify{background:#fafafa;border:1px dashed #9fa8da;border-radius:3px;padding:8px 12px;margin-top:12px;font-size:9.5px;color:#555;text-align:center}
    .verify code{font-family:monospace;font-size:10px;color:#1a237e;font-weight:bold}
    /* Footer */
    .footer{border-top:2px solid #e8eaf6;padding:10px 24px;display:flex;justify-content:space-between;align-items:flex-end;font-size:10px;color:#555;margin-top:8px}
    .footer .sig{text-align:center}
    .footer .sig-line{border-top:1px solid #555;width:120px;margin:18px auto 4px}
    @media print{
      body{background:white;padding:0}
      .page{box-shadow:none;max-width:100%}
    }
  </style></head>
  <body><div class="page">
    <div class="letterhead">
      <div class="trust">Vidya-Niketan Sevabhavi Sanstha's</div>
      <div class="college">Late Kalpana Chawla Women's Senior College (LKCWSC)</div>
      <div class="affil">Affiliated to SNDT Women's University, Mumbai</div>
      <div class="contact">Gangakhed, Maharashtra &nbsp;|&nbsp; Contact: +91 9307162914 &nbsp;|&nbsp; lkcwsc.vnssorg.com</div>
    </div>
    <div class="title-bar">✦ FEE RECEIPT ✦</div>
    <div class="body">
      <div class="section-title">Receipt Details</div>
      <table>
        <tr><td>Receipt No</td><td><strong>${data.receiptNo}</strong></td></tr>
        <tr><td>Date</td><td>${dateStr}</td></tr>
        <tr><td>Academic Year</td><td>${acadYear}</td></tr>
      </table>
      <div class="section-title">Student Details</div>
      <table>
        <tr><td>Student Name</td><td>${data.studentName}</td></tr>
        ${data.prnNumber ? `<tr><td>PRN Number</td><td>${data.prnNumber}</td></tr>` : ''}
        ${data.studentId  ? `<tr><td>Student ID</td><td>${data.studentId}</td></tr>` : ''}
        ${data.branch     ? `<tr><td>Course &amp; Year</td><td>${data.branch}${data.year ? ' — ' + data.year : ''}</td></tr>` : ''}
      </table>
      <div class="section-title">Payment Details</div>
      <table>
        <tr><td>Fee Type</td><td>${data.feeLabel}</td></tr>
        ${data.semester   ? `<tr><td>Semester</td><td>${data.semester}</td></tr>` : ''}
        <tr><td>Payment Mode</td><td>${data.paymentMode === 'online' ? 'Online / UPI' : 'Cash'}</td></tr>
        ${data.transactionId ? `<tr><td>Transaction ID / UTR</td><td>${data.transactionId}</td></tr>` : ''}
        ${data.scholarshipDeduction > 0 ? `<tr><td>Scholarship Deduction</td><td>− ₹${Number(data.scholarshipDeduction).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td>Payment Status</td><td><strong style="color:#2E7D32">PAID ✓</strong></td></tr>
      </table>
      <div class="amount-section">
        <div><div class="amount-label">Amount Paid</div><div style="font-size:10px;color:#388e3c;margin-top:2px">Rupees ${amountInWords(data.amount)} Only</div></div>
        <div class="amount-value">₹${Number(data.amount).toLocaleString('en-IN')}/-</div>
      </div>
      <div class="paid-wrap"><span class="paid-stamp">PAID</span></div>
      <div class="verify">
        ERP Verification No: <code>${vNo}</code> &nbsp;|&nbsp; Collected by: <strong>${data.collectedBy}</strong>
      </div>
    </div>
    <div class="footer">
      <div style="font-size:9px;color:#888">*This is a computer-generated receipt. Valid without signature.<br/>Generated through LKCWSC ERP System</div>
      <div class="sig">
        <div class="sig-line"></div>
        <div>Accounts Section</div>
        <div style="font-size:9px;color:#888">LKCWSC</div>
      </div>
    </div>
  </div>
  <scri${'pt'}>
    function amtWords(n){return n;} // placeholder
    window.onload=()=>{window.print();}
  </scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=580,height=820');
  w.document.write(html);
  w.document.close();
};

// ─── Amount in words (simple Indian system) ───────────────────────────────────
const amountInWords = (num) => {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const inWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n/100)] + ' Hundred ' + inWords(n%100);
    if (n < 100000) return inWords(Math.floor(n/1000)) + 'Thousand ' + inWords(n%1000);
    if (n < 10000000) return inWords(Math.floor(n/100000)) + 'Lakh ' + inWords(n%100000);
    return inWords(Math.floor(n/10000000)) + 'Crore ' + inWords(n%10000000);
  };
  return inWords(Math.floor(num)).trim() || 'Zero';
};

const genReceiptNo = () => {
  const y = new Date().getFullYear();
  const seq = Date.now().toString().slice(-4);
  return `REC${y}-${seq}`;
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const docStatusStyle = (status) => {
  const map = {
    pending_accounts:     { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Review' },
    rejected_by_accounts: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    pending_principal:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Forwarded to Principal' },
    pending_generation:   { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved → Student Section' },
    completed:            { bg: '#e3f2fd', color: '#1565C0', label: '🏁 Completed' },
  };
  return map[status] || { bg: '#f5f5f5', color: '#666', label: status };
};

// ─── Small reusable Field ─────────────────────────────────────────────────────
const F = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
    <span style={{ color: '#888', fontWeight: 600 }}>{label}</span>
    <span style={{ color: '#222', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AccountsSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home');

  // ── Global message ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: '' }); // type: 'success'|'error'
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // ── Document requests ──────────────────────────────────────────────────────
  const [docRequests, setDocRequests]     = useState([]);
  const [docLoading, setDocLoading]       = useState(false);
  const [docSearch, setDocSearch]         = useState('');
  const [docFilter, setDocFilter]         = useState('pending_accounts');
  const [selectedDoc, setSelectedDoc]     = useState(null);
  const [docAction, setDocAction]         = useState(''); // 'collect' | 'reject'
  const [docNotes, setDocNotes]           = useState('');
  const [docLoading2, setDocLoading2]     = useState(false);
  const [payMode, setPayMode]             = useState('cash');
  const [txnId, setTxnId]                = useState('');
  const [docFees, setDocFees]             = useState(loadDocFees());
  const [editDocFees, setEditDocFees]     = useState(false);
  const [docFeeEdits, setDocFeeEdits]     = useState({});

  // ── Admission fees ─────────────────────────────────────────────────────────
  const [admissions, setAdmissions]         = useState([]);
  const [admLoading, setAdmLoading]         = useState(false);
  const [admSearch, setAdmSearch]           = useState('');
  const [admFilter, setAdmFilter]           = useState('all'); // 'all'|'paid'|'unpaid'
  const [selectedAdm, setSelectedAdm]       = useState(null);
  const [admPayMode, setAdmPayMode]         = useState('cash');
  const [admTxnId, setAdmTxnId]             = useState('');
  const [admFeeAmt, setAdmFeeAmt]           = useState('');
  const [admFeeType, setAdmFeeType]         = useState('admission');
  const [admSelectedSem, setAdmSelectedSem] = useState('');
  const [admScholarshipAmt, setAdmScholarshipAmt] = useState('');
  const [admLoading2, setAdmLoading2]       = useState(false);



  // ── College expenses ───────────────────────────────────────────────────────
  const [expenses, setExpenses]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_expenses') || '[]'); } catch { return []; }
  });
  const [expForm, setExpForm]               = useState({ description: '', amount: '', date: '', category: 'other', paidTo: '' });
  const [expMsg, setExpMsg]                 = useState('');

  // ── Payment history (from localStorage) ──────────────────────────────────
  const [payHistory, setPayHistory]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_pay_history') || '[]'); } catch { return []; }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Data fetchers
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDocRequests = useCallback(async () => {
    setDocLoading(true);
    try {
      const res = await API.get('/document-requests/accounts/all');
      setDocRequests(res.data.requests || []);
    } catch { /* silent */ }
    finally { setDocLoading(false); }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    setAdmLoading(true);
    try {
      const res = await API.get('/admissions/accounts-section/all');
      setAdmissions(res.data.admissions || []);
    } catch { /* silent */ }
    finally { setAdmLoading(false); }
  }, []);

  useEffect(() => {
    fetchDocRequests();
    fetchAdmissions();
  }, [fetchDocRequests, fetchAdmissions]);

  const handleLogout = () => { logout(); navigate('/'); };

  // ─────────────────────────────────────────────────────────────────────────
  // Document request actions
  // ─────────────────────────────────────────────────────────────────────────
  const closeDocModal = () => {
    setSelectedDoc(null); setDocAction(''); setDocNotes('');
    setPayMode('cash'); setTxnId('');
  };

  const handleDocReject = async () => {
    if (!docNotes.trim()) { showToast('Please enter rejection reason.', 'error'); return; }
    setDocLoading2(true);
    try {
      await API.put(`/document-requests/accounts/reject/${selectedDoc._id}`, { reason: docNotes });
      showToast('Request rejected.');
      closeDocModal(); fetchDocRequests();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setDocLoading2(false); }
  };

  const handleDocCollect = async () => {
    if (payMode === 'online' && !txnId.trim()) {
      showToast('Please enter Transaction ID for online payment.', 'error'); return;
    }
    setDocLoading2(true);
    try {
      await API.put(`/document-requests/accounts/approve/${selectedDoc._id}`, {
        notes: `Fees collected. Mode: ${payMode}${txnId ? '. TxnID: ' + txnId : ''}`
      });
      const fee = docFees[selectedDoc.documentType]?.price ?? 0;
      const rNo = genReceiptNo();

      // Save to history
      const entry = {
        id: rNo, date: new Date().toISOString(),
        studentName: selectedDoc.studentName,
        studentEmail: selectedDoc.studentEmail,
        branch: selectedDoc.branch, year: selectedDoc.admissionYear,
        feeLabel: docFees[selectedDoc.documentType]?.label || selectedDoc.documentTypeLabel,
        amount: fee, paymentMode: payMode, transactionId: txnId,
        collectedBy: user?.name || 'Accounts Staff',
        type: 'document',
      };
      const hist = [entry, ...payHistory].slice(0, 200);
      setPayHistory(hist);
      localStorage.setItem('lkcwsc_pay_history', JSON.stringify(hist));

      printReceipt({ ...entry, receiptNo: rNo });
      showToast('Receipt generated & request approved!');
      closeDocModal(); fetchDocRequests();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setDocLoading2(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Admission fee collection
  // ─────────────────────────────────────────────────────────────────────────
  const handleAdmFeeCollect = async () => {
    if (!admFeeAmt || isNaN(Number(admFeeAmt)) || Number(admFeeAmt) <= 0) {
      showToast('Enter a valid fee amount.', 'error'); return;
    }
    if (admPayMode === 'online' && !admTxnId.trim()) {
      showToast('Enter Transaction ID for online payment.', 'error'); return;
    }
    setAdmLoading2(true);
    const rNo = genReceiptNo();
    const feeType = FEE_TYPES.find(f => f.key === admFeeType);
    const courseKey = detectCourse(selectedAdm);
    const course = courseKey ? OFFICIAL_FEES[courseKey] : null;
    const selSemAmt = course && admSelectedSem ? course.semesters[admSelectedSem] : null;
    try {
      await API.put(`/admissions/mark-fees-paid/${selectedAdm._id}`, {
        fees: Number(admFeeAmt),
        paymentMode: admPayMode,
        transactionId: admTxnId,
        receiptNo: rNo,
        collectedBy: user?.name || 'Accounts Staff',
        feeType: admFeeType,
        feeTypeLabel: feeType?.label || 'Fee',
        semester: admSelectedSem || '',
        totalFees: selSemAmt || undefined,
        scholarshipAmount: admScholarshipAmt ? Number(admScholarshipAmt) : undefined,
      });

      const entry = {
        id: rNo, date: new Date().toISOString(),
        studentName: selectedAdm.applicantName,
        studentEmail: selectedAdm.email,
        studentId: selectedAdm.studentId,
        branch: selectedAdm.courseType,
        year: selectedAdm.admissionYear,
        semester: admSelectedSem || '',
        feeLabel: feeType?.label || 'Fee',
        amount: Number(admFeeAmt),
        paymentMode: admPayMode,
        transactionId: admTxnId,
        collectedBy: user?.name || 'Accounts Staff',
        type: 'admission',
        scholarshipDeduction: admScholarshipAmt ? Number(admScholarshipAmt) : 0,
        totalFees: selSemAmt || 0,
      };
      const hist = [entry, ...payHistory].slice(0, 200);
      setPayHistory(hist);
      localStorage.setItem('lkcwsc_pay_history', JSON.stringify(hist));

      printReceipt({ ...entry, receiptNo: rNo });
      showToast('Fee collected & receipt generated!');
      setSelectedAdm(null);
      setAdmFeeAmt(''); setAdmTxnId(''); setAdmPayMode('cash');
      setAdmSelectedSem(''); setAdmScholarshipAmt('');
      fetchAdmissions();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setAdmLoading2(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Expense tracker
  // ─────────────────────────────────────────────────────────────────────────
  const saveExpense = () => {
    if (!expForm.description.trim() || !expForm.amount || !expForm.date) {
      setExpMsg('❌ Fill all required fields.'); return;
    }
    const entry = { ...expForm, id: Date.now(), amount: Number(expForm.amount) };
    const updated = [entry, ...expenses];
    setExpenses(updated);
    localStorage.setItem('lkcwsc_expenses', JSON.stringify(updated));
    setExpForm({ description: '', amount: '', date: '', category: 'other', paidTo: '' });
    setExpMsg('✅ Expense recorded!');
    setTimeout(() => setExpMsg(''), 3000);
  };
  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('lkcwsc_expenses', JSON.stringify(updated));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Derived numbers
  // ─────────────────────────────────────────────────────────────────────────
  const pendingDocCount  = docRequests.filter(r => r.status === 'pending_accounts').length;
  const paidAdmCount     = admissions.filter(a => a.feesPaid).length;
  const unpaidAdmCount   = admissions.filter(a => !a.feesPaid).length;
  const totalCollected   = payHistory.reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpenses    = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const filteredDocs = docRequests.filter(r => {
    const matchFilter = docFilter === 'all' || r.status === docFilter;
    const q = docSearch.toLowerCase();
    const matchSearch = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const filteredAdm = admissions.filter(a => {
    const matchFilter = admFilter === 'all' || (admFilter === 'paid' ? a.feesPaid : !a.feesPaid);
    const q = admSearch.toLowerCase();
    const matchSearch = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Sidebar tabs
  // ─────────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'home',       label: '🏠 Dashboard' },
    { id: 'doc_req',    label: '📄 Document Requests', badge: pendingDocCount },
    { id: 'adm_fees',   label: '🎓 Admission Fees', badge: unpaidAdmCount },
    { id: 'fee_struct', label: '💼 Fee Structure' },
    { id: 'expenses',   label: '🏗️ College Expenses' },
    { id: 'history',    label: '🧾 Payment History' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">💰</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Accounts Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
              {t.label}
              {t.badge > 0 && (
                <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div style={{ margin: '12px 24px 0', padding: '12px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14,
            background: toast.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: toast.type === 'error' ? '#C62828' : '#2E7D32' }}>
            {toast.msg}
          </div>
        )}

        <div className="dashboard-content">

          {/* ════════════════════════ HOME ════════════════════════ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#e8f5e9,#f0fff4)', padding: 20, borderRadius: 12, marginBottom: 20, borderLeft: '5px solid #2E7D32' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: 6 }}>💰 Welcome, {user?.name}!</h3>
                <p style={{ color: '#555' }}>Manage fee collection, document requests, expenses, and receipts.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('doc_req')}>
                  <div className="dash-card-icon">📄</div>
                  <div><h3>{pendingDocCount}</h3><p>Pending Doc Requests</p></div>
                </div>
                <div className="dash-card red" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('adm_fees')}>
                  <div className="dash-card-icon">💸</div>
                  <div><h3>{unpaidAdmCount}</h3><p>Unpaid Admissions</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div><h3>{paidAdmCount}</h3><p>Fees Collected</p></div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">💰</div>
                  <div><h3>₹{totalCollected.toLocaleString('en-IN')}</h3><p>Total Collected (Session)</p></div>
                </div>
              </div>

              {pendingDocCount > 0 && (
                <div style={{ background: '#fff3e0', border: '2px solid #ffb74d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ color: '#E65100', marginBottom: 8 }}>⚠️ {pendingDocCount} Document Request{pendingDocCount > 1 ? 's' : ''} Awaiting!</h3>
                  <p style={{ color: '#555', marginBottom: 14 }}>Students are waiting. Collect fees and generate receipts.</p>
                  <button onClick={() => setActiveTab('doc_req')}
                    style={{ background: '#E65100', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    📄 Review Now →
                  </button>
                </div>
              )}

              <h3 style={{ margin: '24px 0 14px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                {[
                  { label: '📄 Document Requests', sub: 'Collect fees, approve/reject', tab: 'doc_req', tag: 'Active' },
                  { label: '🎓 Admission Fees', sub: 'Collect admission & other fees', tab: 'adm_fees', tag: 'Important' },
                  { label: '💼 Fee Structure', sub: 'Edit document fee amounts', tab: 'fee_struct', tag: 'Settings' },
                  { label: '🏗️ Expenses', sub: 'Record college expenditures', tab: 'expenses', tag: 'Tracking' },
                  { label: '🧾 Payment History', sub: 'View all collected receipts', tab: 'history', tag: 'Records' },
                ].map((item, i) => (
                  <div key={i} className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab(item.tab)}>
                    <span className="notice-tag">{item.tag}</span>
                    <h4>{item.label}</h4>
                    <p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════ DOCUMENT REQUESTS ════════════════════════ */}
          {activeTab === 'doc_req' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📄 Document Requests</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect fees, generate receipts, approve or reject student requests.</p>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name or email..." value={docSearch} onChange={e => setDocSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={docFilter} onChange={e => setDocFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Requests</option>
                  <option value="pending_accounts">⏳ Pending</option>
                  <option value="pending_generation">✅ Approved</option>
                  <option value="pending_principal">🔄 At Principal</option>
                  <option value="completed">🏁 Completed</option>
                  <option value="rejected_by_accounts">❌ Rejected</option>
                </select>
                <button onClick={fetchDocRequests}
                  style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {/* Counts row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total', count: docRequests.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Pending', count: pendingDocCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Approved', count: docRequests.filter(r => ['pending_generation','pending_principal','completed'].includes(r.status)).length, color: '#2E7D32', bg: '#e8f5e9' },
                  { label: 'Rejected', count: docRequests.filter(r => r.status === 'rejected_by_accounts').length, color: '#C62828', bg: '#ffebee' },
                ].map((pill, i) => (
                  <div key={i} style={{ background: pill.bg, color: pill.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
                    {pill.label}: {pill.count}
                  </div>
                ))}
              </div>

              {docLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : filteredDocs.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No requests found</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredDocs.map(req => {
                    const ss = docStatusStyle(req.status);
                    const fee = docFees[req.documentType]?.price ?? 0;
                    const isPending = req.status === 'pending_accounts';
                    return (
                      <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e0e0'}`, borderRadius: 12, padding: 18, borderLeft: `4px solid ${ss.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <h4 style={{ color: '#1565C0', fontSize: 16, margin: 0 }}>{req.documentTypeLabel || req.documentType}</h4>
                              {fee > 0 && <span style={{ background: '#e8f5e9', color: '#2E7D32', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>₹{fee}</span>}
                              {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>⚡ Urgent</span>}
                            </div>
                            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                          </div>
                          <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color }}>{ss.label}</span>
                        </div>

                        <div style={{ background: '#f8faff', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <span><strong>Name:</strong> {req.studentName}</span>
                          <span><strong>Email:</strong> {req.studentEmail}</span>
                          <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                          <span><strong>Year:</strong> {req.admissionYear || 'N/A'}</span>
                          {req.rollNumber && <span><strong>Roll No:</strong> {req.rollNumber}</span>}
                          {req.studentPhone && <span><strong>Phone:</strong> {req.studentPhone}</span>}
                        </div>

                        {req.reason && <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}><strong>Reason:</strong> {req.reason}</p>}
                        {req.documentType === 'TC' && isPending && (
                          <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: 13, color: '#92400e' }}>
                            ⚠️ TC will go to Principal for final approval after fee collection.
                          </div>
                        )}

                        {isPending && (
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={() => { setSelectedDoc(req); setDocAction('collect'); setPayMode('cash'); setTxnId(''); }}
                              style={{ background: '#1565C0', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                              💰 Collect Fee {fee > 0 ? `(₹${fee})` : '(₹0)'}
                            </button>
                            <button onClick={() => { setSelectedDoc(req); setDocAction('reject'); setDocNotes(''); }}
                              style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                              ❌ Reject
                            </button>
                          </div>
                        )}

                        {req.accountsNotes && !isPending && (
                          <p style={{ fontSize: 12, color: '#777', marginTop: 8, fontStyle: 'italic' }}>Notes: {req.accountsNotes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ ADMISSION FEES ════════════════════════ */}
          {activeTab === 'adm_fees' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 Admission Fee Collection</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect admission fees, exam fees, and other dues from enrolled students.</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name, student ID or email..." value={admSearch} onChange={e => setAdmSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={admFilter} onChange={e => setAdmFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Students</option>
                  <option value="unpaid">💸 Fees Pending</option>
                  <option value="paid">✅ Fees Paid</option>
                </select>
                <button onClick={fetchAdmissions}
                  style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Students', count: admissions.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Fees Pending', count: unpaidAdmCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Fees Paid', count: paidAdmCount, color: '#2E7D32', bg: '#e8f5e9' },
                ].map((p, i) => (
                  <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
                    {p.label}: {p.count}
                  </div>
                ))}
              </div>

              {admLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading admissions...</h3></div>
              ) : filteredAdm.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No students found</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 0.8fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
                    {['Student', 'Course / Year', 'Student ID', 'Fees', 'Status', 'Action'].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {filteredAdm.map((adm, idx) => (
                    <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#333', margin: 0 }}>{adm.courseType || 'N/A'}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.admissionYear || '—'}</p>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{adm.studentId || '—'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: adm.fees > 0 ? '#1b5e20' : '#aaa' }}>
                        {adm.fees > 0 ? `₹${adm.fees}` : '—'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, textAlign: 'center',
                        background: adm.feesPaid ? '#e8f5e9' : '#fff3e0',
                        color: adm.feesPaid ? '#2E7D32' : '#E65100' }}>
                        {adm.feesPaid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                      <button onClick={() => { setSelectedAdm(adm); setAdmFeeAmt(''); setAdmTxnId(''); setAdmPayMode('cash'); setAdmFeeType('admission'); setAdmSelectedSem(''); setAdmScholarshipAmt(''); }}
                        style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        💰 Collect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ FEE STRUCTURE ════════════════════════ */}
          {activeTab === 'fee_struct' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: 4 }}>💼 Document Fee Structure</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>Set the fee charged for each document type a student can request.</p>
                </div>
                {!editDocFees ? (
                  <button onClick={() => { setDocFeeEdits(Object.fromEntries(Object.entries(docFees).map(([k, v]) => [k, v.price]))); setEditDocFees(true); }}
                    style={{ background: '#1565C0', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    ✏️ Edit Fees
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => {
                      const updated = { ...docFees };
                      Object.entries(docFeeEdits).forEach(([k, v]) => { updated[k] = { ...updated[k], price: Number(v) || 0 }; });
                      setDocFees(updated); saveDocFees(updated); setEditDocFees(false);
                      showToast('Fee structure saved!');
                    }} style={{ background: '#2E7D32', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      💾 Save
                    </button>
                    <button onClick={() => setEditDocFees(false)}
                      style={{ background: '#eee', color: '#333', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#1565C0', padding: '14px 20px' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Document Type</span>
                  <span style={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>Fee (₹)</span>
                </div>
                {Object.entries(docFees).map(([key, val], idx) => (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                    <span style={{ fontSize: 15, color: '#222', fontWeight: 500 }}>{val.label}</span>
                    {editDocFees ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#555', fontWeight: 600 }}>₹</span>
                        <input type="number" min="0" value={docFeeEdits[key] ?? val.price}
                          onChange={e => setDocFeeEdits(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: 90, padding: '7px 10px', borderRadius: 7, border: '2px solid #1565C0', fontSize: 15, fontWeight: 600, textAlign: 'right', outline: 'none' }} />
                      </div>
                    ) : (
                      <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: val.price > 0 ? '#1565C0' : '#aaa' }}>
                        {val.price > 0 ? `₹ ${val.price}` : '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, background: '#fff8e1', padding: '12px 16px', borderRadius: 10, border: '1px solid #ffe082', fontSize: 13, color: '#7c5e00' }}>
                💡 Changes apply immediately when a student submits a new document request.
              </div>
            </div>
          )}

          {/* ════════════════════════ EXPENSES ════════════════════════ */}
          {activeTab === 'expenses' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🏗️ College Expense Tracker</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Record and monitor college expenditures.</p>

              {/* Add Expense Form */}
              <div className="form-card" style={{ marginBottom: 28 }}>
                <h3>➕ Record New Expense</h3>
                {expMsg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: expMsg.includes('✅') ? '#e8f5e9' : '#ffebee', color: expMsg.includes('✅') ? '#2E7D32' : '#C62828' }}>{expMsg}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label>Description *</label>
                    <input type="text" placeholder="e.g. Stationery purchase" value={expForm.description}
                      onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" min="0" placeholder="e.g. 500" value={expForm.amount}
                      onChange={e => setExpForm({ ...expForm, amount: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={expForm.date}
                      onChange={e => setExpForm({ ...expForm, date: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                      <option value="infrastructure">🏗️ Infrastructure</option>
                      <option value="stationery">📝 Stationery</option>
                      <option value="electricity">💡 Electricity / Utilities</option>
                      <option value="salary">👤 Salary / Wages</option>
                      <option value="events">🎉 Events / Functions</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Paid To / Vendor</label>
                    <input type="text" placeholder="e.g. Sharma Stationery Store" value={expForm.paidTo}
                      onChange={e => setExpForm({ ...expForm, paidTo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                </div>
                <button onClick={saveExpense}
                  style={{ marginTop: 16, background: '#1565C0', color: '#fff', padding: '11px 28px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  💾 Save Expense
                </button>
              </div>

              {/* Expense Summary */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ background: '#e3f2fd', color: '#1565C0', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>
                  Total Expenses: ₹{totalExpenses.toLocaleString('en-IN')}
                </div>
                <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>
                  Records: {expenses.length}
                </div>
              </div>

              {/* Expense List */}
              {expenses.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🏗️</div><h3>No expenses recorded yet</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 0.8fr 0.5fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
                    {['Description', 'Category', 'Date', 'Paid To', 'Amount', ''].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {expenses.map((exp, idx) => (
                    <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 0.8fr 0.5fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                      <span style={{ fontSize: 13, color: '#222', fontWeight: 500 }}>{exp.description}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.category}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.date}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.paidTo || '—'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#C62828' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                      <button onClick={() => deleteExpense(exp.id)}
                        style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ PAYMENT HISTORY ════════════════════════ */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🧾 Payment History</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>All receipts generated in this session.</p>
                </div>
                <div style={{ background: '#e8f5e9', color: '#1b5e20', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 15 }}>
                  Total: ₹{totalCollected.toLocaleString('en-IN')}
                </div>
              </div>

              {payHistory.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🧾</div><h3>No receipts yet</h3><p>Receipts will appear here once you collect fees.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {payHistory.map((p, idx) => (
                    <div key={p.id} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderLeft: '4px solid #2E7D32' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h4 style={{ margin: 0, color: '#1565C0', fontSize: 14 }}>{p.studentName}</h4>
                          <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1565C0', padding: '2px 8px', borderRadius: 10 }}>{p.type === 'admission' ? '🎓 Admission' : '📄 Document'}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{p.feeLabel} • {p.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'} • {new Date(p.date).toLocaleDateString('en-IN')}</p>
                        <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>Receipt: {p.id}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                        <button onClick={() => printReceipt({ ...p, receiptNo: p.id })}
                          style={{ marginTop: 6, background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          🖨️ Reprint
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ════════════ COLLECT DOC FEE MODAL ════════════ */}
      {selectedDoc && docAction === 'collect' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDocModal}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>💰 Collect Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Verify payment, then generate an official receipt.</p>

            {/* Summary */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13 }}>
              <F label="Student" value={selectedDoc.studentName} />
              <F label="Document" value={docFees[selectedDoc.documentType]?.label || selectedDoc.documentTypeLabel} />
              <F label="Branch" value={selectedDoc.branch} />
              <F label="Year" value={selectedDoc.admissionYear} />
              <div style={{ marginTop: 12, background: '#1565C0', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Amount to Collect</span>
                <span style={{ color: '#ffd700', fontWeight: 800, fontSize: 22 }}>₹ {docFees[selectedDoc.documentType]?.price ?? 0}/-</span>
              </div>
            </div>

            {/* Payment mode */}
            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10 }}>Payment Mode</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {['cash', 'online'].map(m => (
                <button key={m} onClick={() => { setPayMode(m); if (m === 'cash') setTxnId(''); }}
                  style={{ flex: 1, padding: 14, borderRadius: 10, border: `2px solid ${payMode === m ? (m === 'cash' ? '#2E7D32' : '#1565C0') : '#ddd'}`,
                    background: payMode === m ? (m === 'cash' ? '#e8f5e9' : '#e8f0fe') : '#fff',
                    color: payMode === m ? (m === 'cash' ? '#1b5e20' : '#1565C0') : '#555',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {m === 'cash' ? '💵 Cash' : '🌐 Online / UPI'}
                </button>
              ))}
            </div>

            {payMode === 'online' && (
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d7f9', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 600, color: '#1565C0', marginBottom: 8 }}>College UPI: <strong>{COLLEGE_UPI}</strong></p>
                <p style={{ fontSize: 13, color: '#444', marginBottom: 12 }}>Ask student to pay ₹{docFees[selectedDoc.documentType]?.price ?? 0} and provide the UTR / Transaction ID:</p>
                <input type="text" placeholder="Transaction ID / UTR No." value={txnId} onChange={e => setTxnId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            {payMode === 'cash' && (
              <div style={{ background: '#f0fff4', border: '1px solid #b2dfdb', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 14, color: '#2e7d32' }}>
                ✅ Collect <strong>₹{docFees[selectedDoc.documentType]?.price ?? 0}/-</strong> cash from the student, then generate the receipt.
              </div>
            )}

            <button onClick={handleDocCollect} disabled={docLoading2 || (payMode === 'online' && !txnId.trim())}
              style={{ width: '100%', background: docLoading2 ? '#aaa' : '#1565C0', color: '#fff', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: docLoading2 ? 'not-allowed' : 'pointer', opacity: (payMode === 'online' && !txnId.trim()) ? 0.5 : 1 }}>
              {docLoading2 ? '⏳ Processing...' : '🖨️ Generate Receipt & Approve'}
            </button>
            <button onClick={closeDocModal} style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ════════════ REJECT DOC MODAL ════════════ */}
      {selectedDoc && docAction === 'reject' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDocModal}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 30, maxWidth: 480, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#C62828', marginBottom: 14 }}>❌ Reject Request</h2>
            <div style={{ background: '#f8faff', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <F label="Student" value={selectedDoc.studentName} />
              <F label="Document" value={selectedDoc.documentTypeLabel} />
            </div>
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea rows="3" placeholder="Explain why this request is being rejected..." value={docNotes} onChange={e => setDocNotes(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleDocReject} disabled={docLoading2}
                style={{ background: '#C62828', color: '#fff', padding: '12px 28px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: docLoading2 ? 'not-allowed' : 'pointer', opacity: docLoading2 ? 0.6 : 1 }}>
                {docLoading2 ? '⏳...' : '❌ Confirm Reject'}
              </button>
              <button onClick={closeDocModal} style={{ background: '#eee', color: '#333', padding: '12px 22px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ ADMISSION FEE MODAL ════════════ */}
      {selectedAdm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelectedAdm(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 620, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>🎓 Collect Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Select semester, apply scholarship deduction, generate receipt.</p>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13 }}>
              <F label="Name"       value={selectedAdm.applicantName} />
              <F label="Student ID" value={selectedAdm.studentId} />
              <F label="Course"     value={selectedAdm.courseType} />
              <F label="Year"       value={selectedAdm.admissionYear} />
            </div>

            {selectedAdm.feeLedger && selectedAdm.feeLedger.length > 0 && (
              <div style={{ background: '#f8faff', borderRadius: 10, border: '1px solid #e0e7ef', marginBottom: 14 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e0e7ef', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#1565C0', fontSize: 13 }}>📋 Payment History</span>
                  <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 700 }}>Total Paid: ₹{(selectedAdm.fees || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedAdm.feeLedger.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                    <span style={{ color: '#555' }}>{p.feeTypeLabel || p.feeType}{p.semester ? ` (${p.semester})` : ''}</span>
                    <span style={{ fontWeight: 700, color: '#1565C0' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Fee Type *</label>
              <select value={admFeeType} onChange={e => { setAdmFeeType(e.target.value); setAdmFeeAmt(''); setAdmSelectedSem(''); }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                {FEE_TYPES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>

            {admFeeType === 'admission' && (() => {
              const courseKey = detectCourse(selectedAdm);
              const course = courseKey ? OFFICIAL_FEES[courseKey] : null;
              const sems = course ? getSemesters(courseKey, selectedAdm.admissionYear) : [];
              return course ? (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontWeight: 700, color: '#1565C0', fontSize: 13, marginBottom: 10 }}>📋 Select Semester — {course.label}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {sems.map(sem => (
                      <button key={sem}
                        onClick={() => {
                          setAdmSelectedSem(sem);
                          const gross = course.semesters[sem];
                          const schol = Number(admScholarshipAmt || 0);
                          setAdmFeeAmt(String(Math.max(0, gross - schol)));
                        }}
                        style={{ padding: '8px 14px', borderRadius: 8, border: `2px solid ${admSelectedSem === sem ? '#1565C0' : '#ddd'}`,
                          background: admSelectedSem === sem ? '#e3f2fd' : '#fff',
                          color: admSelectedSem === sem ? '#1565C0' : '#555',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'center', minWidth: 90 }}>
                        {sem}<br/>
                        <span style={{ fontSize: 14 }}>₹{course.semesters[sem].toLocaleString('en-IN')}</span>
                      </button>
                    ))}
                  </div>
                  {admSelectedSem && course.breakdown?.[admSelectedSem] && (
                    <details style={{ background: '#f8faff', borderRadius: 8, border: '1px solid #e3f2fd', marginBottom: 10 }}>
                      <summary style={{ padding: '10px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#1565C0' }}>
                        📊 Breakdown for {admSelectedSem} (click to expand)
                      </summary>
                      <div style={{ padding: '0 14px 14px' }}>
                        {course.breakdown[admSelectedSem].filter(b => b.amt > 0).map((b, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                            <span style={{ color: '#555' }}>{b.label}</span>
                            <span style={{ fontWeight: 600 }}>₹{b.amt}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontWeight: 800, fontSize: 13, color: '#1565C0', borderTop: '2px solid #1565C0', marginTop: 6 }}>
                          <span>Gross Total</span><span>₹{course.semesters[admSelectedSem].toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div style={{ background: '#fff3e0', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#E65100' }}>⚠️ Course not detected. Enter amount manually.</div>
              );
            })()}

            {admFeeType === 'admission' && (
              <div style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#6A1B9A', marginBottom: 8, fontSize: 13 }}>🏅 Scholarship Deduction (₹)</label>
                <input type="number" min="0" placeholder="0 — leave blank if no scholarship"
                  value={admScholarshipAmt}
                  onChange={e => {
                    setAdmScholarshipAmt(e.target.value);
                    if (admSelectedSem) {
                      const ck = detectCourse(selectedAdm);
                      const cr = ck ? OFFICIAL_FEES[ck] : null;
                      if (cr) setAdmFeeAmt(String(Math.max(0, (cr.semesters[admSelectedSem] || 0) - Number(e.target.value || 0))));
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />

                {admSelectedSem && (() => {
                  const ck = detectCourse(selectedAdm);
                  const cr = ck ? OFFICIAL_FEES[ck] : null;
                  const gross = cr ? (cr.semesters[admSelectedSem] || 0) : 0;
                  const schol = Number(admScholarshipAmt || 0);
                  const payable = Math.max(0, gross - schol);
                  const alreadyPaid = selectedAdm.fees || 0;
                  const balance = Math.max(0, payable - alreadyPaid);
                  return gross > 0 ? (
                    <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, border: '1px solid #ce93d8', overflow: 'hidden' }}>
                      <div style={{ background: '#6A1B9A', padding: '8px 14px' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>💰 Fee Calculation</span>
                      </div>
                      <div style={{ padding: '10px 14px', fontSize: 13 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <span style={{ color: '#555' }}>Gross Semester Fee</span><span style={{ fontWeight: 600 }}>₹{gross.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', color: '#6A1B9A' }}>
                          <span>− Scholarship Deduction</span><span style={{ fontWeight: 600 }}>− ₹{schol.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', color: '#1565C0' }}>
                          <span>= Net Payable</span><span style={{ fontWeight: 700 }}>₹{payable.toLocaleString('en-IN')}</span>
                        </div>
                        {alreadyPaid > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', color: '#2E7D32' }}>
                            <span>− Already Paid</span><span style={{ fontWeight: 600 }}>− ₹{alreadyPaid.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontWeight: 800, fontSize: 15, color: balance === 0 ? '#2E7D32' : '#C62828' }}>
                          <span>{balance === 0 ? '✅ Fully Paid' : '⚠️ Balance Due'}</span>
                          <span>₹{balance.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Amount Collecting Now (₹) *</label>
              <input type="number" min="1" placeholder="Auto-filled from semester selection"
                value={admFeeAmt} onChange={e => setAdmFeeAmt(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 18, fontWeight: 700, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
              <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Edit if collecting partial / installment amount.</p>
            </div>

            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10, fontSize: 13 }}>Payment Mode</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {['cash', 'online'].map(m => (
                <button key={m} onClick={() => { setAdmPayMode(m); if (m === 'cash') setAdmTxnId(''); }}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: `2px solid ${admPayMode === m ? (m === 'cash' ? '#2E7D32' : '#1565C0') : '#ddd'}`,
                    background: admPayMode === m ? (m === 'cash' ? '#e8f5e9' : '#e8f0fe') : '#fff',
                    color: admPayMode === m ? (m === 'cash' ? '#1b5e20' : '#1565C0') : '#555',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {m === 'cash' ? '💵 Cash' : '🌐 Online / UPI'}
                </button>
              ))}
            </div>

            {admPayMode === 'online' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Transaction ID / UTR *</label>
                <input type="text" placeholder="e.g. 403123456789" value={admTxnId} onChange={e => setAdmTxnId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            <button onClick={handleAdmFeeCollect} disabled={admLoading2 || !admFeeAmt || (admPayMode === 'online' && !admTxnId.trim())}
              style={{ width: '100%', background: admLoading2 ? '#aaa' : '#1565C0', color: '#fff', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: admLoading2 ? 'not-allowed' : 'pointer',
                opacity: (!admFeeAmt || (admPayMode === 'online' && !admTxnId.trim())) ? 0.5 : 1 }}>
              {admLoading2 ? '⏳ Processing...' : '🖨️ Generate Receipt'}
            </button>
            <button onClick={() => setSelectedAdm(null)} style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsSectionDashboard;
