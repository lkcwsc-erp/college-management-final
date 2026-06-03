import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

// ─── Constants ────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const COLLEGE_NAME = 'Late Kalpana Chawla Women\'s Senior College (LKCWSC)';
// eslint-disable-next-line no-unused-vars
const COLLEGE_SUBTITLE = 'Senior Science & Arts College, Gangakhed';
const COLLEGE_UPI = 'lkcwsc@upi';

// ─── Full itemized fee structure from SNDT 2025-26 ────────────────────────────
const DETAILED_FEES = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    items: [
      // Sr, Name, Section, Sem1, Sem2, Sem3, Sem4, Sem5, Sem6
      { id:'bsc_s1',  name:'Sports Fee',                        section:'University', s:[250,0,250,0,250,0] },
      { id:'bsc_s2',  name:'Students Development Fee',          section:'University', s:[225,0,225,0,225,0] },
      { id:'bsc_s3',  name:'Students Diary Fee',                section:'University', s:[50,0,50,0,50,0] },
      { id:'bsc_s4',  name:'CHETNA Fee',                        section:'University', s:[20,0,0,0,0,0] },
      { id:'bsc_s5',  name:'Library Fee (Database)',            section:'University', s:[100,0,100,0,100,0] },
      { id:'bsc_s6',  name:'E-Suvidha Fee',                     section:'University', s:[100,0,100,0,100,0] },
      { id:'bsc_s7',  name:'Disaster Management Fee',           section:'University', s:[10,0,10,0,10,0] },
      { id:'bsc_s8',  name:'Ashwamedh & Avishkar Fees',         section:'University', s:[30,0,30,0,30,0] },
      { id:'bsc_s9',  name:'Swami Vivekanand Yuva Suraksha',    section:'University', s:[62,0,62,0,62,0] },
      { id:'bsc_s10', name:'Eligibility Fee',                   section:'University', s:[400,0,0,0,0,0] },
      { id:'bsc_s11', name:'Enrollment Fee',                    section:'University', s:[400,0,0,0,0,0] },
      { id:'bsc_s12', name:'Examination Fee',                   section:'University', s:[750,750,750,750,750,750] },
      { id:'bsc_s13', name:'Practical Exam Fee',                section:'University', s:[250,250,250,250,250,250] },
      { id:'bsc_s14', name:'Central Information Access',        section:'University', s:[120,0,120,0,120,0] },
      { id:'bsc_s15', name:'University Development Fund',       section:'University', s:[120,0,120,0,120,0] },
      { id:'bsc_s16', name:'Passing Certificate Fee',           section:'University', s:[0,0,0,0,0,200] },
      { id:'bsc_s17', name:'Convocation Fee',                   section:'University', s:[0,0,0,0,0,700] },
      { id:'bsc_s18', name:'Alumni Fee (University)',           section:'University', s:[0,0,0,0,0,100] },
      { id:'bsc_c1',  name:'Admission Fee',                     section:'College',    s:[550,0,550,0,550,0] },
      { id:'bsc_c2',  name:'Tuition Fee',                       section:'College',    s:[16500,0,16500,0,16500,0] },
      { id:'bsc_c3',  name:'Gymkhana Fee',                      section:'College',    s:[700,0,700,0,700,0] },
      { id:'bsc_c4',  name:'Laboratory Fee',                    section:'College',    s:[5250,0,5250,0,5250,0] },
      { id:'bsc_c5',  name:'Development Fee',                   section:'College',    s:[500,0,500,0,500,0] },
      { id:'bsc_c6',  name:'Medical Fee',                       section:'College',    s:[100,0,100,0,100,0] },
      { id:'bsc_c7',  name:'Identity Card Fee',                 section:'College',    s:[100,0,100,0,100,0] },
      { id:'bsc_c8',  name:'Annual Miscellaneous Fee',          section:'College',    s:[250,0,250,0,250,0] },
      { id:'bsc_c9',  name:'Magazine Fee',                      section:'College',    s:[75,0,75,0,75,0] },
      { id:'bsc_c10', name:'Placement Fee',                     section:'College',    s:[0,0,0,0,0,500] },
      { id:'bsc_c11', name:'Library Fee',                       section:'College',    s:[1000,0,1000,0,1000,0] },
      { id:'bsc_c12', name:'Internship Fee/OJT',                section:'College',    s:[0,0,0,0,0,500] },
      { id:'bsc_c13', name:'Alumni Fee (College)',               section:'College',    s:[0,0,0,0,0,100] },
      { id:'bsc_c14', name:'Extra-Curricular Activity Fee',     section:'College',    s:[365,0,365,0,0,0] },
      { id:'bsc_c15', name:'Computer Training Fees',            section:'College',    s:[300,0,300,0,300,0] },
      { id:'bsc_c16', name:'Subject Association Fee',           section:'College',    s:[200,0,200,0,200,0] },
      { id:'bsc_c17', name:'Laboratory Deposit',                section:'College',    s:[300,0,0,0,0,0] },
      { id:'bsc_c18', name:'Caution Money Deposit',             section:'College',    s:[100,0,0,0,0,0] },
      { id:'bsc_c19', name:'Library Deposit',                   section:'College',    s:[500,0,0,0,0,0] },
    ],
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    items: [
      { id:'ba_s1',  name:'Sports Fee',                          section:'University', s:[250,0,250,0,250,0] },
      { id:'ba_s2',  name:'Students Development Fee',            section:'University', s:[225,0,225,0,225,0] },
      { id:'ba_s3',  name:'Students Diary Fee',                  section:'University', s:[50,0,50,0,50,0] },
      { id:'ba_s4',  name:'CHETNA Fee',                          section:'University', s:[20,0,0,0,0,0] },
      { id:'ba_s5',  name:'Library Fee (Database)',              section:'University', s:[100,0,100,0,100,0] },
      { id:'ba_s6',  name:'E-Suvidha Fee',                       section:'University', s:[100,0,100,0,100,0] },
      { id:'ba_s7',  name:'Disaster Management Fee',             section:'University', s:[10,0,10,0,10,0] },
      { id:'ba_s8',  name:'Ashwamedh & Avishkar Fees',           section:'University', s:[30,0,30,0,30,0] },
      { id:'ba_s9',  name:'Swami Vivekanand Yuva Suraksha',      section:'University', s:[62,0,62,0,62,0] },
      { id:'ba_s10', name:'Eligibility Fee',                     section:'University', s:[400,0,0,0,0,0] },
      { id:'ba_s11', name:'Enrollment Fee',                      section:'University', s:[400,0,0,0,0,0] },
      { id:'ba_s12', name:'Examination Fee',                     section:'University', s:[750,750,750,750,750,750] },
      { id:'ba_s13', name:'Practical Exam Fee (Geo/Psy)',        section:'University', s:[0,0,0,0,500,500] },
      { id:'ba_s14', name:'Central Information Access',          section:'University', s:[120,0,120,0,120,0] },
      { id:'ba_s15', name:'University Development Fund',         section:'University', s:[120,0,120,0,120,0] },
      { id:'ba_s16', name:'Passing Certificate Fee',             section:'University', s:[0,0,0,0,0,200] },
      { id:'ba_s17', name:'Convocation Fee',                     section:'University', s:[0,0,0,0,0,700] },
      { id:'ba_s18', name:'Alumni Fee (University)',             section:'University', s:[0,0,0,0,0,100] },
      { id:'ba_c1',  name:'Admission Fee',                       section:'College',    s:[550,0,550,0,550,0] },
      { id:'ba_c2',  name:'Tuition Fee',                         section:'College',    s:[5500,0,5500,0,5500,0] },
      { id:'ba_c3',  name:'Gymkhana Fee',                        section:'College',    s:[700,0,700,0,700,0] },
      { id:'ba_c4',  name:'Laboratory Fee (Psy/Geo)',            section:'College',    s:[300,0,300,0,300,0] },
      { id:'ba_c5',  name:'Development Fee',                     section:'College',    s:[500,0,500,0,500,0] },
      { id:'ba_c6',  name:'Medical Fee',                         section:'College',    s:[100,0,100,0,100,0] },
      { id:'ba_c7',  name:'Identity Card Fee',                   section:'College',    s:[100,0,100,0,100,0] },
      { id:'ba_c8',  name:'Annual Miscellaneous Fee',            section:'College',    s:[250,0,250,0,250,0] },
      { id:'ba_c9',  name:'Magazine Fee',                        section:'College',    s:[75,0,75,0,75,0] },
      { id:'ba_c10', name:'Placement Fee',                       section:'College',    s:[0,0,0,0,0,50] },
      { id:'ba_c11', name:'Library Fee',                         section:'College',    s:[1000,0,1000,0,1000,0] },
      { id:'ba_c12', name:'Internship Fee',                      section:'College',    s:[0,0,0,0,0,50] },
      { id:'ba_c13', name:'Computer Training Fee',               section:'College',    s:[500,0,500,0,500,0] },
      { id:'ba_c14', name:'Alumni Fee (College)',                 section:'College',    s:[0,0,0,0,0,100] },
      { id:'ba_c15', name:'Extra-Curricular Activity Fee',       section:'College',    s:[365,0,365,0,0,0] },
      { id:'ba_c16', name:'Subject Association Fee',             section:'College',    s:[200,0,200,0,200,0] },
      { id:'ba_c17', name:'Laboratory Deposit',                  section:'College',    s:[500,0,0,0,0,0] },
      { id:'ba_c18', name:'Caution Money Deposit',               section:'College',    s:[100,0,0,0,0,0] },
      { id:'ba_c19', name:'Library Deposit',                     section:'College',    s:[500,0,0,0,0,0] },
    ],
  },
};

