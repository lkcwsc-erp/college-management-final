import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import IDCard, { printIDCard } from '../../components/IDCard';
import API from '../../api/axios';
import './Dashboard.css';

// Official fee structure 2025-26


// ── Print receipt for student ────────────────────────────────────────────────
const printStudentReceipt = (p, adm) => {
  const logo = "data:image/jpeg;base64,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";
  const acadYear = (() => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; })();
  const dateStr = p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  const amt = p.amount || 0;
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const inW=(n)=>{if(n===0)return'';if(n<20)return a[n]+' ';if(n<100)return b[Math.floor(n/10)]+' '+(n%10?a[n%10]+' ':'');if(n<1000)return a[Math.floor(n/100)]+'Hundred '+(n%100?inW(n%100):'');return a[Math.floor(n/1000)]+'Thousand '+(n%1000?inW(n%1000):'');};
  const amtWords = inW(amt).trim() + ' Only';

  const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#fff;padding:10px;font-size:12px}
    .receipt{width:160mm;border:1px solid #999;margin:0 auto}
    .hdr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1.5px solid #000}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:8.5px;color:#555}
    .hname{font-size:13px;font-weight:800;color:#000;line-height:1.3;margin:2px 0}
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
    .erpline{padding:3px 12px;font-size:9px;color:#666;border-top:1px dashed #aaa;text-align:center}
    @media print{body{padding:0}.receipt{width:100%}@page{size:A5;margin:5mm}}
  </style></head><body>
  <div class="receipt">
    <div class="hdr">
      <img src="${logo}" class="hlogo"/>
      <div class="htxt">
        <div class="htrust" style="font-weight:700">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="hname">Late Kalpana Chawla Women's Senior College (LKCWSC)</div>
        <div class="haddr">Affiliated to SNDT Women's University, Mumbai</div>
        <div class="haddr">Gangakhed, Dist. Parbhani, Maharashtra – 431514 &nbsp;|&nbsp; +91 9307162914 &nbsp;|&nbsp; lkcwsc.vnssorg.com</div>
      </div>
    </div>
    <div class="titlebar">FEE RECEIPT</div>
    <div class="copyline">Fee Receipt (Student Copy)</div>
    <div class="metarow">
      <span><b>Receipt No. :</b> ${p.receiptNo||'—'}</span>
      <span><b>Date :</b> ${dateStr}</span>
    </div>
    <div class="infobox">
      <table class="info">
        <tr>
          <td class="lbl">Student Name</td><td class="val">: ${adm?.applicantName||'—'}</td>
          <td class="lbl" style="padding-left:16px">Student UID</td><td class="val">: ${adm?.studentId||'—'}</td>
        </tr>
        <tr>
          <td class="lbl">Course</td><td class="val">: ${(()=>{const ct=(adm?.courseType||'').toLowerCase();return ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')?'Bachelor of Science (B.Sc.)':ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')?'Bachelor of Arts (B.A.)':adm?.courseType||'—';})()} </td>
          <td class="lbl" style="padding-left:16px">Academic Year</td><td class="val">: ${acadYear}</td>
        </tr>
        <tr>
          <td class="lbl">Class</td><td class="val">: ${adm?.admissionYear||'—'}</td>
          <td class="lbl" style="padding-left:16px">Fee Type</td><td class="val">: ${p.feeTypeLabel||p.feeType||'—'}</td>
        </tr>
      </table>
    </div>
    <table class="fees">
      <thead><tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>${p.feeTypeLabel||p.feeType||'Fee'}</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
        <tr class="totrow"><td colspan="2" style="text-align:right;padding-right:10px">Total Amount</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
      </tbody>
    </table>
    <div class="amtline">Amt. in words (Rs.) : <b>${amtWords}</b></div>
    <div class="payline">Paid by : <b>${p.paymentMode==='online'?'Online':'Cash'}</b> &nbsp;&nbsp; Rs. <b>${amt.toLocaleString('en-IN')}.00</b> &nbsp;&nbsp; Date : <b>${dateStr}</b></div>
    <div class="narrline">Narration :</div>
    <div class="sigrow">
      <div class="sigsys">This is system generated receipt and does not require seal/stamp.</div>
      <div class="sigbox"><div class="sigline">Accounts Section<br/>LKCWSC</div></div>
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}></body></html>`;
  const w = window.open('','_blank','width=680,height=680');
  w.document.write(html); w.document.close();
};


// ── Document Request Form ────────────────────────────────────────────────────
const DocRequestForm = ({ myAdmission, onSubmitted }) => {
  const [docType, setDocType]   = useState('');
  const [reason, setReason]     = useState('');
  const [urgency, setUrgency]   = useState('normal');
  const [msSem, setMsSem]       = useState('');
  const [msSession, setMsSession] = useState('');
  const [msYear, setMsYear]     = useState(new Date().getFullYear().toString());
  const [msAcadYear, setMsAcadYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState('');

  // Check if TC already issued
  const tcAlreadyIssued = myAdmission?.tcIssued;

  const handleSubmit = async () => {
    if (!docType) { setMsg('❌ Please select document type.'); return; }
    if (docType === 'TC' && tcAlreadyIssued) { setMsg('❌ TC has already been issued to you. Contact college for re-issue.'); return; }
    if (docType === 'MARKSHEET' && (!msSem || !msSession || !msYear)) { setMsg('❌ Please select semester, session and year for marksheet.'); return; }
    setSubmitting(true);
    try {
      await API.post('/document-requests', {
        documentType: docType, reason, urgency,
        marksheetSemester: docType === 'MARKSHEET' ? msSem : '',
        marksheetSession:  docType === 'MARKSHEET' ? msSession : '',
        marksheetYear:     docType === 'MARKSHEET' ? msYear : '',
        marksheetAcadYear: docType === 'MARKSHEET' ? msAcadYear : '',
      });
      setMsg('✅ Request submitted successfully!');
      setDocType(''); setReason(''); setUrgency('normal'); setMsSem(''); setMsSession(''); setMsYear(new Date().getFullYear().toString()); setMsAcadYear('');
      setTimeout(() => setMsg(''), 3000);
      if (onSubmitted) onSubmitted();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to submit')); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
      <h4 style={{ color: '#1565C0', marginBottom: 16, fontSize: 14 }}>📋 Apply for a Document</h4>

      {/* TC inactive warning */}
      {tcAlreadyIssued && (
        <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#C62828', fontWeight: 600 }}>
          ⚠️ Your Transfer Certificate has been issued. Your account is marked as <strong>Inactive</strong>. Contact the college for any queries.
        </div>
      )}

      {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: msg.startsWith('✅')?'#e8f5e9':'#ffebee', color: msg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight: 500 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Document Type *</label>
          <select value={docType} onChange={e => setDocType(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
            <option value="">— Select —</option>
            <option value="TC" disabled={tcAlreadyIssued}>🎓 Transfer Certificate (TC){tcAlreadyIssued?' — Already Issued':''}</option>
            <option value="BONAFIDE">📋 Bonafide Certificate</option>
            <option value="ID_CARD">🪪 ID Card</option>
            <option value="MARKSHEET">📄 Marksheet</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Priority</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
            <option value="normal">Normal</option>
            <option value="urgent">⚡ Urgent</option>
          </select>
        </div>
      </div>

      {/* Marksheet extra fields */}
      {docType === 'MARKSHEET' && (
        <div style={{ background: '#e3f2fd', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1565C0', marginBottom: 10 }}>📄 Marksheet Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Semester *</label>
              <select value={msSem} onChange={e => setMsSem(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                {['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Session *</label>
              <select value={msSession} onChange={e => setMsSession(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                <option value="mar_apr">March / April</option>
                <option value="nov_dec">November / December</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Year *</label>
              <select value={msYear} onChange={e => setMsYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Academic Year *</label>
              <select value={msAcadYear} onChange={e => setMsAcadYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                {['2022-23','2023-24','2024-25','2025-26','2026-27'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Reason / Purpose</label>
        <input type="text" placeholder="e.g. For job application, higher studies..." value={reason} onChange={e => setReason(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
      </div>

      {/* Workflow info */}
      {docType && (
        <div style={{ marginBottom: 14, background: '#f8faff', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555' }}>
          {docType==='TC' && '📋 Workflow: You → Accounts (fee) → Exam Section (result verify) → Principal → Student Section (print)'}
          {docType==='BONAFIDE' && '📋 Workflow: You → Accounts (fee) → Student Section (print)'}
          {docType==='ID_CARD' && '📋 Workflow: You → Accounts (fee) → Student Section (issue)'}
          {docType==='MARKSHEET' && '📋 Workflow: You → Exam Section (process) → Student Section (issue)'}
        </div>
      )}

      <button onClick={handleSubmit} disabled={submitting || (docType==='TC' && tcAlreadyIssued)}
        style={{ background: submitting||(!docType)||(docType==='TC'&&tcAlreadyIssued)?'#aaa':'#1565C0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: submitting?'not-allowed':'pointer' }}>
        {submitting ? '⏳ Submitting...' : '📤 Submit Request'}
      </button>
    </div>
  );
};


// ─── Yearly fee structure for student view ───────────────────────────────────
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

// ── Course full name helper ──────────────────────────────────────────────────
const getCourseFull = (ct) => {
  const c = (ct||'').toLowerCase();
  if (c.includes('b.sc')||c.includes('bsc')||c.includes('science')) return 'Bachelor of Science (B.Sc.)';
  if (c.includes('b.a')||c.includes('ba')||c.includes('arts')) return 'Bachelor of Arts (B.A.)';
  return ct||'—';
};


const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);


  const [results, setResults] = useState([]);
  const [resultsLoading] = useState(false);
  const [examSettings, setExamSettings] = useState({ regularEnabled: false, backlogEnabled: false });
  const [examSubmitted, setExamSubmitted] = useState({ regular: false, backlog: false });

  useEffect(() => {
    API.get('/notices').then(res => setNotices(res.data.notices || []));
    if (user?.email) {
      API.get(`/admissions/by-email/${user.email}`)
        .then(res => {
          if (res.data.success) setMyAdmission(res.data.admission);
          setAdmissionLoading(false);
        })
        .catch(() => setAdmissionLoading(false));
    } else {
      setAdmissionLoading(false);
    }
    // Fetch results
    API.get('/results/my')
      .then(res => setResults(res.data.results || []))
      .catch(() => {});
    API.get('/document-requests/my')
      .then(r => setMyRequests(r.data.requests || []))
      .catch(() => {});
    // Fetch exam form settings
    API.get('/results/exam-settings')
      .then(res => setExamSettings(res.data.settings || {}))
      .catch(() => {});
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };


  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'application', label: '📋 My Application' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'fees', label: '💰 My Fees' },
    { id: 'documents', label: '📄 Request Documents' },
    { id: 'results', label: '🎓 Results' },
    { id: 'examform', label: '📝 Exam Form' },
    { id: 'scholarship', label: '🏅 Scholarship' },
    { id: 'attendance', label: '📊 Attendance' },
    { id: 'academic_year', label: '📅 Academic Year' },
    { id: 'notices', label: '📢 Notices' },
  ];

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' };
  };

  const getStatusMessage = (status) => {
    if (status === 'approved') return 'Congratulations! Your admission has been approved.';
    if (status === 'rejected') return 'Unfortunately your application was not approved. Please contact the college office.';
    return 'Your application is being reviewed. Please check back later.';
  };

  const getStatusEmoji = (status) => {
    if (status === 'approved') return '🎉';
    if (status === 'rejected') return '😞';
    return '⏳';
  };

  const docUrl = (f) => (f || '').startsWith('http')
    ? f
    : `https://college-management-nnve.onrender.com/uploads/${f}`;

  const docList = [
    { key: 'studentPhoto', label: '📸 Student Photo' },
    { key: 'aadharPhoto', label: '🪪 Aadhar Card' },
    { key: 'sscMarksheet', label: '📄 SSC Marksheet' },
    { key: 'hscMarksheet', label: '📄 HSC Marksheet' },
    { key: 'gapCertificate', label: '📅 Gap Certificate' },
    { key: 'casteCertificate', label: '📋 Caste Certificate' },
    { key: 'casteValidityCertificate', label: '✅ Caste Validity' },
  ];
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/college-logo.png" alt="College Logo" className="sidebar-logo-img" />
          <div className="sidebar-text">
            <h3>Late Kalpana Chawla Women's Senior College</h3>
            <p>Senior Science & Arts College, Gangakhed</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info"><span>👋 Welcome, {user?.name}</span></div>
        </div>

        <div className="dashboard-content">

          {/* ============ HOME TAB ============ */}
          {activeTab === 'home' && (
            <div>
              {/* ── MIT/JUNO style Profile Card ── */}
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '28px 24px',
                marginBottom: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                textAlign: 'center', border: '1px solid #e3f2fd'
              }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  margin: '0 auto 14px', overflow: 'hidden',
                  border: '4px solid #1565C0', background: '#e3f2fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {myAdmission?.studentPhoto ? (
                    <img src={docUrl(myAdmission.studentPhoto)} alt="Student"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>👩‍🎓</span>
                  )}
                </div>

                <h2 style={{ color: '#0d1b3e', margin: '0 0 4px', fontSize: '1.5rem' }}>
                  {myAdmission?.applicantName || user?.name}
                </h2>

                {myAdmission?.studentId ? (
                  <div style={{
                    display: 'inline-block', background: '#e8f5e9', color: '#2E7D32',
                    padding: '5px 16px', borderRadius: '20px', fontSize: '14px',
                    fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px',
                    margin: '4px 0 14px'
                  }}>
                    🎓 ID: {myAdmission.studentId}
                  </div>
                ) : (
                  <div style={{
                    display: 'inline-block', background: '#fff3e0', color: '#E65100',
                    padding: '5px 16px', borderRadius: '20px', fontSize: '13px',
                    fontWeight: '600', margin: '4px 0 14px'
                  }}>
                    ⏳ Student ID Pending
                  </div>
                )}

                <div style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                  gap: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '16px'
                }}>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>COURSE</p>
                    <p style={{ fontSize: '14px', color: '#1565C0', fontWeight: '600', margin: '2px 0 0' }}>
                      {myAdmission?.courseType || myAdmission?.hscStream || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#e8f5e9', borderRadius: '10px', border: '1px solid #a5d6a7' }}>
                    <p style={{ fontSize: '11px', color: '#2E7D32', margin: 0, fontWeight: '700' }}>CURRENT YEAR</p>
                    <p style={{ fontSize: '14px', color: '#1b5e20', fontWeight: '700', margin: '2px 0 0' }}>
                      {myAdmission?.admissionYear || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>EMAIL</p>
                    <p style={{ fontSize: '13px', color: '#333', fontWeight: '500', margin: '2px 0 0', wordBreak: 'break-all' }}>
                      {myAdmission?.email || user?.email}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>PHONE</p>
                    <p style={{ fontSize: '14px', color: '#333', fontWeight: '500', margin: '2px 0 0' }}>
                      {myAdmission?.phone || user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>STATUS</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '2px 0 0',
                      color: myAdmission?.status === 'approved' ? '#2E7D32' : '#E65100' }}>
                      {myAdmission?.status === 'approved' ? '✅ Approved' : '⏳ Under Review'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">📋</div>
                  <div>
                    <h3>Application</h3>
                    <p style={{ color: myAdmission ? getStatusStyle(myAdmission.status).color : '#888', fontWeight: '500', fontSize: '13px' }}>
                      {myAdmission ? getStatusStyle(myAdmission.status).label : 'Not Applied'}
                    </p>
                  </div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">💰</div>
                  <div>
                    <h3>Fees</h3>
                    <p>{myAdmission?.fees ? `₹${myAdmission.fees}` : 'Not Set'}</p>
                  </div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">📢</div>
                  <div>
                    <h3>Notices</h3>
                    <p>{notices.length} notices</p>
                  </div>
                </div>
              </div>

              {myAdmission && (
                <div className="recent-section" style={{ marginTop: '20px' }}>
                  <h3>My Application Status</h3>
                  <div style={{ padding: '8px 0' }}>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Applicant Name</span>
                      <span className="fees-info-value">{myAdmission.applicantName}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Course Applied</span>
                      <span className="fees-info-value">{myAdmission.course?.name || getCourseFull(myAdmission.courseType) || 'N/A'}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Status</span>
                      <span style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                        background: getStatusStyle(myAdmission.status).bg,
                        color: getStatusStyle(myAdmission.status).color,
                      }}>
                        {getStatusStyle(myAdmission.status).label}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Fees</span>
                      <span className="fees-info-value">
                        {myAdmission.fees ? `₹${myAdmission.fees}` : 'Not set by college yet'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {myAdmission && (
                <div className="recent-section" style={{ marginTop: '20px' }}>
                  <h3>📊 Admission Approval Progress</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '12px 0', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600' }}>📝 Submitted</span>
                    <span>→</span>
                    <span style={{
                      color: (myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '#2E7D32' : '#999',
                      fontWeight: (myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '600' : '400'
                    }}>
                      {(myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '✅' : '⏳'} Student Section
                    </span>
                    <span>→</span>
                    <span style={{
                      color: myAdmission.status === 'approved' ? '#2E7D32' : '#999',
                      fontWeight: myAdmission.status === 'approved' ? '600' : '400'
                    }}>
                      {myAdmission.status === 'approved' ? '✅' : '⏳'} Principal
                    </span>
                    <span>→</span>
                    <span style={{
                      color: myAdmission.status === 'approved' ? '#2E7D32' : '#999',
                      fontWeight: myAdmission.status === 'approved' ? '600' : '400'
                    }}>
                      {myAdmission.status === 'approved' ? '✅ Approved' : '⏳ Approved'}
                    </span>
                  </div>
                  {myAdmission.rejectionReason && (
                    <div style={{ background: '#ffebee', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#C62828' }}>
                      <strong>❌ Rejection Reason:</strong> {myAdmission.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {!myAdmission && !admissionLoading && (
                <div className="recent-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                  <h3>📝 Complete Your Admission</h3>
                  <p style={{ color: '#666', margin: '12px 0' }}>You haven't submitted your admission form yet.</p>
                  <button onClick={() => navigate('/admissions?tab=apply')}
                    style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    📝 Complete Your Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============ APPLICATION TAB ============ */}
          {activeTab === 'application' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>My Application Details</h3>

              {admissionLoading && (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              )}

              {!admissionLoading && !myAdmission && (
                <div style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📝</div>
                  <h2 style={{ color: 'white', marginBottom: '12px' }}>Complete Your Profile</h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '24px' }}>
                    Welcome to LKCWSC! Please complete your admission profile.
                  </p>
                  <a href="/admissions?tab=apply" onClick={(e) => { e.preventDefault(); navigate('/admissions?tab=apply'); }}
                    style={{ display: 'inline-block', background: 'white', color: '#1565C0', padding: '14px 36px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
                    ✨ Complete Your Profile →
                  </a>
                </div>
              )}

              {!admissionLoading && myAdmission && (
                <div>
                  <div style={{ padding: '20px 24px', borderRadius: '12px', marginBottom: '24px', background: getStatusStyle(myAdmission.status).bg, border: `2px solid ${getStatusStyle(myAdmission.status).color}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{getStatusEmoji(myAdmission.status)}</div>
                    <div>
                      <h3 style={{ color: getStatusStyle(myAdmission.status).color }}>
                        Application {myAdmission.status === 'approved' ? 'Approved!' : myAdmission.status === 'rejected' ? 'Rejected' : 'Under Review'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#555' }}>{getStatusMessage(myAdmission.status)}</p>
                    </div>
                  </div>

                  {myAdmission.studentId && (
                    <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #2E7D32' }}>
                      <p style={{ fontSize: '13px', color: '#2E7D32', marginBottom: '4px' }}>🎓 Your Student ID:</p>
                      <h3 style={{ color: '#2E7D32', fontFamily: 'monospace', letterSpacing: '1px' }}>{myAdmission.studentId}</h3>
                    </div>
                  )}

                  <div className="fees-card">
                    <h3>Personal Information</h3>
                    <div className="fees-info-row"><span className="fees-info-label">Full Name</span><span className="fees-info-value">{myAdmission.applicantName}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Email</span><span className="fees-info-value">{myAdmission.email}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Phone</span><span className="fees-info-value">{myAdmission.phone}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Category</span><span className="fees-info-value">{myAdmission.category ? myAdmission.category.toUpperCase() : 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Course Applied</span><span className="fees-info-value">{myAdmission.course?.name || getCourseFull(myAdmission.courseType) || 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">SSC Percentage</span><span className="fees-info-value">{myAdmission.sscPercentage ? `${myAdmission.sscPercentage}%` : 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">HSC Percentage</span><span className="fees-info-value">{myAdmission.hscPercentage ? `${myAdmission.hscPercentage}%` : 'N/A'}</span></div>
                  </div>

                  <div className="fees-card" style={{ marginTop: '20px' }}>
                    <h3>Uploaded Documents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {docList.map(doc => {
                        if (!myAdmission[doc.key]) return null;
                        return (
                          <div key={doc.key} style={{ background: '#f8faff', border: '1px solid #e3f2fd', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <img src={docUrl(myAdmission[doc.key])} alt={doc.label}
                              style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                              onError={(e) => { e.target.style.display = 'none'; }} />
                            <p style={{ fontSize: '11px', color: '#1565C0', fontWeight: '500', marginBottom: '6px' }}>{doc.label}</p>
                            <a href={docUrl(myAdmission[doc.key])} target="_blank" rel="noreferrer"
                              style={{ fontSize: '11px', color: '#1565C0', textDecoration: 'underline' }}>View Full</a>
                          </div>
                        );
                      })}
                    </div>
                    {docList.every(doc => !myAdmission[doc.key]) && (
                      <p className="empty-msg">No documents uploaded</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ PROFILE TAB ============ */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ marginBottom: 20, color: '#1565C0' }}>👤 My Profile</h3>
              {!myAdmission ? (
                <div className="empty-state"><div className="empty-icon">👤</div><h3>No profile data</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Top card — photo + name + ID */}
                  <div style={{ background: 'linear-gradient(135deg,#1565C0,#0d47a1)', borderRadius: 16, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden', background: '#e3f2fd', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {myAdmission.studentPhoto
                        ? <img src={docUrl(myAdmission.studentPhoto)} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                        : <span style={{ fontSize: '2.5rem' }}>👩‍🎓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h2 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.4rem' }}>{myAdmission.applicantName || user?.name}</h2>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        {myAdmission.studentId
                          ? <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>🎓 {myAdmission.studentId}</span>
                          : <span style={{ background: '#fff3e0', color: '#E65100', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>⏳ ID Pending</span>}
                        <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12 }}>{getCourseFull(myAdmission.courseType)} · {myAdmission.admissionYear}</span>
                        <span style={{ background: myAdmission.status === 'approved' ? '#e8f5e9' : '#fff3e0', color: myAdmission.status === 'approved' ? '#2E7D32' : '#E65100', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {myAdmission.status === 'approved' ? '✅ Approved' : '⏳ Under Review'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

                    {/* Personal */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 18 }}>
                      <h4 style={{ color: '#1565C0', marginBottom: 12, fontSize: 14, borderBottom: '2px solid #e3f2fd', paddingBottom: 8 }}>👤 Personal Details</h4>
                      {[
                        ['Full Name',      myAdmission.applicantName],
                        ["Father's Name",  myAdmission.fatherName],
                        ["Mother's Name",  myAdmission.motherName],
                        ['Date of Birth',  myAdmission.dateOfBirth ? new Date(myAdmission.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                        ['Gender',         myAdmission.gender],
                        ['Blood Group',    myAdmission.bloodGroup],
                        ['Religion',       myAdmission.religion],
                        ['Category',       myAdmission.category?.toUpperCase()],
                        ['Caste',          myAdmission.caste],
                        ['Marital Status', myAdmission.isMarried ? 'Married' : 'Unmarried'],
                        ['Mobile',           myAdmission.phone],
                        ['Parent Phone',     myAdmission.parentPhone || myAdmission.fatherPhone || myAdmission.motherPhone],
                        ['Email',            myAdmission.email],
                        ['Aadhar No.',       myAdmission.aadharNumber],
                        ['Family Income',    myAdmission.familyIncome ? `₹${myAdmission.familyIncome}` : '—'],
                        ['Guardian Name',    myAdmission.guardianName],
                        ['Guardian Phone',   myAdmission.guardianPhone],
                      ].map(([l, v]) => v && v !== '—' ? (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                          <span style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>{l}</span>
                          <span style={{ color: '#222', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                        </div>
                      ) : null)}
                    </div>

                    {/* Academic + Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 18 }}>
                        <h4 style={{ color: '#1565C0', marginBottom: 12, fontSize: 14, borderBottom: '2px solid #e3f2fd', paddingBottom: 8 }}>🎓 Academic Details</h4>
                        {[
                          ['Student ID',    myAdmission.studentId],
                          ['PRN Number',    myAdmission.prnNumber],
                          ['ABC / APAR ID', myAdmission.aparIdNumber],
                          ['Course',        getCourseFull(myAdmission.courseType)],
                          ['Subject',       myAdmission.preferredSubject],
                          ['Year',          myAdmission.admissionYear],
                          ['SSC School',    myAdmission.sscSchoolName],
                          ['SSC %',         myAdmission.sscPercentage ? `${myAdmission.sscPercentage}%` : '—'],
                          ['HSC College',   myAdmission.hscCollegeName],
                          ['HSC Stream',    myAdmission.hscStream],
                          ['HSC %',         myAdmission.hscPercentage ? `${myAdmission.hscPercentage}%` : '—'],
                        ].map(([l, v]) => v && v !== '—' ? (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                            <span style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>{l}</span>
                            <span style={{ color: '#222', textAlign: 'right' }}>{v}</span>
                          </div>
                        ) : null)}
                      </div>

                      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 18 }}>
                        <h4 style={{ color: '#1565C0', marginBottom: 12, fontSize: 14, borderBottom: '2px solid #e3f2fd', paddingBottom: 8 }}>🏠 Address</h4>
                        {[
                          ['House No.',     myAdmission.houseNumber],
                          ['Street/Area',   myAdmission.streetArea],
                          ['City/Village',  myAdmission.cityTownVillage],
                          ['District',      myAdmission.district],
                          ['State',         myAdmission.state],
                          ['Pin Code',      myAdmission.pinCode],
                        ].map(([l, v]) => v && v !== '—' ? (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                            <span style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>{l}</span>
                            <span style={{ color: '#222', textAlign: 'right' }}>{v}</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>

                    {/* Bank Details */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 18 }}>
                      <h4 style={{ color: '#1565C0', marginBottom: 12, fontSize: 14, borderBottom: '2px solid #e3f2fd', paddingBottom: 8 }}>🏦 Bank Details</h4>
                      {[
                        ['Bank Name',        myAdmission.bankName],
                        ['Account No.',      myAdmission.bankAccountNumber],
                        ['IFSC Code',        myAdmission.bankIfscCode],
                        ['Branch',           myAdmission.bankBranch],
                        ['Account Holder',   myAdmission.bankAccountHolder || myAdmission.applicantName],
                      ].map(([l, v]) => v && v !== '—' ? (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                          <span style={{ color: '#888', fontWeight: 600, minWidth: 120 }}>{l}</span>
                          <span style={{ color: '#222', textAlign: 'right', fontFamily: l === 'Account No.' || l === 'IFSC Code' ? 'monospace' : 'inherit', fontWeight: l === 'Account No.' ? 700 : 400 }}>{v}</span>
                        </div>
                      ) : null)}
                      {!myAdmission.bankName && !myAdmission.bankAccountNumber && (
                        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '12px 0' }}>No bank details added yet.</p>
                      )}
                    </div>

                  </div>

                  {/* Issued Documents */}
                  <div style={{ background: '#e8f5e9', borderRadius: 14, border: '1px solid #a5d6a7', padding: 16 }}>
                      <h4 style={{ color: '#2E7D32', marginBottom: 12, fontSize: 14 }}>📦 Documents Collected from College</h4>
                      {myRequests.filter(r => r.status === 'completed').length === 0 && (
                        <p style={{ fontSize: 13, color: '#555' }}>No documents collected yet.</p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {myRequests.filter(r => r.status === 'completed').map((r, i) => (
                          <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #c8e6c9', padding: '10px 16px', fontSize: 12, minWidth: 170 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span style={{ fontSize: 18 }}>
                                {r.documentType==='TC'?'📄':r.documentType==='BONAFIDE'?'📋':r.documentType==='ID_CARD'?'🪪':r.documentType==='MARKSHEET'?'📝':'📃'}
                              </span>
                              <span style={{ fontWeight: 800, color: '#1b5e20', fontSize: 13 }}>{r.documentTypeLabel || r.documentType}</span>
                            </div>
                            {r.documentType === 'MARKSHEET' && r.marksheetSemester && (
                              <div style={{ color: '#1565C0', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
                                {r.marksheetSemester} · {r.marksheetSession === 'mar_apr' ? 'March / April' : 'Nov / December'} {r.marksheetYear}
                              </div>
                            )}
                            {r.reason && <div style={{ color: '#666', fontSize: 11, marginBottom: 2 }}>Purpose: {r.reason}</div>}
                            <div style={{ color: '#888', fontSize: 10 }}>
                              Issued: {new Date(r.updatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>💰 My Fees</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>View your fee structure and payment history.</p>

              {!myAdmission ? (
                <div className="empty-state"><div className="empty-icon">💰</div><h3>No Fee Information</h3></div>
              ) : (() => {
                const ct = (myAdmission.courseType || '').toLowerCase();
                const courseKey = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.' : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
                const schol = myAdmission.scholarshipAmount || 0;
                const ledger = myAdmission.feeLedger || [];
                const paidTotal = ledger.reduce((s, p) => s + (p.amount || 0), 0) || myAdmission.fees || 0;

                return (
                  <div>
                    {/* ── Fee Structure Details Table ── */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                      <div style={{ background: '#009688', padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>Fee Structure Details</span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                              {['Fee Structure Name','Year','Total Fees','Scholarship','Net Payable','Paid Amount','Balance Due','Receipt'].map(h => (
                                <th key={h} style={{ padding: '9px 12px', fontWeight: 700, color: '#009688', textAlign: 'center', borderBottom: '2px solid #009688', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {courseKey ? Object.entries(OFFICIAL_FEES_YEARLY[courseKey]?.years || {}).map(([yr, data], i) => {
                              const isCurrent = yr === myAdmission.admissionYear;
                              const netPay = Math.max(0, data.total - schol);
                              const yrPaid = isCurrent ? paidTotal : 0;
                              const balance = Math.max(0, netPay - yrPaid);
                              return (
                                <tr key={yr} style={{ background: isCurrent ? '#e0f7fa' : i%2===0?'#fafafa':'#fff', fontWeight: isCurrent ? 700 : 400 }}>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    {OFFICIAL_FEES_YEARLY[courseKey]?.label} {isCurrent && <span style={{ background: '#009688', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>Current</span>}
                                  </td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#009688', fontWeight: 700 }}>{yr}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>₹{data.total.toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: schol>0?'#7B1FA2':'#999' }}>{schol>0?`₹${schol.toLocaleString('en-IN')}.00`:'₹0.00'}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>₹{netPay.toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#2E7D32', fontWeight: 700 }}>{isCurrent ? `₹${yrPaid.toLocaleString('en-IN')}.00` : '₹0.00'}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: balance>0?'#C62828':'#2E7D32', fontWeight: 700 }}>{isCurrent ? `₹${balance.toLocaleString('en-IN')}.00` : `₹${netPay.toLocaleString('en-IN')}.00`}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    {isCurrent && ledger.length > 0 && <span style={{ color: '#009688', fontSize: 11, fontWeight: 600 }}>↓ Below</span>}
                                  </td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan="8" style={{ padding: 16, textAlign: 'center', color: '#888' }}>Course not detected — contact Student Section</td>
                              </tr>
                            )}
                            {/* Total row */}
                            {courseKey && (
                              <tr style={{ background: '#e0f7fa', fontWeight: 800 }}>
                                <td colSpan="2" style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800 }}>Total</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>₹{Object.values(OFFICIAL_FEES_YEARLY[courseKey]?.years||{}).reduce((s,d)=>s+d.total,0).toLocaleString('en-IN')}.00</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#7B1FA2' }}>{schol>0?`₹${(schol*3).toLocaleString('en-IN')}.00`:'₹0.00'}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>₹{Object.values(OFFICIAL_FEES_YEARLY[courseKey]?.years||{}).reduce((s,d)=>s+Math.max(0,d.total-schol),0).toLocaleString('en-IN')}.00</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#2E7D32' }}>₹{paidTotal.toLocaleString('en-IN')}.00</td>
                                <td colSpan="2" style={{ padding: '9px 12px', textAlign: 'center' }}></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ── Installment / Receipt Details ── */}
                    {ledger.length > 0 && (
                      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                        <div style={{ background: '#009688', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>Payment Receipts</span>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{ledger.length} payment(s)</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#f5f5f5' }}>
                                {['Receipt No','Date','Fee Type','Amount','Mode','Status'].map(h => (
                                  <th key={h} style={{ padding: '8px 12px', fontWeight: 700, color: '#009688', textAlign: 'center', borderBottom: '2px solid #009688', fontSize: 12 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {ledger.map((p, i) => (
                                <tr key={i} style={{ background: i%2===0?'#fafafa':'#fff' }}>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{p.receiptNo||'—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.feeTypeLabel||p.feeType||'—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontWeight: 700, color: '#2E7D32' }}>₹{(p.amount||0).toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.paymentMode==='online'?'🌐 Online':'💵 Cash'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                    <span style={{ background: '#e8f5e9', color: '#2E7D32', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>PAID ✓</span>
                                    <button onClick={() => printStudentReceipt(p, myAdmission)}
                                      style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>🖨️ Print</button>
                                  </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {ledger.length === 0 && (
                      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '14px 20px', fontSize: 13, color: '#7c5e00', textAlign: 'center' }}>
                        No payments recorded yet. Contact Accounts Section.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}


          {/* ============ DOCUMENTS TAB ============ */}
          {activeTab === 'documents' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📄 Request Documents</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Apply for Transfer Certificate, Bonafide, ID Card or Marksheet.</p>

              {/* Apply form */}
              <DocRequestForm myAdmission={myAdmission} onSubmitted={() => {
                API.get('/document-requests/my').then(r => setMyRequests(r.data.requests || [])).catch(() => {});
              }} />

              {/* My Requests */}
              <div style={{ marginTop: 24 }}>
                {/* Issued Documents summary */}
                {myRequests.filter(r => r.status === 'completed').length > 0 && (
                  <div style={{ background: '#e8f5e9', borderRadius: 14, border: '1px solid #a5d6a7', padding: 16, marginBottom: 20 }}>
                    <h4 style={{ color: '#2E7D32', marginBottom: 12, fontSize: 14 }}>📦 Documents Collected from College</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {myRequests.filter(r => r.status === 'completed').map((r, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #c8e6c9', padding: '10px 16px', fontSize: 13 }}>
                          <div style={{ fontWeight: 700, color: '#1b5e20', fontSize: 14 }}>{r.documentTypeLabel || r.documentType}</div>
                          {r.documentType === 'MARKSHEET' && r.marksheetSemester && (
                            <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{r.marksheetSemester} · {r.marksheetSession === 'mar_apr' ? 'Mar / Apr' : 'Nov / Dec'} {r.marksheetYear}</div>
                          )}
                          <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Issued: {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  <h4 style={{ color: '#1565C0', marginBottom: 14 }}>📋 My Requests ({myRequests.length})</h4>
                  {myRequests.length === 0 ? (
                    <div style={{ background: '#f8faff', borderRadius: 10, padding: 20, textAlign: 'center', color: '#888', fontSize: 13 }}>
                      No document requests yet. Apply above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {myRequests.map((req, i) => {
                        const statusMap = {
                          pending_accounts:      { bg: '#fff3e0', color: '#E65100', label: '⏳ At Accounts (Fee Verification)' },
                          rejected_by_accounts:  { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' },
                          pending_exam:          { bg: '#e3f2fd', color: '#1565C0', label: '⏳ At Exam Section' },
                          rejected_by_exam:      { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Exam Section' },
                          pending_principal:     { bg: '#fff3e0', color: '#E65100', label: '⏳ At Principal' },
                          rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
                          pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Collect' },
                          completed:             { bg: '#e8f5e9', color: '#1b5e20', label: '🏁 Issued — Collect from office' },
                        };
                        const ss = statusMap[req.status] || { bg: '#f5f5f5', color: '#888', label: req.status };
                        return (
                          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: 16, borderLeft: `4px solid ${ss.color}`, boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <h4 style={{ fontSize: 14, color: '#1a1a2e', margin: 0 }}>{req.documentTypeLabel || req.documentType}</h4>
                                {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>⚡ Urgent</span>}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                            </div>
                            {req.reason && <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>Reason: {req.reason}</p>}
                            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Applied: {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                            {/* Workflow progress */}
                            <div style={{ background: '#f8faff', padding: '10px 12px', borderRadius: 8, marginTop: 10, fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span>📝 Submitted</span>
                                {req.documentType === 'MARKSHEET' ? (
                                  <>
                                    <span>→</span>
                                    <span style={{ color: req.examVerifiedDate ? '#2E7D32' : '#999', fontWeight: req.examVerifiedDate ? 600 : 400 }}>{req.examVerifiedDate ? '✅' : '⏳'} Exam Section</span>
                                    <span>→</span>
                                    <span style={{ color: req.status === 'completed' ? '#2E7D32' : '#999', fontWeight: req.status === 'completed' ? 600 : 400 }}>{req.status === 'completed' ? '✅' : '⏳'} Student Section</span>
                                  </>
                                ) : (
                                  <>
                                    <span>→</span>
                                    <span style={{ color: req.accountsApprovedDate ? '#2E7D32' : '#999', fontWeight: req.accountsApprovedDate ? 600 : 400 }}>{req.accountsApprovedDate ? '✅' : '⏳'} Accounts</span>
                                    {req.documentType === 'TC' && (<>
                                      <span>→</span>
                                      <span style={{ color: req.examVerifiedDate ? '#2E7D32' : '#999', fontWeight: req.examVerifiedDate ? 600 : 400 }}>{req.examVerifiedDate ? '✅' : '⏳'} Exam Section</span>
                                      <span>→</span>
                                      <span style={{ color: req.principalApprovedDate ? '#2E7D32' : '#999', fontWeight: req.principalApprovedDate ? 600 : 400 }}>{req.principalApprovedDate ? '✅' : '⏳'} Principal</span>
                                    </>)}
                                    <span>→</span>
                                    <span style={{ color: req.status === 'completed' ? '#2E7D32' : '#999', fontWeight: req.status === 'completed' ? 600 : 400 }}>{req.status === 'completed' ? '✅' : '⏳'} Student Section</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
            </div>
          )}

          {/* ============ RESULTS TAB ============ */}
          {activeTab === 'results' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>🎓 My Exam Results</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>All semester results published by the Examination Section.</p>

              {resultsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading results...</h3></div>
              ) : results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎓</div>
                  <h3>No Results Yet</h3>
                  <p>Your results will appear here once published by the Examination Section.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {results.map(r => (
                    <div key={r._id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                      {/* Result header */}
                      <div style={{ background: r.result === 'pass' || r.result === 'distinction' ? 'linear-gradient(135deg,#1b5e20,#2E7D32)' : 'linear-gradient(135deg,#b71c1c,#C62828)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: 16 }}>
                            {r.course?.name || 'Course'} — Semester {r.semester} ({r.year})
                          </h4>
                          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '4px 0 0' }}>
                            Published: {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{r.percentage ? `${r.percentage}%` : '—'}</div>
                          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                            {r.result === 'distinction' ? '🏅 Distinction' : r.result === 'pass' ? '✅ Pass' : '❌ Fail'}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div style={{ padding: '14px 20px', background: '#f8faff', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                        <span><strong>Total Marks:</strong> {r.obtainedMarks}/{r.totalMarks}</span>
                        <span><strong>Percentage:</strong> {r.percentage ? `${r.percentage}%` : '—'}</span>
                        <span><strong>Semester:</strong> {r.semester}</span>
                        <span><strong>Year:</strong> {r.year}</span>
                      </div>

                      {/* Subject-wise marks */}
                      {r.subjects && r.subjects.length > 0 && (
                        <div style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 700, color: '#1565C0', marginBottom: 10, fontSize: 13 }}>Subject-wise Marks:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                            {r.subjects.map((sub, i) => (
                              <div key={i} style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd' }}>
                                <p style={{ fontWeight: 600, color: '#0c4a6e', fontSize: 13, margin: '0 0 4px' }}>{sub.name}</p>
                                <p style={{ fontSize: 14, color: '#1565C0', fontWeight: 700, margin: 0 }}>
                                  {sub.obtainedMarks}/{sub.maxMarks}
                                  {sub.grade && <span style={{ marginLeft: 8, background: '#e3f2fd', padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>{sub.grade}</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ EXAM FORM TAB ============ */}
          {activeTab === 'examform' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📝 Exam Form</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Fill your examination form when enabled by the Examination Section.
              </p>

              {/* Regular Exam */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ background: examSettings.regularEnabled ? 'linear-gradient(135deg,#0D47A1,#1565C0)' : '#9e9e9e', padding: '16px 20px' }}>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: 16 }}>📋 Regular Examination Form</h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '4px 0 0' }}>
                    {examSettings.regularEnabled ? '✅ Currently Open' : '🔒 Not yet opened by Examination Section'}
                  </p>
                </div>
                <div style={{ padding: 20 }}>
                  {!examSettings.regularEnabled ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
                      <p style={{ fontSize: '2.5rem', margin: 0 }}>🔒</p>
                      <p style={{ fontWeight: 600, color: '#555', marginTop: 8 }}>Form Not Open Yet</p>
                      <p style={{ fontSize: 13 }}>The Examination Section will open this form when the time comes. Check back later.</p>
                    </div>
                  ) : examSubmitted.regular ? (
                    <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 20, textAlign: 'center', border: '2px solid #2E7D32' }}>
                      <p style={{ fontSize: '2rem', margin: 0 }}>✅</p>
                      <h4 style={{ color: '#2E7D32', margin: '8px 0 4px' }}>Regular Exam Form Submitted!</h4>
                      <p style={{ fontSize: 13, color: '#555' }}>Your form has been submitted. The Examination Section will process it.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#e3f2fd', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#0c4a6e' }}>
                        <strong>ℹ️ Student Details (auto-attached):</strong><br />
                        Name: {myAdmission?.applicantName || user?.name} | Course: {myAdmission?.courseType || 'N/A'} | Year: {myAdmission?.admissionYear || 'N/A'}
                      </div>
                      <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                        By submitting this form, you confirm that your fees are paid and you wish to appear for the regular examination.
                      </p>
                      <button
                        onClick={() => setExamSubmitted(prev => ({ ...prev, regular: true }))}
                        style={{ background: '#1565C0', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        📝 Submit Regular Exam Form
                      </button>
                      <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>* Ensure fees are paid before submitting.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Backlog Exam */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ background: examSettings.backlogEnabled ? 'linear-gradient(135deg,#e65100,#f57c00)' : '#9e9e9e', padding: '16px 20px' }}>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: 16 }}>📋 Backlog / KT Examination Form</h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '4px 0 0' }}>
                    {examSettings.backlogEnabled ? '✅ Currently Open' : '🔒 Not yet opened by Examination Section'}
                  </p>
                </div>
                <div style={{ padding: 20 }}>
                  {!examSettings.backlogEnabled ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
                      <p style={{ fontSize: '2.5rem', margin: 0 }}>🔒</p>
                      <p style={{ fontWeight: 600, color: '#555', marginTop: 8 }}>Backlog Form Not Open</p>
                      <p style={{ fontSize: 13 }}>The Examination Section will open the KT/backlog form when required.</p>
                    </div>
                  ) : examSubmitted.backlog ? (
                    <div style={{ background: '#fff3e0', borderRadius: 10, padding: 20, textAlign: 'center', border: '2px solid #E65100' }}>
                      <p style={{ fontSize: '2rem', margin: 0 }}>✅</p>
                      <h4 style={{ color: '#E65100', margin: '8px 0 4px' }}>Backlog Form Submitted!</h4>
                      <p style={{ fontSize: 13, color: '#555' }}>Your backlog form has been submitted successfully.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#7c3d00' }}>
                        <strong>⚠️ Backlog/KT Form:</strong> Only for students who have failed subjects in previous semesters. Ensure your KT exam fees are paid.
                      </div>
                      <button
                        onClick={() => setExamSubmitted(prev => ({ ...prev, backlog: true }))}
                        style={{ background: '#E65100', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        📝 Submit Backlog Exam Form
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ SCHOLARSHIP TAB ============ */}
          {activeTab === 'scholarship' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>🏅 Scholarship Status</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Track your scholarship application status on the MahaDBT portal.
              </p>

              {!myAdmission ? (
                <div className="empty-state">
                  <div className="empty-icon">🏅</div>
                  <h3>Application Required</h3>
                  <p>Please complete your admission application first.</p>
                </div>
              ) : (
                <>
                  {/* Status card */}
                  {(() => {
                    const statusMap = {
                      not_filled: { bg: '#fff3e0', color: '#E65100', icon: '📝', label: 'Not Filled', desc: 'You have not yet filled the scholarship form on MahaDBT portal.' },
                      filled:     { bg: '#e3f2fd', color: '#1565C0', icon: '📋', label: 'Form Filled', desc: 'Your scholarship form has been submitted on MahaDBT portal.' },
                      approved:   { bg: '#e8f5e9', color: '#2E7D32', icon: '✅', label: 'Approved', desc: 'Your scholarship has been approved! Disbursement is pending.' },
                      rejected:   { bg: '#ffebee', color: '#C62828', icon: '❌', label: 'Rejected', desc: 'Your scholarship was rejected. Please contact the Scholarship Section.' },
                      disbursed:  { bg: '#e8f5e9', color: '#1b5e20', icon: '💰', label: 'Disbursed', desc: 'Scholarship amount has been credited to your bank account.' },
                    };
                    const s = statusMap[myAdmission.scholarshipStatus || 'not_filled'];
                    return (
                      <div style={{ background: s.bg, border: `2px solid ${s.color}`, borderRadius: 14, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '3rem' }}>{s.icon}</div>
                        <div>
                          <h3 style={{ color: s.color, margin: '0 0 6px', fontSize: 20 }}>Scholarship Status: {s.label}</h3>
                          <p style={{ color: '#555', fontSize: 14, margin: 0 }}>{s.desc}</p>
                          {myAdmission.scholarshipNote && (
                            <p style={{ color: '#777', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>Note: {myAdmission.scholarshipNote}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Student eligibility info */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14, fontSize: 15 }}>📋 Your Details for Scholarship</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                      {[
                        { label: 'Name', value: myAdmission.applicantName },
                        { label: 'Category', value: myAdmission.category ? myAdmission.category.toUpperCase() : '—' },
                        { label: 'Caste', value: myAdmission.caste || '—' },
                        { label: 'Annual Income', value: myAdmission.familyIncome ? `₹${myAdmission.familyIncome}` : '—' },
                        { label: 'Course', value: myAdmission.courseType || '—' },
                        { label: 'Year', value: myAdmission.admissionYear || '—' },
                        { label: 'PRN Number', value: myAdmission.prnNumber || '⚠️ Not assigned yet' },
                        { label: 'ABC / APAR ID', value: myAdmission.aparIdNumber || '⚠️ Not assigned yet' },
                      ].map((item, i) => (
                        <div key={i} style={{ background: '#f8faff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e3f2fd' }}>
                          <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px', fontWeight: 600 }}>{item.label}</p>
                          <p style={{ fontSize: 13, color: '#222', fontWeight: 600, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MahaDBT instructions */}
                  <div style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                    <h4 style={{ color: '#6A1B9A', marginBottom: 12, fontSize: 15 }}>🌐 How to Fill Scholarship on MahaDBT</h4>
                    <ol style={{ paddingLeft: 20, fontSize: 13, color: '#444', lineHeight: 2 }}>
                      <li>Visit <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noreferrer" style={{ color: '#6A1B9A', fontWeight: 600 }}>mahadbt.maharashtra.gov.in</a></li>
                      <li>Login with your registered mobile number and Aadhar</li>
                      <li>Select your scholarship scheme (e.g. GOI, State, EBC, OBC, SBC etc.)</li>
                      <li>Fill all required details — ensure PRN and ABC ID are correct</li>
                      <li>Upload required documents (caste certificate, income certificate, marksheet)</li>
                      <li>Submit the form and note down your application number</li>
                      <li>Inform the <strong>Scholarship Section</strong> of your college after submitting</li>
                    </ol>
                    <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#6A1B9A', fontWeight: 500 }}>
                      ⚠️ Make sure your <strong>PRN Number</strong> and <strong>ABC ID</strong> are updated before filling the form. Contact the Student Section if they are missing.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}


          {/* ============ ACADEMIC YEAR TAB ============ */}
          {activeTab === 'academic_year' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📅 Academic Year</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Your academic year details and examination schedule.</p>
              {myAdmission ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14 }}>🎓 Current Academic Details</h4>
                    {[
                      ['Course', (() => { const ct=(myAdmission.courseType||'').toLowerCase(); return ct.includes('b.sc')||ct.includes('bsc')?'Bachelor of Science (B.Sc.)':ct.includes('b.a')||ct.includes('ba')?'Bachelor of Arts (B.A.)':myAdmission.courseType||'—'; })()],
                      ['Current Year', myAdmission.admissionYear || '—'],
                      ['Academic Year', (() => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; })()],
                      ['Student ID', myAdmission.studentId || '—'],
                      ['PRN Number', myAdmission.prnNumber || 'Not assigned yet'],
                      ['Admission Year', myAdmission.createdAt ? new Date(myAdmission.createdAt).getFullYear() : '—'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                        <span style={{ color:'#888', fontWeight:600 }}>{l}</span>
                        <span style={{ color:'#1a1a2e', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14 }}>📋 Exam Schedule (SNDT Pattern)</h4>
                    {[
                      ['Odd Semesters (I, III, V)', 'November – December'],
                      ['Even Semesters (II, IV, VI)', 'March – April'],
                      ['Result Declaration', '45-60 days after exam'],
                      ['Marksheet Collection', 'Student Section after result'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                        <span style={{ color:'#888', fontWeight:600, maxWidth:200 }}>{l}</span>
                        <span style={{ color:'#1565C0', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:14, background:'#e3f2fd', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#1565C0' }}>
                      💡 Current Semester: <strong>{(() => { const yr=myAdmission.admissionYear||''; const m=new Date().getMonth()+1; const odd=m>=6&&m<=12; return yr==='1st Year'?(odd?'Sem I':'Sem II'):yr==='2nd Year'?(odd?'Sem III':'Sem IV'):yr==='3rd Year'?(odd?'Sem V':'Sem VI'):'—'; })()}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state"><div className="empty-icon">📅</div><h3>No admission data found</h3></div>
              )}
            </div>
          )}

          {/* ============ NOTICES TAB ============ */}
          {activeTab === 'notices' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>All Notices ({notices.length})</h3>
              {notices.map(notice => (
                <div className="notice-full-card" key={notice._id}>
                  <div className="notice-full-header">
                    <h4>{notice.title}</h4>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                  <p>{notice.content}</p>
                  <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
              {notices.length === 0 && <p className="empty-msg">No notices available</p>}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
