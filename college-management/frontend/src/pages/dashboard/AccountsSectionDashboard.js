import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';
import ExamFeeRequestsTab from './ExamFeeRequestsTab';


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

// Helper — normalize any course string to 'B.A.' / 'B.Sc.' (tolerant matching)
const normCourse = (str) => {
  const ct = (str || '').toLowerCase();
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
  DEGREE_FORM:        { label: '📝 Degree Form',                   price: 100 },
};

// Auto-calculate walk-in fee amount based on course + year + fee type
// eslint-disable-next-line no-unused-vars
const calcWalkinAmount = (course, year, feeType) => {
  if (feeType === 'admission') {
    // Tuition / annual fee depends on course + year; none once the course is completed
    if (year === 'Course completed') return '';
    return YEARLY_FEES[course]?.years?.[year]?.total ?? '';
  }
  // Fixed certificate / document fees (independent of course)
  const FIXED = {
    bonafide:  DEFAULT_DOC_FEES.BONAFIDE.price,
    tc:        DEFAULT_DOC_FEES.TC.price,
    migration: DEFAULT_DOC_FEES.MIGRATION.price,
  };
  // exam / library / development / penalty / other → no fixed structure, enter manually
  return FIXED[feeType] ?? '';
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

  const ct = (data.courseType||data.branch||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)'
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)'
    : (data.courseType||data.branch||'—');
  const classStr = courseFull + (data.admissionYear||data.year ? ' — '+(data.admissionYear||data.year) : '');

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
    .hdr{display:flex;align-items:center;gap:14px;padding:14px 28px;border-bottom:1.5px solid #000}
    .hlogo{width:84px;height:84px;object-fit:contain;flex-shrink:0;margin-left:6px}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:9px;color:#222;font-weight:700}
    .hname{font-size:13px;font-weight:900;color:#000;line-height:1.3;margin:2px 0}
    .haddr{font-size:9px;color:#333;margin-top:1px}
    .hcontact{font-size:9.5px;color:#000;font-weight:800;margin-top:2px}
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
        <div class="haddr">Gangakhed, Dist. Parbhani, Maharashtra – 431514</div>
        <div class="hcontact">📞 +91 9307162914 &nbsp;|&nbsp; ✉️ lkcwscgkd@gmail.com &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com</div>
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
  const [editDocFees2, setEditDocFees2] = useState(false); // eslint-disable-line no-unused-vars
  const [docFeeEdits2, setDocFeeEdits2] = useState({}); // eslint-disable-line no-unused-vars
  const [customFees, setCustomFees]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_custom_fees') || '{}'); } catch { return {}; }
  });
  const [pendingEdits, setPendingEdits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_fee_pending') || '{}'); } catch { return {}; }
  });
  const [addingItem, setAddingItem]     = useState(false);
  const [newItem, setNewItem]           = useState({ name:'', section:'College', s0:0,s1:0,s2:0,s3:0,s4:0,s5:0 });
  const [editingItem, setEditingItem]   = useState(null);
  const [editAmounts, setEditAmounts]   = useState({});
  // Approval records from backend — source of truth for what's approved/pending
  const [feeApprovals, setFeeApprovals] = useState([]);

  const fetchFeeApprovals = useCallback(async () => {
    try {
      const res = await API.get('/fee-structure-approvals?myOnly=true');
      setFeeApprovals(res.data.approvals || []);
    } catch { /* ignore — keep showing what we have */ }
  }, []);

  useEffect(() => { fetchFeeApprovals(); }, [fetchFeeApprovals]);

  const courseKey = feeView === 'bsc' ? 'B.Sc.' : 'B.A.';
  const course = DETAILED_FEES[courseKey];
  const customItems = customFees[courseKey] || [];

  // Reconcile with backend approvals (feeApprovals is sorted newest-first):
  //  - newest APPROVED edit per item → live override amount
  //  - newest APPROVED deletion per item → item removed from structure
  //  - newest edit/delete still in the pipeline → shows as "pending"
  const approvedOverrides = {};      // itemId -> approved amounts (live)
  const approvedDeleted   = {};      // itemId -> true (approved deletion)
  const pendingForCourse  = {};      // itemId -> { amounts, status:'pending', isDelete }
  const seenNewest        = new Set();
  feeApprovals.forEach(a => {
    if (a.courseKey !== courseKey) return;
    if (!seenNewest.has(a.itemId)) {
      seenNewest.add(a.itemId);
      if (['pending_principal', 'approved_by_principal', 'pending_admin'].includes(a.status)) {
        pendingForCourse[a.itemId] = { amounts: a.newAmounts, status: 'pending', isDelete: !!a.isDeletion, submittedAt: a.createdAt };
      }
    }
    if (a.status === 'approved' && !(a.itemId in approvedOverrides) && !(a.itemId in approvedDeleted)) {
      if (a.isDeletion) approvedDeleted[a.itemId] = true;  // newest approved deletion
      else approvedOverrides[a.itemId] = a.newAmounts;     // newest approved amounts
    }
  });

  const allItems = course
    ? [...course.items, ...customItems.filter(ci => !course.items.find(i => i.id === ci.id))]
        .filter(it => !approvedDeleted[it.id])
        .map(it => approvedOverrides[it.id] ? { ...it, s: approvedOverrides[it.id] } : it)
    : [];

  const saveCustomFees = (cf) => {
    localStorage.setItem('lkcwsc_custom_fees', JSON.stringify(cf));
    setCustomFees(cf);
  };

  const savePending = (p) => {
    localStorage.setItem('lkcwsc_fee_pending', JSON.stringify(p));
    setPendingEdits(p);
  };

  const semLabels = ['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'];

  const submitEdit = async (itemId, newAmounts, newItemMeta = null, isDeletion = false) => {
    const isNewItem = !!newItemMeta;
    const item = newItemMeta || allItems.find(i => i.id === itemId) || editingItem || {};
    const oldAmounts = isNewItem ? [] : (item.s || []);
    try {
      // Send to backend so it goes to Principal → then Admin for approval
      await API.post('/fee-structure-approvals/submit', {
        courseKey,
        itemId,
        itemName:    item.name || itemId,
        itemSection: item.section || 'College',
        oldAmounts,
        newAmounts,
        isNewItem,
        isDeletion,
      });
      // Keep a local marker so this row shows "⏳ pending" immediately for the accountant
      const pending = { ...pendingEdits, [courseKey]: { ...(pendingEdits[courseKey]||{}), [itemId]: { amounts: newAmounts, submittedAt: new Date().toISOString(), status: 'pending' } } };
      savePending(pending);
      setEditingItem(null);
      showToast(isDeletion
        ? '🗑️ Delete request Principal → Admin approval ke liye bheja gaya!'
        : '✅ Edit submitted — sent to Principal for approval!');
      fetchFeeApprovals(); // pull fresh status from backend
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Failed to submit for approval'));
    }
  };

  // Delete a fee item → routed through Principal → Admin approval (applied only after approval)
  const submitDelete = (item) => {
    if (!window.confirm(`"${item.name}" delete karne ke liye approval bhejein?\n(Principal → Admin approve karenge, tabhi structure se hatega)`)) return;
    submitEdit(item.id, (item.s && item.s.length ? item.s : [0,0,0,0,0,0]), null, true);
  };

  const hasPending = Object.keys(pendingForCourse).length > 0;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#1565C0', marginBottom:4 }}>💼 Fee Structure 2025-26</h2>
          <p style={{ color:'#666', fontSize:14 }}>View and edit fee amounts. Changes require Principal/Admin approval.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          {hasPending && (
            <div style={{ background:'#fff3e0', border:'1px solid #ffe082', borderRadius:10, padding:'8px 14px', fontSize:13, color:'#E65100', fontWeight:600 }}>
              ⏳ {Object.values(pendingForCourse).filter(p=>p.status==='pending').length} edit(s) pending approval
            </div>
          )}
          <button onClick={fetchFeeApprovals} title="Approval status latest karein"
            style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            🔄 Refresh Status
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:20, background:'#f0f4f8', borderRadius:10, padding:4, width:'fit-content' }}>
        {[{id:'bsc',label:'📗 B.Sc.'},{id:'ba',label:'📘 B.A.'},{id:'doc',label:'📄 Document Fees'}].map(t => (
          <button key={t.id} onClick={() => setFeeView(t.id)}
            style={{ padding:'9px 22px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', background:feeView===t.id?'#1565C0':'transparent', color:feeView===t.id?'#fff':'#555' }}>
            {t.label}
          </button>
        ))}
      </div>

      {(feeView==='bsc'||feeView==='ba') && (
        <div>
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

          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 1fr', background:'#1565C0', padding:'10px 14px', gap:6 }}>
              {['Fee Item','Section','Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI','Action'].map(h=>(
                <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:11 }}>{h}</span>
              ))}
            </div>

            <div style={{ background:'#e8eaf6', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1a237e' }}>🏛️ UNIVERSITY FEES (A)</div>
            {allItems.filter(i=>i.section==='University').map((item,idx) => {
              const isPending = pendingForCourse[item.id]?.status === 'pending';
              const pendAmts  = pendingForCourse[item.id]?.amounts || null;
              return (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 1fr', padding:'7px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:isPending?'#fff8e1':idx%2===0?'#fafeff':'#fff' }}>
                  <span style={{ fontSize:12, color:'#333' }}>{item.name}{isPending&&<span style={{fontSize:10,color:'#E65100',marginLeft:4}}>{pendingForCourse[item.id]?.isDelete?'🗑️ delete pending':'⏳ pending'}</span>}</span>
                  <span style={{ fontSize:10, color:'#888', background:'#e8eaf6', padding:'2px 5px', borderRadius:5 }}>Univ.</span>
                  {(pendAmts||item.s).map((amt,si)=>(
                    <span key={si} style={{ fontSize:11, fontWeight:amt>0?700:400, color:amt>0?'#1565C0':'#ddd', textAlign:'right' }}>
                      {amt>0?`₹${amt}`:'—'}
                    </span>
                  ))}
                  <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                    <button onClick={()=>{ setEditingItem(item); setEditAmounts(Object.fromEntries(item.s.map((a,i)=>[i,a]))); }}
                      style={{ fontSize:10, background:'#e3f2fd', color:'#1565C0', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>✏️</button>
                    <button onClick={()=>submitDelete(item)} title="Delete (Principal → Admin approval)"
                      style={{ fontSize:10, background:'#ffebee', color:'#C62828', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>🗑️</button>
                  </div>
                </div>
              );
            })}

            <div style={{ background:'#e8f5e9', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1b5e20' }}>🏫 COLLEGE FEES (B)</div>
            {allItems.filter(i=>i.section==='College').map((item,idx) => {
              const isPending = pendingForCourse[item.id]?.status === 'pending';
              const pendAmts  = pendingForCourse[item.id]?.amounts || null;
              return (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 1fr', padding:'7px 14px', gap:6, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:isPending?'#fff8e1':idx%2===0?'#fafff8':'#fff' }}>
                  <span style={{ fontSize:12, color:'#333' }}>{item.name}{isPending&&<span style={{fontSize:10,color:'#E65100',marginLeft:4}}>{pendingForCourse[item.id]?.isDelete?'🗑️ delete pending':'⏳ pending'}</span>}</span>
                  <span style={{ fontSize:10, color:'#888', background:'#e8f5e9', padding:'2px 5px', borderRadius:5 }}>College</span>
                  {(pendAmts||item.s).map((amt,si)=>(
                    <span key={si} style={{ fontSize:11, fontWeight:amt>0?700:400, color:amt>0?'#2E7D32':'#ddd', textAlign:'right' }}>
                      {amt>0?`₹${amt}`:'—'}
                    </span>
                  ))}
                  <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                    <button onClick={()=>{ setEditingItem(item); setEditAmounts(Object.fromEntries(item.s.map((a,i)=>[i,a]))); }}
                      style={{ fontSize:10, background:'#e8f5e9', color:'#2E7D32', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>✏️</button>
                    <button onClick={()=>submitDelete(item)} title="Delete (Principal → Admin approval)"
                      style={{ fontSize:10, background:'#ffebee', color:'#C62828', border:'none', borderRadius:5, padding:'3px 6px', cursor:'pointer', fontWeight:700 }}>🗑️</button>
                  </div>
                </div>
              );
            })}

            <div style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr repeat(6,1fr) 1fr', padding:'10px 14px', gap:6, background:'#e3f2fd', borderTop:'2px solid #1565C0' }}>
              <span style={{ fontWeight:800, fontSize:13, color:'#1a237e' }}>TOTAL</span><span></span>
              {semLabels.map((_,si)=><span key={si} style={{ fontWeight:800, fontSize:12, color:'#1a237e', textAlign:'right' }}>₹{allItems.reduce((s,i)=>s+(i.s[si]||0),0).toLocaleString('en-IN')}</span>)}
              <span></span>
            </div>
          </div>

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
                    submitEdit(id, item.s, item);
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

      {feeView==='doc' && (
        <DocFeesManager docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast} />
      )}
    </div>
  );
};

/* ── Document Fees Manager ── */
const DocFeesManager = ({ docFees, showToast }) => {
  const [editMode,    setEditMode]    = useState(false);
  const [edits,       setEdits]       = useState({});
  const [showAdd,     setShowAdd]     = useState(false);
  const [newType,     setNewType]     = useState({ key:'', label:'', price:'' });
  const [docApprovals, setDocApprovals] = useState([]);
  const fetchDocApprovals = useCallback(async () => {
    try {
      const res = await API.get('/fee-structure-approvals?myOnly=true');
      setDocApprovals((res.data.approvals || []).filter(a => a.courseKey === 'DOC'));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { fetchDocApprovals(); }, [fetchDocApprovals]);

  // Newest still-in-pipeline edit per doc key → shows as "⏳ pending" on that row
  const pendingDoc = {};
  const seenDocKey = new Set();
  docApprovals.forEach(a => {
    if (seenDocKey.has(a.itemId)) return;
    seenDocKey.add(a.itemId);
    if (['pending_principal', 'approved_by_principal', 'pending_admin'].includes(a.status)) {
      pendingDoc[a.itemId] = { newPrice: a.newAmounts?.[0], isDelete: a.newAmounts?.[0] === -1, status: a.status };
    }
  });

  const inp = { padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' };

  // Submit doc-fee changes into the SAME Accounts → Principal → Admin approval pipeline
  // used by the fee structure (courseKey 'DOC'). Nothing is applied until Admin approves.
  const submitForApproval = async (changes) => {
    try {
      for (const c of changes) {
        await API.post('/fee-structure-approvals/submit', {
          courseKey:   'DOC',
          itemId:      c.key,
          itemName:    c.label,
          itemSection: 'Document',
          oldAmounts:  c.oldPrice == null ? [] : [Number(c.oldPrice)],
          newAmounts:  c.deleted ? [-1] : [Number(c.newPrice) || 0],
          isNewItem:   !!c.isNew,
        });
      }
      showToast('✅ Changes Principal → Admin approval ke liye bheje! Approval ke baad hi apply honge.');
      fetchDocApprovals();
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Submit failed'), 'error');
    }
  };

  const handleSaveEdit = () => {
    const changes = [];
    Object.entries(edits).forEach(([k, v]) => {
      if (docFees[k] && Number(v) !== docFees[k].price) {
        changes.push({ key: k, label: docFees[k].label, oldPrice: docFees[k].price, newPrice: Number(v) });
      }
    });
    if (changes.length === 0) { setEditMode(false); return; }
    submitForApproval(changes);   // does NOT apply locally — waits for approval
    setEditMode(false);
  };

  const handleAddType = () => {
    if (!newType.key.trim() || !newType.label.trim()) { showToast('Key aur Label dono required hain', 'error'); return; }
    const key = newType.key.trim().toUpperCase().replace(/\s+/g, '_');
    if (docFees[key]) { showToast('Ye type already exist karta hai', 'error'); return; }
    // Submit for approval only — added to the live list after Admin approval.
    submitForApproval([{ key, label: newType.label.trim(), oldPrice: null, newPrice: Number(newType.price) || 0, isNew: true }]);
    setNewType({ key:'', label:'', price:'' });
    setShowAdd(false);
  };

  const handleDelete = (key) => {
    if (!window.confirm(`"${docFees[key]?.label}" delete ke liye approval bhejein? (Principal → Admin approve karenge, tabhi hatega)`)) return;
    // Submit deletion for approval only — removed from live list after Admin approval.
    submitForApproval([{ key, label: docFees[key]?.label, oldPrice: docFees[key]?.price, deleted: true }]);
  };

  const hasPending = Object.keys(pendingDoc).length > 0;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <p style={{ color:'#666', fontSize:14, margin:0 }}>Document fee amounts manage karo. Changes Principal/Admin approval ke baad apply honge.</p>
          {hasPending && (
            <p style={{ fontSize:12, color:'#E65100', fontWeight:600, margin:'4px 0 0' }}>
              ⏳ {Object.keys(pendingDoc).length} change(s) approval pending hain (Principal → Admin)
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

      <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px', background:'#1565C0', padding:'12px 20px', gap:8 }}>
          <span style={{ color:'#fff', fontWeight:700 }}>Document Type</span>
          <span style={{ color:'#fff', fontWeight:700, textAlign:'right' }}>Fee (₹)</span>
          <span style={{ color:'#fff', fontWeight:700, textAlign:'center' }}>Action</span>
        </div>
        {Object.entries(docFees).map(([key, val], idx) => (
          <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px', padding:'14px 20px', alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
            <span style={{ fontSize:14, color:'#222', fontWeight:500 }}>
              {val.label}
              {pendingDoc[key] && (
                <span style={{ marginLeft:8, fontSize:11, fontWeight:700, background:'#fff3e0', color:'#E65100', padding:'2px 8px', borderRadius:8 }}>
                  ⏳ {pendingDoc[key].isDelete ? 'delete pending' : `→ ₹${pendingDoc[key].newPrice} pending`}
                </span>
              )}
            </span>
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


// ── Old Student / Walk-in fee collections (Finance Overview) ──────────────────
// Pulls walk-in receipts persisted in the backend so old-student fees collected
// via "Old Student Fee Collect" also show up in the Finance Overview.
const WalkinCollections = ({ themeColor }) => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');

  const fetchRows = useCallback(() => {
    setLoading(true);
    API.get('/admissions/receipts/walkin/all')
      .then(res => setRows(res.data.receipts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${r.studentName||''} ${r.prnNo||''} ${r.rollNo||''} ${r.receiptNo||''} ${r.feeTypeLabel||''}`.toLowerCase().includes(q);
  });
  const total = filtered.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div style={{ marginTop:28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:10 }}>
        <div>
          <h3 style={{ color:'#E65100', margin:0 }}>🧑‍🎓 Old Student / Walk-in Collections</h3>
          <p style={{ color:'#666', fontSize:13, margin:'2px 0 0' }}>Fees collected from old/walk-in students (not in the regular admission list).</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ background:'#fff3e0', color:'#E65100', borderRadius:20, padding:'6px 16px', fontSize:13, fontWeight:700 }}>
            Total Collected: ₹{total.toLocaleString('en-IN')}
          </div>
          <button onClick={fetchRows}
            style={{ padding:'8px 14px', background:'#fff3e0', color:'#E65100', border:'1px solid #ffcc80', borderRadius:9, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <input type="text" placeholder="🔍 Search old student (name / PRN / receipt)..." value={search} onChange={e=>setSearch(e.target.value)}
        style={{ width:'100%', padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14, marginBottom:12, boxSizing:'border-box' }} />

      {loading ? (
        <div style={{ textAlign:'center', padding:20 }}>⏳</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:24, textAlign:'center', color:'#888', fontSize:14 }}>
          📭 No old-student / walk-in collections yet.
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1.2fr 1.2fr 1fr 0.9fr 1fr', background:themeColor || '#E65100', padding:'10px 14px', gap:8 }}>
            {['Student','Course / Year','Fee Type','Receipt No','Mode','Amount'].map(h=>(
              <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
            ))}
          </div>
          {filtered.map((r, idx) => (
            <div key={(r.receiptNo||'')+idx} style={{ display:'grid', gridTemplateColumns:'1.6fr 1.2fr 1.2fr 1fr 0.9fr 1fr', padding:'10px 14px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fffaf5':'#fff' }}>
              <div>
                <p style={{ fontWeight:600, fontSize:13, margin:0 }}>{r.studentName || '—'}</p>
                <p style={{ fontSize:10, color:'#888', margin:0 }}>{r.prnNo ? 'PRN: '+r.prnNo : (r.rollNo ? 'Roll: '+r.rollNo : '')}</p>
              </div>
              <span style={{ fontSize:12 }}>{r.course || '—'}{r.admissionYear ? ' · '+r.admissionYear : ''}</span>
              <span style={{ fontSize:12, color:'#555' }}>{r.feeTypeLabel || r.feeType || '—'}</span>
              <span style={{ fontSize:11, fontFamily:'monospace', color:'#E65100', fontWeight:600 }}>{r.receiptNo || '—'}</span>
              <span style={{ fontSize:11, fontWeight:700, color: r.paymentMode==='online' ? '#1565C0' : '#2E7D32' }}>{r.paymentMode==='online'?'Online':'Cash'}</span>
              <span style={{ fontSize:13, fontWeight:800, color:'#1b5e20' }}>₹{(r.amount||0).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1.2fr 1.2fr 1fr 0.9fr 1fr', padding:'10px 14px', gap:8, background:'#fff3e0', borderTop:'2px solid #E65100' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'#E65100', gridColumn:'1 / 6' }}>TOTAL</span>
            <span style={{ fontWeight:800, fontSize:13, color:'#E65100' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:20 }}>
        <div style={{ background:'#e3f2fd', borderRadius:12, padding:'14px 18px' }}>
          <div style={{ fontSize:12, color:'#1565C0', fontWeight:600 }}>Total Academic Fees</div>
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
            {['Student','Course/Year','Academic Fee','Paid','Pending','Status'].map(h=>(
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

  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState({ msg: '', type: '' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const [docRequests, setDocRequests]     = useState([]);
  const [docLoading, setDocLoading]       = useState(false);
  const [docSearch, setDocSearch]         = useState('');
  const [docFilter, setDocFilter]         = useState('pending_accounts');
  const [selectedDoc, setSelectedDoc]     = useState(null);
  const [docAction, setDocAction]         = useState('');
  const [docNotes, setDocNotes]           = useState('');
  const [docLoading2, setDocLoading2]     = useState(false);
  const [payMode, setPayMode]             = useState('cash');
  const [txnId, setTxnId]                = useState('');
  const [docFees, setDocFees]             = useState(loadDocFees());

  const [admissions, setAdmissions]         = useState([]);
  const [admLoading, setAdmLoading]         = useState(false);
  const [showWalkIn, setShowWalkIn]         = useState(false);
  const [admSearch, setAdmSearch]           = useState('');
  const [admFilter, setAdmFilter]           = useState('all');
  const [admCourseFilter, setAdmCourseFilter] = useState('all');
  const [admYearFilter, setAdmYearFilter]   = useState('all');
  const [selectedAdm, setSelectedAdm]       = useState(null);
  const [admPayMode, setAdmPayMode]         = useState('cash');
  const [admTxnId, setAdmTxnId]             = useState('');
  const [admFeeAmt, setAdmFeeAmt]           = useState('');
  const [admFeeType, setAdmFeeType]         = useState('admission');
  const [admSelectedSem, setAdmSelectedSem] = useState('');
  const [admMsg, setAdmMsg]                 = useState('');
  const [admCollectDocMode, setAdmCollectDocMode] = useState(false);
  const [admDocType, setAdmDocType]         = useState(''); // eslint-disable-line no-unused-vars
  const [selectedFeeItems, setSelectedFeeItems] = useState({});
  const [admScholarshipAmt, setAdmScholarshipAmt] = useState('');
  // Other Fee (free-form) for the Collect Fee modal — description + amount
  const [admOtherFeeOn, setAdmOtherFeeOn]   = useState(false);
  const [admOtherFeeDesc, setAdmOtherFeeDesc] = useState('');
  const [admOtherFeeAmt, setAdmOtherFeeAmt] = useState('');
  const [admLoading2, setAdmLoading2]       = useState(false);

  const [expenses, setExpenses]             = useState(() => { // eslint-disable-line no-unused-vars
    try { return JSON.parse(localStorage.getItem('lkcwsc_expenses') || '[]'); } catch { return []; }
  });
  const [expForm, setExpForm]               = useState({ description: '', amount: '', date: '', category: 'other', paidTo: '' }); // eslint-disable-line no-unused-vars
  const [expMsg, setExpMsg]                 = useState(''); // eslint-disable-line no-unused-vars

  const [payHistory, setPayHistory]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_pay_history') || '[]'); } catch { return []; }
  });

  // Full payment history (all receipts across all students) — for the Payment History tab
  const [allReceipts, setAllReceipts]       = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [histSearch, setHistSearch]         = useState('');
  const [histFrom, setHistFrom]             = useState('');
  const [histTo, setHistTo]                 = useState('');
  const [histCourse, setHistCourse]         = useState('all');
  const [histYear, setHistYear]             = useState('all');

  const fetchAllReceipts = useCallback(async () => {
    setReceiptsLoading(true);
    try {
      const res = await API.get('/admissions/receipts/all');
      setAllReceipts(res.data.receipts || []); // already sorted newest-first by backend
    } catch { /* keep whatever we have */ }
    finally { setReceiptsLoading(false); }
  }, []);

  // Approved fee-structure edits → live amounts for fee collection ({ 'B.Sc.|bsc_c2': [amts] })
  const [feeStructOverrides, setFeeStructOverrides] = useState({});
  // Approved NEW fee items (added via Fee Structure tab) → must appear in Collect Fees modal
  const [extraFeeItems, setExtraFeeItems] = useState({});   // { 'B.Sc.': [ {id,name,section,s} ] }
  // Approved DELETED fee items → must be hidden from structure & Collect Fees modal
  const [deletedFeeMap, setDeletedFeeMap] = useState({});   // { 'B.Sc.|itemId': true }
  const fetchFeeStructOverrides = useCallback(async () => {
    try {
      const res = await API.get('/fee-structure-approvals');
      const approvals = res.data.approvals || []; // newest-first (backend sorted)
      const map = {};
      const deleted = {};
      const decided = new Set();   // courseKey|itemId whose NEWEST approved decision is locked
      const customMeta = {};       // key -> {courseKey,id,name,section} for approved new items
      approvals.forEach(a => {
        if (a.courseKey === 'DOC' || a.status !== 'approved') return;
        const key = `${a.courseKey}|${a.itemId}`;
        if (!decided.has(key)) {
          decided.add(key);
          if (a.isDeletion) deleted[key] = true;       // newest decision = delete
          else map[key] = a.newAmounts;                // newest approved amounts win
        }
        // Any approved new-item approval marks this as a custom item that must show up
        if (a.isNewItem && !customMeta[key]) {
          customMeta[key] = { courseKey: a.courseKey, id: a.itemId, name: a.itemName, section: a.itemSection || 'College' };
        }
      });
      setFeeStructOverrides(map);
      setDeletedFeeMap(deleted);
      // Build the live list of approved new items (latest amounts, excluding deleted)
      const extras = {};
      Object.values(customMeta).forEach(m => {
        const key = `${m.courseKey}|${m.id}`;
        if (deleted[key]) return;
        const s = map[key] || [0, 0, 0, 0, 0, 0];
        if (!extras[m.courseKey]) extras[m.courseKey] = [];
        extras[m.courseKey].push({ id: m.id, name: m.name, section: m.section, s });
      });
      setExtraFeeItems(extras);

      // Document fees: base list with APPROVED changes applied (only post Admin approval).
      // Pending/rejected DOC edits are ignored, so the accountant keeps charging the old
      // amount until the change is fully approved.
      const effective = loadDocFees();
      const seenDoc = new Set();
      approvals.forEach(a => {
        if (a.courseKey !== 'DOC' || a.status !== 'approved') return;
        if (seenDoc.has(a.itemId)) return; // newest approved per key already applied
        seenDoc.add(a.itemId);
        const price = Number(a.newAmounts?.[0]);
        if (price === -1) {
          delete effective[a.itemId]; // approved deletion
        } else {
          effective[a.itemId] = { label: a.itemName || effective[a.itemId]?.label || a.itemId, price };
        }
      });
      setDocFees(effective);
      saveDocFees(effective);
    } catch { /* ignore — fall back to default structure */ }
  }, []);
  useEffect(() => { fetchFeeStructOverrides(); }, [fetchFeeStructOverrides]);
  // Amounts for a fee item, with approved edits applied
  const itemAmounts = (courseKey, item) => feeStructOverrides[`${courseKey}|${item.id}`] || item.s;

  // ── Admin → Accounts messages (sourced from Notices) ──
  const [messages, setMessages] = useState([]);
  const [seenMsgIds, setSeenMsgIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_acc_seen_msgs') || '[]'); } catch { return []; }
  });
  const fetchMessages = useCallback(async () => {
    try {
      const res = await API.get('/notices');
      const all = res.data.notices || [];
      const mine = all.filter(n => {
        const hasSpecific = Array.isArray(n.specificRecipients) && n.specificRecipients.length > 0;
        if (hasSpecific) return user?.email && n.specificRecipients.includes(user.email);
        return ['all', 'staff', 'staff_student'].includes(n.targetAudience);
      });
      setMessages(mine);
    } catch { /* ignore — keep what we have */ }
  }, [user?.email]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const unreadMsgCount = messages.filter(m => !seenMsgIds.includes(m._id)).length;
  // Opening the Messages tab marks everything currently shown as read
  useEffect(() => {
    if (activeTab === 'messages' && messages.length) {
      const ids = messages.map(m => m._id);
      setSeenMsgIds(ids);
      localStorage.setItem('lkcwsc_acc_seen_msgs', JSON.stringify(ids));
    }
  }, [activeTab, messages]);


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
    const selSemAmt = course && admSelectedSem ? course.semesters?.[admSelectedSem] : null;
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

      const ct = (selectedAdm.courseType||'').toLowerCase();
      const ck = ct.includes('b.sc')||ct.includes('bsc') ? 'B.Sc.' : ct.includes('b.a')||ct.includes('ba') ? 'B.A.' : null;
      const course2 = ck ? DETAILED_FEES[ck] : null;
      const breakdownItems = [
        ...((course2 && course2.items) || []),
        ...((ck && extraFeeItems[ck]) || []),
      ].filter(it => !(ck && deletedFeeMap[`${ck}|${it.id}`]));
      const feeBreakdown_semIdxs = { '1st Year':[0,1], '2nd Year':[2,3], '3rd Year':[4,5] };
      const feeBreakdown_idxs = feeBreakdown_semIdxs[selectedAdm.admissionYear||'1st Year'] || [0,1];
      const academicRows = (ck ? breakdownItems : [])
        .filter(item => selectedFeeItems[item.id])
        .map(item => {
          const s = itemAmounts(ck, item); // approved edit if any, else default
          const yearAmt = (s[feeBreakdown_idxs[0]]||0) + (s[feeBreakdown_idxs[1]]||0);
          return { particular: item.name, amount: yearAmt };
        }).filter(r => r.amount > 0);
      const docRows = Object.entries(selectedFeeItems)
        .filter(([k,v]) => k.startsWith('doc_') && v)
        .map(([k]) => { const dk = k.replace('doc_',''); return { particular: docFees[dk]?.label || 'Document Fee', amount: docFees[dk]?.price || 0 }; })
        .filter(r => r.amount > 0);
      const otherRows = (admOtherFeeOn && Number(admOtherFeeAmt) > 0)
        ? [{ particular: (admOtherFeeDesc||'').trim() || 'Other Fee', amount: Number(admOtherFeeAmt) }]
        : [];
      const feeBreakdown = [...academicRows, ...docRows, ...otherRows].map((r, i) => ({ sr: i+1, ...r }));

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
      setSelectedFeeItems({}); setAdmCollectDocMode(false);
      setAdmOtherFeeOn(false); setAdmOtherFeeDesc(''); setAdmOtherFeeAmt('');
      fetchAdmissions();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setAdmLoading2(false); }
  };

  const [examFormPendingCount, setExamFormPendingCount] = useState(0);
  const fetchExamFormBadge = useCallback(() => {
    API.get('/results/exam-form/all')
      .then(res => {
        const all = res.data.requests || [];
        setExamFormPendingCount(all.filter(r => r.feeStatus === 'pending').length);
      })
      .catch(() => {});
  }, []);
  useEffect(() => { fetchExamFormBadge(); }, [fetchExamFormBadge, activeTab]);
  // Load full payment history when the History tab is opened
  useEffect(() => { if (activeTab === 'history') fetchAllReceipts(); }, [activeTab, fetchAllReceipts]);

  // Filter + group the full receipts list for the Payment History tab
  const filteredReceipts = allReceipts.filter(r => {
    const q = histSearch.toLowerCase().trim();
    if (q) {
      const hay = `${r.studentName || ''} ${r.studentId || ''} ${r.prnNo || ''} ${r.rollNo || ''} ${r.receiptNo || ''} ${r.feeTypeLabel || r.feeType || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (histCourse !== 'all' && normCourse(r.courseType) !== histCourse) return false;
    if (histYear !== 'all' && (r.admissionYear || '') !== histYear) return false;
    if (r.paidAt) {
      const d = new Date(r.paidAt);
      if (histFrom && d < new Date(histFrom + 'T00:00:00')) return false;
      if (histTo   && d > new Date(histTo   + 'T23:59:59')) return false;
    }
    return true;
  });
  const filteredReceiptsTotal = filteredReceipts.reduce((s, r) => s + (r.amount || 0), 0);
  // Group date-wise (backend already sorts newest-first, so date order is preserved)
  const receiptsByDate = [];
  const dateIndex = {};
  filteredReceipts.forEach(r => {
    const key = r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown date';
    if (!(key in dateIndex)) { dateIndex[key] = receiptsByDate.length; receiptsByDate.push({ date: key, items: [], total: 0 }); }
    const g = receiptsByDate[dateIndex[key]];
    g.items.push(r);
    g.total += (r.amount || 0);
  });

  const downloadReceiptsCSV = () => {
    if (!filteredReceipts.length) { showToast('❌ No payments to export'); return; }
    const headers = ['Date', 'Time', 'Receipt No', 'Student Name', 'Student ID', 'Course', 'Year', 'Fee Type', 'Amount', 'Payment Mode', 'Transaction ID', 'Collected By'];
    const esc = (v) => {
      const s = (v === null || v === undefined) ? '' : v.toString().replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = [headers.join(',')];
    filteredReceipts.forEach(r => {
      const d = r.paidAt ? new Date(r.paidAt) : null;
      lines.push([
        d ? d.toLocaleDateString('en-IN') : '',
        d ? d.toLocaleTimeString('en-IN') : '',
        r.receiptNo || '',
        r.studentName || '',
        r.studentId || '',
        r.courseType || '',
        r.admissionYear || '',
        r.feeTypeLabel || r.feeType || '',
        r.amount || 0,
        r.paymentMode === 'online' ? 'Online' : 'Cash',
        r.transactionId || '',
        r.collectedBy || '',
      ].map(esc).join(','));
    });
    lines.push(['', '', '', '', '', '', '', 'TOTAL', filteredReceiptsTotal, '', '', ''].map(esc).join(','));
    const csv = '\ufeff' + lines.join('\n'); // BOM so Excel reads UTF-8 + ₹ correctly
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ CSV downloaded');
  };

  const downloadReceiptsXLSX = () => {
    if (!filteredReceipts.length) { showToast('❌ No payments to export'); return; }
    const rows = filteredReceipts.map(r => {
      const d = r.paidAt ? new Date(r.paidAt) : null;
      return {
        'Date':          d ? d.toLocaleDateString('en-IN') : '',
        'Time':          d ? d.toLocaleTimeString('en-IN') : '',
        'Receipt No':    r.receiptNo || '',
        'Student Name':  r.studentName || '',
        'PRN / Student ID': r.prnNo || r.studentId || '',
        'Roll No':       r.rollNo || '',
        'Course':        r.courseType || '',
        'Year':          r.admissionYear || '',
        'Fee Type':      r.feeTypeLabel || r.feeType || '',
        'Amount (₹)':    r.amount || 0,
        'Payment Mode':  r.paymentMode === 'online' ? 'Online' : 'Cash',
        'Transaction ID': r.transactionId || '',
        'Collected By':  r.collectedBy || '',
      };
    });
    rows.push({
      'Date': '', 'Time': '', 'Receipt No': '', 'Student Name': '', 'PRN / Student ID': '',
      'Roll No': '', 'Course': '', 'Year': '', 'Fee Type': 'TOTAL',
      'Amount (₹)': filteredReceiptsTotal, 'Payment Mode': '', 'Transaction ID': '', 'Collected By': '',
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 26 }, { wch: 12 },
      { wch: 12 }, { wch: 18 }, { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payment History');
    XLSX.writeFile(wb, `payment-history-${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('✅ Excel file downloaded');
  };


  const pendingDocCount  = docRequests.filter(r => r.status === 'pending_accounts').length;
  const paidAdmCount     = admissions.filter(a => a.feesPaid).length;
  const unpaidAdmCount   = admissions.filter(a => !a.feesPaid).length;
  const totalCollected   = payHistory.reduce((s, p) => s + (p.amount || 0), 0);

  const filteredDocs = docRequests.filter(r => {
    const matchFilter = docFilter === 'all' || r.status === docFilter;
    const q = docSearch.toLowerCase();
    const matchSearch = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Course/year options for the Collect Fees filter dropdowns (derived from the student list)
  const admCourseOptions = [...new Set(admissions.map(a => a.courseType).filter(Boolean))];
  const admYearOptions   = [...new Set(admissions.map(a => a.admissionYear).filter(Boolean))];

  const filteredAdm = admissions.filter(a => {
    const matchFilter = admFilter === 'all' || (admFilter === 'paid' ? a.feesPaid : !a.feesPaid);
    const q = admSearch.toLowerCase();
    const matchSearch = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    const matchCourse = admCourseFilter === 'all' || a.courseType === admCourseFilter;
    const matchYear   = admYearFilter === 'all' || a.admissionYear === admYearFilter;
    return matchFilter && matchSearch && matchCourse && matchYear;
  });

  const tabs = [
    { id: 'home',          label: '🏠 Dashboard' },
    { id: 'messages',      label: '📨 Messages',           badge: unreadMsgCount },
    { id: 'exam_form_req', label: '📝 Exam Form Requests', badge: examFormPendingCount },
    { id: 'doc_req',       label: '📄 Document Requests',  badge: pendingDocCount },
    { id: 'adm_fees',      label: '💰 Collect Fees',        badge: unpaidAdmCount },
    { id: 'fee_struct',    label: '💼 Fee Structure' },
    { id: 'expenses',      label: '🏗️ College Expenses' },
    { id: 'history',       label: '🧾 Payment History' },
    { id: 'finance',       label: '📊 Payment Overview' },
    { id: 'all_students',  label: '👩‍🎓 All Students' },
  ];

  return (
    <div className="dashboard-layout">

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

        {/* ── Message box: admin messages land here ── */}
        <button
          onClick={() => setActiveTab('messages')}
          style={{ margin: '0 12px 10px', padding: '12px 14px', borderRadius: 10,
            border: '1px solid #ffe0b2', background: '#fff8f0', cursor: 'pointer', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#E65100' }}>📨 Messages</span>
            {unreadMsgCount > 0 && (
              <span style={{ background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{unreadMsgCount} new</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {messages.length ? (messages[0].title || 'Message from Admin') : 'No messages yet'}
          </div>
        </button>

        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
        </div>

        {toast.msg && (
          <div style={{ margin: '12px 24px 0', padding: '12px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14,
            background: toast.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: toast.type === 'error' ? '#C62828' : '#2E7D32' }}>
            {toast.msg}
          </div>
        )}

        <div className="dashboard-content">

          {/* ════ MESSAGES (from Admin) ════ */}
          {activeTab === 'messages' && (
            <div>
              <h3 style={{ color: '#E65100', marginBottom: 4 }}>📨 Messages from Admin</h3>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Notices aur messages jo Admin ne bheje hain, yahan dikhenge.</p>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                  <div style={{ fontSize: 40 }}>📭</div>
                  <p>No messages yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.map(m => (
                    <div key={m._id} style={{ background: '#fff', border: '1px solid #eee',
                      borderLeft: `4px solid ${m.isHighlighted ? '#E65100' : '#bbb'}`, borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{m.title}</span>
                        <span style={{ fontSize: 11, color: '#888' }}>{m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN') : ''}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#444', whiteSpace: 'pre-wrap', margin: 0 }}>{m.content}</p>
                      {m.attachment ? (
                        <a href={m.attachment} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1565C0', display: 'inline-block', marginTop: 8 }}>📎 Attachment</a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ HOME ════ */}
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

          {/* ════ DOCUMENT REQUESTS ════ */}
          {activeTab === 'doc_req' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📄 Document Requests</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect fees, generate receipts, approve or reject student requests.</p>

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

          {/* ════ FINANCE OVERVIEW ════ */}
          {activeTab === 'finance' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📊 Payment Overview</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student-wise fee summary — paid, pending, and payment history.</p>
              <AccountsStudentFeeView themeColor="#1565C0" />
              <WalkinCollections themeColor="#E65100" />
            </div>
          )}

          {/* ════ ADMISSION FEES ════ */}
          {activeTab === 'adm_fees' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <h2 style={{ color: '#1565C0', margin: 0 }}>💰 Collect Fees</h2>
                <button onClick={() => setShowWalkIn(true)}
                  style={{ background:'#E65100', color:'#fff', border:'none', borderRadius:9, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                   Old Student Fee Collect
                </button>
              </div>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect admission fees, exam fees, and other dues from enrolled students.</p>
              {showWalkIn && <WalkInFeeModal onClose={() => setShowWalkIn(false)} user={user} API={API} showToast={showToast} docFees={docFees} />}

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name, student ID or email..." value={admSearch} onChange={e => setAdmSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={admFilter} onChange={e => setAdmFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Students</option>
                  <option value="unpaid">💸 Fees Pending</option>
                  <option value="paid">✅ Fees Paid</option>
                </select>
                <select value={admCourseFilter} onChange={e => setAdmCourseFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">📚 All Courses</option>
                  {admCourseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={admYearFilter} onChange={e => setAdmYearFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">🎓 All Years / Sem</option>
                  {admYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
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

          {/* ════ FEE STRUCTURE ════ */}
          {activeTab === 'fee_struct' && (
            <FeeStructTab
              docFees={docFees} setDocFees={setDocFees} saveDocFees={saveDocFees} showToast={showToast}
            />
          )}

          {/* ════ EXPENSES ════ */}
          {activeTab === 'expenses' && (
            <ExpenseTracker user={user} />
          )}

          {/* ════ PAYMENT HISTORY ════ */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🧾 Payment History</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>All fee payments — date-wise, across every student.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ background: '#e8f5e9', color: '#1b5e20', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 15 }}>
                    Total: ₹{filteredReceiptsTotal.toLocaleString('en-IN')}
                  </div>
                  <button onClick={fetchAllReceipts} style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🔄 Refresh</button>
                  <button onClick={downloadReceiptsXLSX} style={{ background: '#1b7a3d', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇️ Excel (.xlsx)</button>
                  <button onClick={downloadReceiptsCSV} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇️ CSV</button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18, background: '#f7f9fc', border: '1px solid #e0e7ef', borderRadius: 12, padding: 14 }}>
                <div style={{ flex: '1 1 220px' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>🔍 Search</label>
                  <input type="text" placeholder="PRN / Roll No / Name / Receipt / Fee type" value={histSearch} onChange={e => setHistSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Course</label>
                  <select value={histCourse} onChange={e => setHistCourse(e.target.value)}
                    style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
                    <option value="all">All Courses</option>
                    <option value="B.A.">B.A.</option>
                    <option value="B.Sc.">B.Sc.</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Year</label>
                  <select value={histYear} onChange={e => setHistYear(e.target.value)}
                    style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
                    <option value="all">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>From</label>
                  <input type="date" value={histFrom} onChange={e => setHistFrom(e.target.value)} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>To</label>
                  <input type="date" value={histTo} onChange={e => setHistTo(e.target.value)} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd' }} />
                </div>
                {(histSearch || histFrom || histTo || histCourse !== 'all' || histYear !== 'all') && (
                  <button onClick={() => { setHistSearch(''); setHistFrom(''); setHistTo(''); setHistCourse('all'); setHistYear('all'); }}
                    style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✕ Clear</button>
                )}
                <div style={{ marginLeft: 'auto', fontSize: 13, color: '#666', fontWeight: 600 }}>{filteredReceipts.length} payment(s)</div>
              </div>

              {receiptsLoading ? (
                <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading payment history…</h3></div>
              ) : filteredReceipts.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🧾</div><h3>No payments found</h3><p>Try changing the filters, or collect fees to see receipts here.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {receiptsByDate.map((grp) => (
                    <div key={grp.date}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #e3f2fd' }}>
                        <h4 style={{ margin: 0, color: '#1565C0', fontSize: 14 }}>📅 {grp.date}</h4>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1b5e20' }}>₹{grp.total.toLocaleString('en-IN')} · {grp.items.length} receipt(s)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {grp.items.map((p, i) => (
                          <div key={(p.receiptNo || '') + i} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderLeft: `4px solid ${p.isWalkin ? '#E65100' : '#2E7D32'}` }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                                <h4 style={{ margin: 0, color: '#1565C0', fontSize: 14 }}>{p.studentName || '—'}</h4>
                                {p.studentId && <span style={{ fontSize: 11, background: '#e8f5e9', color: '#1b5e20', padding: '2px 8px', borderRadius: 10, fontFamily: 'monospace' }}>{p.studentId}</span>}
                                {p.isWalkin && <span style={{ fontSize: 11, background: '#fff3e0', color: '#E65100', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>🧑‍🎓 Old Student</span>}
                                <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1565C0', padding: '2px 8px', borderRadius: 10 }}>{p.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'}</span>
                              </div>
                              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{p.feeTypeLabel || p.feeType || 'Fee'}{p.courseType ? ` • ${p.courseType}` : ''}{p.admissionYear ? ` • ${p.admissionYear}` : ''}{p.paidAt ? ` • ${new Date(p.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                              {(p.prnNo || p.rollNo) && <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{p.prnNo ? `PRN: ${p.prnNo}` : ''}{p.prnNo && p.rollNo ? ' • ' : ''}{p.rollNo ? `Roll: ${p.rollNo}` : ''}</p>}
                              <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>Receipt: {p.receiptNo || '—'}{p.transactionId ? ` • Txn: ${p.transactionId}` : ''}{p.collectedBy ? ` • By: ${p.collectedBy}` : ''}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</div>
                              <button onClick={() => printReceipt(p)}
                                style={{ marginTop: 6, background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                🖨️ Reprint
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ EXAM FORM REQUESTS ════ */}
          {activeTab === 'exam_form_req' && (
            <ExamFeeRequestsTab
              themeColor="#1565C0"
              onToast={showToast}
            />
          )}

          {/* ════ ALL STUDENTS ════ */}
          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 14, fontSize: 14 }}>View complete student information. Click 👁️ to see details including fee history.</p>
              <StudentViewFull canEdit={false} themeColor="#1565C0" role="accounts" />
            </div>
          )}
        </div>
      </main>

      {/* ════ COLLECT DOC FEE MODAL ════ */}
      {selectedDoc && docAction === 'collect' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDocModal}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>💰 Collect Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Verify payment, then generate an official receipt.</p>

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

      {/* ════ REJECT DOC MODAL ════ */}
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

      {/* ════ ADMISSION FEE MODAL ════ */}
      {selectedAdm && (() => {
        const ct = (selectedAdm.courseType||'').toLowerCase();
        const ck = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.'
          : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
        const course = ck ? DETAILED_FEES[ck] : null;
        const admYear = selectedAdm.admissionYear || '1st Year';
        const yearSemIdx = { '1st Year':[0,1], '2nd Year':[2,3], '3rd Year':[4,5] };
        const semIdxs = yearSemIdx[admYear] || [0,1];
        const schol = Number(admScholarshipAmt||0);

        // Base items = DETAILED_FEES items + approved NEW items, minus approved-DELETED items
        const baseItems = [
          ...((course && course.items) || []),
          ...((extraFeeItems[ck]) || []),
        ].filter(it => !deletedFeeMap[`${ck}|${it.id}`]);

        const yearItems = baseItems.map(item => {
          const s = itemAmounts(ck, item); // approved edit if any, else default
          const amt = (s[semIdxs[0]]||0) + (s[semIdxs[1]]||0);
          return { ...item, s, yearAmt: amt };
        }).filter(item => item.yearAmt > 0);

        const yearTotal = yearItems.reduce((s,i) => s + i.yearAmt, 0);

        const calcSelected = (map) =>
          yearItems.reduce((s,i) => s + (map[i.id] ? i.yearAmt : 0), 0);

        const otherAdd = () => (admOtherFeeOn ? Number(admOtherFeeAmt || 0) : 0);

        const selectAll = () => {
          const m = {};
          yearItems.forEach(i => { m[i.id] = true; });
          setSelectedFeeItems(m);
          setAdmFeeAmt(String(Math.max(0, calcSelected(m) - schol + otherAdd())));
        };

        const clearAll = () => { setSelectedFeeItems({}); setAdmFeeAmt(String(Math.max(0, otherAdd()))); };

        const toggleItem = (id) => {
          const m = { ...selectedFeeItems, [id]: !selectedFeeItems[id] };
          setSelectedFeeItems(m);
          setAdmFeeAmt(String(Math.max(0, calcSelected(m) - schol + otherAdd())));
        };

        const selGross   = calcSelected(selectedFeeItems);
        const netPayable = Math.max(0, selGross - schol);
        const amtPaid    = Number(admFeeAmt||0);
        const balance    = Math.max(0, netPayable - amtPaid);
        const docSelTotal = Object.entries(selectedFeeItems)
          .filter(([k,v]) => k.startsWith('doc_') && v)
          .reduce((s,[k]) => s + (docFees[k.replace('doc_','')]?.price || 0), 0);
        // Recompute suggested amount including the free-form Other Fee
        const recalcWithOther = (on, amt) => {
          const add = on ? Number(amt || 0) : 0;
          setAdmFeeAmt(String(Math.max(0, selGross + docSelTotal - schol + add)));
        };

        const uItems = yearItems.filter(i => i.section === 'University');
        const cItems = yearItems.filter(i => i.section === 'College');

        const closeAdmModal = () => {
          setSelectedAdm(null); setAdmFeeAmt(''); setAdmSelectedSem('');
          setSelectedFeeItems({}); setAdmMsg(''); setAdmCollectDocMode(false); setAdmDocType('');
          setAdmOtherFeeOn(false); setAdmOtherFeeDesc(''); setAdmOtherFeeAmt('');
        };

        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={closeAdmModal}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:620, width:'100%', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>

              <h2 style={{ color:'#1565C0', marginBottom:8 }}>💰 Fee Collection</h2>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <button
                  style={{ flex:1, padding:'8px', borderRadius:8, border:`2px solid ${!admCollectDocMode?'#1565C0':'#ddd'}`, background:!admCollectDocMode?'#e3f2fd':'#fff', color:!admCollectDocMode?'#1565C0':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}
                  onClick={()=>setAdmCollectDocMode(false)}>
                  🎓 Academic Fee
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
                  <p style={{ fontSize:13, color:'#666', marginBottom:10 }}>Document fees select karo (multiple select ho sakte hain):</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14, maxHeight:260, overflowY:'auto', border:'1px solid #e0e7ef', borderRadius:10, padding:10 }}>
                    {Object.entries(docFees).map(([key, val]) => {
                      const isSelected = !!selectedFeeItems['doc_'+key];
                      return (
                        <div key={key} onClick={() => {
                          const m = { ...selectedFeeItems, ['doc_'+key]: !selectedFeeItems['doc_'+key] };
                          setSelectedFeeItems(m);
                          const docTotal = Object.entries(m).filter(([k,v])=>k.startsWith('doc_')&&v).reduce((s,[k])=>{
                            const dKey = k.replace('doc_','');
                            return s + (docFees[dKey]?.price||0);
                          },0);
                          const annualTotal = yearItems.reduce((s,i)=>s+(m[i.id]?i.yearAmt:0),0);
                          setAdmFeeAmt(String(Math.max(0, docTotal + annualTotal - Number(admScholarshipAmt||0) + (admOtherFeeOn ? Number(admOtherFeeAmt||0) : 0))));
                        }}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:9, border:`2px solid ${isSelected?'#1565C0':'#e0e7ef'}`, background:isSelected?'#e3f2fd':'#fff', cursor:'pointer' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <input type="checkbox" checked={isSelected} readOnly style={{ width:15, height:15 }}/>
                            <span style={{ fontSize:13, fontWeight:isSelected?700:500, color:isSelected?'#1565C0':'#333' }}>{val.label}</span>
                          </div>
                          <span style={{ fontSize:14, fontWeight:700, color:isSelected?'#1565C0':'#888' }}>₹{val.price}</span>
                        </div>
                      );
                    })}
                  </div>
                  {Object.entries(selectedFeeItems).filter(([k,v])=>k.startsWith('doc_')&&v).length > 0 && (
                    <div style={{ background:'#e3f2fd', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#888', marginBottom:6 }}>SELECTED DOCUMENT FEES</div>
                      {Object.entries(selectedFeeItems).filter(([k,v])=>k.startsWith('doc_')&&v).map(([k])=>{
                        const dKey = k.replace('doc_','');
                        return (
                          <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0' }}>
                            <span>{docFees[dKey]?.label}</span>
                            <span style={{ fontWeight:700, color:'#1565C0' }}>₹{docFees[dKey]?.price}</span>
                          </div>
                        );
                      })}
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800, borderTop:'1px solid #90caf9', paddingTop:6, marginTop:4, color:'#1565C0' }}>
                        <span>Document Fees Total</span>
                        <span>₹{Object.entries(selectedFeeItems).filter(([k,v])=>k.startsWith('doc_')&&v).reduce((s,[k])=>s+(docFees[k.replace('doc_','')]?.price||0),0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ANNUAL FEES TAB ── */}
              {!admCollectDocMode && (
                <div>
                  <div style={{ background:'#e3f2fd', borderRadius:10, padding:'10px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, color:'#555', fontWeight:600 }}>Academic Fee ({admYear})</span>
                    <span style={{ fontSize:16, fontWeight:800, color:'#1565C0' }}>₹{yearTotal.toLocaleString('en-IN')}</span>
                  </div>

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

                    {yearItems.length === 0 ? (
                      <div style={{ background:'#fff3e0', padding:'10px', borderRadius:8, fontSize:13, color:'#E65100' }}>⚠️ Course not detected. Enter amount manually below.</div>
                    ) : (
                      <div style={{ border:'1px solid #e0e7ef', borderRadius:10, overflow:'hidden', maxHeight:260, overflowY:'auto' }}>
                        {uItems.length > 0 && (
                          <>
                            <div style={{ background:'#e8eaf6', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1a237e', letterSpacing:0.5 }}>UNIVERSITY FEES (A)</div>
                            {uItems.map((item, idx) => (
                              <div key={item.id} onClick={() => toggleItem(item.id)}
                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#e8f4ff':idx%2===0?'#fafbff':'#fff', userSelect:'none' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                                  <span style={{ fontSize:13, color:'#333' }}>{item.name}</span>
                                </div>
                                <span style={{ fontSize:13, fontWeight:700, color:'#1565C0', flexShrink:0 }}>₹{item.yearAmt.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </>
                        )}
                        {cItems.length > 0 && (
                          <>
                            <div style={{ background:'#e8f5e9', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1b5e20', letterSpacing:0.5 }}>COLLEGE FEES (B)</div>
                            {cItems.map((item) => (
                              <div key={item.id} onClick={() => toggleItem(item.id)}
                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:selectedFeeItems[item.id]?'#f0fff4':'#fff', userSelect:'none' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <input type="checkbox" checked={!!selectedFeeItems[item.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                                  <span style={{ fontSize:13, color:'#333' }}>{item.name}</span>
                                </div>
                                <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32', flexShrink:0 }}>₹{item.yearAmt.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {selGross > 0 && (
                      <div style={{ background:'#f8faff', border:'1px solid #e0e7ef', borderRadius:10, padding:'12px 16px', marginTop:10 }}>
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

                  <div style={{ marginBottom:14, border:'1px solid #ffe0b2', background:'#fff8f0', borderRadius:10, padding:'12px 14px' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:800, color:'#E65100', cursor:'pointer' }}>
                      <input type="checkbox" checked={admOtherFeeOn}
                        onChange={e => { const on = e.target.checked; setAdmOtherFeeOn(on); recalcWithOther(on, admOtherFeeAmt); }} />
                      ➕ Other Fee <span style={{ fontWeight:600, color:'#999' }}>(description + amount)</span>
                    </label>
                    {admOtherFeeOn && (
                      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:10, marginTop:10 }}>
                        <input type="text" placeholder="Description (e.g. Late Fee, Sports, Misc.)" value={admOtherFeeDesc}
                          onChange={e => setAdmOtherFeeDesc(e.target.value)}
                          style={{ padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' }} />
                        <input type="number" min="0" placeholder="Amount ₹" value={admOtherFeeAmt}
                          onChange={e => { setAdmOtherFeeAmt(e.target.value); recalcWithOther(admOtherFeeOn, e.target.value); }}
                          style={{ padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:15, fontWeight:800, textAlign:'right', boxSizing:'border-box' }} />
                      </div>
                    )}
                  </div>

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
                </div>
              )}

              <button onClick={handleAdmFeeCollect} disabled={admLoading2 || !admFeeAmt || Number(admFeeAmt) <= 0}
                style={{ width:'100%', background:!admFeeAmt||Number(admFeeAmt)<=0?'#b0bec5':'#1565C0', color:'#fff', padding:15, borderRadius:10, border:'none', fontSize:15, fontWeight:700, cursor:!admFeeAmt||Number(admFeeAmt)<=0?'not-allowed':'pointer', marginBottom:10 }}>
                {admLoading2 ? '⏳ Processing...' : '🖨️ Collect & Print Receipt'}
              </button>
              <button onClick={closeAdmModal}
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

/* ═══════════════════════════════════════════════════════════
   EXPENSE TRACKER
═══════════════════════════════════════════════════════════ */
const EXPENSE_CATEGORIES = [
  { value:'infrastructure',    label:'🏗️ Infrastructure / Building' },
  { value:'stationery',        label:'📝 Stationery & Printing' },
  { value:'electricity',       label:'💡 Electricity & Utilities' },
  { value:'water_sanitation',  label:'🚿 Water & Sanitation' },
  { value:'salary',            label:'👤 Salary / Wages' },
  { value:'events',            label:'🎉 Events & Functions' },
  { value:'maintenance',       label:'🔧 Maintenance & Repairs' },
  { value:'academic',          label:'📚 Academic Resources' },
  { value:'library',           label:'📖 Library Expenses' },
  { value:'laboratory',        label:'🔬 Laboratory Expenses' },
  { value:'office_admin',      label:'🏢 Office Administration' },
  { value:'internet_comm',     label:'📡 Internet & Communication' },
  { value:'website_erp',       label:'💻 Website & ERP Maintenance' },
  { value:'faculty_dev',       label:'👩‍🏫 Faculty Development' },
  { value:'student_activities',label:'🎓 Student Activities' },
  { value:'scholarships',      label:'🏅 Scholarships & Student Welfare' },
  { value:'electrical',        label:'⚡ Electrical Maintenance' },
  { value:'university_fees',   label:'🏛️ University / Government Fees' },
  { value:'it_software',       label:'🖥️ IT & Software' },
  { value:'vehicle_travel',    label:'🚗 Vehicle & Travel' },
  { value:'other',             label:'📦 Other' },
];

const PAY_MODES = ['Cash','UPI','Bank Transfer','Cheque','Online Payment'];
const ACAD_YEARS = ['2023-24','2024-25','2025-26','2026-27'];
const fmt2 = n => Number(n||0).toLocaleString('en-IN');

const EMPTY_EXP = {
  description:'', amount:'', date: new Date().toISOString().split('T')[0],
  category:'other', paidTo:'', paymentMode:'Cash',
  academicYear:'2025-26', remarks:'', billInvoiceNo:'',
};

const ExpenseTracker = ({ user }) => {
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_expenses_v2') || '[]'); } catch { return []; }
  });
  const [form, setForm]     = useState({ ...EMPTY_EXP });
  const [msg, setMsg]       = useState('');
  const [view, setView]     = useState('form');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [ayFilter, setAyFilter]   = useState('all');

  const flash = (m) => { setMsg(m); setTimeout(()=>setMsg(''), 3500); };

  const save = (updated) => {
    setExpenses(updated);
    localStorage.setItem('lkcwsc_expenses_v2', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!form.description.trim() || !form.amount || !form.date) {
      flash('❌ Description, Amount aur Date required hain'); return;
    }
    const entry = {
      ...form, id: Date.now(),
      amount: Number(form.amount),
      enteredBy: user?.name || 'Accounts Staff',
      createdAt: new Date().toISOString(),
    };
    save([entry, ...expenses]);
    setForm({ ...EMPTY_EXP });
    flash('✅ Expense recorded!');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this expense?')) return;
    save(expenses.filter(e => e.id !== id));
  };

  const today      = new Date().toISOString().split('T')[0];
  const thisMonth  = new Date().toISOString().slice(0,7);
  const thisAY     = '2025-26';
  const todayAmt   = expenses.filter(e => e.date === today).reduce((s,e)=>s+(e.amount||0),0);
  const monthAmt   = expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((s,e)=>s+(e.amount||0),0);
  const yearAmt    = expenses.filter(e => e.academicYear === thisAY).reduce((s,e)=>s+(e.amount||0),0);
  const totalAmt   = expenses.reduce((s,e)=>s+(e.amount||0),0);

  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + (e.amount||0); });

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    const mq = !q || e.description?.toLowerCase().includes(q) || e.paidTo?.toLowerCase().includes(q);
    const mc = catFilter === 'all' || e.category === catFilter;
    const ma = ayFilter === 'all' || e.academicYear === ayFilter;
    return mq && mc && ma;
  });

  const exportExcel = () => {
    const rows = [
      ['Date','Description','Category','Amount','Payment Mode','Paid To','Academic Year','Remarks','Bill/Invoice No','Entered By'],
      ...filtered.map(e => [
        e.date, e.description,
        EXPENSE_CATEGORIES.find(c=>c.value===e.category)?.label || e.category,
        e.amount, e.paymentMode, e.paidTo, e.academicYear, e.remarks, e.billInvoiceNo, e.enteredBy,
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `expenses_${today}.csv`; a.click();
  };

  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#1565C0', margin:'0 0 4px' }}>🏗️ College Expense Tracker</h2>
          <p style={{ color:'#666', fontSize:14, margin:0 }}>Record and monitor all college expenditures.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['form','history'].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{ padding:'8px 18px', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer',
                background:view===v?'#1565C0':'#f0f4f8', color:view===v?'#fff':'#555' }}>
              {v==='form'?'➕ New Expense':'📋 History ('+expenses.length+')'}
            </button>
          ))}
          <button onClick={exportExcel}
            style={{ padding:'8px 16px', background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Today',        amt:todayAmt,  color:'#1565C0', bg:'#e3f2fd' },
          { label:'This Month',   amt:monthAmt,  color:'#7B1FA2', bg:'#f3e5f5' },
          { label:`AY ${thisAY}`, amt:yearAmt,   color:'#2E7D32', bg:'#e8f5e9' },
          { label:'All Time',     amt:totalAmt,  color:'#E65100', bg:'#fff3e0' },
        ].map(s=>(
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:11, color:s.color, fontWeight:700, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.color }}>₹{fmt2(s.amt)}</div>
          </div>
        ))}
      </div>

      {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13, fontWeight:600, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

      {view==='form' && (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
          <h3 style={{ color:'#1565C0', margin:'0 0 16px' }}>➕ Record New Expense</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Description *</label>
              <input style={inp} placeholder="e.g. Stationery purchase for office" value={form.description}
                onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Amount (₹) *</label>
              <input type="number" min="0" style={{ ...inp, fontSize:16, fontWeight:700 }} placeholder="0"
                value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Date *</label>
              <input type="date" style={inp} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Category</label>
              <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {EXPENSE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Payment Mode</label>
              <select style={inp} value={form.paymentMode} onChange={e=>setForm(p=>({...p,paymentMode:e.target.value}))}>
                {PAY_MODES.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Paid To / Vendor</label>
              <input style={inp} placeholder="e.g. Sharma Stationery" value={form.paidTo}
                onChange={e=>setForm(p=>({...p,paidTo:e.target.value}))} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Academic Year</label>
              <select style={inp} value={form.academicYear} onChange={e=>setForm(p=>({...p,academicYear:e.target.value}))}>
                {ACAD_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Remarks</label>
              <input style={inp} placeholder="Additional notes..." value={form.remarks}
                onChange={e=>setForm(p=>({...p,remarks:e.target.value}))} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Bill / Invoice No</label>
              <input style={inp} placeholder="e.g. INV-2025-001" value={form.billInvoiceNo}
                onChange={e=>setForm(p=>({...p,billInvoiceNo:e.target.value}))} />
            </div>

          </div>
          <div style={{ marginTop:16, display:'flex', gap:10 }}>
            <button onClick={handleSave}
              style={{ background:'#1565C0', color:'#fff', border:'none', borderRadius:9, padding:'12px 28px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              💾 Save Expense
            </button>
            <button onClick={()=>setForm({...EMPTY_EXP})}
              style={{ background:'#eee', color:'#333', border:'none', borderRadius:9, padding:'12px 18px', fontSize:13, cursor:'pointer' }}>
              🔄 Clear
            </button>
          </div>
          <p style={{ fontSize:11, color:'#aaa', margin:'10px 0 0' }}>
            Entered by: <strong>{user?.name}</strong> · {new Date().toLocaleDateString('en-IN')}
          </p>
        </div>
      )}

      {view==='history' && (
        <div>
          {Object.keys(catTotals).length > 0 && (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e0e7ef', padding:16, marginBottom:16 }}>
              <h4 style={{ color:'#555', fontSize:13, margin:'0 0 10px' }}>📊 Category-wise Summary</h4>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
                  const label = EXPENSE_CATEGORIES.find(c=>c.value===cat)?.label || cat;
                  return (
                    <div key={cat} style={{ background:'#f0f4f8', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, color:'#333' }}>
                      {label}: ₹{fmt2(amt)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            <input type="text" placeholder="🔍 Search description / vendor..."
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }} />
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
              style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={ayFilter} onChange={e=>setAyFilter(e.target.value)}
              style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
              <option value="all">All Years</option>
              {ACAD_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>
              <div style={{ fontSize:40 }}>🏗️</div><p>No expenses found</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map(e => {
                const cat = EXPENSE_CATEGORIES.find(c=>c.value===e.category)?.label || e.category;
                return (
                  <div key={e.id} style={{ background:'#fff', border:'1px solid #e0e7ef', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, borderLeft:'4px solid #1565C0' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:'#1a1a2e' }}>{e.description}</span>
                        <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'1px 8px', borderRadius:10, fontWeight:600 }}>{cat}</span>
                        <span style={{ fontSize:11, background:'#f3e5f5', color:'#7B1FA2', padding:'1px 8px', borderRadius:10 }}>{e.paymentMode}</span>
                        {e.academicYear && <span style={{ fontSize:11, color:'#aaa' }}>AY: {e.academicYear}</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#666' }}>
                        {e.paidTo && <span>Paid to: <strong>{e.paidTo}</strong> · </span>}
                        {e.date} · By: {e.enteredBy}
                      </div>
                      {e.remarks && <div style={{ fontSize:12, color:'#888', fontStyle:'italic', marginTop:2 }}>📝 {e.remarks}</div>}
                      {e.billInvoiceNo && (
                        <div style={{ fontSize:12, color:'#1565C0', marginTop:2, fontWeight:600 }}>
                          🧾 Bill/Invoice No: {e.billInvoiceNo}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:'#C62828', marginBottom:6 }}>₹{fmt2(e.amount)}</div>
                      <button onClick={()=>handleDelete(e.id)}
                        style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign:'right', padding:'10px 16px', background:'#f8faff', borderRadius:10, fontSize:14, fontWeight:700, color:'#1565C0' }}>
                Filtered Total: ₹{fmt2(filtered.reduce((s,e)=>s+(e.amount||0),0))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   WALK-IN / OLD STUDENT FEE MODAL
═══════════════════════════════════════════════════════════ */
const WalkInFeeModal = ({ onClose, user, API, showToast, docFees = {} }) => {
  // ── Course (tuition) fee heads from the itemized DETAILED_FEES structure ──
  // A "Year" covers two semesters; index offset 0/2/4 for 1st/2nd/3rd Year.
  const courseFeeOptions = (course, year) => {
    const items = DETAILED_FEES[course]?.items || [];
    const off = year === '1st Year' ? 0 : year === '2nd Year' ? 2 : year === '3rd Year' ? 4 : -1;
    if (off < 0) return []; // 'Course completed' → no structured heads
    return items
      .map(it => ({ id: it.id, name: it.name, section: it.section, amount: (it.s[off] || 0) + (it.s[off + 1] || 0) }))
      .filter(o => o.amount > 0);
  };

  const EMPTY_FORM = {
    studentName:'', phone:'', prnNo:'', rollNo:'',
    course:'B.A.', year:'2nd Year',
    docMode: false,          // false = Academic Fee tab, true = Document Fees tab
    selectedHeads: {},       // { headId: true } — selected academic (course) fee heads
    selectedDocs: {},        // { docKey: true } — selected document fees
    // Other Fee — free-form description + amount
    otherFeeOn: false,
    otherFeeDesc: '',
    otherFeeAmount: '',
    amountCollected: '',     // editable; auto-fills from selected items
    payMode:'cash', txnId:'', notes:'',
  };
  const [view, setView]       = useState('form');
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [receipt, setReceipt] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_walkin_history') || '[]'); } catch { return []; }
  });
  const [histSearch, setHistSearch] = useState('');
  const [histCourse, setHistCourse] = useState('all');
  const [histYear, setHistYear]     = useState('all');

  const inp = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' };
  const fmt = n => Number(n||0).toLocaleString('en-IN');

  // Build the selected fee line items (Academic heads + Document fees + Other)
  const calcLineItems = (f) => {
    const items = [];
    courseFeeOptions(f.course, f.year)
      .filter(o => f.selectedHeads?.[o.id])
      .forEach(o => items.push({ label: `${o.name} — ${f.course} ${f.year}`, amount: o.amount }));
    Object.entries(f.selectedDocs || {}).filter(([, v]) => v).forEach(([k]) => {
      const d = docFees[k];
      if (d) items.push({ label: d.label, amount: Number(d.price) || 0 });
    });
    if (f.otherFeeOn) {
      const lbl = (f.otherFeeDesc || '').trim() || 'Other Fee';
      items.push({ label: lbl, amount: Number(f.otherFeeAmount || 0) });
    }
    return items;
  };

  const sumItems = (f) => calcLineItems(f).reduce((s, i) => s + i.amount, 0);

  // Update the form and auto-refresh the suggested "Amount Collected"
  const applyForm = (updater) => setForm(p => {
    const next = typeof updater === 'function' ? updater(p) : { ...p, ...updater };
    return { ...next, amountCollected: String(sumItems(next) || '') };
  });

  const toggleHead = (id) => applyForm(p => ({ ...p, selectedHeads: { ...p.selectedHeads, [id]: !p.selectedHeads?.[id] } }));
  const selectAllHeads = () => applyForm(p => {
    const all = {}; courseFeeOptions(p.course, p.year).forEach(o => { all[o.id] = true; });
    return { ...p, selectedHeads: all };
  });
  const clearHeads = () => applyForm(p => ({ ...p, selectedHeads: {} }));
  const toggleDoc = (key) => applyForm(p => ({ ...p, selectedDocs: { ...p.selectedDocs, [key]: !p.selectedDocs?.[key] } }));

  const saveToHistory = (rec) => {
    const updated = [rec, ...history].slice(0, 200);
    setHistory(updated);
    localStorage.setItem('lkcwsc_walkin_history', JSON.stringify(updated));
  };

  const handleCollect = async () => {
    if (!form.studentName.trim()) { setMsg('❌ Student name required'); return; }
    const items = calcLineItems(form);
    const academicSel = courseFeeOptions(form.course, form.year).some(o => form.selectedHeads?.[o.id]);
    const docSel = Object.values(form.selectedDocs || {}).some(Boolean);
    if (!academicSel && !docSel && !form.otherFeeOn) { setMsg('❌ Select at least one fee item (Academic / Document / Other)'); return; }
    if (form.otherFeeOn && !(form.otherFeeDesc || '').trim()) { setMsg('❌ Enter a description for Other Fee'); return; }
    const total = Number(form.amountCollected || 0) || items.reduce((s, i) => s + i.amount, 0);
    if (!total || total <= 0) { setMsg('❌ Enter a valid amount'); return; }
    if (form.payMode === 'online' && !form.txnId.trim()) { setMsg('❌ Transaction ID required for online payment'); return; }
    setSaving(true); setMsg('');
    const receiptNo = 'OS' + Date.now().toString().slice(-6);
    const onCount = [academicSel, docSel, form.otherFeeOn].filter(Boolean).length;
    const firstDoc = Object.entries(form.selectedDocs || {}).find(([, v]) => v)?.[0];
    const feeType = onCount > 1 ? 'mixed'
      : academicSel ? 'course'
      : docSel ? (firstDoc || 'document')
      : 'other';
    const rec = {
      studentName:  form.studentName,
      phone:        form.phone,
      prnNo:        form.prnNo,
      rollNo:       form.rollNo,
      course:       form.course,
      admissionYear: form.year,
      feeType,
      feeTypeLabel: items.map(i => i.label).join(' + '),
      lineItems:    items,
      amount:       total,
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
    const logo    = window.location.origin + "/college-logo.png";
    const amt     = r.amount || 0;
    const dateStr = new Date(r.paidAt || Date.now()).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const payMode = r.paymentMode === 'online' ? 'Online / UPI' : 'Cash';
    const courseFull = (r.course||'').toLowerCase().includes('sc') ? 'Bachelor of Science (B.Sc.)'
      : (r.course||'').toLowerCase().includes('a') ? 'Bachelor of Arts (B.A.)' : (r.course||'—');
    const classStr = courseFull + (r.admissionYear ? ' — ' + r.admissionYear : '');

    // Particulars rows — one per selected fee (Course Fee / Document Fee)
    const recItems = (r.lineItems && r.lineItems.length)
      ? r.lineItems
      : [{ label: r.feeTypeLabel || r.feeType || 'Fee', amount: amt }];
    const feeRowsHtml = recItems.map((it, i) =>
      `<tr><td>${i + 1}</td><td>${it.label}</td><td>₹${Number(it.amount || 0).toLocaleString('en-IN')}.00</td></tr>`
    ).join('');

    // amount in words
    const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const inW=(n)=>{if(n===0)return'';if(n<20)return a[n]+' ';if(n<100)return b[Math.floor(n/10)]+' '+(n%10?a[n%10]+' ':'');if(n<1000)return a[Math.floor(n/100)]+'Hundred '+(n%100?inW(n%100):'');if(n<100000)return inW(Math.floor(n/1000))+'Thousand '+(n%1000?inW(n%1000):'');return inW(Math.floor(n/100000))+'Lakh '+(n%100000?inW(n%100000):'');};
    const amtWords = (inW(amt).trim() || 'Zero') + ' Only';

    const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;background:#fff;padding:10px;font-size:12px}
      .receipt{width:160mm;border:1px solid #999;margin:0 auto}
      .hdr{display:flex;align-items:center;gap:14px;padding:14px 28px;border-bottom:1.5px solid #000}
      .hlogo{width:84px;height:84px;object-fit:contain;flex-shrink:0;margin-left:6px}
      .htxt{flex:1;text-align:center}
      .htrust{font-size:9px;color:#222;font-weight:700}
      .hname{font-size:13px;font-weight:900;color:#000;line-height:1.3;margin:2px 0}
      .haddr{font-size:9px;color:#333;margin-top:1px}
      .hcontact{font-size:9.5px;color:#000;font-weight:800;margin-top:2px}
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
          <div class="haddr">Gangakhed, Dist. Parbhani, Maharashtra – 431514</div>
          <div class="hcontact">📞 +91 9307162914 &nbsp;|&nbsp; ✉️ lkcwscgkd@gmail.com &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com</div>
        </div>
      </div>
      <div class="titlebar">FEE RECEIPT</div>
      <div class="copyline">Fee Receipt (Student Copy)</div>
      <div class="metarow">
        <span><b>Receipt No. :</b> ${r.receiptNo}</span>
        <span><b>Date :</b> ${dateStr}</span>
      </div>
      <div class="infobox">
        <table class="info">
          <tr>
            <td class="lbl">Student Name</td><td class="val">: ${r.studentName||'—'}</td>
            <td class="lbl" style="padding-left:16px">PRN No.</td><td class="val">: ${r.prnNo||'—'}</td>
          </tr>
          <tr>
            <td class="lbl">Class</td><td class="val">: ${classStr}</td>
            <td class="lbl" style="padding-left:16px">Roll No.</td><td class="val">: ${r.rollNo||'—'}</td>
          </tr>
          ${r.phone?`<tr><td class="lbl">Phone</td><td class="val">: ${r.phone}</td><td></td><td></td></tr>`:''}
        </table>
      </div>
      <table class="fees">
        <thead><tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr></thead>
        <tbody>
          ${feeRowsHtml}
          <tr class="totrow"><td colspan="2" style="text-align:right;padding-right:10px">Total Amount</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
        </tbody>
      </table>
      <div class="amtline">Amt. in words (Rs.) : <b>${amtWords}</b></div>
      <div class="payline">
        Paid by : <b>${payMode}</b> &nbsp;&nbsp;
        Rs. <b>${amt.toLocaleString('en-IN')}.00</b>
        ${r.transactionId ? ` &nbsp;&nbsp; Transaction ID : <b>${r.transactionId}</b>` : ''}
        &nbsp;&nbsp; Date : <b>${dateStr}</b>
      </div>
      <div class="narrline">Narration : ${r.notes || ''}</div>
      <div class="sigrow">
        <div class="sigsys">This is system generated receipt and does not require seal/stamp.<br/>Collected by: ${r.collectedBy||'Accounts Section'}</div>
        <div class="sigbox"><div class="sigline">Accounts Section<br/>LKCWSC</div></div>
      </div>
    </div>
    <scr${'ipt'}>window.onload=()=>{window.print()}</scr${'ipt'}></body></html>`;
    const w = window.open('','_blank','width=680,height=680');
    w.document.write(html); w.document.close();
  };

  const filteredHistory = history.filter(r => {
    const q = histSearch.toLowerCase().trim();
    if (q) {
      const hay = `${r.studentName||''} ${r.prnNo||''} ${r.rollNo||''} ${r.phone||''} ${r.receiptNo||''} ${r.feeTypeLabel||''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (histCourse !== 'all' && normCourse(r.course) !== histCourse) return false;
    if (histYear !== 'all' && (r.admissionYear||'') !== histYear) return false;
    return true;
  });
  const totalCollected = filteredHistory.reduce((s,r) => s + (r.amount||0), 0);

  const downloadWalkinXLSX = () => {
    if (!filteredHistory.length) { showToast?.('❌ No receipts to export'); return; }
    const rows = filteredHistory.map(r => {
      const d = r.paidAt ? new Date(r.paidAt) : null;
      return {
        'Date':          d ? d.toLocaleDateString('en-IN') : '',
        'Time':          d ? d.toLocaleTimeString('en-IN') : '',
        'Receipt No':    r.receiptNo || '',
        'Student Name':  r.studentName || '',
        'PRN No':        r.prnNo || '',
        'Roll No':       r.rollNo || '',
        'Phone':         r.phone || '',
        'Course':        r.course || '',
        'Year':          r.admissionYear || '',
        'Fee Details':   r.feeTypeLabel || '',
        'Amount (₹)':    r.amount || 0,
        'Payment Mode':  r.paymentMode === 'online' ? 'Online' : 'Cash',
        'Transaction ID': r.transactionId || '',
        'Collected By':  r.collectedBy || '',
      };
    });
    rows.push({
      'Date':'', 'Time':'', 'Receipt No':'', 'Student Name':'', 'PRN No':'', 'Roll No':'', 'Phone':'',
      'Course':'', 'Year':'', 'Fee Details':'TOTAL', 'Amount (₹)':totalCollected, 'Payment Mode':'', 'Transaction ID':'', 'Collected By':'',
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:12},{wch:10},{wch:14},{wch:22},{wch:16},{wch:10},{wch:12},{wch:10},{wch:10},{wch:26},{wch:12},{wch:12},{wch:18},{wch:16}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Old Student Fees');
    XLSX.writeFile(wb, `old-student-fees-${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast?.('✅ Excel file downloaded');
  };

  // Academic (course) fee heads for the currently selected course + year
  const acadItems   = courseFeeOptions(form.course, form.year);
  const acadUniv    = acadItems.filter(o => o.section === 'University');
  const acadCollege = acadItems.filter(o => o.section !== 'University');
  const acadYearTotal   = acadItems.reduce((s, o) => s + o.amount, 0);
  const acadSelectedSum = acadItems.filter(o => form.selectedHeads?.[o.id]).reduce((s, o) => s + o.amount, 0);
  const docFeeEntries   = Object.entries(docFees);
  const docSelectedSum  = docFeeEntries.filter(([k]) => form.selectedDocs?.[k]).reduce((s, [, v]) => s + (Number(v.price) || 0), 0);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth: view==='history' ? 900 : 580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column' }}>

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
                      ...((receipt.lineItems && receipt.lineItems.length)
                        ? receipt.lineItems.map(it => [it.label, `₹ ${fmt(it.amount)}/-`])
                        : [['Fee Type', receipt.feeTypeLabel]]),
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
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                  {/* ── Old Student starting details (editable) ── */}
                  <div style={{ border:'1px solid #ffe0b2', background:'#fff8f0', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ fontSize:12, fontWeight:800, color:'#E65100', marginBottom:10 }}>🧑‍🎓 Old Student Details</div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Student Name *</label>
                      <input style={inp} placeholder="e.g. Priya Santosh Sharma" value={form.studentName} onChange={e=>setForm(p=>({...p,studentName:e.target.value}))} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
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
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Roll No.</label>
                        <input style={inp} placeholder="e.g. 101" value={form.rollNo} onChange={e=>setForm(p=>({...p,rollNo:e.target.value}))} />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Course</label>
                        <select style={inp} value={form.course}
                          onChange={e=>applyForm(p=>({...p, course:e.target.value, selectedHeads:{} }))}>
                          <option value="B.A.">B.A.</option>
                          <option value="B.Sc.">B.Sc.</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Year</label>
                        <select style={inp} value={form.year}
                          onChange={e=>applyForm(p=>({...p, year:e.target.value, selectedHeads:{} }))}>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="Course completed">Course completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── Academic Fee / Document Fees tabs ── */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      style={{ flex:1, padding:'9px', borderRadius:8, border:`2px solid ${!form.docMode?'#1565C0':'#ddd'}`, background:!form.docMode?'#e3f2fd':'#fff', color:!form.docMode?'#1565C0':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}
                      onClick={()=>setForm(p=>({...p, docMode:false}))}>
                      🎓 Academic Fee
                    </button>
                    <button
                      style={{ flex:1, padding:'9px', borderRadius:8, border:`2px solid ${form.docMode?'#1565C0':'#ddd'}`, background:form.docMode?'#e3f2fd':'#fff', color:form.docMode?'#1565C0':'#555', fontWeight:700, fontSize:13, cursor:'pointer' }}
                      onClick={()=>setForm(p=>({...p, docMode:true}))}>
                      📄 Document Fees
                    </button>
                  </div>

                  <p style={{ color:'#666', fontSize:13, margin:0 }}>
                    {form.studentName || '—'} — {form.course} · {form.year}{form.prnNo ? ` · PRN: ${form.prnNo}` : ''}
                  </p>

                  {/* ── ACADEMIC FEE TAB ── */}
                  {!form.docMode && (
                    <div>
                      <div style={{ background:'#e3f2fd', borderRadius:10, padding:'10px 16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:13, color:'#555', fontWeight:600 }}>Academic Fee ({form.year})</span>
                        <span style={{ fontSize:16, fontWeight:800, color:'#1565C0' }}>₹{fmt(acadYearTotal)}</span>
                      </div>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <label style={{ fontSize:13, fontWeight:700, color:'#1565C0' }}>Select Fee Items</label>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={selectAllHeads}
                            style={{ padding:'5px 14px', background:'#1565C0', color:'#fff', border:'none', borderRadius:7, fontWeight:700, fontSize:12, cursor:'pointer' }}>☑ Select All</button>
                          <button onClick={clearHeads}
                            style={{ padding:'5px 14px', background:'#f5f5f5', color:'#555', border:'1px solid #ddd', borderRadius:7, fontWeight:700, fontSize:12, cursor:'pointer' }}>☐ Clear</button>
                        </div>
                      </div>

                      {acadItems.length === 0 ? (
                        <div style={{ background:'#fff3e0', padding:'10px', borderRadius:8, fontSize:13, color:'#E65100' }}>⚠️ No structured fees for this course / year. Use “Other Fee” below or enter amount manually.</div>
                      ) : (
                        <div style={{ border:'1px solid #e0e7ef', borderRadius:10, overflow:'hidden', maxHeight:260, overflowY:'auto' }}>
                          {acadUniv.length > 0 && (
                            <>
                              <div style={{ background:'#e8eaf6', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1a237e', letterSpacing:0.5 }}>UNIVERSITY FEES (A)</div>
                              {acadUniv.map((o, idx) => (
                                <div key={o.id} onClick={()=>toggleHead(o.id)}
                                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:form.selectedHeads?.[o.id]?'#e8f4ff':idx%2===0?'#fafbff':'#fff', userSelect:'none' }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <input type="checkbox" checked={!!form.selectedHeads?.[o.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                                    <span style={{ fontSize:13, color:'#333' }}>{o.name}</span>
                                  </div>
                                  <span style={{ fontSize:13, fontWeight:700, color:'#1565C0', flexShrink:0 }}>₹{fmt(o.amount)}</span>
                                </div>
                              ))}
                            </>
                          )}
                          {acadCollege.length > 0 && (
                            <>
                              <div style={{ background:'#e8f5e9', padding:'5px 14px', fontSize:11, fontWeight:800, color:'#1b5e20', letterSpacing:0.5 }}>COLLEGE FEES (B)</div>
                              {acadCollege.map((o) => (
                                <div key={o.id} onClick={()=>toggleHead(o.id)}
                                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f0f4f8', cursor:'pointer', background:form.selectedHeads?.[o.id]?'#f0fff4':'#fff', userSelect:'none' }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <input type="checkbox" checked={!!form.selectedHeads?.[o.id]} readOnly style={{ width:15, height:15, cursor:'pointer' }}/>
                                    <span style={{ fontSize:13, color:'#333' }}>{o.name}</span>
                                  </div>
                                  <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32', flexShrink:0 }}>₹{fmt(o.amount)}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}

                      {acadSelectedSum > 0 && (
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800, marginTop:10, color:'#1565C0' }}>
                          <span>Academic Selected</span>
                          <span>₹{fmt(acadSelectedSum)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── DOCUMENT FEES TAB ── */}
                  {form.docMode && (
                    <div>
                      <p style={{ fontSize:13, color:'#666', marginBottom:10 }}>Document fees select karo (multiple select ho sakte hain):</p>
                      {docFeeEntries.length === 0 ? (
                        <div style={{ background:'#fff3e0', padding:'10px', borderRadius:8, fontSize:13, color:'#E65100' }}>⚠️ No document fees configured.</div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:260, overflowY:'auto', border:'1px solid #e0e7ef', borderRadius:10, padding:10 }}>
                          {docFeeEntries.map(([key, val]) => {
                            const on = !!form.selectedDocs?.[key];
                            return (
                              <div key={key} onClick={()=>toggleDoc(key)}
                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:9, border:`2px solid ${on?'#1565C0':'#e0e7ef'}`, background:on?'#e3f2fd':'#fff', cursor:'pointer' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <input type="checkbox" checked={on} readOnly style={{ width:15, height:15 }}/>
                                  <span style={{ fontSize:13, fontWeight:on?700:500, color:on?'#1565C0':'#333' }}>{val.label}</span>
                                </div>
                                <span style={{ fontSize:14, fontWeight:700, color:on?'#1565C0':'#888' }}>₹{fmt(val.price)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {docSelectedSum > 0 && (
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800, marginTop:10, color:'#1565C0' }}>
                          <span>Document Selected</span>
                          <span>₹{fmt(docSelectedSum)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Other Fee ── */}
                  <div style={{ border:'1px solid #ffe0b2', background:'#fff8f0', borderRadius:10, padding:'12px 14px' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:800, color:'#E65100', cursor:'pointer' }}>
                      <input type="checkbox" checked={form.otherFeeOn}
                        onChange={e=>applyForm(p=>({...p, otherFeeOn:e.target.checked }))} />
                      ➕ Other Fee <span style={{ fontWeight:600, color:'#999' }}>(description + amount)</span>
                    </label>
                    {form.otherFeeOn && (
                      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:10, marginTop:10 }}>
                        <input type="text" placeholder="Description (e.g. Late Fee, Sports, Misc.)"
                          value={form.otherFeeDesc} onChange={e=>setForm(p=>({...p, otherFeeDesc:e.target.value}))}
                          style={{ padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' }} />
                        <input type="number" min="0" placeholder="Amount ₹"
                          value={form.otherFeeAmount} onChange={e=>applyForm(p=>({...p, otherFeeAmount:e.target.value}))}
                          style={{ padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:15, fontWeight:800, textAlign:'right', boxSizing:'border-box' }} />
                      </div>
                    )}
                  </div>

                  {/* ── Amount Collected ── */}
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#333', marginBottom:8 }}>Amount Collected (₹) *</label>
                    <input type="number" min="0" placeholder="Enter amount"
                      value={form.amountCollected} onChange={e=>setForm(p=>({...p, amountCollected:e.target.value}))}
                      style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:'2px solid #1565C0', fontSize:18, fontWeight:700, textAlign:'center', boxSizing:'border-box', outline:'none' }} />
                  </div>

                  {/* ── Payment Mode ── */}
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#333', marginBottom:8 }}>Payment Mode *</label>
                    <div style={{ display:'flex', gap:10 }}>
                      {[{k:'cash',l:'💵 Cash'},{k:'online',l:'🌐 Online / UPI'}].map(m => (
                        <button key={m.k} onClick={()=>setForm(p=>({...p, payMode:m.k}))}
                          style={{ flex:1, padding:'11px', borderRadius:9, border:`2px solid ${form.payMode===m.k?'#1565C0':'#ddd'}`, background:form.payMode===m.k?'#1565C0':'#fff', color:form.payMode===m.k?'#fff':'#555', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                          {m.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.payMode==='online' && (
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:5 }}>Txn ID / UTR *</label>
                      <input style={inp} placeholder="Ref No." value={form.txnId} onChange={e=>setForm(p=>({...p,txnId:e.target.value}))} />
                    </div>
                  )}

                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Notes (optional)</label>
                    <input style={inp} placeholder="e.g. Exam fee for Sem IV backlog" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
                  </div>

                  <button onClick={handleCollect} disabled={saving}
                    style={{ background: saving ? '#b0bec5' : '#1565C0', color:'#fff', border:'none', borderRadius:10, padding:'14px', fontWeight:700, fontSize:15, cursor:saving?'not-allowed':'pointer' }}>
                    {saving ? '⏳ Processing...' : '🖨️ Collect & Print Receipt'}
                  </button>
                  <button onClick={onClose}
                    style={{ background:'#f3f4f6', color:'#555', border:'none', borderRadius:10, padding:'12px', fontSize:14, cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {view==='history' && (
            <div>
              <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ background:'#e8f5e9', color:'#2E7D32', borderRadius:12, padding:'10px 18px', fontWeight:700, fontSize:15 }}>
                  💰 Total: ₹{fmt(totalCollected)}
                </div>
                <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:12, padding:'10px 18px', fontWeight:700, fontSize:15 }}>
                  🧾 Receipts: {filteredHistory.length}{filteredHistory.length !== history.length ? ` / ${history.length}` : ''}
                </div>
                <button onClick={downloadWalkinXLSX}
                  style={{ marginLeft:'auto', background:'#1b7a3d', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  ⬇️ Excel (.xlsx)
                </button>
              </div>

              {/* Filters: search (PRN/Roll/Name) + Course + Year */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginBottom:16, background:'#f7f9fc', border:'1px solid #e0e7ef', borderRadius:12, padding:12 }}>
                <div style={{ flex:'1 1 220px' }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>🔍 Search</label>
                  <input type="text" placeholder="PRN / Roll No / Name" value={histSearch} onChange={e=>setHistSearch(e.target.value)}
                    style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>Course</label>
                  <select value={histCourse} onChange={e=>setHistCourse(e.target.value)}
                    style={{ padding:'9px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}>
                    <option value="all">All Courses</option>
                    <option value="B.A.">B.A.</option>
                    <option value="B.Sc.">B.Sc.</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>Year</label>
                  <select value={histYear} onChange={e=>setHistYear(e.target.value)}
                    style={{ padding:'9px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}>
                    <option value="all">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                  </select>
                </div>
                {(histSearch || histCourse !== 'all' || histYear !== 'all') && (
                  <button onClick={()=>{ setHistSearch(''); setHistCourse('all'); setHistYear('all'); }}
                    style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>✕ Clear</button>
                )}
              </div>

              {history.length === 0 ? (
                <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>
                  <div style={{ fontSize:40 }}>🧾</div>
                  <p>No walk-in receipts yet</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>
                  <div style={{ fontSize:40 }}>🔍</div>
                  <p>No receipts match the filters</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {filteredHistory.map((r, idx) => (
                    <div key={(r.receiptNo||'')+idx} style={{ background:'#fafbff', border:'1px solid #e0e7ef', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
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
