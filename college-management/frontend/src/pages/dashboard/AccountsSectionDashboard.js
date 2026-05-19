import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const AccountsSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [docRequests, setDocRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    API.get('/document-requests/accounts/all')
      .then(res => setDocRequests(res.data.requests || []))
      .catch(() => {});
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // Approve request
  const handleApprove = async () => {
    if (!selectedReq) return;
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/accounts/approve/${selectedReq._id}`, { notes });
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

  // Reject request
  const handleReject = async () => {
    if (!selectedReq) return;
    if (!notes.trim()) {
      showMsg('❌ Please provide rejection reason');
      return;
    }
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/accounts/reject/${selectedReq._id}`, { reason: notes });
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
      case 'pending_accounts':
        return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Review' };
      case 'rejected_by_accounts':
        return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Me' };
      case 'approved_by_accounts':
      case 'pending_principal':
      case 'pending_generation':
        return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved & Forwarded' };
      case 'completed':
        return { bg: '#e3f2fd', color: '#1565C0', label: '✅ Completed' };
      default:
        return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const pendingRequests = docRequests.filter(r => r.status === 'pending_accounts');
  const processedRequests = docRequests.filter(r => r.status !== 'pending_accounts');

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
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Dashboard</button>
          <button className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
            📄 Document Requests {pendingRequests.length > 0 && <span style={{background:'#dc3545',color:'white',borderRadius:'10px',padding:'2px 8px',fontSize:'11px',marginLeft:'6px'}}>{pendingRequests.length}</span>}
          </button>
          <button>💵 Fees Collection</button>
          <button>🧾 Generate Receipts</button>
          <button>📊 Outstanding Dues</button>
          <button>💳 Payment History</button>
          <button>📈 Financial Reports</button>
          <button>💼 Fee Structure</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
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
                background: '#e8f5e9', padding: '20px', borderRadius: '12px',
                marginBottom: '20px', borderLeft: '5px solid #2E7D32'
              }}>
                <h3 style={{color: '#2E7D32', marginBottom: '8px'}}>💰 Welcome to Accounts Section!</h3>
                <p>Manage fees collection, approve document requests, generate receipts, track payments.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card orange">
                  <div className="dash-card-icon">⏳</div>
                  <div>
                    <h3>{pendingRequests.length}</h3>
                    <p>Pending Document Requests</p>
                  </div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div>
                    <h3>{processedRequests.length}</h3>
                    <p>Processed Requests</p>
                  </div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">📊</div>
                  <div>
                    <h3>{docRequests.length}</h3>
                    <p>Total Requests</p>
                  </div>
                </div>
              </div>

              {pendingRequests.length > 0 && (
                <div style={{
                  background: '#fff3e0',
                  padding: '20px',
                  borderRadius: '12px',
                  marginTop: '20px',
                  border: '2px solid #ffb74d'
                }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>
                    ⚠️ {pendingRequests.length} Pending Document Request{pendingRequests.length > 1 ? 's' : ''}!
                  </h3>
                  <p style={{ color: '#555', marginBottom: '14px' }}>
                    Students are waiting for your approval. Please review them now.
                  </p>
                  <button
                    onClick={() => setActiveTab('documents')}
                    style={{
                      background: '#E65100',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📄 Review Requests Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENT REQUESTS TAB */}
          {activeTab === 'documents' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: '8px' }}>
                📄 Document Requests
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Review student document requests. Approve to forward, or reject with reason.
              </p>

              {/* PENDING REQUESTS */}
              <h3 style={{ color: '#E65100', marginBottom: '14px' }}>
                ⏳ Pending Requests ({pendingRequests.length})
              </h3>

              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>All Caught Up!</h3>
                  <p>No pending document requests right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  {pendingRequests.map(req => (
                    <div key={req._id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '2px solid #fbbf24',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ color: '#1565C0', marginBottom: '6px', fontSize: '18px' }}>
                            {req.documentTypeLabel || req.documentType}
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
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: '#fff3e0',
                          color: '#E65100'
                        }}>⏳ Pending Review</span>
                      </div>

                      {/* Student Details Auto-Filled */}
                      <div style={{
                        background: '#f0f9ff',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        marginBottom: '14px',
                        border: '1px solid #bae6fd',
                        fontSize: '13px'
                      }}>
                        <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
                          👤 Student Details:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                          <strong>Reason:</strong> {req.reason}
                        </p>
                      )}

                      {/* TC Warning */}
                      {req.documentType === 'TC' && (
                        <div style={{
                          background: '#fef3c7',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          marginBottom: '14px',
                          fontSize: '13px',
                          color: '#92400e'
                        }}>
                          ⚠️ <strong>TC Workflow:</strong> If you approve, request will go to Principal for final approval.
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setSelectedReq(req); setActionType('approve'); setNotes(''); }}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => { setSelectedReq(req); setActionType('reject'); setNotes(''); }}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PROCESSED REQUESTS */}
              <h3 style={{ color: '#1565C0', marginBottom: '14px', marginTop: '40px' }}>
                📋 Processed Requests ({processedRequests.length})
              </h3>

              {processedRequests.length === 0 ? (
                <p style={{ color: '#888' }}>No processed requests yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {processedRequests.map(req => {
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
                              {req.documentTypeLabel} — {req.studentName}
                            </p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                              {req.studentEmail} • {req.branch} • {req.admissionYear}
                            </p>
                            {req.accountsApprovedDate && (
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Processed on: {new Date(req.accountsApprovedDate).toLocaleDateString()} by {req.accountsApprovedBy}
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
                        {req.accountsNotes && (
                          <p style={{ fontSize: '13px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>
                            <strong>Notes:</strong> {req.accountsNotes}
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
              {actionType === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
            </h2>

            <div style={{ background: '#f8faff', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              <p><strong>Student:</strong> {selectedReq.studentName}</p>
              <p><strong>Document:</strong> {selectedReq.documentTypeLabel}</p>
              <p><strong>Email:</strong> {selectedReq.studentEmail}</p>
            </div>

            {actionType === 'approve' && selectedReq.documentType === 'TC' && (
              <div style={{
                background: '#fef3c7',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '14px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                ⚠️ This is a TC request. After your approval, it will go to <strong>Principal</strong> for final approval.
              </div>
            )}

            <div className="form-group">
              <label>{actionType === 'approve' ? 'Notes (optional)' : 'Rejection Reason *'}</label>
              <textarea
                rows="3"
                placeholder={actionType === 'approve' ? 'Any notes for next stage...' : 'Why are you rejecting this request?'}
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

export default AccountsSectionDashboard;
