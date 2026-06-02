import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// Official fee structure 2025-26

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

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);


  const [results, setResults] = useState([]);
  const [resultsLoading] = useState(false);
  const [examSettings, setExamSettings] = useState({ regularEnabled: false, backlogEnabled: false });
  const [examSubmitted, setExamSubmitted] = useState({ regular: false, backlog: false });

  // Document Request states
  const [docRequests, setDocRequests] = useState([]);
  const [docReqLoading, setDocReqLoading] = useState(false);
  const [docReqForm, setDocReqForm] = useState({ documentType: '', reason: '', urgency: 'normal' });
  const [docReqSubmitting, setDocReqSubmitting] = useState(false);
  const [docReqMsg, setDocReqMsg] = useState('');

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
    // Fetch exam form settings
    API.get('/results/exam-settings')
      .then(res => setExamSettings(res.data.settings || {}))
      .catch(() => {});
  }, [user]);

  // Fetch doc requests when tab opens
  useEffect(() => {
    if (activeTab === 'documents') {
      setDocReqLoading(true);
      API.get('/document-requests/my')
        .then(res => setDocRequests(res.data.requests || []))
        .catch(() => {})
        .finally(() => setDocReqLoading(false));
    }
  }, [activeTab]);

  const handleDocReqSubmit = async () => {
    if (!docReqForm.documentType) { setDocReqMsg('❌ Please select a document type.'); return; }
    setDocReqSubmitting(true); setDocReqMsg('');
    try {
      const res = await API.post('/document-requests', docReqForm);
      if (res.data.success) {
        setDocReqMsg('✅ ' + res.data.message);
        setDocReqForm({ documentType: '', reason: '', urgency: 'normal' });
        const updated = await API.get('/document-requests/my');
        setDocRequests(updated.data.requests || []);
      } else { setDocReqMsg('❌ ' + res.data.message); }
    } catch (e) { setDocReqMsg('❌ ' + (e.response?.data?.message || 'Error submitting request.')); }
    setDocReqSubmitting(false);
  };

  const handlePrintReceipt = (payment, studentInfo) => {
    const win = window.open('', '_blank', 'width=800,height=600');
    const college = 'Late Kalpana Chawla Women\'s Senior College';
    const address = 'Gangakhed, Dist. Parbhani – 431514, Maharashtra, INDIA';
    win.document.write(`
      <!DOCTYPE html><html><head><title>Fee Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
        .receipt { max-width: 700px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 12px; }
        .header h2 { margin: 0 0 2px; font-size: 18px; }
        .header h3 { margin: 0 0 2px; font-size: 14px; font-weight: normal; }
        .header p { margin: 2px 0; font-size: 12px; }
        .title-row { text-align: center; font-size: 15px; font-weight: bold; margin: 10px 0; text-decoration: underline; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-bottom: 12px; font-size: 13px; }
        .info-grid div { display: flex; gap: 6px; }
        .info-grid label { font-weight: bold; white-space: nowrap; min-width: 110px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
        th, td { border: 1px solid #000; padding: 7px 10px; }
        th { background: #f0f0f0; font-weight: bold; }
        .total-row td { font-weight: bold; background: #f5f5f5; }
        .footer { font-size: 12px; margin-top: 16px; }
        .words { font-weight: bold; font-size: 13px; margin: 8px 0; }
        .sig { margin-top: 30px; text-align: right; font-size: 12px; }
        @media print { button { display: none; } }
      </style></head><body>
      <div class="receipt">
        <div class="header">
          <h2>${college}</h2>
          <h3>${address}</h3>
          <p>Ph: (02452) XXXXXX</p>
        </div>
        <div class="title-row">Fee Receipt (Student Copy)</div>
        <hr style="border:1px dashed #999; margin:10px 0"/>
        <div class="info-grid">
          <div><label>Receipt No. :</label><span>${payment.receiptNo || '—'}</span></div>
          <div><label>Receipt Date :</label><span>${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : '—'}</span></div>
          <div><label>Student Name :</label><span>${studentInfo.name}</span></div>
          <div><label>Student ID :</label><span>${studentInfo.studentId || '—'}</span></div>
          <div><label>Course :</label><span>${studentInfo.course}</span></div>
          <div><label>Year :</label><span>${studentInfo.year}</span></div>
          <div><label>Father's Name :</label><span>${studentInfo.fatherName || '—'}</span></div>
          <div><label>Phone :</label><span>${studentInfo.phone || '—'}</span></div>
        </div>
        <table>
          <thead><tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr></thead>
          <tbody>
            <tr><td style="text-align:center">1</td><td>${payment.feeTypeLabel || payment.feeType || 'College Fees'}</td><td style="text-align:right">₹${(payment.amount || 0).toLocaleString('en-IN')}.00</td></tr>
            <tr class="total-row"><td colspan="2" style="text-align:right">Total Amount</td><td style="text-align:right">₹${(payment.amount || 0).toLocaleString('en-IN')}.00</td></tr>
          </tbody>
        </table>
        <div class="words">Amt. in words: ${numberToWords(payment.amount || 0)} Only</div>
        <div class="footer">
          <strong>Paid by:</strong> ${payment.paymentMode === 'online' ? 'Online' : 'Cash'} &nbsp;&nbsp;
          <strong>Rs. ${(payment.amount || 0).toLocaleString('en-IN')}</strong> &nbsp;&nbsp;
          <strong>Date:</strong> ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : '—'}
        </div>
        <div class="footer"><strong>Narration:</strong> ${payment.narration || ''}</div>
        <div class="sig">
          <p>Signature</p>
          <p style="font-size:11px">(Accounted by: ${payment.accountedBy || 'Not Required'})</p>
        </div>
        <hr style="margin-top:20px"/>
        <p style="font-size:11px; text-align:center;">This is a system generated receipt and does not require seal/stamp.</p>
        <div style="text-align:center; margin-top:10px">
          <button onclick="window.print()" style="padding:8px 24px;background:#1565C0;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ Print</button>
        </div>
      </div></body></html>
    `);
    win.document.close();
  };

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    if (num === 0) return 'Zero';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '');
    if (num < 1000) return ones[Math.floor(num/100)]+' Hundred'+(num%100?' '+numberToWords(num%100):'');
    if (num < 100000) return numberToWords(Math.floor(num/1000))+' Thousand'+(num%1000?' '+numberToWords(num%1000):'');
    if (num < 10000000) return numberToWords(Math.floor(num/100000))+' Lakh'+(num%100000?' '+numberToWords(num%100000):'');
    return numberToWords(Math.floor(num/10000000))+' Crore'+(num%10000000?' '+numberToWords(num%10000000):'');
  };

  const DOC_STATUS_INFO = {
    pending_accounts:      { color: '#E65100', bg: '#fff3e0', label: '⏳ Pending – Accounts Section' },
    rejected_by_accounts:  { color: '#C62828', bg: '#ffebee', label: '❌ Rejected by Accounts' },
    pending_exam:          { color: '#1565C0', bg: '#e3f2fd', label: '🔍 Pending – Exam Section' },
    rejected_by_exam:      { color: '#C62828', bg: '#ffebee', label: '❌ Rejected by Exam Section' },
    pending_principal:     { color: '#6A1B9A', bg: '#f3e5f5', label: '📋 Pending – Principal' },
    rejected_by_principal: { color: '#C62828', bg: '#ffebee', label: '❌ Rejected by Principal' },
    pending_generation:    { color: '#00796B', bg: '#e0f2f1', label: '🖨️ Pending – Being Generated' },
    completed:             { color: '#2E7D32', bg: '#e8f5e9', label: '✅ Completed – Collect from Office' },
  };

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
                      <span className="fees-info-value">{myAdmission.course?.name || myAdmission.courseType || 'N/A'}</span>
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
                    <div className="fees-info-row"><span className="fees-info-label">Course Applied</span><span className="fees-info-value">{myAdmission.course?.name || myAdmission.courseType || 'N/A'}</span></div>
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
            <div className="profile-card">
              <div className="profile-avatar">
                {myAdmission?.studentPhoto ? (
                  <img src={docUrl(myAdmission.studentPhoto)} alt="Student"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>👩‍🎓</span>
                )}
              </div>
              <div className="profile-details">
                <h2>{user?.name}</h2>
                <p className="profile-role">Student</p>
                {myAdmission?.studentId && (
                  <p style={{ color: '#2E7D32', fontWeight: '600', fontFamily: 'monospace' }}>🎓 ID: {myAdmission.studentId}</p>
                )}
                <div className="profile-info-grid">
                  <div className="profile-info-item"><label>Email</label><p>{user?.email}</p></div>
                  <div className="profile-info-item"><label>Phone</label><p>{myAdmission?.phone || user?.phone || 'Not provided'}</p></div>
                  <div className="profile-info-item"><label>Academic Year</label><p>{myAdmission?.admissionYear || 'Not set'}</p></div>
                  <div className="profile-info-item"><label>ABC ID</label><p>{myAdmission?.aparIdNumber || 'Not provided'}</p></div>
                  <div className="profile-info-item"><label>Course</label><p>{myAdmission?.courseType || myAdmission?.course?.name || 'Not set'}</p></div>
                  <div className="profile-info-item"><label>Category</label><p>{myAdmission?.category ? myAdmission.category.toUpperCase() : 'Not set'}</p></div>
                  <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}><label>Address</label><p>{myAdmission?.address || 'Not provided'}</p></div>
                  <div className="profile-info-item"><label>Account Status</label><p className="status-active">Active</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ============ FEES TAB ============ */}
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
                                {['Receipt No','Date','Fee Type','Amount','Mode','Status','Receipt'].map(h => (
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
                                    <span style={{ background: '#e8f5e9', color: '#2E7D32', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>PAID ✓</span>
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    <button
                                      onClick={() => handlePrintReceipt(p, {
                                        name: myAdmission.applicantName,
                                        studentId: myAdmission.studentId,
                                        course: myAdmission.courseType || myAdmission.course?.name || '—',
                                        year: myAdmission.admissionYear || '—',
                                        fatherName: myAdmission.fatherName,
                                        phone: myAdmission.phone,
                                      })}
                                      style={{ background: '#1565C0', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                      🖨️ Print
                                    </button>
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
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Apply for official documents like ID Card, Bonafide, TC, Marksheet, or Migration Certificate.
              </p>

              {/* New Request Form */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 24, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ background: 'linear-gradient(135deg,#1565C0,#1976D2)', padding: '14px 20px' }}>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: 15 }}>📝 Submit New Document Request</h4>
                </div>
                <div style={{ padding: 20 }}>
                  {!myAdmission ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
                      <p style={{ fontSize: '2rem', margin: 0 }}>⚠️</p>
                      <p style={{ fontWeight: 600, color: '#555', marginTop: 8 }}>Admission Required</p>
                      <p style={{ fontSize: 13 }}>Please complete your admission application first to request documents.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>Document Type *</label>
                        <select
                          value={docReqForm.documentType}
                          onChange={e => setDocReqForm(f => ({ ...f, documentType: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, background: '#f8faff' }}>
                          <option value="">-- Select Document --</option>
                          <option value="ID_CARD">🪪 ID Card</option>
                          <option value="BONAFIDE">📋 Bonafide Certificate</option>
                          <option value="MARKSHEET">📄 Marksheet</option>
                          <option value="TC">🎓 Transfer Certificate (TC)</option>
                          <option value="MIGRATION">📜 Migration Certificate</option>
                        </select>
                      </div>

                      {docReqForm.documentType === 'TC' && (
                        <div style={{ background: '#fff3e0', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#7c3d00' }}>
                          ⚠️ <strong>Transfer Certificate (TC)</strong> requires verification by Accounts Section → Exam Section → Principal. Processing may take 7–10 working days.
                        </div>
                      )}
                      {docReqForm.documentType === 'MARKSHEET' && (
                        <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0c4a6e' }}>
                          ℹ️ <strong>Marksheet requests</strong> go directly to the Examination Section for verification.
                        </div>
                      )}

                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>Reason / Purpose</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Required for job application, bank loan, further education..."
                          value={docReqForm.reason}
                          onChange={e => setDocReqForm(f => ({ ...f, reason: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>Urgency</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {[{val:'normal',label:'🟢 Normal (5–7 days)'},{val:'urgent',label:'🔴 Urgent (1–2 days)'}].map(opt => (
                            <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, background: docReqForm.urgency===opt.val?'#e3f2fd':'#f8f8f8', padding: '8px 16px', borderRadius: 8, border: `2px solid ${docReqForm.urgency===opt.val?'#1565C0':'#ddd'}`, fontWeight: docReqForm.urgency===opt.val?700:400 }}>
                              <input type="radio" name="urgency" value={opt.val} checked={docReqForm.urgency===opt.val} onChange={e => setDocReqForm(f => ({ ...f, urgency: e.target.value }))} style={{ margin: 0 }} />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {docReqMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: docReqMsg.startsWith('✅')?'#e8f5e9':'#ffebee', color: docReqMsg.startsWith('✅')?'#2E7D32':'#C62828', fontSize: 13, fontWeight: 600 }}>
                          {docReqMsg}
                        </div>
                      )}

                      <button
                        onClick={handleDocReqSubmit}
                        disabled={docReqSubmitting}
                        style={{ background: docReqSubmitting?'#aaa':'linear-gradient(135deg,#1565C0,#1976D2)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: docReqSubmitting?'not-allowed':'pointer', alignSelf: 'flex-start' }}>
                        {docReqSubmitting ? '⏳ Submitting...' : '📤 Submit Request'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* My Requests List */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ background: '#009688', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>📋 My Document Requests</span>
                  <button onClick={() => { setDocReqLoading(true); API.get('/document-requests/my').then(r => setDocRequests(r.data.requests||[])).catch(()=>{}).finally(()=>setDocReqLoading(false)); }}
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>🔄 Refresh</button>
                </div>
                <div style={{ padding: 20 }}>
                  {docReqLoading ? (
                    <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>⏳ Loading...</div>
                  ) : docRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                      <p style={{ fontSize: '2.5rem', margin: 0 }}>📭</p>
                      <p style={{ fontWeight: 600, marginTop: 8 }}>No requests yet</p>
                      <p style={{ fontSize: 13 }}>Submit a new request above.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {docRequests.map((req, i) => {
                        const st = DOC_STATUS_INFO[req.status] || { color: '#666', bg: '#f5f5f5', label: req.status };
                        return (
                          <div key={req._id || i} style={{ borderRadius: 10, border: `1px solid ${st.color}30`, overflow: 'hidden' }}>
                            <div style={{ background: st.bg, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>{req.documentTypeLabel || req.documentType}</span>
                                {req.urgency === 'urgent' && <span style={{ marginLeft: 8, background: '#C62828', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>URGENT</span>}
                              </div>
                              <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}50`, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
                            </div>
                            <div style={{ padding: '10px 16px', background: '#fff', fontSize: 13, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                              <span><strong>Applied:</strong> {new Date(req.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                              {req.reason && <span><strong>Reason:</strong> {req.reason}</span>}
                              {req.rejectionReason && <span style={{ color: '#C62828' }}><strong>Rejected:</strong> {req.rejectionReason}</span>}
                              {req.generationNotes && <span style={{ color: '#2E7D32' }}><strong>Note:</strong> {req.generationNotes}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
