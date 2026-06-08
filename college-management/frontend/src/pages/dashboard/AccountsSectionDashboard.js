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
  { key: 'admission',    label: '💰 Collect Fees' },
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
  const payMode  = data.paymentMode === 'online' ? 'Online' : 'Cash';
  const txnId    = data.transactionId || '';
  const logo     = window.location.origin + "/college-logo.png";

  // Full course name
  const ct = (data.courseType||data.branch||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)'
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)'
    : (data.courseType||data.branch||'—');
  const classStr = courseFull + (data.admissionYear||data.year ? ' — '+(data.admissionYear||data.year) : '');

  // Amount in words
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const inW=(n)=>{if(n===0)return'';if(n<20)return a[n]+' ';if(n<100)return b[Math.floor(n/10)]+' '+(n%10?a[n%10]+' ':'');if(n<1000)return a[Math.floor(n/100)]+'Hundred '+(n%100?inW(n%100):'');return a[Math.floor(n/1000)]+'Thousand '+(n%1000?inW(n%1000):'');};
  const amtWords = inW(amt).trim() + ' Only';

  const rows = (data.feeBreakdown && data.feeBreakdown.length > 0)
    ? data.feeBreakdown.map((r,i) => `<tr><td>${i+1}</td><td>${r.particular||r.label||r.name||'Fee'}</td><td>₹${Number(r.amount||0).toLocaleString('en-IN')}.00</td></tr>`).join('')
    : `<tr><td>1</td><td>${data.feeTypeLabel||data.feeLabel||'Fee'}</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>`;

  const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#fff;padding:10px;font-size:12px}
    .receipt{width:160mm;border:1px solid #999;margin:0 auto}
    .hdr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1.5px solid #000}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:8.5px;color:#333;font-weight:700}
    .hname{font-size:13px;font-weight:900;color:#000;line-height:1.3;margin:2px 0}
    .haddr{font-size:8.5px;color:#444;margin-top:1px}
    .titlebar{text-align:center;padding:5px;border-bottom:1px solid #999;font-size:13px;font-weight:900;letter-spacing:2px;background:#f5f5f5}
    .copyline{padding:4px 12px;font-size:10px;border-bottom:1px dashed #aaa}
    .metarow{display:flex;justify-content:space-between;padding:4px 12px;font-size:11px;border-bottom:1px dashed #aaa}
    .infobox{padding:4px 12px;border-bottom:1px dashed #aaa}
    table.info{width:100%;border-collapse:collapse;font-size:11px}
    table.info td{padding:2px 4px}
    .lbl{font-weight:700;color:#444;width:95px}
    .val{font-weight:600;color:#000}
    table.fees{width:100%;border-collapse:collapse;margin-top:4px}
    table.fees thead tr{background:#ddd}
    table.fees th{padding:5px 8px;font-size:11px;font-weight:700;text-align:left;border:1px solid #aaa}
    table.fees th:last-child{text-align:right}
    table.fees td{padding:5px 8px;font-size:11px;border:1px solid #ccc}
    table.fees td:first-child{text-align:center;width:32px}
    table.fees td:last-child{text-align:right}
    .totrow td{font-weight:800;font-size:12px;background:#f0f0f0;border-top:2px solid #555}
    .amtline{padding:5px 12px;font-size:11px;border-top:1px dashed #aaa}
    .payline{padding:4px 12px;font-size:11px}
    .narrline{padding:4px 12px 6px;font-size:11px;border-top:1px dashed #aaa}
    .sigrow{display:flex;justify-content:space-between;align-items:flex-end;padding:6px 12px 8px;border-top:1px dashed #aaa}
    .sigsys{font-size:9px;color:#666;font-style:italic}
    .sigbox{text-align:center;font-size:10px}
    .sigline{border-top:1px solid #444;margin-top:22px;padding-top:3px;font-weight:700}
    @media print{body{padding:0}.receipt{width:100%}@page{size:A5;margin:5mm}}
  </style></head><body>
  <div class="receipt">
    <div class="hdr">
      <img src="${logo}" class="hlogo"/>
      <div class="htxt">
        <div class="htrust">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="hname">Late Kalpana Chawla Women's Senior College (LKCWSC)</div>
        <div class="haddr">Affiliated to SNDT Women's University, Mumbai</div>
        <div class="haddr">Gangakhed, Dist. Parbhani, Maharashtra – 431514 &nbsp;|&nbsp; +91 9307162914 &nbsp;|&nbsp; lkcwsc.vnssorg.com</div>
      </div>
    </div>
    <div class="titlebar">FEE RECEIPT</div>
    <div class="copyline">Fee Receipt (Student Copy)</div>
    <div class="metarow">
      <span><b>Receipt No. :</b> ${data.receiptNo}</span>
      <span><b>Date :</b> ${dateStr}</span>
    </div>
    <div class="infobox">
      <table class="info">
        <tr>
          <td class="lbl">Student Name</td><td class="val">: ${data.studentName||'—'}</td>
          <td class="lbl" style="padding-left:16px">Student UID</td><td class="val">: ${data.studentId||'—'}</td>
        </tr>
        <tr>
          <td class="lbl">Class</td><td class="val">: ${classStr}</td>
          <td class="lbl" style="padding-left:16px">Academic Year</td><td class="val">: ${acadYear}</td>
        </tr>
      </table>
    </div>
    <table class="fees">
      <thead><tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="totrow"><td colspan="2" style="text-align:right;padding-right:10px">Total Amount</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
      </tbody>
    </table>
    <div class="amtline">Amt. in words (Rs.) : <b>${amtWords}</b></div>
    <div class="payline">
      Paid by : <b>${payMode}</b> &nbsp;&nbsp;
      Rs. <b>${amt.toLocaleString('en-IN')}.00</b>
      ${txnId ? ` &nbsp;&nbsp; Transaction ID : <b>${txnId}</b>` : ''}
      &nbsp;&nbsp; Date : <b>${dateStr}</b>
    </div>
    <div class="narrline">Narration :</div>
    <div class="sigrow">
      <div class="sigsys">This is system generated receipt and does not require seal/stamp.</div>
      <div class="sigbox"><div class="sigline">Accounts Section<br/>LKCWSC</div></div>
    </div>
  </div>
  <scr${'ipt'}>window.onload=()=>{window.print()}</scr${'ipt'}></body></html>`;

  const w = window.open('','_blank','width=680,height=680');
  w.document.write(html); w.document.close();
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
/* ============================================================
   FeeStructureManager.jsx
   Tab component for Admin / Accounts dashboard.
   Manages both:
     1. College Total Fee Structure (per item, per semester)
     2. MahaDBT Receivable (ScholarshipMaster)
   Full CRUD — Add / Edit / Delete per fee item.
   ============================================================ */
/* ── constants ─────────────────────────────────────────────── */
const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27', '2027-28'];
const COURSES        = ['B.Sc.', 'B.A.'];
const SECTIONS       = ['University', 'College'];
const SEM_LABELS     = ['Sem I', 'Sem II', 'Sem III', 'Sem IV', 'Sem V', 'Sem VI'];
const YEAR_SEM_IDX   = { FY: [0,1], SY: [2,3], TY: [4,5] };
const YEAR_LABELS    = { FY: 'First Year', SY: 'Second Year', TY: 'Third Year' };

const RESERVED_CATS = ['SC','ST','OBC','VJ/DT(NT-A)','NT-B','NT-C','NT-D','SBC','EWS','SEBC'];
const ALL_CATS      = [...RESERVED_CATS, 'OPEN'];

const fmt = n => Number(n||0).toLocaleString('en-IN');

/* ── style helpers ──────────────────────────────────────────── */
const th = { color:'#fff', fontWeight:700, fontSize:12, padding:'9px 10px', textAlign:'left' };
const td = { padding:'9px 10px', fontSize:13, borderBottom:'1px solid #f0f4f8', verticalAlign:'middle' };
const inp = { padding:'7px 10px', borderRadius:7, border:'2px solid #e0e7ef', fontSize:13, width:'100%', boxSizing:'border-box' };
const btn = (bg,color,border='transparent') => ({
  padding:'7px 14px', background:bg, color, border:`1px solid ${border}`,
  borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer',
});

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const FeeStructureManager = ({ user, docFees, setDocFees, saveDocFees, showToast }) => {
  const [subTab, setSubTab]   = useState('total');   // 'total' | 'mahadbt' | 'doc'
  const [ay, setAy]           = useState('2025-26');
  const [course, setCourse]   = useState('B.Sc.');
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  // ── Total fee structure state ──
  const [structures, setStructures] = useState([]);  // all docs from API
  const [activeDoc,  setActiveDoc]  = useState(null); // currently selected {_id, items, yearTotals}

  // ── Inline edit state ──
  const [editItemId,  setEditItemId]  = useState(null); // item.id being edited
  const [editValues,  setEditValues]  = useState({});   // { name, section, s:[...] }
  const [saving,      setSaving]      = useState(false);

  // ── Add new item form ──
  const [showAdd,   setShowAdd]   = useState(false);
  const [newItem,   setNewItem]   = useState({ name:'', section:'College', s:[0,0,0,0,0,0] });

  // ── MahaDBT master state ──
  const [masters,       setMasters]       = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [editMasterId,  setEditMasterId]  = useState(null);
  const [masterForm,    setMasterForm]    = useState({
    categories:[], courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'',
  });
  const [masterSaving, setMasterSaving] = useState(false);

  const flash = (m, delay=3500) => { setMsg(m); setTimeout(()=>setMsg(''), delay); };

  /* ── Fetch total fee structures ── */
  const fetchStructures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/fee-structure');
      setStructures(res.data.structures || []);
    } catch { flash('❌ Failed to load fee structures'); }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch MahaDBT masters ── */
  const fetchMasters = useCallback(async () => {
    setMasterLoading(true);
    try {
      const res = await API.get('/scholarships/master');
      setMasters(res.data.scholarships || []);
    } catch {}
    finally { setMasterLoading(false); }
  }, []);

  useEffect(() => { fetchStructures(); fetchMasters(); }, [fetchStructures, fetchMasters]);

  /* ── Derive active doc from course + ay ── */
  useEffect(() => {
    const doc = structures.find(s => s.courseType === course && s.academicYear === ay);
    setActiveDoc(doc || null);
    setEditItemId(null);
  }, [structures, course, ay]);

  /* ── Seed defaults ── */
  const handleSeedDefaults = async () => {
    if (!window.confirm(`Seed default fee structure for AY ${ay}? (Safe — skips if already exists)`)) return;
    try {
      const res = await API.post('/fee-structure/seed-defaults', { academicYear: ay, createdBy: user?.name });
      flash('✅ ' + res.data.results.map(r => `${r.course}: ${r.status}`).join(' | '));
      fetchStructures();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Seed failed')); }
  };

  /* ── Create new structure ── */
  const handleCreateStructure = async () => {
    if (!window.confirm(`Create empty fee structure for ${course} AY ${ay}?`)) return;
    try {
      await API.post('/fee-structure', { courseType: course, academicYear: ay, items: [], createdBy: user?.name });
      flash('✅ Empty structure created — now add fee items below');
      fetchStructures();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Create failed')); }
  };

  /* ── Start editing an item ── */
  const startEdit = (item) => {
    setEditItemId(item.id);
    setEditValues({ name: item.name, section: item.section, s: [...item.s] });
  };

  /* ── Save edited item ── */
  const saveItem = async () => {
    if (!activeDoc) return;
    setSaving(true);
    try {
      const res = await API.patch(`/fee-structure/${activeDoc._id}/item`, {
        itemId: editItemId, ...editValues, updatedBy: user?.name,
      });
      setActiveDoc({ ...res.data.structure });
      setStructures(prev => prev.map(s => s._id === activeDoc._id ? res.data.structure : s));
      setEditItemId(null);
      flash('✅ Fee item updated');
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Update failed')); }
    finally { setSaving(false); }
  };

  /* ── Delete item ── */
  const deleteItem = async (itemId, itemName) => {
    if (!activeDoc) return;
    if (!window.confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
    try {
      const res = await API.delete(`/fee-structure/${activeDoc._id}/item/${itemId}`);
      setActiveDoc({ ...res.data.structure });
      setStructures(prev => prev.map(s => s._id === activeDoc._id ? res.data.structure : s));
      flash('✅ Item deleted');
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Delete failed')); }
  };

  /* ── Add new item ── */
  const addItem = async () => {
    if (!newItem.name.trim()) { flash('❌ Enter fee item name'); return; }
    if (!activeDoc) { flash('❌ Select or create a fee structure first'); return; }
    try {
      const res = await API.post(`/fee-structure/${activeDoc._id}/item`, {
        ...newItem, updatedBy: user?.name,
      });
      setActiveDoc({ ...res.data.structure });
      setStructures(prev => prev.map(s => s._id === activeDoc._id ? res.data.structure : s));
      setNewItem({ name:'', section:'College', s:[0,0,0,0,0,0] });
      setShowAdd(false);
      flash('✅ Fee item added');
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Add failed')); }
  };

  /* ── Delete full structure ── */
  const deleteStructure = async () => {
    if (!activeDoc) return;
    if (!window.confirm(`Delete entire fee structure for ${course} AY ${ay}? This is a soft delete.`)) return;
    try {
      await API.delete(`/fee-structure/${activeDoc._id}`);
      flash('✅ Fee structure deactivated');
      fetchStructures();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Delete failed')); }
  };

  /* ── MahaDBT master CRUD ── */
  const handleMasterSave = async () => {
    if (!masterForm.categories.length) { flash('❌ Select at least one category'); return; }
    if (!masterForm.courseType || !masterForm.scholarshipAmount) { flash('❌ Fill all required fields'); return; }
    setMasterSaving(true);
    try {
      if (editMasterId) {
        await API.put(`/scholarships/master/${editMasterId}`, { ...masterForm, updatedBy: user?.name });
        flash('✅ MahaDBT record updated');
      } else {
        await API.post('/scholarships/master', { ...masterForm, createdBy: user?.name });
        flash('✅ MahaDBT record created');
      }
      setEditMasterId(null);
      setMasterForm({ categories:[], courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'' });
      fetchMasters();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Save failed')); }
    finally { setMasterSaving(false); }
  };

  const handleMasterDelete = async (id, label) => {
    if (!window.confirm(`Delete MahaDBT record: ${label}?`)) return;
    try {
      await API.delete(`/scholarships/master/${id}`);
      flash('✅ Deleted');
      fetchMasters();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Delete failed')); }
  };

  /* ── helpers ── */
  const yearTotal = (items, yearKey) => {
    if (!items) return 0;
    const [i0, i1] = YEAR_SEM_IDX[yearKey];
    return items.reduce((s, item) => s + (item.s[i0]||0) + (item.s[i1]||0), 0);
  };

  const uItems = activeDoc?.items?.filter(i => i.section === 'University') || [];
  const cItems = activeDoc?.items?.filter(i => i.section === 'College')    || [];

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h2 style={{ color:'#1565C0', margin:'0 0 4px' }}>🏛️ Fee Structure Manager</h2>
          <p style={{ color:'#666', margin:0, fontSize:14 }}>Manage college fees & MahaDBT receivable — edit, add, delete per item</p>
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ display:'flex', gap:0, background:'#f0f4f8', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {[
          { id:'total',   label:'🏛️ Total College Fees' },
          { id:'mahadbt', label:'📊 MahaDBT Receivable' },
          { id:'doc',     label:'📄 Document Fees' },
        ].map(t => (
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{
            padding:'9px 24px', borderRadius:8, border:'none',
            background: subTab===t.id ? '#1565C0' : 'transparent',
            color:       subTab===t.id ? '#fff'    : '#555',
            fontWeight:  subTab===t.id ? 700       : 500,
            fontSize:13, cursor:'pointer', transition:'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div style={{ padding:'11px 16px', borderRadius:10, marginBottom:16, fontWeight:600, fontSize:14,
          background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
          color:      msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
          {msg}
        </div>
      )}

      {/* ══════════════════════════════════════
          SUB-TAB 1 — TOTAL COLLEGE FEES
      ══════════════════════════════════════ */}
      {subTab === 'total' && (
        <div>
          {/* Controls */}
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
            <select value={course} onChange={e=>setCourse(e.target.value)} style={{ ...inp, width:130 }}>
              {COURSES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={ay} onChange={e=>setAy(e.target.value)} style={{ ...inp, width:130 }}>
              {ACADEMIC_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            {!activeDoc ? (
              <>
                <button onClick={handleSeedDefaults} style={btn('#e3f2fd','#1565C0','#90caf9')}>
                  📥 Load 2025-26 Defaults
                </button>
                <button onClick={handleCreateStructure} style={btn('#e8f5e9','#2E7D32','#a5d6a7')}>
                  ➕ Create Empty
                </button>
              </>
            ) : (
              <>
                <button onClick={()=>setShowAdd(v=>!v)} style={btn('#1565C0','#fff')}>
                  {showAdd ? '✕ Cancel Add' : '➕ Add Fee Item'}
                </button>
                <button onClick={deleteStructure} style={btn('#ffebee','#C62828','#ef9a9a')}>
                  🗑️ Delete Structure
                </button>
              </>
            )}
          </div>

          {/* Year totals summary bar */}
          {activeDoc && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {Object.entries(YEAR_LABELS).map(([key, label]) => {
                const total = yearTotal(activeDoc.items, key);
                return (
                  <div key={key} style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:12, padding:'14px 18px' }}>
                    <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#1565C0' }}>{label}</p>
                    <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#0d47a1' }}>₹{fmt(total)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new item form */}
          {showAdd && activeDoc && (
            <div style={{ background:'#f8faff', border:'2px dashed #1565C0', borderRadius:12, padding:18, marginBottom:20 }}>
              <h4 style={{ color:'#1565C0', margin:'0 0 14px', fontSize:14 }}>➕ Add New Fee Item</h4>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:5 }}>Item Name *</label>
                  <input style={inp} value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="e.g. New Development Fee" />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:5 }}>Section *</label>
                  <select style={inp} value={newItem.section} onChange={e=>setNewItem(p=>({...p,section:e.target.value}))}>
                    {SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* 6 semester inputs */}
              <p style={{ fontSize:12, fontWeight:700, color:'#555', margin:'0 0 8px' }}>Amount per Semester (₹)</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:14 }}>
                {SEM_LABELS.map((sl,i) => (
                  <div key={i}>
                    <label style={{ fontSize:11, color:'#888', display:'block', marginBottom:3 }}>{sl}</label>
                    <input type="number" min="0" style={{ ...inp, textAlign:'right' }}
                      value={newItem.s[i]} onChange={e=>{
                        const s=[...newItem.s]; s[i]=Number(e.target.value)||0;
                        setNewItem(p=>({...p,s}));
                      }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addItem} style={btn('#1565C0','#fff')}>✅ Add Item</button>
                <button onClick={()=>setShowAdd(false)} style={btn('#eee','#555')}>Cancel</button>
              </div>
            </div>
          )}

          {/* No structure found */}
          {!loading && !activeDoc && (
            <div style={{ background:'#fafbff', borderRadius:14, border:'1px solid #e0e7ef', padding:'40px', textAlign:'center', color:'#aaa' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <p style={{ fontSize:15, fontWeight:600, color:'#555' }}>No fee structure found for {course} AY {ay}</p>
              <p style={{ fontSize:13, color:'#aaa' }}>Click "Load 2025-26 Defaults" to seed from Excel data, or "Create Empty" to start fresh.</p>
            </div>
          )}

          {/* Fee items table */}
          {activeDoc && (
            <>
              {[
                { label:'🎓 University Fees (A)', items: uItems, bg:'#e8eaf6', hbg:'#3949AB' },
                { label:'🏫 College Fees (B)',    items: cItems, bg:'#e8f5e9', hbg:'#2E7D32' },
              ].map(({ label, items, bg, hbg }) => (
                <div key={label} style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', overflow:'hidden', marginBottom:20 }}>
                  <div style={{ background:hbg, padding:'11px 16px' }}>
                    <span style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{label}</span>
                  </div>

                  {/* Header */}
                  <div style={{ display:'grid', gridTemplateColumns:'2.5fr repeat(6,1fr) 1fr 80px', background:'#f8f9ff', borderBottom:'2px solid #e0e7ef' }}>
                    <div style={th}>Fee Item</div>
                    {SEM_LABELS.map(sl=><div key={sl} style={{ ...th, color:'#555', fontSize:11 }}>{sl}</div>)}
                    <div style={{ ...th, color:'#555' }}>Year Totals</div>
                    <div style={th}></div>
                  </div>

                  {items.length === 0 && (
                    <div style={{ padding:'20px', textAlign:'center', color:'#aaa', fontSize:13 }}>No items in this section</div>
                  )}

                  {items.map(item => {
                    const isEditing = editItemId === item.id;
                    const vals = isEditing ? editValues : item;
                    const fyT  = (vals.s[0]||0)+(vals.s[1]||0);
                    const syT  = (vals.s[2]||0)+(vals.s[3]||0);
                    const tyT  = (vals.s[4]||0)+(vals.s[5]||0);

                    return (
                      <div key={item.id} style={{
                        display:'grid', gridTemplateColumns:'2.5fr repeat(6,1fr) 1fr 80px',
                        alignItems:'center',
                        background: isEditing ? '#fffde7' : '#fff',
                        borderBottom:'1px solid #f0f4f8',
                      }}>
                        {/* Name */}
                        <div style={td}>
                          {isEditing ? (
                            <input style={inp} value={vals.name}
                              onChange={e=>setEditValues(p=>({...p,name:e.target.value}))} />
                          ) : (
                            <span style={{ fontSize:13, fontWeight:500, color:'#222' }}>{item.name}</span>
                          )}
                        </div>

                        {/* 6 semester amounts */}
                        {[0,1,2,3,4,5].map(i => (
                          <div key={i} style={td}>
                            {isEditing ? (
                              <input type="number" min="0"
                                style={{ ...inp, width:72, textAlign:'right', padding:'5px 6px' }}
                                value={vals.s[i]}
                                onChange={e=>{
                                  const s=[...vals.s]; s[i]=Number(e.target.value)||0;
                                  setEditValues(p=>({...p,s}));
                                }} />
                            ) : (
                              <span style={{ fontSize:12, color: item.s[i] ? '#333' : '#ccc', fontWeight: item.s[i] ? 600 : 400 }}>
                                {item.s[i] ? `₹${fmt(item.s[i])}` : '—'}
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Year totals mini */}
                        <div style={{ ...td, fontSize:11, color:'#888', lineHeight:1.6 }}>
                          <span style={{ display:'block' }}>FY: <b>₹{fmt(fyT)}</b></span>
                          <span style={{ display:'block' }}>SY: <b>₹{fmt(syT)}</b></span>
                          <span style={{ display:'block' }}>TY: <b>₹{fmt(tyT)}</b></span>
                        </div>

                        {/* Actions */}
                        <div style={{ ...td, display:'flex', gap:4, justifyContent:'center' }}>
                          {isEditing ? (
                            <>
                              <button onClick={saveItem} disabled={saving}
                                style={{ padding:'4px 8px', background:'#2E7D32', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                {saving ? '⏳' : '💾'}
                              </button>
                              <button onClick={()=>setEditItemId(null)}
                                style={{ padding:'4px 8px', background:'#eee', color:'#555', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }}>
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={()=>startEdit(item)}
                                style={{ padding:'4px 8px', background:'#e3f2fd', color:'#1565C0', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }}>
                                ✏️
                              </button>
                              <button onClick={()=>deleteItem(item.id, item.name)}
                                style={{ padding:'4px 8px', background:'#ffebee', color:'#C62828', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }}>
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Section subtotal */}
                  {items.length > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'2.5fr repeat(6,1fr) 1fr 80px', background: hbg+'22', borderTop:`2px solid ${hbg}44` }}>
                      <div style={{ ...td, fontWeight:800, color:'#333' }}>Subtotal ({label.split(' ')[0]})</div>
                      {[0,1,2,3,4,5].map(i=>(
                        <div key={i} style={{ ...td, fontWeight:700, color:'#333' }}>
                          {items.reduce((s,it)=>s+(it.s[i]||0),0) > 0
                            ? `₹${fmt(items.reduce((s,it)=>s+(it.s[i]||0),0))}`
                            : '—'}
                        </div>
                      ))}
                      <div style={{ ...td, fontSize:11, color:'#555' }}>
                        {Object.entries(YEAR_LABELS).map(([k,l])=>(
                          <span key={k} style={{ display:'block' }}>
                            {k}: <b>₹{fmt(yearTotal(items,k))}</b>
                          </span>
                        ))}
                      </div>
                      <div style={td}></div>
                    </div>
                  )}
                </div>
              ))}

              {/* Grand total row */}
              <div style={{ background:'#1565C0', borderRadius:12, padding:'14px 20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {Object.entries(YEAR_LABELS).map(([key, label]) => (
                  <div key={key} style={{ textAlign:'center' }}>
                    <p style={{ margin:'0 0 2px', fontSize:12, color:'rgba(255,255,255,0.75)', fontWeight:600 }}>
                      {label} — Grand Total
                    </p>
                    <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#fff' }}>
                      ₹{fmt(yearTotal(activeDoc.items, key))}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          SUB-TAB 2 — MAHADBT RECEIVABLE
      ══════════════════════════════════════ */}
      {subTab === 'mahadbt' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr', gap:20 }}>

          {/* ── Form panel ── */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
            <h4 style={{ color:'#7B1FA2', margin:'0 0 16px', fontSize:14 }}>
              {editMasterId ? '✏️ Edit Record' : '➕ Add New Record'}
            </h4>

            {/* Categories multi-select */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:8 }}>
                Categories *
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {ALL_CATS.map(cat => {
                  const sel = masterForm.categories.includes(cat);
                  return (
                    <button key={cat} type="button" onClick={()=>{
                      const cats = sel
                        ? masterForm.categories.filter(c=>c!==cat)
                        : [...masterForm.categories, cat];
                      setMasterForm(p=>({...p, categories:cats}));
                    }} style={{
                      padding:'4px 10px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight: sel ? 700 : 500,
                      border:`2px solid ${sel ? '#7B1FA2' : '#ddd'}`,
                      background: sel ? '#f3e5f5' : '#fafafa',
                      color:      sel ? '#7B1FA2' : '#888',
                    }}>
                      {sel && '✓ '}{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {[
              { label:'Course Type *', field:'courseType', type:'select', opts:['','B.Sc.','B.A.'] },
              { label:'Admission Year *', field:'admissionYear', type:'select', opts:['FY','SY','TY'] },
              { label:'Academic Year *', field:'academicYear', type:'select', opts:ACADEMIC_YEARS },
            ].map(({ label, field, type, opts }) => (
              <div key={field} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:5 }}>{label}</label>
                <select style={inp} value={masterForm[field]} onChange={e=>setMasterForm(p=>({...p,[field]:e.target.value}))}>
                  {opts.map(o=><option key={o} value={o}>{o||'Select...'}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:5 }}>
                MahaDBT Receivable Amount (₹) *
              </label>
              <input type="number" min="0" style={{ ...inp, fontSize:18, fontWeight:700, textAlign:'right' }}
                value={masterForm.scholarshipAmount}
                onChange={e=>setMasterForm(p=>({...p, scholarshipAmount:e.target.value}))}
                placeholder="e.g. 26140" />
              <p style={{ fontSize:11, color:'#7B1FA2', margin:'4px 0 0' }}>
                Reserved categories = full amount. OPEN = Tuition Fee only.
              </p>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:5 }}>Description</label>
              <input style={inp} value={masterForm.description} onChange={e=>setMasterForm(p=>({...p,description:e.target.value}))} placeholder="Optional note..." />
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleMasterSave} disabled={masterSaving}
                style={{ flex:1, padding:'10px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {masterSaving ? '⏳...' : editMasterId ? '💾 Update' : '➕ Add Record'}
              </button>
              {editMasterId && (
                <button onClick={()=>{
                  setEditMasterId(null);
                  setMasterForm({ categories:[], courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'' });
                }} style={{ padding:'10px 14px', background:'#eee', color:'#333', border:'none', borderRadius:8, cursor:'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* ── Records table ── */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', overflow:'hidden' }}>
            <div style={{ background:'#7B1FA2', padding:'13px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:14 }}>
                📊 MahaDBT Records ({masters.length})
              </span>
              <select value={ay} onChange={e=>setAy(e.target.value)}
                style={{ padding:'5px 10px', borderRadius:7, border:'1px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:12 }}>
                <option value="all" style={{ color:'#333' }}>All Years</option>
                {ACADEMIC_YEARS.map(y=><option key={y} value={y} style={{ color:'#333' }}>{y}</option>)}
              </select>
            </div>

            {masterLoading ? (
              <div style={{ padding:'30px', textAlign:'center', color:'#aaa' }}>⏳ Loading...</div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1.4fr 0.9fr 0.6fr 0.9fr 1.1fr 0.8fr', padding:'9px 14px', background:'#f8f9ff', borderBottom:'2px solid #e0e7ef', gap:8 }}>
                  {['Category','Course','Year','Acad Year','Amount (₹)',''].map(h=>(
                    <span key={h} style={{ fontSize:11, fontWeight:700, color:'#555' }}>{h}</span>
                  ))}
                </div>
                <div style={{ maxHeight:520, overflowY:'auto' }}>
                  {masters
                    .filter(m => ay === 'all' || m.academicYear === ay)
                    .map((m, idx) => {
                      const catDisplay = m.categories?.length > 1
                        ? `${m.categories[0]} +${m.categories.length-1}`
                        : m.category || m.categories?.[0] || '—';
                      const isOpen = m.categories?.includes('OPEN') && m.categories?.length === 1;
                      return (
                        <div key={m._id} style={{
                          display:'grid', gridTemplateColumns:'1.4fr 0.9fr 0.6fr 0.9fr 1.1fr 0.8fr',
                          padding:'10px 14px', gap:8, alignItems:'center',
                          borderBottom:'1px solid #f0f4f8',
                          background: idx%2===0 ? '#fafbff' : '#fff',
                        }}>
                          <div>
                            <span title={m.categories?.join(', ')} style={{
                              fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:8, cursor:'help',
                              background: isOpen ? '#fff3e0' : '#e8f5e9',
                              color:      isOpen ? '#E65100' : '#2E7D32',
                            }}>{catDisplay}</span>
                          </div>
                          <span style={{ fontSize:12, color:'#333' }}>{m.courseType}</span>
                          <span style={{ fontSize:12, color:'#555' }}>{m.admissionYear}</span>
                          <span style={{ fontSize:11, color:'#888' }}>{m.academicYear}</span>
                          <span style={{ fontSize:14, fontWeight:800, color: isOpen ? '#E65100' : '#2E7D32' }}>
                            ₹{fmt(m.scholarshipAmount || m.mahaDBTReceivable)}
                          </span>
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={()=>{
                              setEditMasterId(m._id);
                              setMasterForm({
                                categories:    m.categories || (m.category ? [m.category] : []),
                                courseType:    m.courseType,
                                admissionYear: m.admissionYear,
                                academicYear:  m.academicYear,
                                scholarshipAmount: m.scholarshipAmount || m.mahaDBTReceivable || '',
                                description:   m.description || '',
                              });
                            }} style={{ fontSize:11, padding:'3px 8px', background:'#f3e5f5', color:'#7B1FA2', border:'none', borderRadius:5, cursor:'pointer' }}>✏️</button>
                            <button onClick={()=>handleMasterDelete(
                              m._id,
                              `${(m.categories||[]).join('+')} ${m.courseType} ${m.admissionYear} ${m.academicYear}`
                            )} style={{ fontSize:11, padding:'3px 8px', background:'#ffebee', color:'#C62828', border:'none', borderRadius:5, cursor:'pointer' }}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  {masters.filter(m => ay==='all' || m.academicYear===ay).length === 0 && (
                    <div style={{ padding:'30px', textAlign:'center', color:'#aaa', fontSize:13 }}>
                      No MahaDBT records found for {ay === 'all' ? 'any year' : ay}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════
          SUB-TAB 3 — DOCUMENT FEES
      ══════════════════════════════════════ */}
      {subTab === 'doc' && (
        <DocFeesPanel docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast} flash={flash} fmt={fmt} />
      )}
    </div>
  );
};

/* ── Document Fees Panel — separate component (hooks rules) ── */
const DocFeesPanel = ({ docFees, setDocFees, saveDocFees, showToast }) => {
  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState({});
  const fmtN = n => Number(n||0).toLocaleString('en-IN');
  const bStyle = (bg, color) => ({ padding:'9px 18px', background:bg, color, border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' });

  if (!docFees) return null;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h3 style={{ color:'#1565C0', margin:'0 0 4px' }}>📄 Document Fee Amounts</h3>
          <p style={{ color:'#666', fontSize:13, margin:0 }}>Fee charged per document type for students.</p>
        </div>
        {!editMode ? (
          <button onClick={() => { setEdits(Object.fromEntries(Object.entries(docFees).map(([k,v]) => [k, v.price]))); setEditMode(true); }}
            style={bStyle('#1565C0','#fff')}>✏️ Edit Fees</button>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => {
              const updated = {...docFees};
              Object.entries(edits).forEach(([k,v]) => { updated[k] = {...updated[k], price: Number(v)||0}; });
              setDocFees(updated);
              if (saveDocFees) saveDocFees(updated);
              if (showToast) showToast('Document fees saved!');
              setEditMode(false);
            }} style={bStyle('#2E7D32','#fff')}>💾 Save</button>
            <button onClick={() => setEditMode(false)} style={bStyle('#eee','#333')}>Cancel</button>
          </div>
        )}
      </div>
      <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 180px', background:'#1565C0', padding:'12px 20px' }}>
          <span style={{ color:'#fff', fontWeight:700 }}>Document Type</span>
          <span style={{ color:'#fff', fontWeight:700, textAlign:'right' }}>Fee (₹)</span>
        </div>
        {Object.entries(docFees).map(([key, val], idx) => (
          <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 180px', padding:'14px 20px', alignItems:'center', borderBottom:'1px solid #f0f4f8', background: idx%2===0 ? '#fafbff' : '#fff' }}>
            <span style={{ fontSize:14, color:'#222', fontWeight:500 }}>{val.label}</span>
            {editMode ? (
              <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6 }}>
                <span style={{ color:'#555', fontWeight:600 }}>₹</span>
                <input type="number" min="0" value={edits[key] ?? val.price}
                  onChange={e => setEdits(p => ({...p, [key]: e.target.value}))}
                  style={{ width:100, padding:'7px 10px', borderRadius:7, border:'2px solid #1565C0', fontSize:15, fontWeight:600, textAlign:'right' }} />
              </div>
            ) : (
              <span style={{ textAlign:'right', fontWeight:700, fontSize:16, color: val.price > 0 ? '#1565C0' : '#aaa' }}>
                {val.price > 0 ? `₹ ${fmtN(val.price)}` : '—'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Fee Structure Tab — alias to FeeStructureManager ────────────────────────
const FeeStructTab = ({ docFees, setDocFees, saveDocFees, showToast, user }) => {
  return <FeeStructureManager user={user} docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast} />;
};



const AccountsStudentFeeView = ({ themeColor }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/admissions/staff-view/all')
      .then(res => setStudents(res.data.admissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getCourseKey = (courseType) => {
    const ct = (courseType||'').toLowerCase();
    return ct.includes('b.sc')||ct.includes('bsc') ? 'B.Sc.' : ct.includes('b.a')||ct.includes('ba') ? 'B.A.' : null;
  };

  const getYearFee = (s) => {
    const ck = getCourseKey(s.courseType);
    if (!ck || !YEARLY_FEES[ck]) return 0;
    const yr = s.admissionYear;
    return YEARLY_FEES[ck].years?.[yr]?.total || YEARLY_FEES[ck][yr] || 0;
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.applicantName?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  const totalFees    = filtered.reduce((s,st) => s + getYearFee(st), 0);
  const totalPaid    = filtered.reduce((s,st) => s + (st.feeLedger||[]).reduce((a,p)=>a+(p.amount||0),0), 0);
  const totalPending = Math.max(0, totalFees - totalPaid);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:20 }}>
        <div style={{ background:'#e3f2fd', borderRadius:12, padding:'14px 18px' }}>
          <div style={{ fontSize:12, color:'#1565C0', fontWeight:600 }}>Total Annual Fees</div>
          <div style={{ fontSize:20, fontWeight:800, color:'#0d47a1' }}>₹{totalFees.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background:'#e8f5e9', borderRadius:12, padding:'14px 18px' }}>
          <div style={{ fontSize:12, color:'#2E7D32', fontWeight:600 }}>Total Collected</div>
          <div style={{ fontSize:20, fontWeight:800, color:'#1b5e20' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background:'#ffebee', borderRadius:12, padding:'14px 18px' }}>
          <div style={{ fontSize:12, color:'#C62828', fontWeight:600 }}>Total Pending</div>
          <div style={{ fontSize:20, fontWeight:800, color:'#b71c1c' }}>₹{totalPending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <input type="text" placeholder="🔍 Search student..." value={search} onChange={e=>setSearch(e.target.value)}
        style={{ width:'100%', padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14, marginBottom:14, boxSizing:'border-box' }} />

      {loading ? <div style={{textAlign:'center',padding:20}}>⏳</div> : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr', background:themeColor, padding:'10px 14px', gap:8 }}>
            {['Student','Course/Year','Annual Fee','Paid','Pending','Status'].map(h=>(
              <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
            ))}
          </div>
          {filtered.map((s,idx) => {
            const annual  = getYearFee(s);
            const paid    = (s.feeLedger||[]).reduce((a,p)=>a+(p.amount||0),0);
            const pending = Math.max(0, annual - paid);
            const status  = s.tcIssued ? 'TC Issued' : pending === 0 && annual > 0 ? 'Fully Paid' : paid > 0 ? 'Partial' : 'Unpaid';
            const statusColor = { 'Fully Paid':'#2E7D32', Partial:'#E65100', Unpaid:'#C62828', 'TC Issued':'#7B1FA2' }[status] || '#888';
            return (
              <div key={s._id} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr', padding:'10px 14px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                <div>
                  <p style={{ fontWeight:600, fontSize:13, margin:0 }}>{s.applicantName}</p>
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.studentId||'—'}</p>
                </div>
                <span style={{ fontSize:12 }}>{s.courseType} · {s.admissionYear}</span>
                <span style={{ fontSize:12, fontWeight:700 }}>₹{annual.toLocaleString('en-IN')}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'#2E7D32' }}>₹{paid.toLocaleString('en-IN')}</span>
                <span style={{ fontSize:12, fontWeight:700, color: pending>0?'#C62828':'#2E7D32' }}>₹{pending.toLocaleString('en-IN')}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10, background:`${statusColor}22`, color:statusColor }}>{status}</span>
              </div>
            );
          })}
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
  const [admCollectDocMode, setAdmCollectDocMode] = useState(false);
  const [admDocType, setAdmDocType] = useState(''); // eslint-disable-line no-unused-vars
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

      // Build itemized breakdown from selected fee items
      const ct = (selectedAdm.courseType||'').toLowerCase();
      const ck = ct.includes('b.sc')||ct.includes('bsc') ? 'B.Sc.' : ct.includes('b.a')||ct.includes('ba') ? 'B.A.' : null;
      const course2 = ck ? DETAILED_FEES[ck] : null;
      const feeBreakdown = course2 && Object.keys(selectedFeeItems).length > 0
        ? course2.items
            .filter(item => selectedFeeItems[item.id])
            .map((item, i) => {
              const semIdxs = { '1st Year':[0,1], '2nd Year':[2,3], '3rd Year':[4,5] };
              const idxs = semIdxs[selectedAdm.admissionYear||'1st Year'] || [0,1];
              const yearAmt = (item.s[idxs[0]]||0) + (item.s[idxs[1]]||0);
              return { sr: i+1, particular: item.name, amount: yearAmt };
            }).filter(r => r.amount > 0)
        : [];

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
        feeBreakdown,
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
        feeBreakdown: entry.feeBreakdown || [],
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
    { id: 'adm_fees',   label: '💰 Collect Fees', badge: unpaidAdmCount },
    { id: 'fee_struct', label: '💼 Fee Structure' },
    { id: 'expenses',   label: '🏗️ College Expenses' },
    { id: 'history',    label: '🧾 Payment History' },
    { id: 'finance',      label: '📊 Finance Overview' },
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
                  { label: '💰 Collect Fees', sub: 'Collect admission & other fees', tab: 'adm_fees', tag: 'Important' },
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

          {/* ════════════════════════ FINANCE OVERVIEW ════════════════════════ */}
          {activeTab === 'finance' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📊 Finance Overview</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student-wise fee summary — paid, pending, and payment history.</p>
              <AccountsStudentFeeView themeColor="#1565C0" />
            </div>
          )}

          {/* ════════════════════════ ADMISSION FEES ════════════════════════ */}
          {activeTab === 'adm_fees' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>💰 Collect Fees</h2>
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
                      <button onClick={() => { setSelectedAdm(adm); setAdmFeeAmt(''); setAdmTxnId(''); setAdmPayMode('cash'); setAdmFeeType('admission'); setAdmSelectedSem(''); setAdmScholarshipAmt(adm.scholarshipAmount > 0 ? String(adm.scholarshipAmount) : ''); }}
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
              docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast} user={user}
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
              <p style={{ color: '#666', marginBottom: 14, fontSize: 14 }}>View complete student information. Click 👁️ to see details including fee history.</p>
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
        const ct = (selectedAdm.courseType||'').toLowerCase();
        const ck = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.'
          : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
        const course = ck ? DETAILED_FEES[ck] : null;
        const admYear = selectedAdm.admissionYear || '1st Year';
        // Yearly items — all sems for this year combined (unique items, max amount)
        const yearSemIdx = { '1st Year':[0,1], '2nd Year':[2,3], '3rd Year':[4,5] };
        const semIdxs = yearSemIdx[admYear] || [0,1];
        const schol = Number(admScholarshipAmt||0);

        // Build yearly item list — combine both sems, sum amounts
        const yearItems = course ? course.items.map(item => {
          const amt = (item.s[semIdxs[0]]||0) + (item.s[semIdxs[1]]||0);
          return { ...item, yearAmt: amt };
        }).filter(item => item.yearAmt > 0) : [];

        const yearTotal = yearItems.reduce((s,i) => s + i.yearAmt, 0);

        const calcSelected = (map) =>
          yearItems.reduce((s,i) => s + (map[i.id] ? i.yearAmt : 0), 0);

        const selectAll = () => {
          const m = {};
          yearItems.forEach(i => { m[i.id] = true; });
          setSelectedFeeItems(m);
          setAdmFeeAmt(String(Math.max(0, calcSelected(m) - schol)));
        };

        const clearAll = () => { setSelectedFeeItems({}); setAdmFeeAmt('0'); };

        const toggleItem = (id) => {
          const m = { ...selectedFeeItems, [id]: !selectedFeeItems[id] };
          setSelectedFeeItems(m);
          setAdmFeeAmt(String(Math.max(0, calcSelected(m) - schol)));
        };

        const selGross   = calcSelected(selectedFeeItems);
        const netPayable = Math.max(0, selGross - schol);
        const amtPaid    = Number(admFeeAmt||0);
        const balance    = Math.max(0, netPayable - amtPaid);

        const uItems = yearItems.filter(i => i.section === 'University');
        const cItems = yearItems.filter(i => i.section === 'College');

        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => { setSelectedAdm(null); setAdmFeeAmt(''); setAdmSelectedSem(''); setSelectedFeeItems({}); setAdmMsg(''); setAdmCollectDocMode(false); setAdmDocType(''); }}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:620, width:'100%', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <h2 style={{ color:'#1565C0', marginBottom:8 }}>💰 Fee Collection</h2>
              {/* Fee collection type toggle */}
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <button
                  style={{ flex:1, padding:'8px', borderRadius:8, border:`2px solid ${!admCollectDocMode?'#1565C0':'#ddd'}`, background:!admCollectDocMode?'#e3f2fd':'#fff', color:!admCollectDocMode?'#1565C0':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}
                  onClick={()=>setAdmCollectDocMode(false)}>
                  🎓 Admission / Annual Fees
                </button>
                <button
                  style={{ flex:1, padding:'8px', borderRadius:8, border:`2px solid ${admCollectDocMode?'#1565C0':'#ddd'}`, background:admCollectDocMode?'#e3f2fd':'#fff', color:admCollectDocMode?'#1565C0':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}
                  onClick={()=>setAdmCollectDocMode(true)}>
                  📄 Document Fees
                </button>
              </div>
              <p style={{ color:'#666', fontSize:13, marginBottom:16 }}>{selectedAdm.applicantName} — {selectedAdm.courseType} · {admYear} · ID: {selectedAdm.studentId||'—'}</p>

              {/* ── Scholarship & Fee Flow Strip ── */}
              {(() => {
                const scholAmt  = selectedAdm.scholarshipAmount || 0;
                const scholStat = selectedAdm.scholarshipStatus || 'not_filled';
                const cat       = (selectedAdm.category || '').toUpperCase();
                const alreadyPaid = selectedAdm.fees || 0;
                const netPay    = Math.max(0, yearTotal - scholAmt);
                const balance   = Math.max(0, netPay - alreadyPaid);

                const statColors = {
                  not_filled: { bg:'#fff3e0', color:'#E65100', label:'📝 Not Filled' },
                  filled:     { bg:'#e3f2fd', color:'#1565C0', label:'📋 Filled' },
                  approved:   { bg:'#e8f5e9', color:'#2E7D32', label:'✅ Approved' },
                  rejected:   { bg:'#ffebee', color:'#C62828', label:'❌ Rejected' },
                  disbursed:  { bg:'#f3e5f5', color:'#7B1FA2', label:'💰 Disbursed' },
                };
                const sc = statColors[scholStat] || statColors.not_filled;

                return (
                  <div style={{ background:'#f8faff', border:'1px solid #e0e7ef', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
                    {/* Row 1 — category + scholarship status */}
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
                      {cat && (
                        <span style={{ fontSize:12, fontWeight:800, padding:'3px 10px', borderRadius:20,
                          background: ['SC','ST','OBC','SBC','NT-B','NT-C','NT-D','VJ/DT(NT-A)','EWS','SEBC'].includes(cat) ? '#e8f5e9' : '#fff3e0',
                          color:      ['SC','ST','OBC','SBC','NT-B','NT-C','NT-D','VJ/DT(NT-A)','EWS','SEBC'].includes(cat) ? '#2E7D32' : '#E65100',
                        }}>{cat}</span>
                      )}
                      <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background:sc.bg, color:sc.color }}>
                        Scholarship: {sc.label}
                      </span>
                      {alreadyPaid > 0 && (
                        <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'#e8f5e9', color:'#2E7D32' }}>
                          ✅ Already Paid: ₹{alreadyPaid.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {/* Row 2 — fee calculation */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <div style={{ textAlign:'center', background:'#e3f2fd', borderRadius:8, padding:'8px 12px', minWidth:90 }}>
                        <div style={{ fontSize:10, color:'#1565C0', fontWeight:700 }}>TOTAL FEES</div>
                        <div style={{ fontSize:15, fontWeight:800, color:'#1565C0' }}>₹{yearTotal.toLocaleString('en-IN')}</div>
                      </div>
                      {scholAmt > 0 && <>
                        <span style={{ color:'#aaa', fontWeight:700, fontSize:16 }}>−</span>
                        <div style={{ textAlign:'center', background:'#f3e5f5', borderRadius:8, padding:'8px 12px', minWidth:90, border:'2px solid #ce93d8' }}>
                          <div style={{ fontSize:10, color:'#7B1FA2', fontWeight:700 }}>SCHOLARSHIP</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'#7B1FA2' }}>₹{scholAmt.toLocaleString('en-IN')}</div>
                        </div>
                        <span style={{ color:'#aaa', fontWeight:700, fontSize:16 }}>=</span>
                        <div style={{ textAlign:'center', background:'#fff3e0', borderRadius:8, padding:'8px 12px', minWidth:90 }}>
                          <div style={{ fontSize:10, color:'#E65100', fontWeight:700 }}>NET PAYABLE</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'#E65100' }}>₹{netPay.toLocaleString('en-IN')}</div>
                        </div>
                      </>}
                      {alreadyPaid > 0 && <>
                        <span style={{ color:'#aaa', fontWeight:700, fontSize:16 }}>−</span>
                        <div style={{ textAlign:'center', background:'#e8f5e9', borderRadius:8, padding:'8px 12px', minWidth:90 }}>
                          <div style={{ fontSize:10, color:'#2E7D32', fontWeight:700 }}>PAID</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'#2E7D32' }}>₹{alreadyPaid.toLocaleString('en-IN')}</div>
                        </div>
                        <span style={{ color:'#aaa', fontWeight:700, fontSize:16 }}>=</span>
                        <div style={{ textAlign:'center', background: balance > 0 ? '#ffebee' : '#e8f5e9', borderRadius:8, padding:'8px 12px', minWidth:90 }}>
                          <div style={{ fontSize:10, color: balance > 0 ? '#C62828' : '#2E7D32', fontWeight:700 }}>BALANCE</div>
                          <div style={{ fontSize:15, fontWeight:800, color: balance > 0 ? '#C62828' : '#2E7D32' }}>
                            {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '✅ Clear'}
                          </div>
                        </div>
                      </>}
                    </div>
                    {scholStat === 'not_filled' && (
                      <p style={{ margin:'8px 0 0', fontSize:11, color:'#E65100', fontWeight:600 }}>
                        ⚠️ Scholarship form not yet filled — collecting full fees. Scholarship section la contact kara.
                      </p>
                    )}
                    {scholStat === 'approved' && scholAmt > 0 && (
                      <p style={{ margin:'8px 0 0', fontSize:11, color:'#2E7D32', fontWeight:600 }}>
                        ✅ Scholarship approved — ₹{scholAmt.toLocaleString('en-IN')} automatically deducted below.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Step 1 — Select fee items */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:'#1565C0' }}>Select Fee Items</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={selectAll}
                      style={{ padding:'5px 14px', background:'#1565C0', color:'#fff', border:'none', borderRadius:7, fontWeight:700, fontSize:12, cursor:'pointer' }}>☑ Select All</button>
                    <button onClick={clearAll}
                      style={{ padding:'5px 14px', background:'#f5f5f5', color:'#555', border:'1px solid #ddd', borderRadius:7, fontWeight:700, fontSize:12, cursor:'pointer' }}>☐ Clear</button>
                  </div>
                </div>

                {!course ? (
                  <div style={{ background:'#fff3e0', padding:'10px', borderRadius:8, fontSize:13, color:'#E65100' }}>⚠️ Course not detected. Enter amount manually below.</div>
                ) : (
                  <div style={{ border:'1px solid #e0e7ef', borderRadius:10, overflow:'hidden', maxHeight:260, overflowY:'auto' }}>
                    {uItems.length > 0 && <>
                      <div style={{ background:'#e8eaf6', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1a237e', letterSpacing:0.5 }}>UNIVERSITY FEES (A)</div>
                      {uItems.map((item,idx) => (
                        <div key={item.id} onClick={() => toggleItem(item.id)}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#e8f4ff':'idx%2===0?#fafbff:#fff', userSelect:'none' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                            <span style={{ fontSize:13, color:'#333' }}>{item.name}</span>
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:'#1565C0', flexShrink:0 }}>₹{item.yearAmt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </>}
                    {cItems.length > 0 && <>
                      <div style={{ background:'#e8f5e9', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1b5e20', letterSpacing:0.5 }}>COLLEGE FEES (B)</div>
                      {cItems.map((item,idx) => (
                        <div key={item.id} onClick={() => toggleItem(item.id)}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#f0fff4':'#fff', userSelect:'none' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                            <span style={{ fontSize:13, color:'#333' }}>{item.name}</span>
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32', flexShrink:0 }}>₹{item.yearAmt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </>}
                  </div>
                )}

                {/* Fee summary */}
                {selGross > 0 && (
                  <div style={{ background:'#f8faff', border:'1px solid #e0e7ef', borderRadius:10, padding:'12px 16px', marginTop:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                      <span style={{ color:'#555' }}>Selected Total</span>
                      <span style={{ fontWeight:700 }}>₹{selGross.toLocaleString('en-IN')}</span>
                    </div>
                    {schol > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#7B1FA2', marginBottom:4 }}>
                        <span>Scholarship Deduction</span>
                        <span style={{ fontWeight:700 }}>− ₹{schol.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:800, borderTop:'2px solid #e0e7ef', paddingTop:8, marginTop:6 }}>
                      <span style={{ color:'#1565C0' }}>Net Payable</span>
                      <span style={{ color:'#1565C0' }}>₹{netPayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 — Scholarship Deduction */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:'#7B1FA2' }}>
                    🏅 Scholarship Deduction (₹)
                  </label>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {selectedAdm.scholarshipStatus === 'approved' || selectedAdm.scholarshipStatus === 'disbursed' ? (
                      <span style={{ fontSize:11, background:'#e8f5e9', color:'#2E7D32', padding:'2px 10px', borderRadius:10, fontWeight:700 }}>
                        ✅ Scholarship Approved — Auto set
                      </span>
                    ) : selectedAdm.scholarshipAmount > 0 ? (
                      <span style={{ fontSize:11, background:'#f3e5f5', color:'#7B1FA2', padding:'2px 10px', borderRadius:10, fontWeight:600 }}>
                        📋 From student record
                      </span>
                    ) : (
                      <span style={{ fontSize:11, background:'#fff3e0', color:'#E65100', padding:'2px 10px', borderRadius:10, fontWeight:600 }}>
                        ⚠️ No scholarship set
                      </span>
                    )}
                  </div>
                </div>
                <input
                  type="number" min="0"
                  placeholder="0"
                  value={admScholarshipAmt}
                  onChange={e => {
                    setAdmScholarshipAmt(e.target.value);
                    const newSchol = Number(e.target.value) || 0;
                    if (Object.keys(selectedFeeItems).length > 0) {
                      const gross = yearItems ? yearItems.reduce((s,i) => s + (selectedFeeItems[i.id] ? i.yearAmt : 0), 0) : 0;
                      setAdmFeeAmt(String(Math.max(0, gross - newSchol)));
                    }
                  }}
                  style={{
                    width:'100%', padding:'11px 14px', borderRadius:9, fontSize:17, fontWeight:800,
                    textAlign:'right', boxSizing:'border-box',
                    border: schol > 0 ? '2px solid #7B1FA2' : '2px solid #e0e7ef',
                    background: schol > 0 ? '#fdf3ff' : '#fafafa',
                    color: schol > 0 ? '#7B1FA2' : '#aaa',
                  }}
                />
                {schol > 0 && (
                  <p style={{ fontSize:12, color:'#7B1FA2', margin:'5px 0 0', fontWeight:600 }}>
                    ✅ ₹{schol.toLocaleString('en-IN')} will be deducted — student pays ₹{Math.max(0, selGross - schol).toLocaleString('en-IN')}
                  </p>
                )}
                {!schol && (
                  <p style={{ fontSize:11, color:'#aaa', margin:'4px 0 0' }}>
                    Scholarship section ne approve kelyas automatically fill hote. Manual override karta yete.
                  </p>
                )}
              </div>

              {/* Step 3 — Amount Collected */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#333', marginBottom:8 }}>Amount Collected (₹) *</label>
                <input type="number" placeholder="Enter amount" value={admFeeAmt}
                  onChange={e => setAdmFeeAmt(e.target.value)} min="0"
                  style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:'2px solid #1565C0', fontSize:18, fontWeight:700, textAlign:'center', boxSizing:'border-box', outline:'none' }} />
                {admFeeAmt && Number(admFeeAmt) > 0 && (
                  <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <div style={{ flex:1, background:'#e8f5e9', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#2E7D32', fontWeight:600, marginBottom:2 }}>AMOUNT PAID</div>
                      <div style={{ fontSize:16, fontWeight:800, color:'#1b5e20' }}>₹{amtPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ flex:1, background: balance > 0 ? '#fff3e0' : '#e8f5e9', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color: balance > 0 ? '#E65100' : '#2E7D32', fontWeight:600, marginBottom:2 }}>BALANCE DUE</div>
                      <div style={{ fontSize:16, fontWeight:800, color: balance > 0 ? '#E65100' : '#1b5e20' }}>
                        {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '✅ Fully Paid'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3 — Payment Mode */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#333', marginBottom:8 }}>Payment Mode *</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[{k:'cash',l:'💵 Cash'},{k:'online',l:'🌐 Online / UPI'}].map(m => (
                    <button key={m.k} onClick={() => setAdmPayMode(m.k)}
                      style={{ flex:1, padding:'11px', borderRadius:9, border:`2px solid ${admPayMode===m.k?'#1565C0':'#ddd'}`, background:admPayMode===m.k?'#1565C0':'#fff', color:admPayMode===m.k?'#fff':'#555', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>

              {admPayMode === 'online' && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#333', marginBottom:6 }}>Transaction ID *</label>
                  <input type="text" placeholder="UPI / Transaction Reference ID" value={admTxnId} onChange={e => setAdmTxnId(e.target.value)}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'2px solid #1565C0', fontSize:14, boxSizing:'border-box' }} />
                </div>
              )}

              {admMsg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:admMsg.startsWith('✅')?'#e8f5e9':'#ffebee', color:admMsg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight:500 }}>{admMsg}</div>}

              <button onClick={handleAdmFeeCollect} disabled={admLoading2 || !admFeeAmt || Number(admFeeAmt) <= 0}
                style={{ width:'100%', background:!admFeeAmt||Number(admFeeAmt)<=0?'#b0bec5':'#1565C0', color:'#fff', padding:15, borderRadius:10, border:'none', fontSize:15, fontWeight:700, cursor:!admFeeAmt||Number(admFeeAmt)<=0?'not-allowed':'pointer', marginBottom:10 }}>
                {admLoading2 ? '⏳ Processing...' : '🖨️ Collect & Print Receipt'}
              </button>
              <button onClick={() => { setSelectedAdm(null); setAdmFeeAmt(''); setAdmSelectedSem(''); setSelectedFeeItems({}); setAdmMsg(''); setAdmCollectDocMode(false); setAdmDocType(''); }}
                style={{ width:'100%', background:'#f3f4f6', color:'#555', padding:12, borderRadius:10, border:'none', fontSize:14, cursor:'pointer' }}>
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
