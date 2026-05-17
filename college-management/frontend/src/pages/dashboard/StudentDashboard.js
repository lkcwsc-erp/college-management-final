
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
  } else {
    setAdmissionLoading(false);
  }
}, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'application', label: '📋 My Application' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'fees', label: '💰 My Fees' },
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

                      {/* Complete Your Form Button */}
                      {percentage < 100 && (
                        <button
                          onClick={() => navigate('/admissions')}
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
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Application Found</h3>
                  <p>You have not applied for admission yet.</p>
                  <br />
                  <a href="/admissions" className="btn btn-primary">
                    Apply Now
                  </a>
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
                  <a href="/admissions" className="btn btn-primary">
                    Apply for Admission
                  </a>
                </div>
              )}
            </div>
          )}

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
