
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);
  
  
  // Document Request States
  const [myDocRequests, setMyDocRequests] = useState([]);
  const [docFormData, setDocFormData] = useState({
    documentType: '',
    reason: '',
    urgency: 'normal'
  });
  const [docMessage, setDocMessage] = useState('');
  const [docLoading, setDocLoading] = useState(false);

useEffect(() => {
  API.get('/notices')
    .then(res => setNotices(res.data.notices || []));

  if (user?.email) {
    API.get(`/admissions/by-email/${user.email}`)
      .then(res => {
        if (res.data.success) {
          setMyAdmission(res.data.admission);
        }
        setAdmissionLoading(false);
      })
      .catch(() => {
        setAdmissionLoading(false);
      });

    // Fetch Document Requests
    API.get('/document-requests/my')
      .then(res => setMyDocRequests(res.data.requests || []))
      .catch(() => {});
  } else {
    setAdmissionLoading(false);
  }
}, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogout = () => {
  logout();
  navigate('/');
};

// Document Request Submit
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
      // Refresh requests
      API.get('/document-requests/my')
        .then(r => setMyDocRequests(r.data.requests || []));
      setTimeout(() => setDocMessage(''), 4000);
    }
  } catch (err) {
    setDocMessage('❌ ' + (err.response?.data?.message || 'Failed to submit'));
  } finally {
    setDocLoading(false);
  }
};

// Get document status display
const getDocStatusStyle = (status) => {
  switch (status) {
    case 'pending_accounts':
      return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Accounts' };
    case 'rejected_by_accounts':
      return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' };
    case 'approved_by_accounts':
    case 'pending_principal':
      return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Principal' };
    case 'rejected_by_principal':
      return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' };
    case 'approved_by_principal':
    case 'pending_generation':
      return { bg: '#e3f2fd', color: '#1565C0', label: '🎯 Pending - Generation' };
    case 'completed':
      return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Completed' };
    default:
      return { bg: '#f5f5f5', color: '#666', label: status };
  }
};

 const tabs = [
  { id: 'home', label: '🏠 Dashboard' },
  { id: 'application', label: '📋 My Application' },
  { id: 'profile', label: '👤 My Profile' },
  { id: 'fees', label: '💰 My Fees' },
  { id: 'documents', label: '📄 Request Documents' },
  { id: 'attendance', label: '📊 Attendance' },
  { id: 'results', label: '🎓 Results' },
  { id: 'notices', label: '📢 Notices' },
];

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' };
  };

  const getStatusMessage = (status) => {
    if (status === 'approved') return 'Congratulations! Your admission has been approved. Please pay fees to confirm your seat.';
    if (status === 'rejected') return 'Unfortunately your application was not approved. Please contact the college office.';
    return 'Your application is being reviewed by the admin. Please check back later.';
  };

  const getStatusEmoji = (status) => {
    if (status === 'approved') return '🎉';
    if (status === 'rejected') return '😞';
    return '⏳';
  };

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
  <img
    src="/college-logo.png"
    alt="College Logo"
    className="sidebar-logo-img"
  />

  <div className="sidebar-text">
    <h3>Late Kalpana Chawla Women's Senior College</h3>
    <p>Senior Science & Arts College, Gangakhed</p>
  </div>
