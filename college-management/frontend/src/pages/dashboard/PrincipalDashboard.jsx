import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const PrincipalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [tcRequests, setTcRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    API.get('/document-requests/principal/all')
      .then(res => setTcRequests(res.data.requests || []))
      .catch(() => {});
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/principal/approve/${selectedReq._id}`, { notes });
      showMsg('✅ ' + res.data.message);
      setSelectedReq(null);
      setActionType('');
      setNotes('');
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!notes.trim()) {
      showMsg('❌ Please provide rejection reason');
      return;
    }
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/principal/reject/${selectedReq._id}`, { reason: notes });
      showMsg('✅ ' + res.data.message);
      setSelectedReq(null);
      setActionType('');
      setNotes('');
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending_principal':
        return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending My Approval' };
      case 'rejected_by_principal':
        return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Me' };
      case 'approved_by_principal':
      case 'pending_generation':
        return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved & Forwarded' };
      case 'completed':
        return { bg: '#e3f2fd', color: '#1565C0', label: '✅ Completed' };
      default:
        return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const pendingTC = tcRequests.filter(r => r.status === 'pending_principal');
  const processedTC = tcRequests.filter(r => r.status !== 'pending_principal');

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">👨‍🏫</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Principal Office</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Dashboard</button>
          <button className={activeTab === 'tc' ? 'active' : ''} onClick={() => setActiveTab('tc')}>
            🎓 TC Approvals {pendingTC.length > 0 && <span style={{background:'#dc3545',color:'white',borderRadius:'10px',padding:'2px 8px',fontSize:'11px',marginLeft:'6px'}}>{pendingTC.length}</span>}
          </button>
          <button>📊 College Reports</button>
          <button>👥 Staff Overview</button>
          <button>📝 Admission Approvals</button>
          <button>📢 Important Notices</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>👨‍🏫 Principal Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Principal)</span></div>
        </div>

        {message && (
          <div style={{
            margin: '20px',
            padding: '14px 18px',
            borderRadius: '10px',
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2E7D32' : '#C62828',
            fontWeight: '500'
          }}>{message}</div>
        )}

        <div className="dashboard-content">

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                padding: '24px', borderRadius: '12px',
                marginBottom: '20px', borderLeft: '5px solid #C62828'
              }}>
                <h3 style={{color: '#C62828', marginBottom: '8px'}}>👨‍🏫 Welcome, {user?.name}!</h3>
                <p style={{color: '#555'}}>You are logged in as <strong>Principal</strong>. Review TC requests, monitor college operations, approve important decisions.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card orange">
                  <div className="dash-card-icon">⏳</div>
                  <div>
                    <h3>{pendingTC.length}</h3>
                    <p>Pending TC Approvals</p>
                  </div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div>
                    <h3>{processedTC.length}</h3>
                    <p>Processed TC Requests</p>
                  </div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">🎓</div>
                  <div>
                    <h3>{tcRequests.length}</h3>
                    <p>Total TC Requests</p>
                  </div>
                </div>
              </div>

              {pendingTC.length > 0 && (
                <div style={{
                  background: '#fff3e0',
                  padding: '24px',
                  borderRadius: '12px',
                  marginTop: '20px',
                  border: '2px solid #ffb74d'
                }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>
                    ⚠️ {pendingTC.length} TC Request{pendingTC.length > 1 ? 's' : ''} Awaiting Your Approval!
                  </h3>
                  <p style={{ color: '#555', marginBottom: '14px' }}>
                    Students are waiting for your final approval on Transfer Certificate requests.
                  </p>
                  <button
                    onClick={() => setActiveTab('tc')}
                    style={{
                      background: '#E65100',
                      color: 'white',
                      padding: '12px 28px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🎓 Review TC Requests Now →
                  </button>
                </div>
              )}

              <div style={{
                background: '#e3f2fd',
                padding: '24px',
                borderRadius: '12px',
                marginTop: '24px'
              }}>
                <h3 style={{ color: '#1565C0', marginBottom: '14px' }}>
                  📋 Principal Responsibilities
                </h3>
                <ul style={{ paddingLeft: '20px', color: '#555', lineHeight: '1.9' }}>
                  <li>🎓 Final approval of Transfer Certificate (TC) requests</li>
                  <li>📝 Review admission decisions</li>
                  <li>👥 Monitor staff and student section operations</li>
                  <li>📊 View college-wide reports and statistics</li>
                  <li>📢 Issue important institutional notices</li>
                </ul>
              </div>
            </div>
          )}

          {/* TC APPROVALS TAB */}
          {activeTab === 'tc' && (
            <div>
              <h2 style={{ color: '#C62828', marginBottom: '8px' }}>
                🎓 Transfer Certificate (TC) Approvals
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Review TC requests forwarded by Accounts Section. Your approval is final before document generation.
              </p>

              {/* PENDING REQUESTS */}
              <h3 style={{ color: '#E65100', marginBottom: '14px' }}>
                ⏳ Pending TC Approvals ({pendingTC.length})
              </h3>

              {pendingTC.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>All Clear!</h3>
                  <p>No TC requests pending your approval.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  {pendingTC.map(req => (
                    <div key={req._id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '2px solid #fbbf24',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ color: '#1565C0', marginBottom: '6px', fontSize: '20px' }}>
                            🎓 Transfer Certificate (TC)
                          </h4>
                          <p style={{ fontSize: '13px', color: '#666' }}>
                            Requested: {new Date(req.createdAt).toLocaleString()}
                            {req.urgency === 'urgent' && (
                              <span style={{ marginLeft: '10px', color: '#E65100', fontWeight: '600' }}>
                                ⚡ Urgent
                              </span>
                            )}
                          </p>
                        </div>
                        <span style={{
                          padding: '8px 18px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: '#fff3e0',
                          color: '#E65100'
                        }}>⏳ Pending Final Approval</span>
                      </div>

                      {/* Student Details */}
                      <div style={{
                        background: '#f0f9ff',
                        padding: '16px 20px',
                        borderRadius: '10px',
                        marginBottom: '14px',
                        border: '1px solid #bae6fd',
                        fontSize: '13px'
                      }}>
                        <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '10px' }}>
                          👤 Student Details:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <span><strong>Name:</strong> {req.studentName}</span>
                          <span><strong>Email:</strong> {req.studentEmail}</span>
                          <span><strong>Phone:</strong> {req.studentPhone || 'N/A'}</span>
                          <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                          <span><strong>Year:</strong> {req.admissionYear || 'N/A'}</span>
                          <span><strong>Batch:</strong> {req.batch || 'N/A'}</span>
                        </div>
                      </div>

                      {req.reason && (
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '14px' }}>
                          <strong>Reason for TC:</strong> {req.reason}
                        </p>
                      )}

                      {/* Accounts Approval Info */}
                      <div style={{
                        background: '#e8f5e9',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        marginBottom: '14px',
                        fontSize: '13px',
                        border: '1px solid #a5d6a7'
                      }}>
                        <p style={{ fontWeight: '600', color: '#2E7D32', marginBottom: '6px' }}>
                          ✅ Approved by Accounts Section:
                        </p>
                        <p><strong>By:</strong> {req.accountsApprovedBy}</p>
                        <p><strong>Date:</strong> {new Date(req.accountsApprovedDate).toLocaleString()}</p>
                        {req.accountsNotes && (
                          <p style={{ marginTop: '6px', fontStyle: 'italic' }}>
                            <strong>Notes:</strong> {req.accountsNotes}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                        <button
                          onClick={() => { setSelectedReq(req); setActionType('approve'); setNotes(''); }}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ Approve TC
                        </button>
                        <button
                          onClick={() => { setSelectedReq(req); setActionType('reject'); setNotes(''); }}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Reject TC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PROCESSED REQUESTS */}
              <h3 style={{ color: '#1565C0', marginBottom: '14px', marginTop: '40px' }}>
                📋 Processed TC Requests ({processedTC.length})
              </h3>

              {processedTC.length === 0 ? (
                <p style={{ color: '#888' }}>No processed TC requests yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {processedTC.map(req => {
                    const statusStyle = getStatusStyle(req.status);
                    return (
                      <div key={req._id} style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '16px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '4px' }}>
                              🎓 TC — {req.studentName}
                            </p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                              {req.studentEmail} • {req.branch} • {req.admissionYear}
                            </p>
                            {req.principalApprovedDate && (
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Processed: {new Date(req.principalApprovedDate).toLocaleDateString()} by {req.principalApprovedBy}
                              </p>
                            )}
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: statusStyle.bg,
                            color: statusStyle.color
                          }}>{statusStyle.label}</span>
                        </div>
                        {req.principalNotes && (
                          <p style={{ fontSize: '13px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>
                            <strong>My Notes:</strong> {req.principalNotes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* APPROVAL/REJECTION MODAL */}
      {selectedReq && actionType && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px'
        }} onClick={() => { setSelectedReq(null); setActionType(''); setNotes(''); }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '30px',
            maxWidth: '500px', width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{
              color: actionType === 'approve' ? '#28a745' : '#dc3545',
              marginBottom: '14px'
            }}>
              {actionType === 'approve' ? '✅ Approve TC Request' : '❌ Reject TC Request'}
            </h2>

            <div style={{ background: '#f8faff', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              <p><strong>Student:</strong> {selectedReq.studentName}</p>
              <p><strong>Document:</strong> 🎓 Transfer Certificate (TC)</p>
              <p><strong>Email:</strong> {selectedReq.studentEmail}</p>
              <p><strong>Branch:</strong> {selectedReq.branch} • {selectedReq.admissionYear}</p>
            </div>

            {actionType === 'approve' && (
              <div style={{
                background: '#e8f5e9',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '14px',
                fontSize: '13px',
                color: '#2E7D32'
              }}>
                ✅ Your final approval will allow Student Section to generate this TC and issue it to the student.
              </div>
            )}

            <div className="form-group">
              <label>{actionType === 'approve' ? 'Notes (optional)' : 'Rejection Reason *'}</label>
              <textarea
                rows="3"
                placeholder={actionType === 'approve' ? 'Any additional notes...' : 'Why are you rejecting this TC request?'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={loading}
                style={{
                  background: actionType === 'approve' ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Processing...' : (actionType === 'approve' ? '✅ Confirm Approve' : '❌ Confirm Reject')}
              </button>
              <button
                onClick={() => { setSelectedReq(null); setActionType(''); setNotes(''); }}
                style={{
                  background: '#eee',
                  color: '#333',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;
