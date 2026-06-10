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
  BONAFIDE:           { label: '📋 Bonafide Certificate',           price: 30  },
  ID_CARD:            { label: '🪪 ID Card',                        price: 100 },
  MARKSHEET:          { label: '📄 Marksheet',                      price: 50  },
  MIGRATION:          { label: '📜 Migration Certificate',          price: 200 },
  TC:                 { label: '🎓 Transfer Certificate (TC)',      price: 150 },
  PROVISIONAL_DEGREE: { label: '🎓 Provisional Degree Certificate', price: 200 },
  DEGREE:             { label: '📜 Degree Certificate',             price: 300 },
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
// ─── Fee Structure Tab Component ─────────────────────────────────────────────
const FeeStructTab = ({ docFees, setDocFees, saveDocFees, showToast }) => {
  const [feeView, setFeeView]           = useState('bsc');
  const [editDocFees2, setEditDocFees2] = useState(false);
  const [docFeeEdits2, setDocFeeEdits2] = useState({});
  const [customFees, setCustomFees]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_custom_fees') || '{}'); } catch { return {}; }
  });
  const [pendingEdits, setPendingEdits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_fee_pending') || '{}'); } catch { return {}; }
  });
  const [addingItem, setAddingItem]     = useState(false);
  const [newItem, setNewItem]           = useState({ name:'', section:'College', s0:0,s1:0,s2:0,s3:0,s4:0,s5:0 });
  const [editingItem, setEditingItem]   = useState(null); // item being edited
  const [editAmounts, setEditAmounts]   = useState({});

  const courseKey = feeView === 'bsc' ? 'B.Sc.' : 'B.A.';
  const course = DETAILED_FEES[courseKey];
  const customItems = customFees[courseKey] || [];
  const allItems = course ? [...course.items, ...customItems.filter(ci => !course.items.find(i=>i.id===ci.id))] : [];

  const saveCustomFees = (cf) => {
    localStorage.setItem('lkcwsc_custom_fees', JSON.stringify(cf));
    setCustomFees(cf);
  };

  const savePending = (p) => {
    localStorage.setItem('lkcwsc_fee_pending', JSON.stringify(p));
    setPendingEdits(p);
  };

  const semLabels = ['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'];

  // Submit edit for approval
  const submitEdit = (itemId, newAmounts) => {
    const pending = { ...pendingEdits, [courseKey]: { ...(pendingEdits[courseKey]||{}), [itemId]: { amounts: newAmounts, submittedAt: new Date().toISOString(), status: 'pending' } } };
    savePending(pending);
    setEditingItem(null);
    showToast('✅ Edit submitted for Principal/Admin approval!');
  };

  const pendingForCourse = pendingEdits[courseKey] || {};
  const hasPending = Object.values(pendingForCourse).some(p => p.status === 'pending');

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#1565C0', marginBottom:4 }}>💼 Fee Structure 2025-26</h2>
          <p style={{ color:'#666', fontSize:14 }}>View and edit fee amounts. Changes require Principal/Admin approval.</p>
        </div>
        {hasPending && (
          <div style={{ background:'#fff3e0', border:'1px solid #ffe082', borderRadius:10, padding:'8px 14px', fontSize:13, color:'#E65100', fontWeight:600 }}>
            ⏳ {Object.values(pendingForCourse).filter(p=>p.status==='pending').length} edit(s) pending approval
          </div>
        )}
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

      {/* B.Sc / B.A table */}
      {(feeView==='bsc'||feeView==='ba') && (
        <div>
          {/* Sem totals */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:16 }}>
            {semLabels.map((sl,si) => {
              const total = allItems.reduce((s,i)=>s+(i.s[si]||0),0);
              const pend  = Object.values(pendingForCourse).filter(p=>p.status==='pending').length;
              return (
                <div key={sl} style={{ background:si%2===0?'#e3f2fd':'#f3e5f5', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#888' }}>{'1st 1st 2nd 2nd 3rd 3rd'.split(' ')[si]} Yr</div>
                  <div style={{ fontSize:11, color:'#555', fontWeight:600 }}>{sl}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#1565C0' }}>₹{total.toLocaleString('en-IN')}</div>
                  {pend>0 && si===0 && <div style={{ fontSize:9, color:'#E65100', fontWeight:600 }}>⏳ pending</div>}
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 0.6fr', background:'#1565C0', padding:'10px 14px', gap:6 }}>
              {['Fee Item','Section','Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI','Edit'].map(h=>(
                <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:11 }}>{h}</span>
              ))}
            </div>

            <div style={{ background:'#e8eaf6', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1a237e' }}>🏛️ UNIVERSITY FEES (A)</div>
            {allItems.filter(i=>i.section==='University').map((item,idx) => {
              const isPending = pendingForCourse[item.id]?.status === 'pending';
              const pendAmts  = pendingForCourse[item.id]?.amounts || null;
              return (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 0.6fr', padding:'7px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:isPending?'#fff8e1':idx%2===0?'#fafeff':'#fff' }}>
                  <span style={{ fontSize:12, color:'#333' }}>{item.name}{isPending&&<span style={{fontSize:10,color:'#E65100',marginLeft:4}}>⏳ pending</span>}</span>
                  <span style={{ fontSize:10, color:'#888', background:'#e8eaf6', padding:'2px 5px', borderRadius:5 }}>Univ.</span>
                  {(pendAmts||item.s).map((amt,si)=>(
                    <span key={si} style={{ fontSize:11, fontWeight:amt>0?700:400, color:amt>0?'#1565C0':'#ddd', textAlign:'right' }}>
                      {amt>0?`₹${amt}`:'—'}
                    </span>
                  ))}
                  <button onClick={()=>{ setEditingItem(item); setEditAmounts(Object.fromEntries(item.s.map((a,i)=>[i,a]))); }}
                    style={{ fontSize:10, background:'#e3f2fd', color:'#1565C0', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>✏️</button>
                </div>
              );
            })}

            <div style={{ background:'#e8f5e9', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1b5e20' }}>🏫 COLLEGE FEES (B)</div>
            {allItems.filter(i=>i.section==='College').map((item,idx) => {
              const isPending = pendingForCourse[item.id]?.status === 'pending';
              const pendAmts  = pendingForCourse[item.id]?.amounts || null;
              return (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 0.6fr', padding:'7px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:isPending?'#fff8e1':idx%2===0?'#fafff8':'#fff' }}>
                  <span style={{ fontSize:12, color:'#333' }}>{item.name}{isPending&&<span style={{fontSize:10,color:'#E65100',marginLeft:4}}>⏳ pending</span>}</span>
                  <span style={{ fontSize:10, color:'#888', background:'#e8f5e9', padding:'2px 5px', borderRadius:5 }}>College</span>
                  {(pendAmts||item.s).map((amt,si)=>(
                    <span key={si} style={{ fontSize:11, fontWeight:amt>0?700:400, color:amt>0?'#2E7D32':'#ddd', textAlign:'right' }}>
                      {amt>0?`₹${amt}`:'—'}
                    </span>
                  ))}
                  <button onClick={()=>{ setEditingItem(item); setEditAmounts(Object.fromEntries(item.s.map((a,i)=>[i,a]))); }}
                    style={{ fontSize:10, background:'#e8f5e9', color:'#2E7D32', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>✏️</button>
                </div>
              );
            })}

            {/* Total */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 0.6fr', padding:'10px 14px', gap:6, background:'#e3f2fd', borderTop:'2px solid #1565C0' }}>
              <span style={{ fontWeight:800, fontSize:13, color:'#1a237e' }}>TOTAL</span><span></span>
              {semLabels.map((_,si)=><span key={si} style={{ fontWeight:800, fontSize:12, color:'#1a237e', textAlign:'right' }}>₹{allItems.reduce((s,i)=>s+(i.s[si]||0),0).toLocaleString('en-IN')}</span>)}
              <span></span>
            </div>
          </div>

          {/* Add item */}
          <div style={{ marginTop:16 }}>
            {!addingItem ? (
              <button onClick={()=>setAddingItem(true)}
                style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:9, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                ➕ Add Fee Item
              </button>
            ) : (
              <div style={{ background:'#fff', borderRadius:14, border:'2px solid #1565C0', padding:20, marginTop:10 }}>
                <h4 style={{ color:'#1565C0', marginBottom:14 }}>➕ Add New Fee Item — {courseKey}</h4>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Fee Item Name *</label>
                    <input type="text" placeholder="e.g. Sports Uniform Fee" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Section</label>
                    <select value={newItem.section} onChange={e=>setNewItem(p=>({...p,section:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }}>
                      <option value="University">University</option>
                      <option value="College">College</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:14 }}>
                  {semLabels.map((sl,si)=>(
                    <div key={sl}>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:4 }}>{sl}</label>
                      <input type="number" min="0" value={newItem[`s${si}`]||0} onChange={e=>setNewItem(p=>({...p,[`s${si}`]:Number(e.target.value)||0}))}
                        style={{ width:'100%', padding:'7px 8px', borderRadius:7, border:'1px solid #ddd', fontSize:13, textAlign:'right', boxSizing:'border-box' }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:11, color:'#E65100', marginBottom:10 }}>⚠️ New items will be sent for Principal/Admin approval before appearing in fee collection.</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>{
                    if (!newItem.name.trim()) return;
                    const id = 'custom_'+Date.now();
                    const item = { id, name:newItem.name.trim(), section:newItem.section, s:[0,1,2,3,4,5].map(i=>newItem[`s${i}`]||0) };
                    const cf = { ...customFees, [courseKey]: [...(customFees[courseKey]||[]), item] };
                    saveCustomFees(cf);
                    // Auto-submit for approval
                    submitEdit(id, item.s);
                    setAddingItem(false);
                    setNewItem({ name:'', section:'College', s0:0,s1:0,s2:0,s3:0,s4:0,s5:0 });
                  }} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    ✅ Add & Send for Approval
                  </button>
                  <button onClick={()=>setAddingItem(false)} style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Edit modal */}
          {editingItem && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
              onClick={()=>setEditingItem(null)}>
              <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:520, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.2)' }} onClick={e=>e.stopPropagation()}>
                <h3 style={{ color:'#1565C0', marginBottom:16 }}>✏️ Edit: {editingItem.name}</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:16 }}>
                  {semLabels.map((sl,si)=>(
                    <div key={sl}>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#555', marginBottom:4 }}>{sl}</label>
                      <input type="number" min="0" value={editAmounts[si]||0} onChange={e=>setEditAmounts(p=>({...p,[si]:Number(e.target.value)||0}))}
                        style={{ width:'100%', padding:'7px 8px', borderRadius:7, border:'2px solid #1565C0', fontSize:13, textAlign:'right', boxSizing:'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff3e0', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#E65100', marginBottom:16 }}>
                  ⚠️ Changes will be sent to <strong>Principal / Admin</strong> for approval. They will be applied only after approval.
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>submitEdit(editingItem.id, [0,1,2,3,4,5].map(i=>editAmounts[i]||0))}
                    style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    📤 Submit for Approval
                  </button>
                  <button onClick={()=>setEditingItem(null)} style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Fees */}
      {feeView==='doc' && (
        <DocFeesManager docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast} />
      )}
    </div>
  );
};

/* ── Document Fees Manager — add/edit/delete types + approval ── */
const DocFeesManager = ({ docFees, setDocFees, saveDocFees, showToast }) => {
  const [editMode,    setEditMode]    = useState(false);
  const [edits,       setEdits]       = useState({});
  const [showAdd,     setShowAdd]     = useState(false);
  const [newType,     setNewType]     = useState({ key:'', label:'', price:'' });
  const [pendingApproval, setPendingApproval] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_docfee_pending') || '[]'); } catch { return []; }
  });

  const inp = { padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' };

  const submitForApproval = (changes) => {
    const entry = {
      id: Date.now(),
      type: 'doc_fee_edit',
      changes,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [entry, ...pendingApproval].slice(0, 50);
    setPendingApproval(updated);
    localStorage.setItem('lkcwsc_docfee_pending', JSON.stringify(updated));
    showToast('✅ Changes submitted for Principal/Admin approval!');
  };

  const handleSaveEdit = () => {
    const changes = [];
    Object.entries(edits).forEach(([k, v]) => {
      if (docFees[k] && Number(v) !== docFees[k].price) {
        changes.push({ key: k, label: docFees[k].label, oldPrice: docFees[k].price, newPrice: Number(v) });
      }
    });
    if (changes.length === 0) { setEditMode(false); return; }
    submitForApproval(changes);
    setEditMode(false);
  };

  const handleAddType = () => {
    if (!newType.key.trim() || !newType.label.trim()) { showToast('Key aur Label dono required hain', 'error'); return; }
    const key = newType.key.trim().toUpperCase().replace(/\s+/g, '_');
    if (docFees[key]) { showToast('Ye type already exist karta hai', 'error'); return; }
    const updated = { ...docFees, [key]: { label: newType.label.trim(), price: Number(newType.price) || 0 } };
    setDocFees(updated);
    saveDocFees(updated);
    submitForApproval([{ key, label: newType.label, oldPrice: null, newPrice: Number(newType.price) || 0, isNew: true }]);
    setNewType({ key:'', label:'', price:'' });
    setShowAdd(false);
  };

  const handleDelete = (key) => {
    if (!window.confirm(`"${docFees[key]?.label}" delete karna chahte ho?`)) return;
    const updated = { ...docFees };
    delete updated[key];
    setDocFees(updated);
    saveDocFees(updated);
    submitForApproval([{ key, label: docFees[key]?.label, deleted: true }]);
  };

  const hasPending = pendingApproval.filter(p => p.status === 'pending').length > 0;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <p style={{ color:'#666', fontSize:14, margin:0 }}>Document fee amounts manage karo. Changes Principal/Admin approval ke baad apply honge.</p>
          {hasPending && (
            <p style={{ fontSize:12, color:'#E65100', fontWeight:600, margin:'4px 0 0' }}>
              ⏳ {pendingApproval.filter(p=>p.status==='pending').length} change(s) approval pending hain
            </p>
          )}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {!editMode ? (
            <>
              <button onClick={()=>{ setEdits(Object.fromEntries(Object.entries(docFees).map(([k,v])=>[k,v.price]))); setEditMode(true); }}
                style={{ background:'#1565C0', color:'#fff', padding:'9px 18px', borderRadius:8, border:'none', fontWeight:600, fontSize:13, cursor:'pointer' }}>✏️ Edit Fees</button>
              <button onClick={()=>setShowAdd(v=>!v)}
                style={{ background:'#2E7D32', color:'#fff', padding:'9px 18px', borderRadius:8, border:'none', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                {showAdd ? '✕ Cancel' : '➕ Add Type'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSaveEdit}
                style={{ background:'#2E7D32', color:'#fff', padding:'9px 18px', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>📤 Submit for Approval</button>
              <button onClick={()=>setEditMode(false)}
                style={{ background:'#eee', color:'#333', padding:'9px 14px', borderRadius:8, border:'none', fontSize:13, cursor:'pointer' }}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Add new type form */}
      {showAdd && (
        <div style={{ background:'#f8faff', border:'2px dashed #2E7D32', borderRadius:12, padding:16, marginBottom:16 }}>
          <h4 style={{ color:'#2E7D32', margin:'0 0 12px', fontSize:14 }}>➕ Add New Document Fee Type</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:4 }}>Key (unique) *</label>
              <input style={{ ...inp, width:'100%' }} placeholder="e.g. TRANSCRIPT" value={newType.key}
                onChange={e=>setNewType(p=>({...p,key:e.target.value.toUpperCase()}))} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:4 }}>Document Name *</label>
              <input style={{ ...inp, width:'100%' }} placeholder="e.g. 📜 Transcript Certificate" value={newType.label}
                onChange={e=>setNewType(p=>({...p,label:e.target.value}))} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:4 }}>Fee (₹)</label>
              <input type="number" min="0" style={{ ...inp, width:'100%', textAlign:'right' }} placeholder="0"
                value={newType.price} onChange={e=>setNewType(p=>({...p,price:e.target.value}))} />
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleAddType}
              style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>✅ Add & Submit for Approval</button>
            <button onClick={()=>setShowAdd(false)}
              style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Fee table */}
      <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px', background:'#1565C0', padding:'12px 20px', gap:8 }}>
          <span style={{ color:'#fff', fontWeight:700 }}>Document Type</span>
          <span style={{ color:'#fff', fontWeight:700, textAlign:'right' }}>Fee (₹)</span>
          <span style={{ color:'#fff', fontWeight:700, textAlign:'center' }}>Action</span>
        </div>
        {Object.entries(docFees).map(([key, val], idx) => (
          <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px', padding:'14px 20px', alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
            <span style={{ fontSize:14, color:'#222', fontWeight:500 }}>{val.label}</span>
            {editMode ? (
              <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:4 }}>
                <span style={{ color:'#555', fontWeight:600 }}>₹</span>
                <input type="number" min="0" value={edits[key]??val.price}
                  onChange={e=>setEdits(p=>({...p,[key]:e.target.value}))}
                  style={{ width:80, padding:'6px 8px', borderRadius:7, border:'2px solid #1565C0', fontSize:14, fontWeight:600, textAlign:'right' }} />
              </div>
            ) : (
              <span style={{ textAlign:'right', fontWeight:700, fontSize:15, color:val.price>0?'#1565C0':'#aaa' }}>
                {val.price > 0 ? `₹ ${val.price}` : '—'}
              </span>
            )}
            <div style={{ display:'flex', justifyContent:'center' }}>
              {!editMode && (
                <button onClick={()=>handleDelete(key)}
                  style={{ background:'#ffebee', color:'#C62828', border:'none', borderRadius:6, padding:'5px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editMode && (
        <div style={{ background:'#fff3e0', border:'1px solid #ffe082', borderRadius:10, padding:'10px 14px', marginTop:12, fontSize:12, color:'#E65100', fontWeight:600 }}>
          ⚠️ Changes save karne ke baad Principal → Admin approval required hai. Approve hone tak purani fees applicable rahegi.
        </div>
      )}
    </div>
  );
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
  const [showWalkIn, setShowWalkIn]       = useState(false);
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
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <h2 style={{ color: '#1565C0', margin: 0 }}>💰 Collect Fees</h2>
                <button onClick={() => setShowWalkIn(true)}
                  style={{ background:'#E65100', color:'#fff', border:'none', borderRadius:9, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  🚶 Walk-in / Old Student Fee
                </button>
              </div>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect admission fees, exam fees, and other dues from enrolled students.</p>
              {showWalkIn && <WalkInFeeModal onClose={() => setShowWalkIn(false)} user={user} API={API} showToast={showToast} />}

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

              {/* ── DOCUMENT FEES TAB ── */}
              {admCollectDocMode && (
                <div>
                  <p style={{ fontSize:13, color:'#666', marginBottom:14 }}>Select document type and collect fee:</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                    {Object.entries(docFees).map(([key, val]) => (
                      <div key={key} onClick={() => { setAdmFeeType(key); setAdmFeeAmt(String(val.price || 0)); }}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:10, border:`2px solid ${admFeeType===key?'#1565C0':'#e0e7ef'}`, background:admFeeType===key?'#e3f2fd':'#fff', cursor:'pointer' }}>
                        <span style={{ fontSize:14, fontWeight:admFeeType===key?700:500, color:admFeeType===key?'#1565C0':'#333' }}>{val.label}</span>
                        <span style={{ fontSize:14, fontWeight:800, color:admFeeType===key?'#1565C0':'#888' }}>₹{val.price}</span>
                      </div>
                    ))}
                  </div>
                  {admFeeType && docFees[admFeeType] && (
                    <div style={{ background:'#e3f2fd', borderRadius:10, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#555', fontWeight:600 }}>Selected: {docFees[admFeeType]?.label}</span>
                      <span style={{ fontSize:18, fontWeight:800, color:'#1565C0' }}>₹{docFees[admFeeType]?.price}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── ANNUAL FEES TAB ── */}
              {!admCollectDocMode && (<>
              {/* Year total info */}
              <div style={{ background:'#e3f2fd', borderRadius:10, padding:'10px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'#555', fontWeight:600 }}>Annual Fee ({admYear})</span>
                <span style={{ fontSize:16, fontWeight:800, color:'#1565C0' }}>₹{yearTotal.toLocaleString('en-IN')}</span>
              </div>

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
                    {/* Selected items list */}
                    {yearItems.filter(i => selectedFeeItems[i.id]).length > 0 && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#888', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Selected Items</div>
                        {yearItems.filter(i => selectedFeeItems[i.id]).map(item => (
                          <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:'1px solid #f0f4f8' }}>
                            <span style={{ color:'#444' }}>{item.name}</span>
                            <span style={{ fontWeight:600, color: item.section === 'University' ? '#1565C0' : '#2E7D32' }}>₹{item.yearAmt.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4, borderTop:'1px solid #e0e7ef', paddingTop:8 }}>
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

              {/* Step 2 — Amount */}
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

              </>}

              
              

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
/* ═══════════════════════════════════════════════════════════
   WALK-IN
   Collect fees from old/SY/TY students without admission record
═══════════════════════════════════════════════════════════ */
const WalkInFeeModal = ({ onClose, user, API, showToast }) => {
  const EMPTY_FORM = {
    studentName:'', phone:'', prnNo:'', rollNo:'',
    course:'B.A.', year:'2nd Year',
    feeType:'admission', amount:'', payMode:'cash', txnId:'', notes:'',
  };
  const [view, setView]       = useState('form'); // 'form' | 'receipt' | 'history'
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [receipt, setReceipt] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_walkin_history') || '[]'); } catch { return []; }
  });

  const FEE_OPTS = [
    { key:'admission',   label:'💰 Tuition / Annual Fees' },
    { key:'exam',        label:'📝 Exam Fee' },
    { key:'bonafide',    label:'📋 Bonafide Fee' },
    { key:'tc',          label:'📄 TC Fee' },
    { key:'migration',   label:'📜 Migration Fee' },
    { key:'library',     label:'📚 Library Fee' },
    { key:'development', label:'🏗️ Development Fee' },
    { key:'penalty',     label:'⚠️ Penalty / Fine' },
    { key:'other',       label:'➕ Other' },
  ];

  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' };
  const fmt = n => Number(n||0).toLocaleString('en-IN');

  const saveToHistory = (rec) => {
    const updated = [rec, ...history].slice(0, 200);
    setHistory(updated);
    localStorage.setItem('lkcwsc_walkin_history', JSON.stringify(updated));
  };

  const handleCollect = async () => {
    if (!form.studentName.trim()) { setMsg('❌ Student name required'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setMsg('❌ Enter valid amount'); return; }
    if (form.payMode === 'online' && !form.txnId.trim()) { setMsg('❌ Transaction ID required for online payment'); return; }
    setSaving(true); setMsg('');
    const receiptNo = 'WI' + Date.now().toString().slice(-6);
    const rec = {
      studentName:  form.studentName,
      phone:        form.phone,
      prnNo:        form.prnNo,
      rollNo:       form.rollNo,
      course:       form.course,
      admissionYear: form.year,
      feeType:      form.feeType,
      feeTypeLabel: FEE_OPTS.find(f=>f.key===form.feeType)?.label || form.feeType,
      amount:       Number(form.amount),
      paymentMode:  form.payMode,
      transactionId: form.txnId || '',
      notes:        form.notes,
      receiptNo,
      collectedBy:  user?.name || 'Accounts Staff',
      paidAt:       new Date().toISOString(),
    };
    try {
      await API.post('/admissions/receipts/walkin', rec);
    } catch { /* save locally if API not available */ }
    saveToHistory(rec);
    setReceipt(rec);
    setView('receipt');
    showToast?.('✅ Fee collected & receipt generated!');
    setSaving(false);
  };

  const printReceiptFn = (r) => {
    const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Times New Roman',serif;background:#fff;display:flex;justify-content:center;padding:20px}
      .page{width:400px;border:2px solid #000;padding:20px}
      .center{text-align:center}
      h2{font-size:15px;margin-bottom:2px}
      h3{font-size:12px;color:#555;margin-bottom:2px;font-weight:normal}
      .divider{border-top:2px solid #000;margin:10px 0}
      .divider2{border-top:1px dashed #aaa;margin:8px 0}
      .row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px dotted #ddd}
      .lbl{color:#555;font-weight:600;width:130px;flex-shrink:0}
      .val{font-weight:700;text-align:right}
      .total{display:flex;justify-content:space-between;padding:10px 0 6px;font-size:17px;font-weight:900}
      .footer{text-align:center;font-size:11px;color:#777;margin-top:12px;line-height:1.6}
      .stamp{border:2px solid #2E7D32;color:#2E7D32;text-align:center;padding:6px;font-size:13px;font-weight:900;letter-spacing:2px;margin:10px 0;border-radius:4px}
      @media print{body{padding:0}.print-btn{display:none}}
    </style></head><body><div class="page">
      <div class="center">
        <h2>Late Kalpana Chawla Women's Senior College</h2>
        <h3>Affiliated to SNDT Women's University, Mumbai</h3>
        <h3>Gangakhed, Dist. Parbhani, Maharashtra – 431514</h3>
      </div>
      <div class="divider"></div>
      <div class="center" style="font-size:14px;font-weight:900;letter-spacing:2px;margin-bottom:8px">FEE RECEIPT</div>
      <div class="row"><span class="lbl">Receipt No.</span><span class="val">${r.receiptNo}</span></div>
      <div class="row"><span class="lbl">Date</span><span class="val">${new Date(r.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div>
      <div class="divider2"></div>
      <div class="row"><span class="lbl">Student Name</span><span class="val">${r.studentName}</span></div>
      ${r.phone?`<div class="row"><span class="lbl">Phone</span><span class="val">${r.phone}</span></div>`:''}
      ${r.prnNo?`<div class="row"><span class="lbl">PRN No.</span><span class="val">${r.prnNo}</span></div>`:''}
      ${r.rollNo?`<div class="row"><span class="lbl">Roll No.</span><span class="val">${r.rollNo}</span></div>`:''}
      <div class="row"><span class="lbl">Course / Year</span><span class="val">${r.course} · ${r.admissionYear}</span></div>
      <div class="divider2"></div>
      <div class="row"><span class="lbl">Fee Type</span><span class="val">${r.feeTypeLabel}</span></div>
      <div class="row"><span class="lbl">Payment Mode</span><span class="val">${r.paymentMode==='online'?'Online / UPI':'Cash'}</span></div>
      ${r.transactionId?`<div class="row"><span class="lbl">Txn ID / UTR</span><span class="val">${r.transactionId}</span></div>`:''}
      ${r.notes?`<div class="row"><span class="lbl">Notes</span><span class="val">${r.notes}</span></div>`:''}
      <div class="divider"></div>
      <div class="total"><span>Amount Paid</span><span>₹ ${fmt(r.amount)}/-</span></div>
      <div class="stamp">✅ PAID</div>
      <div class="footer">
        Collected by: <strong>${r.collectedBy}</strong><br/>
        LKCWSC College Management ERP<br/>
        +91 9307162914 | lkcwsc.vnssorg.com
      </div>
      <br/>
      <button class="print-btn" onclick="window.print()" style="width:100%;padding:10px;background:#1a237e;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Print Receipt</button>
    </div></body></html>`;
    const w = window.open('','_blank','width=500,height=680');
    w.document.write(html); w.document.close();
  };

  const totalCollected = history.reduce((s,r) => s + (r.amount||0), 0);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #f0f4f8', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            {['form','history'].map(v => (
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:'7px 16px', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer',
                  background: view===v ? '#E65100' : '#f0f4f8',
                  color:      view===v ? '#fff'    : '#555' }}>
                {v==='form' ? '🚶 Collect Fee' : `🧾 History (${history.length})`}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#555' }}>✕</button>
        </div>

        <div style={{ padding:'20px 24px', flex:1 }}>

          {/* ── FORM VIEW ── */}
          {(view==='form' || view==='receipt') && (
            <>
              {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13, background:'#ffebee', color:'#C62828', fontWeight:600 }}>{msg}</div>}

              {view==='receipt' && receipt ? (
                <div style={{ background:'#e8f5e9', border:'2px solid #2E7D32', borderRadius:12, padding:20 }}>
                  <h4 style={{ color:'#2E7D32', margin:'0 0 14px', fontSize:16 }}>✅ Fee Collected!</h4>
                  <div style={{ background:'#fff', borderRadius:10, padding:14, marginBottom:16 }}>
                    {[
                      ['Receipt No.', receipt.receiptNo],
                      ['Student', receipt.studentName],
                      receipt.phone && ['Phone', receipt.phone],
                      receipt.prnNo && ['PRN No.', receipt.prnNo],
                      receipt.rollNo && ['Roll No.', receipt.rollNo],
                      ['Course / Year', `${receipt.course} · ${receipt.admissionYear}`],
                      ['Fee Type', receipt.feeTypeLabel],
                      ['Amount', `₹ ${fmt(receipt.amount)}/-`],
                      ['Payment', receipt.paymentMode==='online'?'🌐 Online':'💵 Cash'],
                      receipt.transactionId && ['Txn ID', receipt.transactionId],
                    ].filter(Boolean).map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                        <span style={{ color:'#888', fontWeight:600 }}>{l}</span>
                        <span style={{ fontWeight:700, color:l==='Amount'?'#2E7D32':'#222' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>printReceiptFn(receipt)}
                      style={{ flex:1, background:'#1565C0', color:'#fff', border:'none', borderRadius:8, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      🖨️ Print Receipt
                    </button>
                    <button onClick={()=>{ setReceipt(null); setForm(EMPTY_FORM); setView('form'); }}
                      style={{ padding:'11px 18px', background:'#fff3e0', color:'#E65100', border:'1px solid #ffcc80', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      ➕ New
                    </button>
                    <button onClick={onClose}
                      style={{ padding:'11px 18px', background:'#e8f5e9', color:'#2E7D32', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      Done ✓
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Student Name *</label>
                    <input style={inp} placeholder="e.g. Priya Santosh Sharma" value={form.studentName} onChange={e=>setForm(p=>({...p,studentName:e.target.value}))} />
                  </div>
                  {/* Phone + PRN */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Phone No.</label>
                      <input style={inp} placeholder="9876543210" maxLength={10} value={form.phone}
                        onChange={e=>{ if(/^\d{0,10}$/.test(e.target.value)) setForm(p=>({...p,phone:e.target.value})); }} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>PRN No.</label>
                      <input style={inp} placeholder="e.g. 2200123456" value={form.prnNo} onChange={e=>setForm(p=>({...p,prnNo:e.target.value}))} />
                    </div>
                  </div>
                  {/* Roll No + Course */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Roll No.</label>
                      <input style={inp} placeholder="e.g. 101" value={form.rollNo} onChange={e=>setForm(p=>({...p,rollNo:e.target.value}))} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Course</label>
                      <select style={inp} value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))}>
                        <option value="B.A.">B.A.</option>
                        <option value="B.Sc.">B.Sc.</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Year</label>
                      <select style={inp} value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                      </select>
                    </div>
                  </div>
                  {/* Fee type + Amount */}
                  <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Fee Type *</label>
                      <select style={inp} value={form.feeType} onChange={e=>setForm(p=>({...p,feeType:e.target.value}))}>
                        {FEE_OPTS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Amount (₹) *</label>
                      <input type="number" min="0" style={{ ...inp, fontSize:17, fontWeight:800, textAlign:'right' }}
                        placeholder="0" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} />
                    </div>
                  </div>
                  {/* Payment mode */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Payment Mode</label>
                      <select style={inp} value={form.payMode} onChange={e=>setForm(p=>({...p,payMode:e.target.value}))}>
                        <option value="cash">💵 Cash</option>
                        <option value="online">🌐 Online / UPI</option>
                      </select>
                    </div>
                    {form.payMode==='online' && (
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Txn ID / UTR *</label>
                        <input style={inp} placeholder="Ref No." value={form.txnId} onChange={e=>setForm(p=>({...p,txnId:e.target.value}))} />
                      </div>
                    )}
                  </div>
                  {/* Notes */}
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Notes (optional)</label>
                    <input style={inp} placeholder="e.g. Exam fee for Sem IV backlog" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
                  </div>
                  <button onClick={handleCollect} disabled={saving}
                    style={{ background:'#E65100', color:'#fff', border:'none', borderRadius:9, padding:'13px', fontWeight:700, fontSize:15, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                    {saving ? '⏳ Processing...' : '💰 Collect Fee & Generate Receipt'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── HISTORY VIEW ── */}
          {view==='history' && (
            <div>
              {/* Summary */}
              <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
                <div style={{ background:'#e8f5e9', color:'#2E7D32', borderRadius:12, padding:'12px 18px', fontWeight:700, fontSize:15 }}>
                  💰 Total Collected: ₹{fmt(totalCollected)}
                </div>
                <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:12, padding:'12px 18px', fontWeight:700, fontSize:15 }}>
                  🧾 Receipts: {history.length}
                </div>
              </div>

              {history.length === 0 ? (
                <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>
                  <div style={{ fontSize:40 }}>🧾</div>
                  <p>No walk-in receipts yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {history.map((r, idx) => (
                    <div key={idx} style={{ background:'#fafbff', border:'1px solid #e0e7ef', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:14, color:'#1a1a2e' }}>{r.studentName}</span>
                          <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'1px 8px', borderRadius:10, fontWeight:600 }}>
                            {r.course} · {r.admissionYear}
                          </span>
                          {r.prnNo && <span style={{ fontSize:11, color:'#888' }}>PRN: {r.prnNo}</span>}
                          {r.rollNo && <span style={{ fontSize:11, color:'#888' }}>Roll: {r.rollNo}</span>}
                          {r.phone && <span style={{ fontSize:11, color:'#888' }}>📱 {r.phone}</span>}
                        </div>
                        <div style={{ fontSize:12, color:'#666' }}>
                          {r.feeTypeLabel} · {r.paymentMode==='online'?'🌐 Online':'💵 Cash'} · {new Date(r.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                        </div>
                        <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>Receipt: {r.receiptNo} · By: {r.collectedBy}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:17, fontWeight:800, color:'#2E7D32', marginBottom:6 }}>₹{fmt(r.amount)}</div>
                        <button onClick={()=>printReceiptFn(r)}
                          style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:7, padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
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
      </div>
    </div>
  );
};


export default AccountsSectionDashboard;