</div>

    <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info">
            <span>👋 Welcome, {user?.name}</span>
          </div>
        </div>

        <div className="dashboard-content">

          {activeTab === 'home' && (
            <div>
              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">📋</div>
                  <div>
                    <h3>Application</h3>
                    <p style={{
                      color: myAdmission
                        ? getStatusStyle(myAdmission.status).color
                        : '#888',
                      fontWeight: '500',
                      fontSize: '13px'
                    }}>
                      {myAdmission
                        ? getStatusStyle(myAdmission.status).label
                        : 'Not Applied'}
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
                <div className="recent-section" style={{ marginBottom: '20px' }}>
                  <h3>My Application Status</h3>
                  <div style={{ padding: '8px 0' }}>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Applicant Name</span>
                      <span className="fees-info-value">{myAdmission.applicantName}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Course Applied</span>
                      <span className="fees-info-value">
                        {myAdmission.course?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Applied Date</span>
                      <span className="fees-info-value">
                        {new Date(myAdmission.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Status</span>
                      <span style={{
                        padding: '5px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: getStatusStyle(myAdmission.status).bg,
                        color: getStatusStyle(myAdmission.status).color,
                      }}>
                        {getStatusStyle(myAdmission.status).label}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Fees</span>
                      <span className="fees-info-value">
                        {myAdmission.fees
                          ? `₹${myAdmission.fees}`
                          : 'Not set by college yet'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admission Form Progress Section */}
              <div className="recent-section">
                <h3>📋 Admission Form Status</h3>

                {admissionLoading ? (
                  <p style={{ color: '#888', fontSize: '14px', padding: '10px 0' }}>
                    ⏳ Loading admission status...
                  </p>
                ) : (() => {
                  // Calculate form completion percentage
                  const fields = [
                    myAdmission?.applicantName,
                    myAdmission?.email,
                    myAdmission?.phone,
                    myAdmission?.address,
                    myAdmission?.dateOfBirth,
                    myAdmission?.gender,
                    myAdmission?.category,
                    myAdmission?.aadharNumber,
                    myAdmission?.aadharName,
                    myAdmission?.studentPhoto,
                    myAdmission?.aadharPhoto,
                    myAdmission?.sscSchoolName,
                    myAdmission?.sscBoard,
                    myAdmission?.sscYOP,
                    myAdmission?.sscPercentage,
                    myAdmission?.sscMarksheet,
                    myAdmission?.hscCollegeName,
                    myAdmission?.hscBoard,
                    myAdmission?.hscYOP,
                    myAdmission?.hscPercentage,
                    myAdmission?.hscMarksheet,
                    myAdmission?.course,
                    myAdmission?.fatherName,
                    myAdmission?.motherName,
                  ];
                  const filled = fields.filter(f => f && f !== '').length;
                  const total = fields.length;
                  const percentage = myAdmission ? Math.round((filled / total) * 100) : 0;
                  
                  const pendingFields = [];

if (!myAdmission?.applicantName) pendingFields.push('Applicant Name');
if (!myAdmission?.email) pendingFields.push('Email');
if (!myAdmission?.phone) pendingFields.push('Phone Number');
if (!myAdmission?.address) pendingFields.push('Address');
if (!myAdmission?.dateOfBirth) pendingFields.push('Date of Birth');
if (!myAdmission?.gender) pendingFields.push('Gender');
if (!myAdmission?.category) pendingFields.push('Category');
if (!myAdmission?.aadharNumber) pendingFields.push('Aadhar Number');
if (!myAdmission?.aadharName) pendingFields.push('Aadhar Name');
if (!myAdmission?.studentPhoto) pendingFields.push('Student Photo');
if (!myAdmission?.aadharPhoto) pendingFields.push('Aadhar Card');
if (!myAdmission?.sscMarksheet) pendingFields.push('SSC Marksheet');
if (!myAdmission?.hscMarksheet) pendingFields.push('HSC Marksheet');
if (!myAdmission?.fatherName) pendingFields.push('Father Name');
if (!myAdmission?.motherName) pendingFields.push('Mother Name');

const progressColor =
  percentage === 100 ? '#2E7D32' :
  percentage >= 60  ? '#E65100' :
                      '#C62828';

                  const progressBg =
                    percentage === 100 ? '#e8f5e9' :
                    percentage >= 60  ? '#fff3e0' :
                                        '#ffebee';

                  return (
                    <div style={{ padding: '8px 0' }}>
                      {/* Status label */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          {myAdmission
                            ? `${filled} / ${total} fields completed`
                            : 'Form not started yet'}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: progressColor
                        }}>
                          {percentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '14px',
                        background: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        marginBottom: '14px'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: progressColor,
                          borderRadius: '10px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>

                      {/* Status message */}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: progressBg,
                        marginBottom: '16px',
                        fontSize: '13px',
                        color: progressColor,
                        fontWeight: '500'
                      }}>
                        {percentage === 100
                          ? '🎉 Your admission form is fully complete!'
                          : percentage >= 60
                          ? '⚠️ Form partially filled. Please complete remaining details.'
                          : myAdmission
                          ? '❗ Form is mostly incomplete. Please fill all required details.'
                          : '📝 You have not started the admission form yet.'}
                      </div>
                      {pendingFields.length > 0 && (
  <div
    style={{
      background: '#fff3e0',
      padding: '14px',
      borderRadius: '10px',
      marginBottom: '16px',
      border: '1px solid #ffcc80'
    }}
  >
    <h4
      style={{
        marginBottom: '10px',
        color: '#E65100',
        fontSize: '15px'
      }}
    >
      ⚠️ Pending Details
    </h4>

    <ul style={{ paddingLeft: '18px', margin: 0 }}>
      {pendingFields.map((field, index) => (
        <li
          key={index}
          style={{
            marginBottom: '6px',
            fontSize: '13px',
            color: '#555'
          }}
        >
          {field}
        </li>
      ))}
    </ul>
  </div>
)}

                      {/* Complete Your Form Button */}
                      {percentage < 100 && (
                        <button
                          onClick={() => navigate('/admissions?tab=apply')}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            letterSpacing: '0.3px',
                            boxShadow: '0 3px 10px rgba(21,101,192,0.3)',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                          📝 Complete Your Form
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'application' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>
                My Application Details
              </h3>

              {admissionLoading && (
                <div className="empty-state">
                  <p style={{ fontSize: '2rem' }}>⏳</p>
                  <h3>Loading...</h3>
                </div>
              )}

            {!admissionLoading && !myAdmission && (
                <div style={{
                  background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                  borderRadius: '16px',
                  padding: '40px 30px',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(21, 101, 192, 0.3)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📝</div>
                  <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '1.8rem' }}>
                    Complete Your Profile
                  </h2>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '15px', 
                    marginBottom: '24px',
                    maxWidth: '500px',
                    margin: '0 auto 24px'
                  }}>
                    Welcome to LKCWSC! Please complete your admission profile by filling all required details and uploading documents.
                  </p>
                <a href="/admissions?tab=apply" onClick={(e) => { e.preventDefault(); navigate('/admissions?tab=apply'); }} style={{
                    display: 'inline-block',
                    background: 'white',
                    color: '#1565C0',
                    padding: '14px 36px',
                    borderRadius: '30px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s'
                  }}>

                    ✨ Complete Your Profile →
                  </a>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.85)', 
                    fontSize: '13px', 
                    marginTop: '20px' 
                  }}>
                    📋 Fill the full admission form  •  📎 Upload documents  •  ⏳ Wait for approval
                  </p>
                </div>
              )}

              {!admissionLoading && myAdmission && (
                <div>
                  <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    background: getStatusStyle(myAdmission.status).bg,
                    border: `2px solid ${getStatusStyle(myAdmission.status).color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ fontSize: '2.5rem' }}>
                      {getStatusEmoji(myAdmission.status)}
                    </div>
                    <div>
                      <h3 style={{ color: getStatusStyle(myAdmission.status).color }}>
                        Application{' '}
                        {myAdmission.status === 'approved'
                          ? 'Approved!'
                          : myAdmission.status === 'rejected'
                            ? 'Rejected'
                            : 'Under Review'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#555' }}>
                        {getStatusMessage(myAdmission.status)}
                      </p>
                    </div>
                  </div>

                  <div className="fees-card">
                    <h3>Personal Information</h3>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Full Name</span>
                      <span className="fees-info-value">{myAdmission.applicantName}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Email</span>
                      <span className="fees-info-value">{myAdmission.email}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Phone</span>
                      <span className="fees-info-value">{myAdmission.phone}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Category</span>
                      <span className="fees-info-value">
                        {myAdmission.category
                          ? myAdmission.category.toUpperCase()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Course Applied</span>
                      <span className="fees-info-value">
                        {myAdmission.course?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">SSC Percentage</span>
                      <span className="fees-info-value">
                        {myAdmission.sscPercentage
                          ? `${myAdmission.sscPercentage}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">HSC Percentage</span>
                      <span className="fees-info-value">
                        {myAdmission.hscPercentage
                          ? `${myAdmission.hscPercentage}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Applied On</span>
                      <span className="fees-info-value">
                        {new Date(myAdmission.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="fees-card" style={{ marginTop: '20px' }}>
                    <h3>Uploaded Documents</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: '16px',
                      marginTop: '16px'
                    }}>
                      {docList.map(doc => {
                        if (!myAdmission[doc.key]) return null;
                        return (
                          <div key={doc.key} style={{
                            background: '#f8faff',
                            border: '1px solid #e3f2fd',
                            borderRadius: '10px',
                            padding: '12px',
                            textAlign: 'center'
                          }}>
                            <img
                              src={`http://localhost:5000/uploads/${myAdmission[doc.key]}`}
                              alt={doc.label}
                              style={{
                                width: '100%',
                                height: '90px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                marginBottom: '8px'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <p style={{
                              fontSize: '11px',
                              color: '#1565C0',
                              fontWeight: '500',
                              marginBottom: '6px'
                            }}>
                              {doc.label}
                            </p>
                            {/* ✅ FIXED: Added missing opening <a tag */}
                            <a
                              href={`http://localhost:5000/uploads/${myAdmission[doc.key]}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11px',
                                color: '#1565C0',
                                textDecoration: 'underline'
                              }}>
                              View Full
                            </a>
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

          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-avatar">
                {myAdmission?.studentPhoto ? (
                  <img
                    src={`http://localhost:5000/uploads/${myAdmission.studentPhoto}`}
                    alt="Student"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem' }}>👩‍🎓</span>
                )}
              </div>
              <div className="profile-details">
                <h2>{user?.name}</h2>
                <p className="profile-role">Student</p>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="profile-info-item">
                    <label>Phone</label>
                    <p>{user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="profile-info-item">
                    <label>Role</label>
                    <p>Student</p>
                  </div>
                  <div className="profile-info-item">
                    <label>Account Status</label>
                    <p className="status-active">Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>
                My Fees Details
              </h3>
              {myAdmission ? (
                <div className="fees-card">
                  <h3>Fee Information</h3>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Student Name</span>
                    <span className="fees-info-value">{user?.name}</span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Course</span>
                    <span className="fees-info-value">
                      {myAdmission.course?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Admission Status</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: getStatusStyle(myAdmission.status).bg,
                      color: getStatusStyle(myAdmission.status).color,
                    }}>
                      {getStatusStyle(myAdmission.status).label}
                    </span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Total Fees</span>
                    <span className="fees-info-value" style={{
                      fontSize: '1.3rem',
                      color: '#1565C0',
                      fontWeight: '700'
                    }}>
                      {myAdmission.fees
                        ? `₹${myAdmission.fees}`
                        : 'Not set by college yet'}
                    </span>
                  </div>
                  <div className="fees-info-row">
                    <span className="fees-info-label">Payment Status</span>
                    <span className={`status-badge ${myAdmission.feesPaid ? 'approved' : 'pending'}`}>
                      {myAdmission.feesPaid ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#e3f2fd',
                    borderRadius: '8px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#1565C0',
                      fontWeight: '500'
                    }}>
                      💡 Payment Instructions
                    </p>
                    <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                      Please visit the college office to pay your fees.
                      Bring your admission letter and ID proof.
                      Office Hours: Monday to Saturday, 9:00 AM to 5:00 PM.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No Fee Information</h3>
                  <p>Please apply for admission first.</p>
                  <br />
                  <a href="/admissions?tab=apply" className="btn btn-primary">
                    ✨ Complete Your Profile →
                  </a>
                </div>
              )}
            </div>
          )}

{/* ============ REQUEST DOCUMENTS TAB ============ */}
{activeTab === 'documents' && (
  <div>
    <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>
      📄 Request Documents
    </h3>

    {/* Student must have approved admission */}
    {!myAdmission && !admissionLoading && (
      <div style={{
        background: '#fff3e0',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #ffb74d'
      }}>
        <p style={{ fontSize: '2.5rem' }}>⚠️</p>
        <h3 style={{ color: '#E65100' }}>Application Required</h3>
        <p style={{ color: '#555' }}>
          You need to submit your admission application first before requesting documents.
        </p>
      </div>
    )}

    {myAdmission && (
      <>
        {/* Message */}
        {docMessage && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: docMessage.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: docMessage.includes('✅') ? '#2E7D32' : '#C62828',
            fontWeight: '500'
          }}>
            {docMessage}
          </div>
        )}

        {/* Request Form */}
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>📝 New Document Request</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Select the document you need. Your student details will be auto-attached.
          </p>

          {/* Student Info Card */}
          <div style={{
            background: '#f0f9ff',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #bae6fd',
            fontSize: '13px'
          }}>
            <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
              ℹ️ Auto-Attached Student Details:
            </p>
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
              <select
                value={docFormData.documentType}
                onChange={e => setDocFormData({ ...docFormData, documentType: e.target.value })}
                required
              >
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
              <textarea
                rows="3"
                placeholder="e.g. Required for next college admission, government job application, etc."
                value={docFormData.reason}
                onChange={e => setDocFormData({ ...docFormData, reason: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Urgency</label>
              <select
                value={docFormData.urgency}
                onChange={e => setDocFormData({ ...docFormData, urgency: e.target.value })}
              >
                <option value="normal">📅 Normal (7-10 days)</option>
                <option value="urgent">⚡ Urgent (1-3 days)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={docLoading} style={{ padding: '12px 32px' }}>
              {docLoading ? '⏳ Submitting...' : '🚀 Submit Request'}
            </button>
          </form>
        </div>

        {/* My Document Requests List */}
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
                <div
                  key={req._id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: `2px solid ${statusStyle.color}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ color: '#1565C0', marginBottom: '6px' }}>
                        {req.documentTypeLabel || req.documentType}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#666' }}>
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                        {req.urgency === 'urgent' && (
                          <span style={{ marginLeft: '10px', color: '#E65100', fontWeight: '600' }}>
                            ⚡ Urgent
                          </span>
                        )}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {req.reason && (
                    <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                      <strong>Reason:</strong> {req.reason}
                    </p>
                  )}

                  {/* Workflow Progress */}
                  <div style={{
                    background: '#f8faff',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '10px',
                    fontSize: '13px'
                  }}>
                    <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '8px' }}>
                      📊 Workflow Progress:
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>📝 Submitted</span>
                      <span>→</span>
                      <span style={{
                        color: req.accountsApprovedDate ? '#2E7D32' : '#999',
                        fontWeight: req.accountsApprovedDate ? '600' : '400'
                      }}>
                        {req.accountsApprovedDate ? '✅' : '⏳'} Accounts
                      </span>
                      {req.documentType === 'TC' && (
                        <>
                          <span>→</span>
                          <span style={{
                            color: req.principalApprovedDate ? '#2E7D32' : '#999',
                            fontWeight: req.principalApprovedDate ? '600' : '400'
                          }}>
                            {req.principalApprovedDate ? '✅' : '⏳'} Principal
                          </span>
                        </>
                      )}
                      <span>→</span>
                      <span style={{
                        color: req.status === 'completed' ? '#2E7D32' : '#999',
                        fontWeight: req.status === 'completed' ? '600' : '400'
                      }}>
                        {req.status === 'completed' ? '✅' : '⏳'} Student Section
                      </span>
                    </div>
                  </div>

                  {/* Rejection reason if rejected */}
                  {req.rejectionReason && (
                    <div style={{
                      background: '#ffebee',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#C62828'
                    }}>
                      <strong>❌ Rejected by {req.rejectedAt}:</strong> {req.rejectionReason}
                    </div>
                  )}

                  {/* Generation notes if completed */}
                  {req.status === 'completed' && req.generationNotes && (
                    <div style={{
                      background: '#e8f5e9',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#2E7D32'
                    }}>
                      <strong>✅ Generated by Student Section:</strong> {req.generationNotes}
                      <br />
                      <span style={{ fontSize: '12px' }}>
                        Date: {new Date(req.generatedDate).toLocaleDateString()}
                      </span>
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
{/* ============ END REQUEST DOCUMENTS TAB ============ */}

          {activeTab === 'attendance' && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Attendance Records</h3>
              <p>Your attendance will be displayed here once uploaded by staff.</p>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>Exam Results</h3>
              <p>Your results will appear here once published by the college.</p>
            </div>
          )}

          {activeTab === 'notices' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>
                All Notices ({notices.length})
              </h3>
              {notices.map(notice => (
                <div className="notice-full-card" key={notice._id}>
                  <div className="notice-full-header">
                    <h4>{notice.title}</h4>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                  <p>{notice.content}</p>
                  <small>
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="empty-msg">No notices available</p>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