// Helper: get fee items for a student's course + semester
// eslint-disable-next-line no-unused-vars
const getDetailedFeeItems = (courseType, semIndex) => {
  const ct = (courseType||'').toLowerCase();
  const courseKey = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.'
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
  if (!courseKey) return [];
  return DETAILED_FEES[courseKey].items.filter(item => item.s[semIndex] > 0);
};

// Helper: semester index from year+sem
// eslint-disable-next-line no-unused-vars
const getSemIndex = (admYear, semNum) => {
  const yearOffset = admYear === '1st Year' ? 0 : admYear === '2nd Year' ? 2 : 4;
  return yearOffset + (semNum === 2 ? 1 : 0);
};

// Helper: document fees
// eslint-disable-next-line no-unused-vars
const DOC_FEES = {
  tc:        { label: '📄 Transfer Certificate (TC)',   amount: 500 },
  bonafide:  { label: '📋 Bonafide Certificate',         amount: 100 },
  id_card:   { label: '🪪 ID Card',                      amount: 100 },
  marksheet: { label: '📋 Marksheet',                    amount: 50  },
  migration: { label: '📜 Migration Certificate',        amount: 500 },
  degree:    { label: '🎓 Degree Certificate',           amount: 500 },
};


const YEARLY_FEES = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    years: {
      '1st Year': { total: 30677, sem1: 29927, sem2: 750,  label: '1st Year (Sem I + II)' },
      '2nd Year': { total: 28957, sem1: 28207, sem2: 750,  label: '2nd Year (Sem III + IV)' },
      '3rd Year': { total: 30692, sem1: 27842, sem2: 2850, label: '3rd Year (Sem V + VI)' },
    }
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    years: {
      '1st Year': { total: 14627, sem1: 13877, sem2: 750,  label: '1st Year (Sem I + II)' },
      '2nd Year': { total: 12707, sem1: 11957, sem2: 750,  label: '2nd Year (Sem III + IV)' },
      '3rd Year': { total: 14542, sem1: 12092, sem2: 2450, label: '3rd Year (Sem V + VI)' },
    }
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
// eslint-disable-next-line no-unused-vars
const getSemesters = (courseKey, year) => {
  const course = YEARLY_FEES[courseKey];
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

// ─── Receipt printer (official format per LKCWSC document) ───────────────────
const printReceipt = (data) => {
  const acadYear = data.academicYear || (() => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; })();
  const dateStr  = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  const amt      = data.amount || 0;
  const amtWords = data.amountInWords || '';
  const logo     = "data:image/jpeg;base64,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";
  const payMode  = data.paymentMode === 'online' ? 'Online' : 'Cash';
  const txnId    = data.transactionId || 'NA';

  const html = `<!DOCTYPE html><html><head><title>Fee Receipt — ${data.receiptNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#fff;display:flex;justify-content:center;padding:16px;font-size:12px}
    .receipt{width:160mm;border:1px solid #999}
    /* Header */
    .hdr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #999}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:9px;color:#555}
    .hname{font-size:13px;font-weight:800;color:#000;line-height:1.3}
    .haddr{font-size:9px;color:#444;margin-top:1px}
    /* Title */
    .title-bar{text-align:center;padding:4px;border-bottom:1px solid #999;font-size:11px;font-weight:700;letter-spacing:1px;background:#f5f5f5}
    /* Copy line */
    .copy-line{padding:3px 10px;font-size:10px;border-bottom:1px dashed #aaa}
    /* Meta top row */
    .meta-row{display:flex;justify-content:space-between;padding:3px 10px;font-size:11px;border-bottom:1px dashed #aaa}
    .meta-item{display:flex;gap:4px}
    .mk{font-weight:700}
    /* Student info row */
    .info-row{display:flex;justify-content:space-between;padding:2px 10px;font-size:11px}
    .ik{font-weight:700;min-width:100px}
    .iv{font-weight:600}
    .divider{border-top:1px dashed #aaa;margin:3px 0}
    /* Table */
    table{width:100%;border-collapse:collapse}
    thead tr{background:#ddd}
    th{padding:5px 8px;font-size:11px;font-weight:700;text-align:left;border:1px solid #aaa}
    th:last-child{text-align:right}
    td{padding:4px 8px;font-size:11px;border:1px solid #ccc}
    td:first-child{text-align:center;width:32px}
    td:last-child{text-align:right}
    .total-row td{font-weight:800;background:#f0f0f0;border-top:2px solid #555}
    /* Bottom */
    .amt-line{padding:4px 10px;font-size:11px;border-top:1px dashed #aaa}
    .pay-line{padding:3px 10px;font-size:11px}
    .narr-line{padding:3px 10px;font-size:11px;border-top:1px dashed #aaa;margin-top:2px}
    .sig-area{padding:5px 10px 8px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #aaa;margin-top:4px}
    .sig-left{font-size:9.5px;color:#555;font-style:italic;max-width:220px;line-height:1.5}
    .sig-right{text-align:center;font-size:10px}
    .sig-line{border-top:1px solid #555;margin-top:20px;padding-top:2px;font-weight:700}
    .erp-line{padding:3px 10px;font-size:9px;color:#666;border-top:1px dashed #aaa;text-align:center}
    @media print{body{padding:0}@page{size:A5;margin:5mm}}
  </style></head><body>
  <div class="receipt">

    <div class="hdr">
      <img src="${logo}" class="hlogo"/>
      <div class="htxt">
        <div class="htrust">Vidya-Niketan Sevabhavi Sanstha's</div>
        <div class="hname">Late Kalpana Chawala Women's Senior College (LKCWSC)</div>
        <div class="haddr">Affiliated to SNDT Women's University, Mumbai</div>
        <div class="haddr">Gangakhed, Dist. Parbhani – 431514 &nbsp;|&nbsp; +91 9307162914 &nbsp;|&nbsp; lkcwsc.vnssorg.com</div>
      </div>
    </div>

    <div class="copy-line">Fee Receipt (Student Copy -&nbsp; )</div>

    <div class="meta-row">
      <div class="meta-item"><span class="mk">Receipt No. :</span>&nbsp;${data.receiptNo}</div>
      <div class="meta-item"><span class="mk">Receipt Date :</span>&nbsp;${dateStr}</div>
    </div>

    <div style="padding:3px 10px 2px;border-bottom:1px dashed #aaa">
      <div class="info-row"><span class="ik">Student Name</span><span>:</span><span class="iv">&nbsp;${data.studentName||'—'}</span><span style="margin-left:20px" class="ik">Student UID</span><span>:</span><span class="iv">&nbsp;${data.studentId||'—'}</span></div>
      <div class="info-row"><span class="ik">Class</span><span>:</span><span class="iv">&nbsp;${(data.courseType||data.branch||'—')} ${(data.admissionYear||data.year||'')}</span><span style="margin-left:20px" class="ik">Academic Year</span><span>:</span><span class="iv">&nbsp;${acadYear}</span></div>
    </div>

    <table style="margin-top:4px">
      <thead>
        <tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>${data.feeTypeLabel||data.feeLabel||'Fee'}</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
        <tr class="total-row"><td colspan="2" style="text-align:right;font-weight:800">Total Amount</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
      </tbody>
    </table>

    <div class="amt-line">Amt. in words(Rs.): &nbsp;<strong>${amtWords}</strong></div>

    <div class="pay-line">
      Paid by: <strong>${payMode}</strong> &nbsp;&nbsp;
      Rs. <strong>${amt.toLocaleString('en-IN')}.00</strong> &nbsp;&nbsp;
      ${data.paymentMode==='online'?`Transaction ID: <strong>${txnId}</strong> &nbsp;&nbsp;`:''}
      Date: <strong>${dateStr}</strong>
    </div>

    <div class="narr-line">Narration :</div>

    <div class="sig-area">
      <div class="sig-left">
        Signature<br/>
        (Accounted by : Not Required)<br/><br/>
        This is system generated receipt and does not require seal/stamp.
      </div>
      <div class="sig-right">
        <div class="sig-line">Accounts Section<br/>LKCWSC</div>
      </div>
    </div>

    <div class="erp-line">ERP Verification No: <strong>${data.verificationNo||'ERP'+data.receiptNo}</strong> &nbsp;|&nbsp; Collected by: <strong>${data.collectedBy||'—'}</strong></div>

  </div>
  <scr${'ipt'}>window.onload=()=>{window.print()}</scr${'ipt'}></body></html>`;

  const w = window.open('','_blank','width=680,height=680');
  w.document.write(html);
  w.document.close();
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
    pending_exam:         { bg: '#e3f2fd', color: '#1565C0', label: '🔍 At Exam Section' },
    rejected_by_exam:     { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Exam' },
    pending_principal:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ At Principal' },
    rejected_by_principal:{ bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
    pending_generation:   { bg: '#e8f5e9', color: '#2E7D32', label: '✅ At Student Section' },
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
// ─── Fee Structure Tab Component ─────────────────────────────────────────────
const FeeStructTab = ({ docFees, setDocFees, saveDocFees, showToast }) => {
  const [feeView, setFeeView]           = useState('bsc');
  const [editDocFees2, setEditDocFees2] = useState(false);
  const [docFeeEdits2, setDocFeeEdits2] = useState({});
  const [customFees, setCustomFees]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_custom_fees') || '{}'); } catch { return {}; }
  });
  const [addingItem, setAddingItem]     = useState(false);
  const [newItem, setNewItem]           = useState({ name:'', section:'College', s0:0,s1:0,s2:0,s3:0,s4:0,s5:0 });

  const saveCustomFees = (cf) => {
    localStorage.setItem('lkcwsc_custom_fees', JSON.stringify(cf));
    setCustomFees(cf);
  };

  const courseKey = feeView === 'bsc' ? 'B.Sc.' : 'B.A.';
  const course = DETAILED_FEES[courseKey];
  const allItems = course ? [
    ...course.items,
    ...((customFees[courseKey] || []).filter(cf => !course.items.find(i => i.id === cf.id))),
  ] : [];

  const semLabels = ['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'];
  const yearLabels = ['1st Year','1st Year','2nd Year','2nd Year','3rd Year','3rd Year'];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#1565C0', marginBottom:4 }}>💼 Fee Structure 2025-26</h2>
          <p style={{ color:'#666', fontSize:14 }}>SNDT University fee structure. View all items, edit amounts, and add custom fees.</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display:'flex', gap:0, marginBottom:20, background:'#f0f4f8', borderRadius:10, padding:4, width:'fit-content' }}>
        {[{id:'bsc',label:'📗 B.Sc.'},{id:'ba',label:'📘 B.A.'},{id:'doc',label:'📄 Document Fees'}].map(t => (
          <button key={t.id} onClick={() => setFeeView(t.id)}
            style={{ padding:'9px 22px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', background:feeView===t.id?'#1565C0':'transparent', color:feeView===t.id?'#fff':'#555' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── B.Sc. / B.A. Fee Table ── */}
      {(feeView === 'bsc' || feeView === 'ba') && (
        <div>
          {/* Sem totals */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:16 }}>
            {semLabels.map((sl, si) => {
              const total = allItems.reduce((s,i) => s+(i.s[si]||0), 0);
              return (
                <div key={sl} style={{ background:si%2===0?'#e3f2fd':'#f3e5f5', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#666', fontWeight:600 }}>{yearLabels[si]}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{sl}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:'#1565C0' }}>₹{total.toLocaleString('en-IN')}</div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr repeat(6,1fr)', background:'#1565C0', padding:'10px 14px', gap:6 }}>
              {['Fee Item','Section','Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'].map(h => (
                <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:11 }}>{h}</span>
              ))}
            </div>
            <div style={{ background:'#e8eaf6', padding:'6px 14px', fontSize:11, fontWeight:800, color:'#1a237e' }}>🏛️ UNIVERSITY FEES (A)</div>
            {allItems.filter(i=>i.section==='University').map((item, idx) => (
              <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr repeat(6,1fr)', padding:'8px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafeff':'#fff' }}>
                <span style={{ fontSize:12, color:'#333' }}>{item.name}</span>
                <span style={{ fontSize:10, color:'#888', background:'#e8eaf6', padding:'2px 6px', borderRadius:6 }}>Univ.</span>
                {item.s.map((amt, si) => (
                  <span key={si} style={{ fontSize:12, fontWeight:amt>0?700:400, color:amt>0?'#1565C0':'#ddd', textAlign:'right' }}>
                    {amt > 0 ? `₹${amt}` : '—'}
                  </span>
                ))}
              </div>
            ))}
            <div style={{ background:'#e8f5e9', padding:'6px 14px', fontSize:11, fontWeight:800, color:'#1b5e20' }}>🏫 COLLEGE FEES (B)</div>
            {allItems.filter(i=>i.section==='College').map((item, idx) => (
              <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr repeat(6,1fr)', padding:'8px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafff8':'#fff' }}>
                <span style={{ fontSize:12, color:'#333' }}>{item.name}</span>
                <span style={{ fontSize:10, color:'#888', background:'#e8f5e9', padding:'2px 6px', borderRadius:6 }}>College</span>
                {item.s.map((amt, si) => (
                  <span key={si} style={{ fontSize:12, fontWeight:amt>0?700:400, color:amt>0?'#2E7D32':'#ddd', textAlign:'right' }}>
                    {amt > 0 ? `₹${amt}` : '—'}
                  </span>
                ))}
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr repeat(6,1fr)', padding:'10px 14px', gap:6, alignItems:'center', background:'#e3f2fd', borderTop:'2px solid #1565C0' }}>
              <span style={{ fontWeight:800, fontSize:13, color:'#1a237e' }}>TOTAL</span>
              <span></span>
              {semLabels.map((_,si) => {
                const t = allItems.reduce((s,i) => s+(i.s[si]||0), 0);
                return <span key={si} style={{ fontWeight:800, fontSize:13, color:'#1a237e', textAlign:'right' }}>₹{t.toLocaleString('en-IN')}</span>;
              })}
            </div>
          </div>

          {/* Add custom item */}
          <div style={{ marginTop:16 }}>
            {!addingItem ? (
              <button onClick={() => setAddingItem(true)}
                style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:9, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                ➕ Add Fee Item to {courseKey}
              </button>
            ) : (
              <div style={{ background:'#fff', borderRadius:14, border:'2px solid #1565C0', padding:20, marginTop:10 }}>
                <h4 style={{ color:'#1565C0', marginBottom:14 }}>➕ Add New Fee Item — {courseKey}</h4>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Fee Item Name *</label>
                    <input type="text" placeholder="e.g. Sports Uniform Fee" value={newItem.name} onChange={e => setNewItem(p=>({...p,name:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Section</label>
                    <select value={newItem.section} onChange={e => setNewItem(p=>({...p,section:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }}>
                      <option value="University">University</option>
                      <option value="College">College</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:14 }}>
                  {semLabels.map((sl,si) => (
                    <div key={sl}>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#555', marginBottom:4 }}>{sl}</label>
                      <input type="number" min="0" placeholder="0" value={newItem[`s${si}`]||0}
                        onChange={e => setNewItem(p=>({...p,[`s${si}`]:Number(e.target.value)||0}))}
                        style={{ width:'100%', padding:'7px 8px', borderRadius:7, border:'1px solid #ddd', fontSize:13, textAlign:'right', boxSizing:'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => {
                    if (!newItem.name.trim()) return;
                    const id = 'custom_'+Date.now();
                    const item = { id, name:newItem.name.trim(), section:newItem.section, s:[0,1,2,3,4,5].map(i=>newItem[`s${i}`]||0) };
                    const cf = { ...customFees, [courseKey]: [...(customFees[courseKey]||[]), item] };
                    saveCustomFees(cf);
                    setAddingItem(false);
                    setNewItem({ name:'', section:'College', s0:0,s1:0,s2:0,s3:0,s4:0,s5:0 });
                    showToast('Fee item added!');
                  }} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    ✅ Add Item
                  </button>
                  <button onClick={() => setAddingItem(false)}
                    style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Fees ── */}
      {feeView === 'doc' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={{ color:'#666', fontSize:14 }}>Set the fee charged for each document type.</p>
            {!editDocFees2 ? (
              <button onClick={() => { setDocFeeEdits2(Object.fromEntries(Object.entries(docFees).map(([k,v])=>[k,v.price]))); setEditDocFees2(true); }}
                style={{ background:'#1565C0', color:'#fff', padding:'10px 22px', borderRadius:8, border:'none', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                ✏️ Edit Fees
              </button>
            ) : (
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => {
                  const updated = {...docFees};
                  Object.entries(docFeeEdits2).forEach(([k,v]) => { updated[k] = {...updated[k], price:Number(v)||0}; });
                  setDocFees(updated); saveDocFees(updated); setEditDocFees2(false);
                  showToast('Document fees saved!');
                }} style={{ background:'#2E7D32', color:'#fff', padding:'10px 22px', borderRadius:8, border:'none', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                  💾 Save
                </button>
                <button onClick={() => setEditDocFees2(false)} style={{ background:'#eee', color:'#333', padding:'10px 18px', borderRadius:8, border:'none', fontSize:14, cursor:'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 160px', background:'#1565C0', padding:'14px 20px' }}>
              <span style={{ color:'#fff', fontWeight:700 }}>Document Type</span>
              <span style={{ color:'#fff', fontWeight:700, textAlign:'right' }}>Fee (₹)</span>
            </div>
            {Object.entries(docFees).map(([key,val],idx) => (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 160px', padding:'16px 20px', alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                <span style={{ fontSize:15, color:'#222', fontWeight:500 }}>{val.label}</span>
                {editDocFees2 ? (
                  <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6 }}>
                    <span style={{ color:'#555', fontWeight:600 }}>₹</span>
                    <input type="number" min="0" value={docFeeEdits2[key]??val.price} onChange={e => setDocFeeEdits2(prev=>({...prev,[key]:e.target.value}))}
                      style={{ width:90, padding:'7px 10px', borderRadius:7, border:'2px solid #1565C0', fontSize:15, fontWeight:600, textAlign:'right', outline:'none' }} />
                  </div>
                ) : (
                  <span style={{ textAlign:'right', fontWeight:700, fontSize:16, color:val.price>0?'#1565C0':'#aaa' }}>
                    {val.price > 0 ? `₹ ${val.price}` : '—'}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, background:'#fff8e1', padding:'12px 16px', borderRadius:10, border:'1px solid #ffe082', fontSize:13, color:'#7c5e00' }}>
            💡 Changes apply immediately when a student submits a new document request.
          </div>
        </div>
      )}
    </div>
  );
};


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
  const [admMsg, setAdmMsg] = useState('');
  const [selectedFeeItems, setSelectedFeeItems] = useState({}); // {itemId: true/false}
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
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); setAdmMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
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

      printReceipt({ 
        ...entry, receiptNo: rNo,
        feeTypeLabel: docFees[selectedDoc.documentType]?.label || selectedDoc.documentTypeLabel || entry.feeLabel || 'Document Fee',
        courseType: selectedDoc.branch || '',
        admissionYear: selectedDoc.admissionYear || '',
        verificationNo: 'ERP' + rNo,
      });
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
    const course = courseKey ? YEARLY_FEES[courseKey] : null;
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

      printReceipt({ 
        ...entry, receiptNo: rNo,
        feeTypeLabel: feeType?.label || entry.feeLabel || 'Fee',
        courseType: selectedAdm.courseType || '',
        admissionYear: selectedAdm.admissionYear || '',
        verificationNo: 'ERP' + rNo,
      });
      showToast('Fee collected & receipt generated!'); setAdmMsg('');
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
    { id: 'all_students', label: '👩‍🎓 All Students' },
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
                  <option value="pending_exam">🔍 At Exam Section</option>
                  <option value="pending_principal">🔄 At Principal</option>
                  <option value="pending_generation">✅ At Student Section</option>
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
            <FeeStructTab
              docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast}
            />
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


          {/* ══ ALL STUDENTS ══ */}
          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>View complete student information. Read-only view.</p>
              <StudentViewFull canEdit={false} themeColor="#1565C0" role="accounts" />
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
      {/* ════════════════════════ ADMISSION FEE MODAL ════════════════════════ */}
      {selectedAdm && (() => {
        const SEM_LABELS = ['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'];
        const ct = (selectedAdm.courseType||'').toLowerCase();
        const ck = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.'
          : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
        const course = ck ? DETAILED_FEES[ck] : null;
        const yearSems = { '1st Year':[0,1], '2nd Year':[2,3], '3rd Year':[4,5] };
        const semIndices = yearSems[selectedAdm.admissionYear||'1st Year'] || [0,1];
        const curSi = SEM_LABELS.indexOf(admSelectedSem);
        const schol = Number(admScholarshipAmt||0);

        const calcTotal = (map, semI) => {
          if (!course || semI < 0) return 0;
          return course.items.reduce((s,i) => s + (map[i.id] ? (i.s[semI]||0) : 0), 0);
        };

        const doAutoSelect = (semI) => {
          if (!course) return;
          const m = {};
          course.items.forEach(i => { if ((i.s[semI]||0) > 0) m[i.id] = true; });
          setSelectedFeeItems(m);
          const tot = calcTotal(m, semI);
          setAdmFeeAmt(String(Math.max(0, tot - schol)));
          setAdmSelectedSem(SEM_LABELS[semI]);
        };

        const toggleItem = (itemId) => {
          const m = { ...selectedFeeItems, [itemId]: !selectedFeeItems[itemId] };
          setSelectedFeeItems(m);
          const tot = calcTotal(m, curSi);
          setAdmFeeAmt(String(Math.max(0, tot - schol)));
        };

        const selectAll = () => {
          if (!course || curSi < 0) return;
          const m = {};
          course.items.forEach(i => { if ((i.s[curSi]||0) > 0) m[i.id] = true; });
          setSelectedFeeItems(m);
          const tot = calcTotal(m, curSi);
          setAdmFeeAmt(String(Math.max(0, tot - schol)));
        };

        const clearAll = () => { setSelectedFeeItems({}); setAdmFeeAmt('0'); };

        const selGross  = calcTotal(selectedFeeItems, curSi);
        const netPayable = Math.max(0, selGross - schol);
        const amtPaid   = Number(admFeeAmt||0);
        const balance   = Math.max(0, netPayable - amtPaid);

        const uItems = course && curSi >= 0 ? course.items.filter(i => i.section==='University' && (i.s[curSi]||0)>0) : [];
        const cItems = course && curSi >= 0 ? course.items.filter(i => i.section==='College'    && (i.s[curSi]||0)>0) : [];

        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => { setSelectedAdm(null); setAdmFeeAmt(''); setAdmSelectedSem(''); setSelectedFeeItems({}); }}>
            <div style={{ background:'#fff', borderRadius:16, padding:24, maxWidth:600, width:'100%', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>

              <h2 style={{ color:'#1565C0', marginBottom:4 }}>💰 Collect Fees</h2>
              <p style={{ color:'#666', fontSize:13, marginBottom:16 }}>{selectedAdm.applicantName} — {selectedAdm.courseType} {selectedAdm.admissionYear}</p>

              {/* Step 1 — Semester */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1565C0', marginBottom:8 }}>1. Semester Select Karo *</label>
                <div style={{ display:'flex', gap:8 }}>
                  {semIndices.map(semI => (
                    <button key={semI} onClick={() => doAutoSelect(semI)}
                      style={{ flex:1, padding:'10px 8px', borderRadius:9, border:`2px solid ${admSelectedSem===SEM_LABELS[semI]?'#1565C0':'#ddd'}`, background:admSelectedSem===SEM_LABELS[semI]?'#1565C0':'#fff', color:admSelectedSem===SEM_LABELS[semI]?'#fff':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      {SEM_LABELS[semI]}<br/>
                      <span style={{ fontSize:11, fontWeight:400 }}>₹{course ? course.items.reduce((s,i)=>s+(i.s[semI]||0),0).toLocaleString('en-IN') : '—'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Fee items */}
              {admSelectedSem && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:'#1565C0' }}>2. Fees Select Karo *</label>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={selectAll}
                        style={{ fontSize:11, padding:'4px 12px', background:'#1565C0', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontWeight:700 }}>✅ Sabhi</button>
                      <button onClick={clearAll}
                        style={{ fontSize:11, padding:'4px 12px', background:'#ffebee', color:'#C62828', border:'none', borderRadius:6, cursor:'pointer', fontWeight:700 }}>❌ Clear</button>
                    </div>
                  </div>

                  {!course ? (
                    <div style={{ background:'#fff3e0', padding:'10px', borderRadius:8, fontSize:13, color:'#E65100' }}>⚠️ Course detect nahi hua — manually amount daalo</div>
                  ) : (uItems.length === 0 && cItems.length === 0) ? (
                    <div style={{ background:'#f5f5f5', padding:'10px', borderRadius:8, fontSize:13, color:'#888' }}>Is semester mein koi fees nahi hain.</div>
                  ) : (
                    <div style={{ border:'1px solid #e0e7ef', borderRadius:10, overflow:'hidden', maxHeight:250, overflowY:'auto' }}>
                      {uItems.length > 0 && <>
                        <div style={{ background:'#e8eaf6', padding:'5px 12px', fontSize:11, fontWeight:800, color:'#1a237e' }}>🏛️ University Fees (A)</div>
                        {uItems.map(item => (
                          <div key={item.id} onClick={() => toggleItem(item.id)}
                            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#e8f4ff':'#fff', userSelect:'none' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15 }}/>
                              <span style={{ fontSize:13, color:selectedFeeItems[item.id]?'#1a237e':'#333' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize:13, fontWeight:700, color:'#1565C0', flexShrink:0 }}>₹{(item.s[curSi]||0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </>}
                      {cItems.length > 0 && <>
                        <div style={{ background:'#e8f5e9', padding:'5px 12px', fontSize:11, fontWeight:800, color:'#1b5e20' }}>🏫 College Fees (B)</div>
                        {cItems.map(item => (
                          <div key={item.id} onClick={() => toggleItem(item.id)}
                            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#f0fff4':'#fff', userSelect:'none' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15 }}/>
                              <span style={{ fontSize:13, color:selectedFeeItems[item.id]?'#1b5e20':'#333' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32', flexShrink:0 }}>₹{(item.s[curSi]||0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </>}
                    </div>
                  )}

                  {/* Summary box */}
                  <div style={{ background:'#e3f2fd', borderRadius:10, padding:'12px 14px', marginTop:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                      <span style={{ color:'#555' }}>Selected Total:</span>
                      <span style={{ fontWeight:700 }}>₹{selGross.toLocaleString('en-IN')}</span>
                    </div>
                    {schol > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#7B1FA2', marginBottom:4 }}>
                        <span>− Scholarship:</span>
                        <span style={{ fontWeight:700 }}>−₹{schol.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:800, borderTop:'1px solid #90CAF9', paddingTop:8, marginTop:4 }}>
                      <span style={{ color:'#1565C0' }}>Net Payable:</span>
                      <span style={{ color:'#1565C0' }}>₹{netPayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Amount + Balance */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:6 }}>3. Student Ne Kitna Diya (₹) *</label>
                <input type="number" placeholder="Amount enter karo" value={admFeeAmt}
                  onChange={e => setAdmFeeAmt(e.target.value)} min="0"
                  style={{ width:'100%', padding:'12px 14px', borderRadius:9, border:'2px solid #1565C0', fontSize:16, fontWeight:700, textAlign:'center', boxSizing:'border-box', outline:'none' }} />
                {admFeeAmt && Number(admFeeAmt) > 0 && netPayable > 0 && (
                  <div style={{ display:'flex', gap:10, marginTop:8 }}>
                    <div style={{ flex:1, background:'#e8f5e9', borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#2E7D32', fontWeight:600 }}>Paid</div>
                      <div style={{ fontSize:15, fontWeight:800, color:'#2E7D32' }}>₹{amtPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ flex:1, background: balance > 0 ? '#ffebee' : '#e8f5e9', borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color: balance > 0 ? '#C62828' : '#2E7D32', fontWeight:600 }}>Balance</div>
                      <div style={{ fontSize:15, fontWeight:800, color: balance > 0 ? '#C62828' : '#2E7D32' }}>
                        {balance > 0 ? `₹${balance.toLocaleString('en-IN')} baaki` : '✅ Full Paid'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4 — Payment Mode */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:8 }}>4. Payment Mode *</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[{k:'cash',l:'💵 Cash'},{k:'online',l:'🌐 Online/UPI'}].map(m => (
                    <button key={m.k} onClick={() => setAdmPayMode(m.k)}
                      style={{ flex:1, padding:'10px', borderRadius:9, border:`2px solid ${admPayMode===m.k?'#1565C0':'#ddd'}`, background:admPayMode===m.k?'#1565C0':'#fff', color:admPayMode===m.k?'#fff':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>

              {admPayMode === 'online' && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:6 }}>Transaction ID *</label>
                  <input type="text" placeholder="UPI/Transaction ID" value={admTxnId} onChange={e => setAdmTxnId(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'2px solid #1565C0', fontSize:14, boxSizing:'border-box' }} />
                </div>
              )}

              {admMsg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:admMsg.startsWith('✅')?'#e8f5e9':'#ffebee', color:admMsg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight:500 }}>{admMsg}</div>}

              <button onClick={handleAdmFeeCollect} disabled={admLoading2 || !admFeeAmt || Number(admFeeAmt) <= 0}
                style={{ width:'100%', background:admLoading2||!admFeeAmt||Number(admFeeAmt)<=0?'#aaa':'#1565C0', color:'#fff', padding:14, borderRadius:10, border:'none', fontSize:15, fontWeight:700, cursor:admLoading2||!admFeeAmt?'not-allowed':'pointer' }}>
                {admLoading2 ? '⏳ Processing...' : '🖨️ Collect & Generate Receipt'}
              </button>
              <button onClick={() => { setSelectedAdm(null); setAdmFeeAmt(''); setAdmSelectedSem(''); setSelectedFeeItems({}); setAdmMsg(''); }}
                style={{ width:'100%', marginTop:10, background:'#f3f4f6', color:'#555', padding:12, borderRadius:10, border:'none', fontSize:14, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AccountsSectionDashboard;
