import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// ─── Year-wise official fee totals (SNDT 2025-26) ─────────────────────────────
const OFFICIAL_FEES_YEARLY = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    years: {
      '1st Year': { total: 30677, sem1: 29927, sem2: 750  },
      '2nd Year': { total: 28957, sem1: 28207, sem2: 750  },
      '3rd Year': { total: 30692, sem1: 27842, sem2: 2850 },
    }
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    years: {
      '1st Year': { total: 14627, sem1: 13877, sem2: 750  },
      '2nd Year': { total: 12707, sem1: 11957, sem2: 750  },
      '3rd Year': { total: 14542, sem1: 12092, sem2: 2450 },
    }
  },
};

// ── Fixed 7 fee heads (same as Accounts / Scholarship views) ──────────────
const DISPLAY_HEADS = ['Enrollment Fee', 'Admission Fee', 'Tuition Fee', 'Gymkhana Fee', 'Laboratory Fee', 'Library Fee', 'Other Fee'];
const svfMatchHead = (name) => {
  const n = String(name || '').trim();
  if (/^enrollment\s*fee/i.test(n))  return 'Enrollment Fee';
  if (/^admission\s*fee/i.test(n))   return 'Admission Fee';
  if (/tuition\s*fee/i.test(n))      return 'Tuition Fee';
  if (/gymkhana/i.test(n))           return 'Gymkhana Fee';
  if (/^laboratory\s*fee/i.test(n))  return 'Laboratory Fee';
  if (/^library\s*fee$/i.test(n))    return 'Library Fee';
  return null;
};
const svfGroupHeads = (rawHeadwise, total) => {
  const out = { 'Enrollment Fee': 0, 'Admission Fee': 0, 'Tuition Fee': 0, 'Gymkhana Fee': 0, 'Laboratory Fee': 0, 'Library Fee': 0, 'Other Fee': 0 };
  let named = 0;
  Object.entries(rawHeadwise || {}).forEach(([name, amt]) => {
    const head = svfMatchHead(name);
    if (head) { out[head] += Number(amt) || 0; named += Number(amt) || 0; }
  });
  out['Other Fee'] = Math.max(0, (Number(total) || 0) - named);
  return out;
};
const svfYearLabelToFYSY = { '1st Year': 'FY', '2nd Year': 'SY', '3rd Year': 'TY' };

const svfCourseKey = (ct) => {
  const c = (ct || '').toLowerCase();
  if (c.includes('b.sc') || c.includes('bsc') || c.includes('science')) return 'B.Sc.';
  if (c.includes('b.a') || c.includes('ba') || c.includes('arts')) return 'B.A.';
  return null;
};

