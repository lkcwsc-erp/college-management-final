import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// Official fee structure 2025-26
const OFFICIAL_FEES = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    semesters: { 'Sem I': 29927, 'Sem II': 750, 'Sem III': 28207, 'Sem IV': 750, 'Sem V': 27842, 'Sem VI': 2850 },
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    semesters: { '1st Sem': 13877, '2nd Sem': 750, '3rd Sem': 11957, '4th Sem': 750, '5th Sem': 12092, '6th Sem': 2450 },
  },
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);

  const [myDocRequests, setMyDocRequests] = useState([]);
  const [docFormData, setDocFormData] = useState({
    documentType: '', reason: '', urgency: 'normal'
  });
  const [docMessage, setDocMessage] = useState('');
  const [docLoading, setDocLoading] = useState(false);

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
      API.get('/document-requests/my')
        .then(res => setMyDocRequests(res.data.requests || []))
        .catch(() => {});
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

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFormData.documentType) {
      setDocMessage('❌ Please select a document type');
      return;
    }
    setDocLoading(true);
    try {
      const res = await API.post('/document-requests', docFormData);
      if (res.data.success) {
        setDocMessage('✅ Request submitted! Waiting for Accounts Section approval.');
        setDocFormData({ documentType: '', reason: '', urgency: 'normal' });
        API.get('/document-requests/my').then(r => setMyDocRequests(r.data.requests || []));
        setTimeout(() => setDocMessage(''), 4000);
      }
    } catch (err) {
      setDocMessage('❌ ' + (err.response?.data?.message || 'Failed to submit'));
    } finally {
      setDocLoading(false);
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case 'pending_accounts':      return { bg: '#fff3e0', color: '#E65100', label: '⏳ Step 1/4 — Accounts (Fee Verification)' };
      case 'rejected_by_accounts':  return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts Section' };
      case 'pending_exam':          return { bg: '#e3f2fd', color: '#1565C0', label: '⏳ Step 2/4 — Exam Section (Result Check)' };
      case 'rejected_by_exam':      return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Examination Section' };
      case 'pending_principal':     return { bg: '#fff3e0', color: '#E65100', label: '⏳ Step 3/4 — Principal (Approval)' };
      case 'rejected_by_principal': return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' };
      case 'pending_generation':    return { bg: '#e8f5e9', color: '#2E7D32', label: '⏳ Step 4/4 — Student Section (Printing)' };
      case 'completed':             return { bg: '#e8f5e9', color: '#1b5e20', label: '✅ Completed — Ready to Collect' };
      default:                      return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

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
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>View your fee payment status and download official receipts.</p>

              {!myAdmission ? (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No Fee Information</h3>
                  <p>Please apply for admission first.</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="dash-cards" style={{ marginBottom: 24 }}>
                    {(() => {
                      const gross = myAdmission.totalFees || 0;
                      const schol = myAdmission.scholarshipAmount || 0;
                      const netPayable = Math.max(0, gross - schol);
                      const paid = myAdmission.fees || 0;
                      const pending = Math.max(0, netPayable - paid);
                      return (
                        <>
                          <div className="dash-card blue">
                            <div className="dash-card-icon">💰</div>
                            <div><h3>{gross > 0 ? `₹${gross.toLocaleString('en-IN')}` : '—'}</h3><p>Gross Semester Fee</p></div>
                          </div>
                          <div className="dash-card" style={{ background: 'linear-gradient(135deg,#e1bee7,#ce93d8)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div className="dash-card-icon">🏅</div>
                            <div><h3>{schol > 0 ? `−₹${schol.toLocaleString('en-IN')}` : '—'}</h3><p>Scholarship Deduction</p></div>
                          </div>
                          <div className="dash-card green">
                            <div className="dash-card-icon">✅</div>
                            <div><h3>{paid > 0 ? `₹${paid.toLocaleString('en-IN')}` : '₹0'}</h3><p>Amount Paid</p></div>
                          </div>
                          <div className={`dash-card ${pending > 0 ? 'orange' : 'green'}`}>
                            <div className="dash-card-icon">{pending > 0 ? '⏳' : '✅'}</div>
                            <div><h3>{pending > 0 ? `₹${pending.toLocaleString('en-IN')}` : '₹0'}</h3><p>{pending > 0 ? 'Balance Pending' : 'Fully Paid'}</p></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Fee calculation breakdown */}
                  {(myAdmission.totalFees > 0 || myAdmission.fees > 0) && (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                      <div style={{ background: '#1565C0', padding: '14px 20px' }}>
                        <h4 style={{ color: '#fff', margin: 0, fontSize: 14 }}>💰 Fee Statement</h4>
                      </div>
                      <div style={{ padding: '14px 20px', fontSize: 14 }}>
                        {[
                          { label: 'Gross Semester Fee', value: myAdmission.totalFees || 0, color: '#222' },
                          { label: '− Scholarship Deduction', value: myAdmission.scholarshipAmount || 0, color: '#6A1B9A', prefix: '−' },
                          { label: '= Net Payable', value: Math.max(0, (myAdmission.totalFees || 0) - (myAdmission.scholarshipAmount || 0)), color: '#1565C0', bold: true },
                          { label: '− Amount Paid', value: myAdmission.fees || 0, color: '#2E7D32', prefix: '−' },
                          { label: '= Balance Pending', value: Math.max(0, Math.max(0, (myAdmission.totalFees || 0) - (myAdmission.scholarshipAmount || 0)) - (myAdmission.fees || 0)), color: Math.max(0, (myAdmission.totalFees || 0) - (myAdmission.scholarshipAmount || 0) - (myAdmission.fees || 0)) > 0 ? '#C62828' : '#2E7D32', bold: true },
                        ].map((row, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
                            <span style={{ color: row.color, fontWeight: row.bold ? 700 : 500 }}>{row.label}</span>
                            <span style={{ color: row.color, fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? 16 : 14 }}>
                              {row.prefix === '−' ? '−' : ''}₹{row.value.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment ledger */}
                  {myAdmission.feeLedger && myAdmission.feeLedger.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                      <div style={{ background: '#2E7D32', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: '#fff', margin: 0, fontSize: 14 }}>🧾 Payment Receipts</h4>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{myAdmission.feeLedger.length} payment(s)</span>
                      </div>
                      {myAdmission.feeLedger.map((p, i) => (
                        <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#222', margin: '0 0 3px' }}>
                              {p.feeTypeLabel || p.feeType}{p.semester ? ` — ${p.semester}` : ''}
                            </p>
                            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                              {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                              {' · '}{p.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'}
                              {p.receiptNo ? ` · Receipt: ${p.receiptNo}` : ''}
                            </p>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#1565C0' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Receipt card */}
                  {myAdmission.feesPaid && myAdmission.lastFeePayment?.paidAt ? (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.06)', marginBottom: 20 }}>
                      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2E7D32)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: '#fff', margin: 0 }}>🧾 Fee Receipt</h4>
                          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '4px 0 0' }}>Receipt No: {myAdmission.lastFeePayment.receiptNo || '—'}</p>
                        </div>
                        <button
                          onClick={() => {
                            const d = myAdmission.lastFeePayment;
                            const acadYear = (() => { const y = new Date(d.paidAt).getFullYear(); const m = new Date(d.paidAt).getMonth()+1; return m>=6?`${y}-${y+1}`:`${y-1}-${y}`; })();
                            const dateStr = new Date(d.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
                            const vNo = 'ERP' + (d.receiptNo||Date.now().toString()).replace(/\D/g,'').slice(-8);
                            const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Times New Roman',serif;background:#e8eaf6;padding:30px;display:flex;justify-content:center}
  .page{background:white;max-width:520px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}
  .letterhead{border-bottom:4px double #1a237e;padding:14px 20px 12px;display:flex;align-items:center;gap:12px}
  .trust{font-size:11px;color:#555;letter-spacing:0.5px;margin-bottom:2px}
  .college{font-size:18px;font-weight:bold;color:#1a237e;line-height:1.2;margin-bottom:3px}
  .affil{font-size:10.5px;color:#333;margin-bottom:2px}
  .contact{font-size:10px;color:#555}
  .title-bar{background:#1a237e;color:white;text-align:center;padding:8px;font-size:14px;font-weight:bold;letter-spacing:2px}
  .body{padding:18px 24px}
  .section-title{font-size:10.5px;font-weight:bold;color:#1a237e;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1a237e;padding-bottom:3px;margin:14px 0 8px}
  table{width:100%;border-collapse:collapse;margin-bottom:4px}
  td{padding:5px 8px;font-size:12px;border:1px solid #c5cae9}
  td:first-child{background:#e8eaf6;font-weight:600;color:#283593;width:42%}
  td:last-child{color:#111}
  .amount-section{background:#e8f5e9;border:2px solid #2E7D32;border-radius:4px;padding:12px 16px;margin:14px 0;display:flex;justify-content:space-between;align-items:center}
  .paid-wrap{text-align:right;margin-top:4px}
  .paid-stamp{display:inline-block;border:3px solid #2E7D32;color:#2E7D32;font-size:16px;font-weight:bold;padding:4px 16px;transform:rotate(-6deg);letter-spacing:5px;opacity:0.85}
  .verify{background:#fafafa;border:1px dashed #9fa8da;border-radius:3px;padding:8px 12px;margin-top:12px;font-size:9.5px;color:#555;text-align:center}
  .verify code{font-family:monospace;font-size:10px;color:#1a237e;font-weight:bold}
  .footer{border-top:2px solid #e8eaf6;padding:10px 24px;display:flex;justify-content:space-between;align-items:flex-end;font-size:10px;color:#555;margin-top:8px}
  .sig{text-align:center}.sig-line{border-top:1px solid #555;width:120px;margin:18px auto 4px}
  @media print{body{background:white;padding:0}.page{box-shadow:none;max-width:100%}}
</style></head><body>
<div class="page">
  <div class="letterhead">
    <img src="data:image/jpeg;base64,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" style="width:60px;height:60px;object-fit:contain;flex-shrink:0" />
    <div style="flex:1;text-align:center">
      <div class="trust">Vidya-Niketan Sevabhavi Sanstha's</div>
      <div class="college">Late Kalpana Chawla Women's Senior College (LKCWSC)</div>
      <div class="affil">Affiliated to SNDT Women's University, Mumbai</div>
      <div class="contact">Gangakhed, Maharashtra | +91 9307162914 | lkcwsc.vnssorg.com</div>
    </div>
  </div>
  <div class="title-bar">✦ FEE RECEIPT ✦</div>
  <div class="body">
    <div class="section-title">Receipt Details</div>
    <table>
      <tr><td>Receipt No</td><td><strong>${myAdmission.lastFeePayment?.receiptNo || '—'}</strong></td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
      <tr><td>Academic Year</td><td>${acadYear}</td></tr>
    </table>
    <div class="section-title">Student Details</div>
    <table>
      <tr><td>Student Name</td><td>${myAdmission.applicantName}</td></tr>
      ${myAdmission.prnNumber ? `<tr><td>PRN Number</td><td>${myAdmission.prnNumber}</td></tr>` : ''}
      ${myAdmission.studentId ? `<tr><td>Student ID</td><td>${myAdmission.studentId}</td></tr>` : ''}
      ${myAdmission.courseType ? `<tr><td>Course &amp; Year</td><td>${myAdmission.courseType} — ${myAdmission.admissionYear||''}</td></tr>` : ''}
    </table>
    <div class="section-title">Payment Details</div>
    <table>
      <tr><td>Fee Type</td><td>Admission Fee</td></tr>
      <tr><td>Payment Mode</td><td>${d.paymentMode === 'online' ? 'Online / UPI' : 'Cash'}</td></tr>
      ${d.transactionId ? `<tr><td>Transaction ID / UTR</td><td>${d.transactionId}</td></tr>` : ''}
      ${myAdmission.scholarshipAmount > 0 ? `<tr><td>Scholarship Deduction</td><td>− ₹${myAdmission.scholarshipAmount.toLocaleString('en-IN')}</td></tr>` : ''}
      <tr><td>Payment Status</td><td><strong style="color:#2E7D32">PAID ✓</strong></td></tr>
    </table>
    <div class="amount-section">
      <div><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#1b5e20">Amount Paid</div></div>
      <div style="font-size:26px;font-weight:bold;color:#1b5e20">₹${myAdmission.fees?.toLocaleString('en-IN')}/-</div>
    </div>
    <div class="paid-wrap"><span class="paid-stamp">PAID</span></div>
    <div class="verify">ERP Verification No: <code>${vNo}</code> &nbsp;|&nbsp; Collected by: <strong>${d.collectedBy||'Accounts Staff'}</strong></div>
  </div>
  <div class="footer">
    <div style="font-size:9px;color:#888">*Computer-generated receipt. Valid without signature.<br/>Generated through LKCWSC ERP System</div>
    <div class="sig"><div class="sig-line"></div><div>Accounts Section</div><div style="font-size:9px;color:#888">LKCWSC</div></div>
  </div>
</div>
<scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
</body></html>`;
                            const w = window.open('', '_blank', 'width=580,height=820');
                            w.document.write(html);
                            w.document.close();
                          }}
                          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                          🖨️ Download / Print
                        </button>
                      </div>

                      <div style={{ padding: 20, fontSize: 13 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[
                            { label: 'Paid On', value: new Date(myAdmission.lastFeePayment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                            { label: 'Amount', value: `₹${myAdmission.fees?.toLocaleString('en-IN')}` },
                            { label: 'Payment Mode', value: myAdmission.lastFeePayment.paymentMode === 'online' ? '🌐 Online / UPI' : '💵 Cash' },
                            { label: 'Transaction ID', value: myAdmission.lastFeePayment.transactionId || '—' },
                            { label: 'Collected By', value: myAdmission.lastFeePayment.collectedBy || '—' },
                            { label: 'Receipt No', value: myAdmission.lastFeePayment.receiptNo || '—' },
                          ].map((item, i) => (
                            <div key={i} style={{ background: '#f8faff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e3f2fd' }}>
                              <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px', fontWeight: 600 }}>{item.label}</p>
                              <p style={{ fontSize: 13, color: '#222', fontWeight: 600, margin: 0 }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : !myAdmission.feesPaid ? (
                    <div style={{ background: '#fff3e0', border: '2px solid #ffb74d', borderRadius: 14, padding: 24, marginBottom: 20, textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', margin: 0 }}>⏳</p>
                      <h3 style={{ color: '#E65100', margin: '10px 0 6px' }}>Fees Pending</h3>
                      <p style={{ color: '#555', fontSize: 14 }}>Please visit the college Accounts Section to pay your fees.</p>
                      <p style={{ color: '#777', fontSize: 13, marginTop: 8 }}>Office Hours: Monday to Saturday, 9:00 AM to 5:00 PM</p>
                    </div>
                  ) : null}

                  {/* Official fee structure reference */}
                  {(() => {
                    const courseKey = (myAdmission.courseType || '').toLowerCase().includes('b.sc') || (myAdmission.courseType || '').toLowerCase().includes('science') ? 'B.Sc.' :
                      (myAdmission.courseType || '').toLowerCase().includes('b.a') || (myAdmission.courseType || '').toLowerCase().includes('arts') ? 'B.A.' : null;
                    const course = courseKey ? OFFICIAL_FEES[courseKey] : null;
                    return course ? (
                      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                        <div style={{ background: '#1565C0', padding: '14px 20px' }}>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: 14 }}>📋 Official Fee Structure 2025-26 — {course.label}</h4>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '4px 0 0' }}>As per SNDT Women's University circular</p>
                        </div>
                        <div style={{ padding: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                            {Object.entries(course.semesters).map(([sem, amt]) => (
                              <div key={sem} style={{ background: '#f8faff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e3f2fd', textAlign: 'center' }}>
                                <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px', fontWeight: 600 }}>{sem}</p>
                                <p style={{ fontSize: 16, color: '#1565C0', fontWeight: 800, margin: 0 }}>₹{amt.toLocaleString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                          <p style={{ fontSize: 11, color: '#aaa', marginTop: 10, textAlign: 'center' }}>* University approved fee structure. Contact Accounts Section for details.</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
          )}

          {/* ============ REQUEST DOCUMENTS TAB ============ */}
          {activeTab === 'documents' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>📄 Request Documents</h3>

              {!myAdmission && !admissionLoading && (
                <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #ffb74d' }}>
                  <p style={{ fontSize: '2.5rem' }}>⚠️</p>
                  <h3 style={{ color: '#E65100' }}>Application Required</h3>
                  <p style={{ color: '#555' }}>You need to submit your admission application first.</p>
                </div>
              )}

              {myAdmission && (
                <>
                  {docMessage && (
                    <div style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', background: docMessage.includes('✅') ? '#e8f5e9' : '#ffebee', color: docMessage.includes('✅') ? '#2E7D32' : '#C62828', fontWeight: '500' }}>
                      {docMessage}
                    </div>
                  )}

                  <div className="form-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '8px' }}>📝 New Document Request</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                      Select the document you need. Your student details will be auto-attached.
                    </p>

                    <div style={{ background: '#f0f9ff', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bae6fd', fontSize: '13px' }}>
                      <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>ℹ️ Auto-Attached Student Details:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <span><strong>Name:</strong> {myAdmission.applicantName}</span>
                        <span><strong>Email:</strong> {myAdmission.email}</span>
                        <span><strong>Course:</strong> {myAdmission.courseType || 'N/A'}</span>
                        <span><strong>Year:</strong> {myAdmission.admissionYear || 'N/A'}</span>
                      </div>
                    </div>

                    <form onSubmit={handleDocSubmit}>
                      <div className="form-group">
                        <label>Select Document Type *</label>
                        <select value={docFormData.documentType}
                          onChange={e => setDocFormData({ ...docFormData, documentType: e.target.value })} required>
                          <option value="">-- Select Document --</option>
                          <option value="ID_CARD">🪪 Apply for ID Card</option>
                          <option value="BONAFIDE">📋 Apply for Bonafide Certificate</option>
                          <option value="MARKSHEET">📄 Apply for Marksheet</option>
                          <option value="MIGRATION">📜 Apply for Migration Certificate</option>
                          <option value="TC">🎓 Apply for TC (Transfer Certificate)</option>
                        </select>
                        {docFormData.documentType === 'TC' && (
                          <small style={{ color: '#E65100', marginTop: '8px', display: 'block', fontSize: '13px' }}>
                            ⚠️ TC requires extra approval: Accounts → Principal → Student Section
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Reason / Purpose</label>
                        <textarea rows="3" placeholder="e.g. Required for next college admission, government job..."
                          value={docFormData.reason}
                          onChange={e => setDocFormData({ ...docFormData, reason: e.target.value })} />
                      </div>

                      <div className="form-group">
                        <label>Urgency</label>
                        <select value={docFormData.urgency}
                          onChange={e => setDocFormData({ ...docFormData, urgency: e.target.value })}>
                          <option value="normal">📅 Normal (7-10 days)</option>
                          <option value="urgent">⚡ Urgent (1-3 days)</option>
                        </select>
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={docLoading} style={{ padding: '12px 32px' }}>
                        {docLoading ? '⏳ Submitting...' : '🚀 Submit Request'}
                      </button>
                    </form>
                  </div>

                  <h3 style={{ margin: '30px 0 16px', color: '#1565C0' }}>
                    📋 My Document Requests ({myDocRequests.length})
                  </h3>

                  {myDocRequests.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📄</div>
                      <h3>No Requests Yet</h3>
                      <p>Your document requests will appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myDocRequests.map(req => {
                        const statusStyle = getDocStatusStyle(req.status);
                        return (
                          <div key={req._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: `2px solid ${statusStyle.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <h4 style={{ color: '#1565C0', marginBottom: '6px' }}>{req.documentTypeLabel || req.documentType}</h4>
                                <p style={{ fontSize: '13px', color: '#666' }}>
                                  Requested: {new Date(req.createdAt).toLocaleDateString()}
                                  {req.urgency === 'urgent' && (
                                    <span style={{ marginLeft: '10px', color: '#E65100', fontWeight: '600' }}>⚡ Urgent</span>
                                  )}
                                </p>
                              </div>
                              <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>
                                {statusStyle.label}
                              </span>
                            </div>

                            {req.reason && (
                              <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                                <strong>Reason:</strong> {req.reason}
                              </p>
                            )}

                            <div style={{ background: '#f8faff', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '13px' }}>
                              <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '8px' }}>📊 Workflow Progress:</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span>📝 Submitted</span>
                                <span>→</span>
                                <span style={{ color: req.accountsApprovedDate ? '#2E7D32' : '#999', fontWeight: req.accountsApprovedDate ? '600' : '400' }}>
                                  {req.accountsApprovedDate ? '✅' : '⏳'} Accounts
                                </span>
                                {req.documentType === 'TC' && (
                                  <>
                                    <span>→</span>
                                    <span style={{ color: req.examVerifiedDate ? '#2E7D32' : '#999', fontWeight: req.examVerifiedDate ? '600' : '400' }}>
                                      {req.examVerifiedDate ? '✅' : '⏳'} Exam Section
                                    </span>
                                    <span>→</span>
                                    <span style={{ color: req.principalApprovedDate ? '#2E7D32' : '#999', fontWeight: req.principalApprovedDate ? '600' : '400' }}>
                                      {req.principalApprovedDate ? '✅' : '⏳'} Principal
                                    </span>
                                  </>
                                )}
                                <span>→</span>
                                <span style={{ color: req.status === 'completed' ? '#2E7D32' : '#999', fontWeight: req.status === 'completed' ? '600' : '400' }}>
                                  {req.status === 'completed' ? '✅' : '⏳'} Student Section
                                </span>
                              </div>
                            </div>

                            {req.rejectionReason && (
                              <div style={{ background: '#ffebee', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: '#C62828' }}>
                                <strong>❌ Rejected:</strong> {req.rejectionReason}
                              </div>
                            )}

                            {req.status === 'completed' && req.generationNotes && (
                              <div style={{ background: '#e8f5e9', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: '#2E7D32' }}>
                                <strong>✅ Generated:</strong> {req.generationNotes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
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
