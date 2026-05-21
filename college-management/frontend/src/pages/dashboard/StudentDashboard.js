import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ─── Admission Status Timeline ────────────────────────────────────────────────
const AdmissionTimeline = ({ admission }) => {
  if (!admission) return null;

  const { studentSectionStatus, status, studentId, rejectionReason, staffNotes, principalNotes } = admission;

  const steps = [
    {
      label: 'Form Submitted',
      icon: '📝',
      done: true,
      active: false,
    },
    {
      label: 'Student Section Review',
      icon: '👩‍💼',
      done: studentSectionStatus === 'verified' || studentSectionStatus === 'rejected',
      active: studentSectionStatus === 'pending',
      rejected: studentSectionStatus === 'rejected',
      note: studentSectionStatus === 'rejected' ? rejectionReason : null,
    },
    {
      label: 'Principal Approval',
      icon: '👨‍🏫',
      done: status === 'approved' || status === 'rejected',
      active: studentSectionStatus === 'verified' && status === 'pending',
      rejected: status === 'rejected' && studentSectionStatus === 'verified',
      note: status === 'rejected' && studentSectionStatus === 'verified' ? (principalNotes || rejectionReason) : null,
    },
    {
      label: 'Admission Approved',
      icon: '🎉',
      done: status === 'approved',
      active: false,
      rejected: false,
    },
  ];

  return (
    <div style={{ padding: '16px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < steps.length - 1 ? '0' : '0' }}>
          {/* Icon + Line */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
              background: step.rejected ? '#ffebee' : step.done ? '#e8f5e9' : step.active ? '#fff3e0' : '#f5f5f5',
              border: `2px solid ${step.rejected ? '#C62828' : step.done ? '#2E7D32' : step.active ? '#E65100' : '#ddd'}`,
            }}>
              {step.rejected ? '❌' : step.done ? '✅' : step.active ? '⏳' : step.icon}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: '2px', height: '32px', background: step.done ? '#2E7D32' : '#e0e0e0', margin: '4px 0' }} />
            )}
          </div>

          {/* Content */}
          <div style={{ paddingBottom: i < steps.length - 1 ? '16px' : '0', flex: 1 }}>
            <p style={{
              fontWeight: '600', fontSize: '14px', margin: '8px 0 4px',
              color: step.rejected ? '#C62828' : step.done ? '#2E7D32' : step.active ? '#E65100' : '#999',
            }}>
              {step.label}
              {step.active && <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '400' }}>— In Progress</span>}
              {step.rejected && <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '400' }}>— Rejected</span>}
            </p>
            {step.note && (
              <div style={{ background: '#ffebee', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: '#C62828', borderLeft: '3px solid #C62828', marginTop: '4px' }}>
                <strong>Reason:</strong> {step.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Student ID Card ──────────────────────────────────────────────────────────
const StudentIDCard = ({ admission }) => {
  if (!admission?.studentId) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      borderRadius: '16px', padding: '24px', marginBottom: '20px',
      color: 'white', textAlign: 'center',
      boxShadow: '0 8px 24px rgba(21,101,192,0.4)',
    }}>
      <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>🎉 Congratulations! Your Student ID</p>
      <h1 style={{ fontSize: '36px', letterSpacing: '6px', margin: '8px 0', fontWeight: '700', color: 'white' }}>
        {admission.studentId}
      </h1>
      <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '16px' }}>Late Kalpana Chawla Women's Senior College</p>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', fontSize: '13px' }}>
        <p style={{ margin: '2px 0' }}><strong>Name:</strong> {admission.applicantName}</p>
        <p style={{ margin: '2px 0' }}><strong>Course:</strong> {admission.preferredSubject || admission.course?.name || 'N/A'}</p>
        <p style={{ margin: '2px 0' }}><strong>Approved On:</strong> {admission.principalApprovedDate ? new Date(admission.principalApprovedDate).toLocaleDateString('en-IN') : 'N/A'}</p>
      </div>
      <p style={{ fontSize: '11px', opacity: 0.65, marginTop: '12px' }}>
        Please save this ID — it will be needed for all college activities
      </p>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);

  // Document Request States
  const [myDocRequests, setMyDocRequests] = useState([]);
  const [docFormData, setDocFormData] = useState({ documentType: '', reason: '', urgency: 'normal' });
  const [docMessage, setDocMessage] = useState('');
  const [docLoading, setDocLoading] = useState(false);

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
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFormData.documentType) { setDocMessage('❌ Please select a document type'); return; }
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
      case 'pending_accounts':     return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Accounts' };
      case 'rejected_by_accounts': return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' };
      case 'approved_by_accounts':
      case 'pending_principal':    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Principal' };
      case 'rejected_by_principal':return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' };
      case 'approved_by_principal':
      case 'pending_generation':   return { bg: '#e3f2fd', color: '#1565C0', label: '🎯 Pending - Generation' };
      case 'completed':            return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Completed' };
      default:                     return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' };
  };

  // Current status message for student
  const getCurrentStatusMsg = (adm) => {
    if (!adm) return null;
    if (adm.status === 'approved') return { msg: '🎉 Your admission has been approved! Check your email for Student ID.', color: '#2E7D32', bg: '#e8f5e9' };
    if (adm.status === 'rejected') return { msg: '❌ Your application was rejected. Please contact the college office.', color: '#C62828', bg: '#ffebee' };
    if (adm.studentSectionStatus === 'verified') return { msg: '✅ Verified by Student Section! Now waiting for Principal\'s final approval.', color: '#1565C0', bg: '#e3f2fd' };
    if (adm.studentSectionStatus === 'rejected') return { msg: '❌ Rejected by Student Section. Please check the reason below.', color: '#C62828', bg: '#ffebee' };
    return { msg: '⏳ Your form is with Student Section staff for review.', color: '#E65100', bg: '#fff3e0' };
  };

  const tabs = [
    { id: 'home',        label: '🏠 Dashboard' },
    { id: 'application', label: '📋 My Application' },
    { id: 'profile',     label: '👤 My Profile' },
    { id: 'fees',        label: '💰 My Fees' },
    { id: 'documents',   label: '📄 Request Documents' },
    { id: 'attendance',  label: '📊 Attendance' },
    { id: 'results',     label: '🎓 Results' },
    { id: 'notices',     label: '📢 Notices' },
  ];

  const docList = [
    { key: 'studentPhoto',  label: '📸 Student Photo' },
    { key: 'aadharPhoto',   label: '🪪 Aadhar Card' },
    { key: 'sscMarksheet',  label: '📄 SSC Marksheet' },
    { key: 'hscMarksheet',  label: '📄 HSC Marksheet' },
    { key: 'gapCertificate',label: '📅 Gap Certificate' },
    { key: 'casteCertificate', label: '📋 Caste Certificate' },
    { key: 'casteValidityCertificate', label: '✅ Caste Validity' },
  ];

  const statusMsg = getCurrentStatusMsg(myAdmission);

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
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
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

          {/* ── HOME ── */}
          {activeTab === 'home' && (
            <div>
              {/* Student ID Card — show on top if approved */}
              {myAdmission?.studentId && <StudentIDCard admission={myAdmission} />}

              {/* Current Status Banner */}
              {statusMsg && (
                <div style={{
                  background: statusMsg.bg, color: statusMsg.color,
                  padding: '14px 18px', borderRadius: '10px',
                  marginBottom: '20px', fontWeight: '500', fontSize: '14px',
                  borderLeft: `4px solid ${statusMsg.color}`,
                }}>
                  {statusMsg.msg}
                </div>
              )}

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
                  <div><h3>Fees</h3><p>{myAdmission?.fees ? `₹${myAdmission.fees}` : 'Not Set'}</p></div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">📢</div>
                  <div><h3>Notices</h3><p>{notices.length} notices</p></div>
                </div>
              </div>

              {/* Admission Status Timeline */}
              {myAdmission && (
                <div className="recent-section" style={{ marginBottom: '20px' }}>
                  <h3>📊 Admission Status Timeline</h3>
                  <AdmissionTimeline admission={myAdmission} />
                </div>
              )}

              {/* Form completion */}
              {!myAdmission && !admissionLoading && (
                <div style={{
                  background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                  borderRadius: '16px', padding: '32px', textAlign: 'center', color: 'white', marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
                  <h2 style={{ color: 'white', marginBottom: '12px' }}>Complete Your Admission Form</h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>Fill all required details and upload documents to start your admission process.</p>
                  <button onClick={() => navigate('/admissions?tab=apply')}
                    style={{ background: 'white', color: '#1565C0', padding: '12px 28px', borderRadius: '30px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                    ✨ Start Application →
                  </button>
                </div>
              )}

              {/* Notices */}
              <div className="recent-section">
                <h3>📢 Recent Notices</h3>
                {notices.slice(0, 3).map(notice => (
                  <div key={notice._id} className="notice-row">
                    <span className="notice-dot"></span>
                    <div>
                      <p className="notice-title">{notice.title}</p>
                      <p className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                ))}
                {notices.length === 0 && <p className="empty-msg">No notices available</p>}
              </div>
            </div>
          )}

          {/* ── APPLICATION ── */}
          {activeTab === 'application' && (
            <div>
              {admissionLoading && (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              )}

              {!admissionLoading && !myAdmission && (
                <div style={{
                  background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                  borderRadius: '16px', padding: '40px 30px', textAlign: 'center', color: 'white',
                  boxShadow: '0 8px 24px rgba(21,101,192,0.3)', marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📝</div>
                  <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '1.8rem' }}>Complete Your Profile</h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '24px' }}>
                    Welcome to LKCWSC! Please complete your admission profile.
                  </p>
                  <button onClick={() => navigate('/admissions?tab=apply')}
                    style={{ background: 'white', color: '#1565C0', padding: '14px 36px', borderRadius: '30px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                    ✨ Complete Your Profile →
                  </button>
                </div>
              )}

              {!admissionLoading && myAdmission && (
                <div>
                  {/* Student ID Card */}
                  {myAdmission.studentId && <StudentIDCard admission={myAdmission} />}

                  {/* Status Timeline */}
                  <div className="fees-card" style={{ marginBottom: '20px' }}>
                    <h3>📊 Application Status Timeline</h3>
                    <AdmissionTimeline admission={myAdmission} />
                  </div>

                  {/* Personal Info */}
                  <div className="fees-card" style={{ marginBottom: '20px' }}>
                    <h3>Personal Information</h3>
                    {[
                      { label: 'Full Name',      value: myAdmission.applicantName },
                      { label: 'Email',           value: myAdmission.email },
                      { label: 'Phone',           value: myAdmission.phone },
                      { label: 'Category',        value: myAdmission.category?.toUpperCase() },
                      { label: 'Course Applied',  value: myAdmission.preferredSubject || myAdmission.course?.name },
                      { label: 'SSC Percentage',  value: myAdmission.sscPercentage ? `${myAdmission.sscPercentage}%` : null },
                      { label: 'HSC Percentage',  value: myAdmission.hscPercentage ? `${myAdmission.hscPercentage}%` : null },
                      { label: 'Applied On',      value: new Date(myAdmission.createdAt).toLocaleDateString('en-IN') },
                    ].map((row, i) => (
                      <div key={i} className="fees-info-row">
                        <span className="fees-info-label">{row.label}</span>
                        <span className="fees-info-value">{row.value || '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Documents */}
                  <div className="fees-card">
                    <h3>Uploaded Documents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {docList.map(doc => {
                        if (!myAdmission[doc.key]) return null;
                        return (
                          <div key={doc.key} style={{ background: '#f8faff', border: '1px solid #e3f2fd', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <img
                              src={myAdmission[doc.key]}
                              alt={doc.label}
                              style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                              onError={e => e.target.style.display = 'none'}
                            />
                            <p style={{ fontSize: '11px', color: '#1565C0', fontWeight: '500', marginBottom: '6px' }}>{doc.label}</p>
                            <a href={myAdmission[doc.key]} target="_blank" rel="noreferrer"
                              style={{ fontSize: '11px', color: '#1565C0', textDecoration: 'underline' }}>
                              View Full
                            </a>
                          </div>
                        );
                      })}
                    </div>
                    {docList.every(doc => !myAdmission[doc.key]) && <p className="empty-msg">No documents uploaded</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-avatar">
                {myAdmission?.studentPhoto ? (
                  <img src={myAdmission.studentPhoto} alt="Student"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>👩‍🎓</span>
                )}
              </div>
              <div className="profile-details">
                <h2>{user?.name}</h2>
                {myAdmission?.studentId && (
                  <p style={{ color: '#1565C0', fontWeight: '700', fontSize: '16px', letterSpacing: '2px' }}>
                    ID: {myAdmission.studentId}
                  </p>
                )}
                <p className="profile-role">Student</p>
                <div className="profile-info-grid">
                  <div className="profile-info-item"><label>Email</label><p>{user?.email}</p></div>
                  <div className="profile-info-item"><label>Phone</label><p>{user?.phone || 'Not provided'}</p></div>
                  <div className="profile-info-item"><label>Role</label><p>Student</p></div>
                  <div className="profile-info-item"><label>Account Status</label><p className="status-active">Active</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ── FEES ── */}
          {activeTab === 'fees' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>My Fees Details</h3>
              {myAdmission ? (
                <div className="fees-card">
                  <h3>Fee Information</h3>
                  {[
                    { label: 'Student Name',     value: user?.name },
                    { label: 'Course',           value: myAdmission.preferredSubject || myAdmission.course?.name || 'N/A' },
                  ].map((row, i) => (
                    <div key={i} className="fees-info-row">
                      <span className="fees-info-label">{row.label}</span>
                      <span className="fees-info-value">{row.value}</span>
                    </div>
                  ))}
                  <div className="fees-info-row">
                    <span className="fees-info-label">Admission Status</span>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', background: getStatusStyle(myAdmission.status).bg, color: getStatusStyle(myAdmission.status).color }}>
                      {getStatusStyle(myAdmission.status).label}
                    </span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Total Fees</span>
                    <span className="fees-info-value" style={{ fontSize: '1.3rem', color: '#1565C0', fontWeight: '700' }}>
                      {myAdmission.fees ? `₹${myAdmission.fees}` : 'Not set by college yet'}
                    </span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Payment Status</span>
                    <span className={`status-badge ${myAdmission.feesPaid ? 'approved' : 'pending'}`}>
                      {myAdmission.feesPaid ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  <div style={{ marginTop: '24px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#1565C0', fontWeight: '500' }}>💡 Payment Instructions</p>
                    <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                      Please visit the college office to pay your fees. Bring your admission letter and ID proof.
                      Office Hours: Monday to Saturday, 9:00 AM to 5:00 PM.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No Fee Information</h3>
                  <p>Please apply for admission first.</p>
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'documents' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>📄 Request Documents</h3>

              {!myAdmission && !admissionLoading && (
                <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #ffb74d' }}>
                  <p style={{ fontSize: '2.5rem' }}>⚠️</p>
                  <h3 style={{ color: '#E65100' }}>Application Required</h3>
                  <p style={{ color: '#555' }}>Please submit your admission application first.</p>
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
                    <form onSubmit={handleDocSubmit}>
                      <div className="form-group">
                        <label>Select Document Type *</label>
                        <select value={docFormData.documentType} onChange={e => setDocFormData({ ...docFormData, documentType: e.target.value })} required>
                          <option value="">-- Select Document --</option>
                          <option value="ID_CARD">🪪 Apply for ID Card</option>
                          <option value="BONAFIDE">📋 Apply for Bonafide Certificate</option>
                          <option value="MARKSHEET">📄 Apply for Marksheet</option>
                          <option value="MIGRATION">📜 Apply for Migration Certificate</option>
                          <option value="TC">🎓 Apply for TC (Transfer Certificate)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Reason / Purpose</label>
                        <textarea rows="3" placeholder="e.g. Required for next college admission..."
                          value={docFormData.reason} onChange={e => setDocFormData({ ...docFormData, reason: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Urgency</label>
                        <select value={docFormData.urgency} onChange={e => setDocFormData({ ...docFormData, urgency: e.target.value })}>
                          <option value="normal">📅 Normal (7-10 days)</option>
                          <option value="urgent">⚡ Urgent (1-3 days)</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={docLoading} style={{ padding: '12px 32px' }}>
                        {docLoading ? '⏳ Submitting...' : '🚀 Submit Request'}
                      </button>
                    </form>
                  </div>

                  <h3 style={{ margin: '30px 0 16px', color: '#1565C0' }}>📋 My Document Requests ({myDocRequests.length})</h3>
                  {myDocRequests.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📄</div><h3>No Requests Yet</h3></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myDocRequests.map(req => {
                        const s = getDocStatusStyle(req.status);
                        return (
                          <div key={req._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: `2px solid ${s.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <h4 style={{ color: '#1565C0', marginBottom: '6px' }}>{req.documentTypeLabel || req.documentType}</h4>
                                <p style={{ fontSize: '13px', color: '#666' }}>Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: s.bg, color: s.color }}>{s.label}</span>
                            </div>
                            {req.rejectionReason && (
                              <div style={{ background: '#ffebee', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: '#C62828' }}>
                                <strong>❌ Rejected:</strong> {req.rejectionReason}
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

          {/* ── ATTENDANCE ── */}
          {activeTab === 'attendance' && (
            <div className="empty-state"><div className="empty-icon">📊</div><h3>Attendance Records</h3><p>Your attendance will be displayed here once uploaded by staff.</p></div>
          )}

          {/* ── RESULTS ── */}
          {activeTab === 'results' && (
            <div className="empty-state"><div className="empty-icon">🎓</div><h3>Exam Results</h3><p>Your results will appear here once published.</p></div>
          )}

          {/* ── NOTICES ── */}
          {activeTab === 'notices' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>All Notices ({notices.length})</h3>
              {notices.map(notice => (
                <div className="notice-full-card" key={notice._id}>
                  <div className="notice-full-header"><h4>{notice.title}</h4><span className="notice-tag">{notice.category}</span></div>
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