const svfGenReceiptNo = () => `REC${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

// Official A5 fee receipt (same format used by the Accounts Section)
const svfPrintReceipt = (data) => {
  const acadYear = data.academicYear || (() => { const y = new Date().getFullYear(); const m = new Date().getMonth() + 1; return m >= 6 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`; })();
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const amt = data.amount || 0;
  const payMode = data.paymentMode === 'online' ? 'Online' : 'Cash';
  const txnId = data.transactionId || '';
  const logo = window.location.origin + '/college-logo.png';
  const ct = (data.courseType || '').toLowerCase();
  const courseFull = ct.includes('b.sc') || ct.includes('bsc') || ct.includes('science') ? 'Bachelor of Science (B.Sc.)'
    : ct.includes('b.a') || ct.includes('ba') || ct.includes('arts') ? 'Bachelor of Arts (B.A.)'
    : (data.courseType || '—');
  const classStr = courseFull + (data.admissionYear ? ' — ' + data.admissionYear : '');
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inW = (n) => { if (n === 0) return ''; if (n < 20) return a[n] + ' '; if (n < 100) return b[Math.floor(n / 10)] + ' ' + (n % 10 ? a[n % 10] + ' ' : ''); if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 ? inW(n % 100) : ''); if (n < 100000) return inW(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? inW(n % 1000) : ''); return inW(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? inW(n % 100000) : ''); };
  const amtWords = (inW(amt).trim() || 'Zero') + ' Only';
  const rows = (data.feeBreakdown && data.feeBreakdown.length > 0)
    ? data.feeBreakdown.map((r, i) => `<tr><td>${i + 1}</td><td>${r.particular || r.label || 'Fee'}</td><td>₹${Number(r.amount || 0).toLocaleString('en-IN')}.00</td></tr>`).join('')
    : `<tr><td>1</td><td>${data.feeTypeLabel || 'Fee'}</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>`;
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
          <td class="lbl">Student Name</td><td class="val">: ${data.studentName || '—'}</td>
          <td class="lbl" style="padding-left:16px">Student UID</td><td class="val">: ${data.studentId || '—'}</td>
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
      Paid by : <b>${payMode}</b> &nbsp;&nbsp; Rs. <b>${amt.toLocaleString('en-IN')}.00</b>
      ${txnId ? ` &nbsp;&nbsp; Transaction ID : <b>${txnId}</b>` : ''} &nbsp;&nbsp; Date : <b>${dateStr}</b>
    </div>
    <div class="sigrow">
      <div class="sigsys">This is system generated receipt and does not require seal/stamp.<br/>Collected by: ${data.collectedBy || 'Accounts Section'}</div>
      <div class="sigbox"><div class="sigline">Accounts Section<br/>LKCWSC</div></div>
    </div>
  </div>
  <scr${'ipt'}>window.onload=()=>{window.print()}</scr${'ipt'}></body></html>`;
  const w = window.open('', '_blank', 'width=680,height=680');
  w.document.write(html); w.document.close();
};

// ─── Exam Forms Detail Tab ────────────────────────────────────────────────────
const ExamFormsDetailTab = ({ studentEmail, themeColor }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentEmail) return;
    API.get(`/results/exam-form/by-student/${encodeURIComponent(studentEmail)}`)
      .then(res => setRequests(res.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentEmail]);

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}>⏳ Loading...</div>;

  if (requests.length === 0) return (
    <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>
      <div style={{ fontSize: '3rem' }}>📝</div>
      <h4>No Exam Forms Submitted</h4>
      <p style={{ fontSize: 13 }}>Student has not filled any exam form yet.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {requests.map((r, i) => (
        <div key={r._id || i} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${r.formType==='regular'?'#a5d6a7':'#ffb74d'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${r.formType==='regular'?'#2E7D32':'#E65100'}` }}>
          <div style={{ padding: '12px 18px', background: r.formType==='regular'?'#f1f8e9':'#fff8e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: r.formType==='regular'?'#2E7D32':'#E65100' }}>
                {r.formType==='regular' ? '📋 Regular Exam Form' : '📋 Backlog/KT Exam Form'}
              </span>
              <span style={{ marginLeft: 10, fontSize: 12, color: '#666' }}>{r.semester} Semester — {r.examEvent}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: r.feeStatus==='collected'?'#e8f5e9':'#fff3e0', color: r.feeStatus==='collected'?'#2E7D32':'#E65100' }}>
              {r.feeStatus==='collected' ? `✅ Fees Paid: ₹${r.feeAmount}` : '⏳ Fees Pending'}
            </span>
          </div>
          <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <span><strong>Course:</strong> {r.course}</span>
            <span><strong>Year:</strong> {r.admissionYear}</span>
            <span><strong>PRN:</strong> {r.prnNumber || '—'}</span>
            <span><strong>Mobile:</strong> {r.mobileNo || '—'}</span>
            {r.feeStatus === 'collected' && <>
              <span><strong>Receipt No:</strong> {r.feeReceiptNo}</span>
              <span><strong>Collected By:</strong> {r.feeCollectedBy}</span>
              <span><strong>Payment Mode:</strong> {r.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'}</span>
              <span><strong>Fee Date:</strong> {r.feeCollectedAt ? new Date(r.feeCollectedAt).toLocaleDateString('en-IN') : '—'}</span>
            </>}
            <span style={{ color: '#aaa', fontSize: 11 }}>Submitted: {new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Role-based access config ────────────────────────────────────────────────
// canEdit:   Student Section + Principal
// role:      'student_section' | 'exam' | 'scholarship' | 'accounts' | 'principal' | 'readonly'

const StudentViewFull = ({ canEdit = false, themeColor = '#1565C0', role = 'readonly' }) => {
  const { user } = useAuth();
  const [admissions, setAdmissions]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [yearFilter, setYearFilter]   = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('current'); // 'current' | 'past' | 'all'
  const [visibleCount, setVisibleCount] = useState(10); // infinite scroll: show 10, load 10 more on scroll
  const loaderRef = useRef(null);
  const [selected, setSelected]       = useState(null);
  const [detailTab, setDetailTab]     = useState('overview');
  const [editMode, setEditMode]       = useState(false);
  const [editData, setEditData]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState('');

  // ── Pay Remaining Fees (Accounts) ──
  const [payModal, setPayModal]       = useState(null); // { year, total, schol, netPay, paid, balance }
  const [payAmt, setPayAmt]           = useState('');
  const [payMode, setPayMode]         = useState('cash');
  const [payTxn, setPayTxn]           = useState('');
  const [paySaving, setPaySaving]     = useState(false);
  const [payMsg, setPayMsg]           = useState('');

  // Fee-head selection: [{name, amount, paid:boolean}] for the year being paid.
  // Heads already covered by a previous payment are locked (paid:true) —
  // they cannot be re-selected. Unpaid heads are checkboxes.
  const [payHeads, setPayHeads]       = useState([]);
  const [selectedHeads, setSelectedHeads] = useState([]); // names currently checked
  const [payHeadsLoading, setPayHeadsLoading] = useState(false);

  const canCollect = role === 'accounts' || role === 'principal';

  const openPayModal = async (yr, info) => {
    setPayModal({ year: yr, ...info });
    setPayAmt(String(info.balance > 0 ? info.balance : ''));
    setPayMode('cash'); setPayTxn(''); setPayMsg('');
    setPayHeads([]); setSelectedHeads([]);

    // ── Head-wise breakdown for this year, from the live Accounts fee
    // structure (base year 2025-26) — same 7 heads shown everywhere else.
    setPayHeadsLoading(true);
    try {
      const ck = svfCourseKey(selected.courseType);
      const fySy = svfYearLabelToFYSY[yr] || 'FY';
      const res = await API.get('/fee-structure', { params: { courseType: ck, academicYear: '2025-26' } });
      const doc = (res.data.structures || [])[0];
      let heads;
      if (doc && Array.isArray(doc.items) && doc.items.length) {
        const idx = { FY: [0, 1], SY: [2, 3], TY: [4, 5] }[fySy];
        const rawHeadwise = {};
        let yearTotal = 0;
        doc.items.forEach(it => {
          const val = (Number(it.s?.[idx[0]]) || 0) + (Number(it.s?.[idx[1]]) || 0);
          if (val) { rawHeadwise[it.name] = (rawHeadwise[it.name] || 0) + val; yearTotal += val; }
        });
        heads = DISPLAY_HEADS.map(name => ({ name, amount: svfGroupHeads(rawHeadwise, yearTotal)[name] || 0 }));
      } else {
        // Fallback: single "Other Fee" head covering the whole balance,
        // when Accounts hasn't created a live structure yet.
        heads = [{ name: 'Other Fee', amount: info.total || 0 }];
      }

      // Which heads has this student already paid for this year? — from
      // feeLedger entries tagged with this year's feeHeads array.
      const paidHeadsSet = new Set();
      (selected.feeLedger || []).filter(p => p.year === yr).forEach(p => (p.feeHeads || []).forEach(h => paidHeadsSet.add(h)));

      setPayHeads(heads.filter(h => h.amount > 0).map(h => ({ ...h, paid: paidHeadsSet.has(h.name) })));
    } catch {
      setPayHeads([{ name: 'Other Fee', amount: info.total || 0, paid: false }]);
    } finally {
      setPayHeadsLoading(false);
    }
  };
  const closePayModal = () => { setPayModal(null); setPayAmt(''); setPayTxn(''); setPayMsg(''); setPayHeads([]); setSelectedHeads([]); };

  // Toggle a head checkbox — only unpaid heads are toggleable; the sum of
  // selected heads becomes the amount to collect (still editable if needed).
  const toggleHead = (name) => {
    const head = payHeads.find(h => h.name === name);
    if (!head || head.paid) return; // locked — already paid, can't re-select
    setSelectedHeads(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      const sum = payHeads.filter(h => next.includes(h.name)).reduce((s, h) => s + h.amount, 0);
      setPayAmt(String(sum || ''));
      return next;
    });
  };

  const handlePayRemaining = async () => {
    const amt = Number(payAmt);
    if (!amt || amt <= 0) { setPayMsg('❌ Enter a valid amount'); return; }
    if (payMode === 'online' && !payTxn.trim()) { setPayMsg('❌ Transaction ID required for online'); return; }
    setPaySaving(true); setPayMsg('');
    const rNo = svfGenReceiptNo();
    try {
      await API.put(`/admissions/mark-fees-paid/${selected._id}`, {
        fees: amt,
        paymentMode: payMode,
        transactionId: payTxn,
        receiptNo: rNo,
        collectedBy: user?.name || 'Accounts Staff',
        feeType: 'admission',
        feeTypeLabel: `Academic Fee — ${payModal.year}${selectedHeads.length ? ` (${selectedHeads.join(', ')})` : ''}`,
        year: payModal.year,
        totalFees: payModal.total || undefined,
        scholarshipAmount: payModal.schol || undefined,
        feeHeads: selectedHeads,
      });
      svfPrintReceipt({
        receiptNo: rNo,
        studentName: selected.applicantName,
        studentId: selected.studentId,
        courseType: selected.courseType,
        admissionYear: payModal.year,
        amount: amt,
        paymentMode: payMode,
        transactionId: payTxn,
        collectedBy: user?.name || 'Accounts Staff',
        feeTypeLabel: `Academic Fee — ${payModal.year}`,
      });
      // Refresh and keep this student selected
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      closePayModal();
      setMsg('✅ Fee collected & receipt generated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setPayMsg('❌ ' + (e.response?.data?.message || 'Failed to collect fee'));
    } finally { setPaySaving(false); }
  };

  // Scholarship edit (scholarship section)
  const [scholEdit, setScholEdit]     = useState(false);
  const [scholData, setScholData]     = useState({});
  const [scholSaving, setScholSaving] = useState(false);

  const EDITABLE_FIELDS = [
    { key: 'applicantName',    label: 'Full Name',           type: 'text' },
    { key: 'fatherName',       label: "Father's Name",       type: 'text' },
    { key: 'motherName',       label: "Mother's Name",       type: 'text' },
    { key: 'guardianName',     label: 'Guardian Name',       type: 'text' },
    { key: 'guardianPhone',    label: 'Guardian Phone',      type: 'text' },
    { key: 'phone',            label: 'Mobile Number',       type: 'text' },
    { key: 'dateOfBirth',      label: 'Date of Birth',       type: 'date' },
    { key: 'gender',           label: 'Gender',              type: 'select', options: ['Female','Male','Other'] },
    { key: 'bloodGroup',       label: 'Blood Group',         type: 'select', options: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
    { key: 'nationality',      label: 'Nationality',         type: 'text' },
    { key: 'religion',         label: 'Religion',            type: 'text' },
    { key: 'category',         label: 'Category',            type: 'select', options: ['sc','st','obc','sbc','nt','ebc','open','other'] },
    { key: 'caste',            label: 'Caste',               type: 'text' },
    { key: 'subCaste',         label: 'Sub-Caste',           type: 'text' },
    { key: 'aadharNumber',     label: 'Aadhar Number',       type: 'text' },
    { key: 'familyIncome',     label: 'Family Income (₹)',   type: 'text' },
    { key: 'houseNumber',      label: 'House No.',           type: 'text' },
    { key: 'streetArea',       label: 'Street / Area',       type: 'text' },
    { key: 'cityTownVillage',  label: 'City / Village',      type: 'text' },
    { key: 'subdistrict',      label: 'Sub-District',        type: 'text' },
    { key: 'district',         label: 'District',            type: 'text' },
    { key: 'state',            label: 'State',               type: 'text' },
    { key: 'pinCode',          label: 'Pin Code',            type: 'text' },
    { key: 'courseType',       label: 'Course',              type: 'select', options: ['B.A.','B.Sc.'] },
    { key: 'preferredSubject', label: 'Subject',             type: 'text' },
    { key: 'admissionYear',    label: 'Year',                type: 'select', options: ['1st Year','2nd Year','3rd Year'] },
    { key: 'prnNumber',        label: 'PRN Number',          type: 'text' },
    { key: 'aparIdNumber',     label: 'ABC / APAR ID',       type: 'text' },
    { key: 'sscSchoolName',    label: 'SSC School',          type: 'text' },
    { key: 'sscBoard',         label: 'SSC Board',           type: 'text' },
    { key: 'sscYOP',           label: 'SSC Year',            type: 'text' },
    { key: 'sscPercentage',    label: 'SSC Percentage',      type: 'number' },
    { key: 'hscCollegeName',   label: 'HSC College',         type: 'text' },
    { key: 'hscBoard',         label: 'HSC Board',           type: 'text' },
    { key: 'hscStream',        label: 'HSC Stream',          type: 'text' },
    { key: 'hscYOP',           label: 'HSC Year',            type: 'text' },
    { key: 'hscPercentage',    label: 'HSC Percentage',      type: 'number' },
    { key: 'bankName',         label: 'Bank Name',           type: 'text' },
    { key: 'bankBranch',       label: 'Bank Branch',         type: 'text' },
    { key: 'bankAccountNo',    label: 'Account No.',         type: 'text' },
    { key: 'ifscCode',         label: 'IFSC Code',           type: 'text' },
  ];

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  // ── Infinite scroll: reset to first 10 whenever filters/search change ──
  useEffect(() => {
    setVisibleCount(10);
  }, [search, yearFilter, academicYearFilter, catFilter, statusFilter, selected]);

  // ── Infinite scroll: load next 10 when the loader sentinel comes into view ──
  useEffect(() => {
    if (selected) return; // list not rendered in detail view
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(c => c + 10);
      }
    }, { rootMargin: '150px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [selected, visibleCount, admissions.length, search, yearFilter, academicYearFilter, catFilter, statusFilter]);

  const handleScholSave = async () => {
    setScholSaving(true);
    try {
      await API.put(`/admissions/update-mahadbt/${selected._id}`, scholData);
      setMsg('✅ Scholarship details updated!');
      setScholEdit(false);
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setScholSaving(false); }
  };

  // Auto-calculate scholarship amount from ScholarshipMaster
  const handleAutoFillAmount = async () => {
    if (!selected?._id) return;
    setScholSaving(true);
    try {
      const res = await API.post(`/scholarships/calculate/${selected._id}`);
      const amt = res.data.data?.scholarshipEligibleAmount || res.data.data?.scholarshipAmount || 0;
      setScholData(p => ({ ...p, scholarshipAmount: amt }));
      setMsg(`✅ Auto-filled: ₹${Number(amt).toLocaleString('en-IN')} (${res.data.data?.categoryType === 'reserved' ? 'Full MahaDBT' : 'Tuition Fee only — OPEN'})`);
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.message || 'Auto-fill failed — check ScholarshipMaster records'));
      setTimeout(() => setMsg(''), 4000);
    }
    finally { setScholSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-documents/${selected._id}`, editData);
      setMsg('✅ Student data updated!');
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setEditMode(false); setEditData({});
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const reason = window.prompt(`⚠️ Enter reason for deleting ${selected.applicantName}'s record.\nThis will send a request to Admin for approval.`);
    if (!reason) return;
    try {
      await API.post('/admissions/request-delete', {
        admissionId: selected._id, studentName: selected.applicantName,
        studentEmail: selected.email, studentId: selected.studentId,
        reason, requestedBy: 'Student Section Staff',
      });
      setMsg('✅ Delete request sent to Admin for approval.');
    } catch {
      setMsg('✅ Delete request recorded. Admin will be notified.');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const schColor = (s) => ({
    not_filled: ['#fff3e0','#E65100'],
    filled:     ['#e3f2fd','#1565C0'],
    approved:   ['#e8f5e9','#2E7D32'],
    rejected:   ['#ffebee','#C62828'],
    disbursed:  ['#f3e5f5','#7B1FA2'],
  }[s] || ['#f5f5f5','#888']);

  const exportCSV = () => {
    const data = filteredAdmissions;
    const headers = ['Student ID','Name','Email','Mobile','Category','Course','Year','PRN','ABC ID','Aadhar','Father','Mother','DOB','SSC %','HSC %','Scholarship'];
    const rows = data.map(s => [s.studentId||'',s.applicantName||'',s.email||'',s.phone||'',s.category||'',s.courseType||'',s.admissionYear||'',s.prnNumber||'',s.aparIdNumber||'',s.aadharNumber||'',s.fatherName||'',s.motherName||'',s.dateOfBirth?new Date(s.dateOfBirth).toLocaleDateString('en-IN'):'',s.sscPercentage||'',s.hscPercentage||'',s.scholarshipStatus||'']);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='students.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const cats = [...new Set(admissions.map(a=>(a.category||'other').toLowerCase()))].sort();

  const filteredAdmissions = admissions.filter(s => {
    const q = search.toLowerCase();
    const mq = !q || s.applicantName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      || s.studentId?.toLowerCase().includes(q) || s.prnNumber?.toLowerCase().includes(q)
      || s.aadharNumber?.toLowerCase().includes(q) || s.phone?.includes(q);
    const my = yearFilter === 'all' || s.admissionYear === yearFilter;
    const mac = academicYearFilter === 'all' || s.academicYear === academicYearFilter;
    const mc = catFilter === 'all' || (s.category||'other').toLowerCase() === catFilter;
    // Current = tcIssued false or not set; Past = tcIssued true
    const ms = statusFilter === 'all' ? true
      : statusFilter === 'current' ? !s.tcIssued
      : s.tcIssued === true;
    return mq && my && mac && mc && ms;
  });

  // ── Row detail field renderer ─────────────────────────────────────────────
  const Row = ({ label, value, mono = false, badge = null }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:12 }}>
      <span style={{ color:'#888', fontWeight:600, minWidth:130, flexShrink:0 }}>{label}</span>
      {badge || <span style={{ color:(!value||value==='—')?'#ccc':'#222', textAlign:'right', wordBreak:'break-all', fontFamily:mono?'monospace':'inherit' }}>{value||'—'}</span>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DETAIL VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (selected) {
    const TABS = [
      { id:'overview',  label:'👤 Overview' },
      { id:'academic',  label:'🎓 Academic' },
      { id:'documents', label:'📎 Documents', show: role !== 'exam' },
      { id:'fees',      label:'💰 Fees',       show: role === 'accounts' || role === 'student_section' || role === 'principal' },
      { id:'scholarship',label:'🏅 Scholarship', show: role === 'scholarship' || role === 'student_section' || role === 'principal' },
      { id:'exam_forms', label:'📝 Exam Forms',  show: role === 'exam' || role === 'accounts' || role === 'student_section' || role === 'principal' },
    ].filter(t => t.show !== false);

    return (
      <div>
        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => { setSelected(null); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); setDetailTab('overview'); }}
              style={{ background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:8, padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer' }}>← Back</button>
            <div>
              <span style={{ fontWeight:700, fontSize:16, color:'#1a1a2e' }}>{selected.applicantName}</span>
              <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'2px 10px', borderRadius:10, fontWeight:700, marginLeft:8 }}>{selected.studentId||'No ID'}</span>
              {selected.tcIssued && <span style={{ fontSize:11, background:'#ffebee', color:'#C62828', padding:'2px 8px', borderRadius:10, fontWeight:700, marginLeft:6 }}>TC Issued</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {canEdit && !editMode && (
              <>
                <button onClick={() => { setEditMode(true); setDetailTab('overview'); setEditData(Object.fromEntries(EDITABLE_FIELDS.map(f=>[f.key,selected[f.key]||'']))); }}
                  style={{ background:themeColor, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>✏️ Edit</button>
                <button onClick={handleDelete}
                  style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>🗑️ Delete</button>
              </>
            )}
            {canEdit && editMode && (
              <>
                <button onClick={handleSave} disabled={saving}
                  style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {saving?'⏳ Saving...':'💾 Save'}</button>
                <button onClick={() => { setEditMode(false); setEditData({}); setMsg(''); }}
                  style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer' }}>Cancel</button>
              </>
            )}
            {role==='scholarship' && !scholEdit && (
              <button onClick={() => { setScholEdit(true); setDetailTab('scholarship'); setScholData({ scholarshipStatus:selected.scholarshipStatus||'not_filled', scholarshipAmount:selected.scholarshipAmount||'', mahaDBTUsername:selected.mahaDBTUsername||'', mahaDBTPassword:selected.mahaDBTPassword||'', mahaDBTAppNo:selected.mahaDBTAppNo||'', mahaDBTMobile:selected.mahaDBTMobile||'', scholarshipNote:selected.scholarshipNote||'' }); }}
                style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>🏅 Edit Scholarship</button>
            )}
          </div>
        </div>

        {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

        {/* Edit Mode — full form */}
        {editMode ? (
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:24 }}>
            <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:13, color:'#7c5e00' }}>
              ⚠️ Only change fields that have incorrect data. All changes are saved permanently.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {EDITABLE_FIELDS.map(field => (
                <div key={field.key}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:themeColor, marginBottom:5 }}>
                    {field.label} <span style={{ fontSize:10, color:'#aaa', fontWeight:400 }}>Current: {selected[field.key]||'—'}</span>
                  </label>
                  {field.type==='select'
                    ? <select value={editData[field.key]||''} onChange={e=>setEditData(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`2px solid ${themeColor}55`, fontSize:13, boxSizing:'border-box' }}>
                        <option value="">— Select —</option>
                        {field.options.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    : <input type={field.type} value={editData[field.key]||''} onChange={e=>setEditData(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`2px solid ${themeColor}55`, fontSize:13, boxSizing:'border-box' }} />
                  }
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'2px solid #e0e7ef', flexWrap:'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setDetailTab(t.id)}
                  style={{ padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', border:'none', borderBottom: detailTab===t.id ? `3px solid ${themeColor}` : '3px solid transparent', background:'transparent', color: detailTab===t.id ? themeColor : '#888', marginBottom:-2 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Overview ─────────────────────────── */}
            {detailTab === 'overview' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Left column: Personal + Contact */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>👤 Personal Details</h4>
                    {[
                      ['Full Name',      selected.applicantName],
                      ["Father's Name",  selected.fatherName],
                      ["Mother's Name",  selected.motherName],
                      ['Guardian',       selected.guardianName],
                      ['DOB',            selected.dateOfBirth?new Date(selected.dateOfBirth).toLocaleDateString('en-IN'):'—'],
                      ['Gender',         selected.gender],
                      ['Blood Group',    selected.bloodGroup],
                      ['Nationality',    selected.nationality],
                      ['Religion',       selected.religion],
                      ['Category',       selected.category?(selected.category).toUpperCase():'—'],
                      ['Caste',          selected.caste],
                      ['Sub-Caste',      selected.subCaste],
                      ['Aadhar No.',     selected.aadharNumber],
                      ['Family Income',  selected.familyIncome?`₹${selected.familyIncome}`:'—'],
                      ['Caste Cert No.', selected.casteCertificateNo],
                      ['Issuing Auth',   selected.casteCertificateAuthority],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>📞 Contact Details</h4>
                    {[
                      ['Mobile No.',       selected.phone],
                      ['Email',            selected.email],
                      ['Parent Phone',     selected.parentPhone || selected.fatherPhone || selected.motherPhone],
                      ['Guardian Phone',   selected.guardianPhone],
                      ['WhatsApp',         selected.whatsapp],
                      ['Emergency Contact',selected.emergencyContact],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                </div>

                {/* Identity + Address */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🏠 Address</h4>
                    {[
                      ['House No.',    selected.houseNumber],
                      ['Street/Area',  selected.streetArea],
                      ['City/Village', selected.cityTownVillage],
                      ['Sub-District', selected.subdistrict],
                      ['District',     selected.district],
                      ['State',        selected.state],
                      ['Pin Code',     selected.pinCode],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  {/* Credentials — Student Section only */}
                  {role==='student_section' && (
                    <div style={{ background:'#e8f5e9', borderRadius:14, border:'1px solid #a5d6a7', padding:20 }}>
                      <h4 style={{ color:'#2E7D32', marginBottom:12, fontSize:14 }}>🔑 Login Credentials</h4>
                      {[
                        ['Email',      selected.email],
                        ['Password',   selected.plainPassword||selected.tempPassword||'(set during generation)'],
                        ['Student ID', selected.studentId||'Not assigned'],
                        ['PRN',        selected.prnNumber||'Not set'],
                      ].map(([l,v]) => <Row key={l} label={l} value={v} mono />)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Academic ─────────────────────────── */}
            {detailTab === 'academic' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Current Academic */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🎓 Current Enrollment</h4>
                  {[
                    ['Student ID',    selected.studentId],
                    ['PRN Number',    selected.prnNumber],
                    ['ABC / APAR ID', selected.aparIdNumber],
                    ['Course',        selected.courseType],
                    ['Subject',       selected.preferredSubject],
                    ['Year',          selected.admissionYear],
                    ['Academic Year', selected.academicYear],
                    ['Status',        selected.tcIssued ? '🔴 TC Issued (Inactive)' : '🟢 Active'],
                  ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                </div>

                {/* SSC + HSC */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>📚 SSC (10th)</h4>
                    {[
                      ['School',   selected.sscSchoolName],
                      ['Board',    selected.sscBoard],
                      ['Year',     selected.sscYOP],
                      ['Percentage', selected.sscPercentage?`${selected.sscPercentage}%`:'—'],
                      ['Grade',    selected.sscGrade],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>📚 HSC (12th)</h4>
                    {[
                      ['College',  selected.hscCollegeName],
                      ['Board',    selected.hscBoard],
                      ['Stream',   selected.hscStream],
                      ['Year',     selected.hscYOP],
                      ['Percentage', selected.hscPercentage?`${selected.hscPercentage}%`:'—'],
                      ['Grade',    selected.hscGrade],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  {selected.hasGap && (
                    <div style={{ background:'#fff8e1', borderRadius:14, border:'1px solid #ffe082', padding:20 }}>
                      <h4 style={{ color:'#F57F17', marginBottom:12, fontSize:14 }}>⏸️ Gap Year</h4>
                      {[
                        ['From', selected.gapFromYear],
                        ['To',   selected.gapToYear],
                        ['Reason', selected.gapReason],
                      ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🏦 Bank Details</h4>
                  {[
                    ['Bank Name',   selected.bankName],
                    ['Branch',      selected.bankBranch],
                    ['Account No.', selected.bankAccountNo],
                    ['IFSC Code',   selected.ifscCode],
                  ].map(([l,v]) => <Row key={l} label={l} value={v} mono={l!=='Bank Name'&&l!=='Branch'} />)}
                </div>
              </div>
            )}

            {/* ── TAB: Documents ────────────────────────── */}
            {detailTab === 'documents' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {[
                  { label:'📸 Photo',              url: selected.photo },
                  { label:'🪪 Aadhar Card',         url: selected.aadharPhoto },
                  { label:'📋 Caste Certificate',   url: selected.casteCertificate },
                  { label:'✅ Caste Validity',      url: selected.casteValidityCertificate },
                  { label:'📄 Income Certificate',  url: selected.incomeCertificate },
                  { label:'🏠 Domicile Certificate',url: selected.domicileCertificate },
                  { label:'🏦 Bank Passbook',        url: selected.bankPassbook },
                  { label:'📝 SSC Marksheet',        url: selected.sscMarksheet },
                  { label:'📝 HSC Marksheet',        url: selected.hscMarksheet },
                  { label:'🎓 HSC Certificate',      url: selected.hscCertificate },
                  { label:'📋 Migration Certificate',url: selected.migrationCertificate },
                  { label:'🔖 Leaving Certificate',  url: selected.leavingCertificate },
                ].map(({ label, url }) => (
                  <div key={label} style={{ background: url?'#f0fdf4':'#fafafa', borderRadius:12, border:`1px solid ${url?'#a5d6a7':'#e0e7ef'}`, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:600, color: url?'#1a1a2e':'#aaa' }}>{label}</span>
                    {role === 'exam'
                      ? (url
                          ? <span style={{ fontSize:16, fontWeight:800, color:'#2E7D32' }}>✓</span>
                          : <span style={{ fontSize:11, color:'#ccc' }}>Not uploaded</span>)
                      : (url
                          ? <a href={url} target="_blank" rel="noreferrer"
                              style={{ fontSize:12, fontWeight:700, color:'#1565C0', background:'#e3f2fd', padding:'4px 10px', borderRadius:6, textDecoration:'none' }}>View ↗</a>
                          : <span style={{ fontSize:11, color:'#ccc' }}>Not uploaded</span>)
                    }
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB: Fees ─────────────────────────────── */}
            {detailTab === 'fees' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* ── Fee Structure Details (year-wise) + Pay Remaining Fees — Accounts only ── */}
                {role === 'accounts' && (() => {
                  const ck = svfCourseKey(selected.courseType);
                  const schol = selected.scholarshipAmount || 0;
                  const ledger = selected.feeLedger || [];
                  const currentYear = selected.admissionYear;
                  const legacyPaid = ledger.filter(p => !p.year).reduce((s, p) => s + (p.amount || 0), 0);
                  const paidForYear = (yr) => {
                    const tagged = ledger.filter(p => p.year === yr).reduce((s, p) => s + (p.amount || 0), 0);
                    return tagged + (yr === currentYear ? legacyPaid : 0);
                  };
                  return (
                    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', overflow:'hidden' }}>
                      <div style={{ background:'#009688', padding:'10px 16px', textAlign:'center' }}>
                        <span style={{ color:'#fff', fontWeight:700, fontSize:14, letterSpacing:1 }}>Fee Structure Details</span>
                      </div>
                      {!ck ? (
                        <div style={{ padding:16, textAlign:'center', color:'#888', fontSize:13 }}>Course not detected — cannot show fee structure.</div>
                      ) : (
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                            <thead>
                              <tr style={{ background:'#f5f5f5' }}>
                                {['Fee Structure','Year','Total','Scholarship','Net Payable','Paid','Balance Due', ...(canCollect ? ['Action'] : [])].map(h => (
                                  <th key={h} style={{ padding:'9px 10px', fontWeight:700, color:'#009688', textAlign:'center', borderBottom:'2px solid #009688', fontSize:12, whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(OFFICIAL_FEES_YEARLY[ck]?.years || {}).map(([yr, data], i) => {
                                const isCurrent = yr === currentYear;
                                const netPay = Math.max(0, data.total - schol);
                                const paid = paidForYear(yr);
                                const balance = Math.max(0, netPay - paid);
                                return (
                                  <tr key={yr} style={{ background: isCurrent ? '#e0f7fa' : i % 2 === 0 ? '#fafafa' : '#fff', fontWeight: isCurrent ? 700 : 400 }}>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0' }}>
                                      {OFFICIAL_FEES_YEARLY[ck]?.label} {isCurrent && <span style={{ background:'#009688', color:'#fff', fontSize:10, padding:'1px 6px', borderRadius:8, marginLeft:4 }}>Current</span>}
                                    </td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0', color:'#009688', fontWeight:700 }}>{yr}</td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0' }}>₹{data.total.toLocaleString('en-IN')}</td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0', color: schol > 0 ? '#7B1FA2' : '#999' }}>{schol > 0 ? `₹${schol.toLocaleString('en-IN')}` : '₹0'}</td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0', fontWeight:700 }}>₹{netPay.toLocaleString('en-IN')}</td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0', color:'#2E7D32', fontWeight:700 }}>₹{paid.toLocaleString('en-IN')}</td>
                                    <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0', color: balance > 0 ? '#C62828' : '#2E7D32', fontWeight:700 }}>{balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '✅ Paid'}</td>
                                    {canCollect && (
                                      <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:'1px solid #f0f0f0' }}>
                                        {balance > 0 ? (
                                          <button onClick={() => openPayModal(yr, { total: data.total, schol, netPay, paid, balance })}
                                            style={{ background:'#009688', color:'#fff', border:'none', borderRadius:7, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                                            💰 Pay Remaining
                                          </button>
                                        ) : <span style={{ fontSize:11, color:'#2E7D32', fontWeight:600 }}>—</span>}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Fee Ledger */}
                {selected.feeLedger?.length > 0 ? (
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#1565C0', marginBottom:12, fontSize:14 }}>📋 Payment History</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', background:'#e3f2fd', padding:'7px 14px', borderRadius:8, marginBottom:6, gap:8 }}>
                      {['Fee Type','Mode','Date','Amount'].map(h=>(
                        <span key={h} style={{ fontSize:11, fontWeight:700, color:'#1565C0' }}>{h}</span>
                      ))}
                    </div>
                    {selected.feeLedger.map((p,i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'7px 14px', borderBottom:'1px solid #f0f4f8', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:12 }}>{p.feeTypeLabel||p.feeType}</span>
                        <span style={{ fontSize:11, color:'#555', textTransform:'capitalize' }}>{p.paymentMode||'—'}</span>
                        <span style={{ fontSize:11, color:'#888' }}>{p.paidAt?new Date(p.paidAt).toLocaleDateString('en-IN'):'—'}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32' }}>₹{(p.amount||0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'8px 14px', background:'#e8f5e9', borderRadius:8, marginTop:6, gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#2E7D32', gridColumn:'span 3' }}>Total Collected</span>
                      <span style={{ fontSize:14, fontWeight:800, color:'#1b5e20' }}>₹{selected.feeLedger.reduce((s,p)=>s+(p.amount||0),0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'#f8faff', borderRadius:12, border:'1px solid #e0e7ef', padding:24, textAlign:'center', color:'#aaa', fontSize:14 }}>
                    No payment records found.
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Scholarship ──────────────────────── */}
            {detailTab === 'scholarship' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Scholarship Edit Form */}
                {scholEdit && (
                  <div style={{ background:'#f3e5f5', border:'1px solid #ce93d8', borderRadius:14, padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:14 }}>🏅 Edit Scholarship Details</h4>

                    {/* Auto-fill info strip */}
                    <div style={{ background:'#fff', border:'1px solid #ce93d8', borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                      <div style={{ fontSize:13, color:'#555' }}>
                        <strong>Category:</strong> {(selected.category||'—').toUpperCase()} &nbsp;|&nbsp;
                        <strong>Course:</strong> {selected.courseType||'—'} &nbsp;|&nbsp;
                        <strong>Year:</strong> {selected.admissionYear||'—'}
                      </div>
                      <button onClick={handleAutoFillAmount} disabled={scholSaving}
                        style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        🔄 Auto-fill Amount from MahaDBT Master
                      </button>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {[
                        { key:'scholarshipStatus', label:'Status', type:'select', options:['not_filled','filled','approved','rejected','disbursed'] },
                        { key:'scholarshipAmount', label:'Scholarship Amount (₹)', type:'number' },
                        { key:'mahaDBTUsername',   label:'MahaDBT Username',       type:'text' },
                        { key:'mahaDBTPassword',   label:'MahaDBT Password',       type:'text' },
                        { key:'mahaDBTAppNo',      label:'MahaDBT App No.',        type:'text' },
                        { key:'mahaDBTMobile',     label:'MahaDBT Mobile No.',     type:'text' },
                        { key:'scholarshipNote',   label:'Notes',                  type:'text' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#7B1FA2', marginBottom:5 }}>{f.label}</label>
                          {f.type==='select'
                            ? <select value={scholData[f.key]||''} onChange={async e => {
                                const newStatus = e.target.value;
                                setScholData(p=>({...p,[f.key]:newStatus}));
                                // Auto-fill amount when status set to approved
                                if (newStatus === 'approved' && !scholData.scholarshipAmount) {
                                  try {
                                    const res = await API.post(`/scholarships/calculate/${selected._id}`);
                                    const amt = res.data.data?.scholarshipEligibleAmount || 0;
                                    if (amt > 0) setScholData(p=>({...p, scholarshipAmount: amt}));
                                  } catch {}
                                }
                              }}
                                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, boxSizing:'border-box' }}>
                                {f.options.map(o=><option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                              </select>
                            : <div style={{ position:'relative' }}>
                                <input type={f.type} value={scholData[f.key]||''} onChange={e=>setScholData(p=>({...p,[f.key]:e.target.value}))}
                                  style={{ width:'100%', padding:'9px 12px', borderRadius:8, border: f.key==='scholarshipAmount' && scholData.scholarshipAmount > 0 ? '2px solid #7B1FA2' : '2px solid #ce93d8', fontSize: f.key==='scholarshipAmount' ? 16 : 13, fontWeight: f.key==='scholarshipAmount' ? 700 : 400, boxSizing:'border-box', background: f.key==='scholarshipAmount' && scholData.scholarshipAmount > 0 ? '#fdf3ff' : '#fff' }} />
                                {f.key==='scholarshipAmount' && (
                                  <div style={{ fontSize:11, color:'#7B1FA2', marginTop:3, fontWeight:600 }}>
                                    {scholData.scholarshipAmount > 0
                                      ? `Net payable = ₹${Math.max(0,(selected.totalFees||0) - Number(scholData.scholarshipAmount)).toLocaleString('en-IN')}`
                                      : 'Click "Auto-fill" to set from MahaDBT Master'}
                                  </div>
                                )}
                              </div>
                          }
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:10, marginTop:16 }}>
                      <button onClick={handleScholSave} disabled={scholSaving}
                        style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        {scholSaving?'⏳ Saving...':'💾 Save Scholarship'}</button>
                      <button onClick={()=>setScholEdit(false)}
                        style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Scholarship info display */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:12, fontSize:14 }}>🏅 Scholarship Status</h4>
                    {[
                      ['Status', null, <span key="s" style={{ background:schColor(selected.scholarshipStatus)[0], color:schColor(selected.scholarshipStatus)[1], padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:700 }}>{(selected.scholarshipStatus||'not_filled').replace(/_/g,' ')}</span>],
                      ['Eligible Amount', `₹${Number(selected.scholarshipEligibleAmount||0).toLocaleString('en-IN')}`],
                      ['Scholarship Amount', `₹${Number(selected.scholarshipAmount||0).toLocaleString('en-IN')}`],
                      ['Received Amount', `₹${Number(selected.scholarshipReceivedAmount||0).toLocaleString('en-IN')}`],
                      ['Pending Amount', `₹${Number(selected.scholarshipPendingAmount||0).toLocaleString('en-IN')}`],
                      ['Note', selected.scholarshipNote],
                    ].map(([l,v,badge]) => <Row key={l} label={l} value={v} badge={badge} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:12, fontSize:14 }}>🌐 MahaDBT Details</h4>
                    {[
                      ['Username',   selected.mahaDBTUsername],
                      ['App No.',    selected.mahaDBTAppNo],
                      ['Mobile',     selected.mahaDBTMobile],
                      ['Verified By',selected.scholarshipVerifiedBy],
                      ['Verified On',selected.scholarshipVerifiedDate?new Date(selected.scholarshipVerifiedDate).toLocaleDateString('en-IN'):'—'],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Exam Forms ──────────────────────── */}
            {detailTab === 'exam_forms' && (
              <ExamFormsDetailTab studentEmail={selected.email} themeColor={themeColor} />
            )}
          </>
        )}

        {/* ── Pay Remaining Fees modal (Accounts) ── */}
        {payModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={closePayModal}>
            <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:440, padding:24, boxShadow:'0 8px 40px rgba(0,0,0,0.25)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ color:'#009688', margin:0, fontSize:17 }}>💰 Pay Remaining Fees</h3>
                <button onClick={closePayModal} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#555' }}>✕</button>
              </div>
              <p style={{ fontSize:13, color:'#666', margin:'0 0 14px' }}>{selected.applicantName} — {selected.courseType} · <strong>{payModal.year}</strong></p>

              <div style={{ background:'#f8faff', border:'1px solid #e0e7ef', borderRadius:10, padding:'12px 14px', marginBottom:16, fontSize:13 }}>
                {[
                  ['Total Fees', `₹${(payModal.total||0).toLocaleString('en-IN')}`],
                  ['Scholarship', `− ₹${(payModal.schol||0).toLocaleString('en-IN')}`],
                  ['Net Payable', `₹${(payModal.netPay||0).toLocaleString('en-IN')}`],
                  ['Already Paid', `₹${(payModal.paid||0).toLocaleString('en-IN')}`],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', color:'#555' }}>
                    <span>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0 0', marginTop:6, borderTop:'1px dashed #cfd8e3', fontWeight:800 }}>
                  <span style={{ color:'#C62828' }}>Balance Due</span>
                  <span style={{ color:'#C62828' }}>₹{(payModal.balance||0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:8 }}>Select Fee Heads to Pay *</label>
              {payHeadsLoading ? (
                <div style={{ textAlign:'center', padding:14, color:'#888', fontSize:13 }}>⏳ Loading fee heads...</div>
              ) : (
                <div style={{ border:'1px solid #e0e7ef', borderRadius:10, marginBottom:16, overflow:'hidden' }}>
                  {payHeads.map(h => (
                    <label key={h.name} htmlFor={`head_${h.name}`}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderBottom:'1px solid #f0f4f8', background: h.paid ? '#e8f5e9' : (selectedHeads.includes(h.name) ? '#e0f7fa' : '#fff'), cursor: h.paid ? 'default' : 'pointer' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <input type="checkbox" id={`head_${h.name}`} checked={h.paid || selectedHeads.includes(h.name)} disabled={h.paid}
                          onChange={() => toggleHead(h.name)} style={{ width:16, height:16, cursor: h.paid ? 'not-allowed' : 'pointer' }} />
                        <span style={{ fontSize:13, color: h.paid ? '#2E7D32' : '#333', fontWeight: h.paid ? 600 : 500 }}>{h.name}</span>
                        {h.paid && <span style={{ fontSize:10, fontWeight:700, color:'#2E7D32', background:'#c8e6c9', padding:'1px 7px', borderRadius:8 }}>✅ Paid</span>}
                      </span>
                      <span style={{ fontSize:13, fontWeight:700, color: h.paid ? '#2E7D32' : '#333' }}>₹{h.amount.toLocaleString('en-IN')}</span>
                    </label>
                  ))}
                </div>
              )}

              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:6 }}>Amount Collected (₹) *</label>
              <input type="number" min="0" value={payAmt} onChange={e => setPayAmt(e.target.value)}
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'2px solid #009688', fontSize:18, fontWeight:700, textAlign:'center', boxSizing:'border-box', marginBottom:14 }} />
              <p style={{ fontSize:11, color:'#888', margin:'-10px 0 14px', textAlign:'center' }}>Selected heads ka total auto-fill hota hai — chahe to manually adjust kar sakte ho.</p>

              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:6 }}>Payment Mode *</label>
              <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                {[{k:'cash',l:'💵 Cash'},{k:'online',l:'🌐 Online / UPI'}].map(m => (
                  <button key={m.k} onClick={() => setPayMode(m.k)}
                    style={{ flex:1, padding:'10px', borderRadius:9, border:`2px solid ${payMode===m.k?'#009688':'#ddd'}`, background:payMode===m.k?'#009688':'#fff', color:payMode===m.k?'#fff':'#555', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    {m.l}
                  </button>
                ))}
              </div>

              {payMode === 'online' && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#333', marginBottom:6 }}>Transaction ID *</label>
                  <input type="text" placeholder="UPI / Txn Reference" value={payTxn} onChange={e => setPayTxn(e.target.value)}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'2px solid #009688', fontSize:14, boxSizing:'border-box' }} />
                </div>
              )}

              {payMsg && <div style={{ padding:'9px 12px', borderRadius:8, marginBottom:12, fontSize:13, background:'#ffebee', color:'#C62828', fontWeight:600 }}>{payMsg}</div>}

              <button onClick={handlePayRemaining} disabled={paySaving}
                style={{ width:'100%', background: paySaving ? '#aaa' : '#009688', color:'#fff', border:'none', borderRadius:10, padding:14, fontSize:15, fontWeight:700, cursor: paySaving ? 'not-allowed' : 'pointer' }}>
                {paySaving ? '⏳ Processing...' : '🖨️ Collect & Print Receipt'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  const currentCount = admissions.filter(s=>!s.tcIssued).length;
  const pastCount    = admissions.filter(s=>s.tcIssued).length;

  return (
    <div>
      {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

      {/* Current / Past / All toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {[
          { k:'current', label:`🟢 Current Students (${currentCount})` },
          { k:'past',    label:`🔴 Past Students (${pastCount})` },
          { k:'all',     label:`📋 All (${admissions.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setStatusFilter(t.k)}
            style={{ padding:'7px 16px', borderRadius:8, border:`2px solid ${statusFilter===t.k?themeColor:'#ddd'}`, background:statusFilter===t.k?themeColor:'#fff', color:statusFilter===t.k?'#fff':'#555', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input type="text" placeholder="🔍 Name, email, ID, PRN, aadhar..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14 }} />
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
        <select value={academicYearFilter} onChange={e=>setAcademicYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Academic Years</option>
          {['2023-24','2024-25','2025-26','2026-27'].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <button onClick={fetchAdmissions} style={{ padding:'9px 14px', background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:9, fontWeight:600, fontSize:13, cursor:'pointer' }}>🔄</button>
        <button onClick={exportCSV} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:9, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer' }}>📥 CSV</button>
      </div>

      {/* Count badges */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Showing: {filteredAdmissions.length}</div>
        {['1st Year','2nd Year','3rd Year'].map(y=>(
          <div key={y} style={{ background:'#f5f5f5', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>
            {y}: {filteredAdmissions.filter(s=>s.admissionYear===y).length}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👩‍🎓</div><h3>No students found</h3></div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.5fr 0.7fr 1.2fr 0.9fr 0.9fr 0.6fr', background:themeColor, padding:'10px 16px', gap:8 }}>
            {['ID','Name','Email','Cat.','Course / Year','PRN','Scholarship',''].map(h=>(
              <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
            ))}
          </div>
          {filteredAdmissions.slice(0, visibleCount).map((s,idx) => {
            const sc = schColor(s.scholarshipStatus);
            return (
              <div key={s._id} style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.5fr 0.7fr 1.2fr 0.9fr 0.9fr 0.6fr', padding:'10px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:s.tcIssued?'#fff8f8':idx%2===0?'#fafbff':'#fff' }}>
                <span style={{ fontSize:10, fontFamily:'monospace', color:themeColor, fontWeight:700 }}>{s.studentId||'—'}</span>
                <div>
                  <p style={{ fontWeight:600, fontSize:13, color:'#1a1a2e', margin:0 }}>{s.applicantName}</p>
                  <p style={{ fontSize:10, color:s.tcIssued?'#C62828':'#888', margin:0 }}>{s.tcIssued?'🔴 TC Issued':s.phone||''}</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:'#555', margin:0 }}>{s.email}</p>
                  <p style={{ fontSize:10, color:'#aaa', margin:0 }}>Aadhar: {s.aadharNumber||'—'}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#555' }}>{s.category||'—'}</span>
                <div>
                  <p style={{ fontSize:11, margin:0 }}>{s.courseType||'—'}</p>
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.admissionYear}</p>
                </div>
                <span style={{ fontSize:10, fontFamily:'monospace', color:s.prnNumber?'#2E7D32':'#E65100', fontWeight:600 }}>{s.prnNumber||'⚠️—'}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:8, background:sc[0], color:sc[1] }}>{(s.scholarshipStatus||'not_filled').replace(/_/g,' ')}</span>
                <button onClick={()=>{ setSelected(s); setDetailTab('overview'); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); }}
                  style={{ background:'#e3f2fd', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>👁️</button>
              </div>
            );
          })}
          {visibleCount < filteredAdmissions.length && (
            <div ref={loaderRef} style={{ padding:'14px 16px', textAlign:'center', fontSize:12, color:'#888', background:'#fafbff' }}>
              ⏳ Scroll for more… (showing {Math.min(visibleCount, filteredAdmissions.length)} of {filteredAdmissions.length})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentViewFull;
