import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const StudentSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // Enquiry states
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await API.get('/enquiries');
      if (res.data.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'enquiries' || activeTab === 'home') {
      fetchEnquiries();
    }
  }, [activeTab]);

  // Update enquiry status
  const handleStatusUpdate = async (id) => {
    if (!statusUpdate.status) {
      setUpdateMsg('❌ Please select a status.');
      return;
    }
    setUpdateLoading(true);
    setUpdateMsg('');
    try {
      const res = await API.put(`/enquiries/${id}`, {
        status: statusUpdate.status,
        notes: statusUpdate.notes,
      });
      if (res.data.success) {
        setUpdateMsg('✅ Status updated successfully!');
        fetchEnquiries();
        setTimeout(() => {
          setSelectedEnquiry(null);
          setStatusUpdate({ status: '', notes: '' });
          setUpdateMsg('');
        }, 1500);
      }
    } catch (err) {
      setUpdateMsg('❌ Failed to update. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete enquiry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await API.delete(`/enquiries/${id}`);
      fetchEnquiries();
      setSelectedEnquiry(null);
    } catch (err) {
      alert('Failed to delete enquiry.');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending:            { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' },
      contacted:          { bg: '#e3f2fd', color: '#1565C0', label: '📞 Contacted' },
      credentials_issued: { bg: '#e8f5e9', color: '#2E7D32', label: '🔑 Credentials Issued' },
      converted:          { bg: '#f3e5f5', color: '#6A1B9A', label: '🎓 Converted' },
      rejected:           { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    };
    return styles[status] || { bg: '#f5f5f5', color: '#555', label: status };
  };

  // Filter enquiries
  const filteredEnquiries = enquiries.filter(e => {
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchSearch = !searchText ||
      e.studentFullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.phone?.includes(searchText);
    return matchStatus && matchSearch;
  });

  const pendingCount = enquiries.filter(e => e.status === 'pending').length;
  const contactedCount = enquiries.filter(e => e.status === 'contacted').length;
  const convertedCount = enquiries.filter(e => e.status === 'converted').length;

  const tabs = [
    { id: 'home',      label: '🏠 Dashboard' },
    { id: 'enquiries', label: '📝 Admission Enquiries' },
    { id: 'credentials', label: '👥 Generate Credentials' },
    { id: 'documents',  label: '📋 Document Verification' },
    { id: 'carryforward', label: '🎓 SY/TY Carry Forward' },
    { id: 'tc',         label: '📄 Generate TC' },
    { id: 'bonafide',   label: '📜 Generate Bonafide' },
    { id: 'idcard',     label: '🪪 Generate ID Card' },
    { id: 'prn',        label: '🔢 Update PRN/ABC ID' },
    { id: 'students',   label: '👩‍🎓 All Students' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">👩‍🎓</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Student Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'enquiries' && pendingCount > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: '#C62828',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info"><span>👋 {user?.name} (Student Section Staff)</span></div>
        </div>

        <div className="dashboard-content">

          {/* ============= HOME TAB ============= */}
          {activeTab === 'home' && (
            <div>
              <div style={{
                background: '#e3f2fd', padding: '20px', borderRadius: '12px',
                marginBottom: '20px', borderLeft: '5px solid #1565C0'
              }}>
                <h3 style={{ color: '#1565C0', marginBottom: '8px' }}>👋 Welcome to Student Section!</h3>
                <p>Manage student admissions, verify documents, generate certificates, and maintain student records.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('enquiries')}>
                  <div className="dash-card-icon">📝</div>
                  <div><h3>{pendingCount}</h3><p>Pending Enquiries</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">📞</div>
                  <div><h3>{contactedCount}</h3><p>Contacted</p></div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">🎓</div>
                  <div><h3>{convertedCount}</h3><p>Converted</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">📊</div>
                  <div><h3>{enquiries.length}</h3><p>Total Enquiries</p></div>
                </div>
              </div>

              {/* Recent Pending Enquiries on Home */}
              {pendingCount > 0 && (
                <div className="recent-section" style={{ marginTop: '24px' }}>
                  <h3>⏳ Recent Pending Enquiries</h3>
                  {enquiries
                    .filter(e => e.status === 'pending')
                    .slice(0, 5)
                    .map(enq => (
                      <div key={enq._id} className="notice-row" style={{ cursor: 'pointer' }}
                        onClick={() => { setActiveTab('enquiries'); setSelectedEnquiry(enq); setStatusUpdate({ status: enq.status, notes: enq.notes || '' }); }}>
                        <span className="notice-dot"></span>
                        <div>
                          <p className="notice-title">{enq.studentFullName}</p>
                          <p className="notice-date">{enq.phone} · {enq.email}</p>
                        </div>
                        <span className="notice-tag">Pending</span>
                      </div>
                    ))}
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    style={{
                      marginTop: '12px', background: 'none', border: '1px solid #1565C0',
                      color: '#1565C0', borderRadius: '8px', padding: '8px 18px',
                      cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                    }}>
                    View All Enquiries →
                  </button>
                </div>
              )}

              <h3 style={{ margin: '30px 0 16px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  { label: '📝 Admission Enquiries', sub: 'View & manage student enquiries', tab: 'enquiries', tag: 'Most Used' },
                  { label: '👥 Generate Login', sub: 'Create student login credentials', tab: 'credentials', tag: 'Quick' },
                  { label: '📋 Verify Documents', sub: 'Review uploaded student documents', tab: 'documents', tag: 'Important' },
                  { label: '📄 Generate TC', sub: 'Issue Transfer Certificate', tab: 'tc', tag: 'Auto' },
                ].map((item, i) => (
                  <div key={i} className="event-card" style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab(item.tab)}>
                    <span className="notice-tag">{item.tag}</span>
                    <h4>{item.label}</h4>
                    <p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============= ENQUIRIES TAB ============= */}
          {activeTab === 'enquiries' && (
            <div>
              {/* Detail Modal / Panel */}
              {selectedEnquiry && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px'
                }}>
                  <div style={{
                    background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
                    maxHeight: '90vh', overflowY: 'auto', padding: '28px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ color: '#1565C0', margin: 0 }}>📋 Enquiry Details</h3>
                      <button onClick={() => { setSelectedEnquiry(null); setStatusUpdate({ status: '', notes: '' }); setUpdateMsg(''); }}
                        style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555' }}>✕</button>
                    </div>

                    {/* Student Info */}
                    <div style={{ background: '#f8faff', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      {[
                        { label: 'Full Name', value: selectedEnquiry.studentFullName },
                        { label: 'Gender', value: selectedEnquiry.gender?.charAt(0).toUpperCase() + selectedEnquiry.gender?.slice(1) },
                        { label: 'Email', value: selectedEnquiry.email },
                        { label: 'Mobile', value: selectedEnquiry.phone },
                        { label: 'Submitted On', value: new Date(selectedEnquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                      ].map((row, i) => (
                        <div key={i} className="fees-info-row">
                          <span className="fees-info-label">{row.label}</span>
                          <span className="fees-info-value">{row.value || '—'}</span>
                        </div>
                      ))}
                      {/* Current Status */}
                      <div className="fees-info-row">
                        <span className="fees-info-label">Current Status</span>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                          fontWeight: '600',
                          background: getStatusStyle(selectedEnquiry.status).bg,
                          color: getStatusStyle(selectedEnquiry.status).color,
                        }}>
                          {getStatusStyle(selectedEnquiry.status).label}
                        </span>
                      </div>
                    </div>

                    {/* Notes from student */}
                    {selectedEnquiry.notes && (
                      <div style={{ background: '#fffde7', borderRadius: '8px', padding: '12px', marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>💬 Student Message:</p>
                        <p style={{ fontSize: '13px', color: '#555' }}>{selectedEnquiry.notes}</p>
                      </div>
                    )}

                    {/* Update Status */}
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                      <h4 style={{ color: '#333', marginBottom: '12px' }}>🔄 Update Status</h4>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>New Status *</label>
                        <select
                          value={statusUpdate.status}
                          onChange={e => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                        >
                          <option value="">Select Status</option>
                          <option value="pending">⏳ Pending</option>
                          <option value="contacted">📞 Contacted</option>
                          <option value="credentials_issued">🔑 Credentials Issued</option>
                          <option value="converted">🎓 Converted (Admission Done)</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Staff Notes</label>
                        <textarea
                          rows="3"
                          placeholder="Add internal notes (e.g. Called student, sent info, asked to visit...)"
                          value={statusUpdate.notes}
                          onChange={e => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>

                      {updateMsg && (
                        <div style={{
                          padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px',
                          background: updateMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
                          color: updateMsg.startsWith('✅') ? '#2E7D32' : '#C62828',
                        }}>
                          {updateMsg}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleStatusUpdate(selectedEnquiry._id)}
                          disabled={updateLoading}
                          style={{
                            flex: 1, padding: '11px', background: '#1565C0', color: '#fff',
                            border: 'none', borderRadius: '9px', fontWeight: '600',
                            fontSize: '14px', cursor: updateLoading ? 'not-allowed' : 'pointer',
                            opacity: updateLoading ? 0.7 : 1
                          }}>
                          {updateLoading ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                        <button
                          onClick={() => handleDelete(selectedEnquiry._id)}
                          style={{
                            padding: '11px 18px', background: '#ffebee', color: '#C62828',
                            border: '1px solid #C62828', borderRadius: '9px',
                            fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                          }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter + Search bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by name, email or phone..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{
                    flex: 1, minWidth: '200px', padding: '10px 14px',
                    borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px'
                  }}
                />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="credentials_issued">🔑 Credentials Issued</option>
                  <option value="converted">🎓 Converted</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                <button
                  onClick={fetchEnquiries}
                  style={{
                    padding: '10px 18px', background: '#e3f2fd', color: '#1565C0',
                    border: '1px solid #90CAF9', borderRadius: '9px',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                  }}>
                  🔄 Refresh
                </button>
              </div>

              {/* Summary pills */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total', count: enquiries.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Pending', count: pendingCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Contacted', count: contactedCount, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Converted', count: convertedCount, color: '#2E7D32', bg: '#e8f5e9' },
                ].map((pill, i) => (
                  <div key={i} style={{
                    background: pill.bg, color: pill.color, borderRadius: '20px',
                    padding: '6px 16px', fontSize: '13px', fontWeight: '600'
                  }}>
                    {pill.label}: {pill.count}
                  </div>
                ))}
              </div>

              {/* Enquiry List */}
              {enquiriesLoading ? (
                <div className="empty-state">
                  <p style={{ fontSize: '2rem' }}>⏳</p>
                  <h3>Loading enquiries...</h3>
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Enquiries Found</h3>
                  <p>{searchText || filterStatus !== 'all' ? 'Try changing your search or filter.' : 'No student enquiries submitted yet.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredEnquiries.map(enq => {
                    const s = getStatusStyle(enq.status);
                    return (
                      <div key={enq._id}
                        onClick={() => { setSelectedEnquiry(enq); setStatusUpdate({ status: enq.status, notes: enq.notes || '' }); setUpdateMsg(''); }}
                        style={{
                          background: '#fff', border: '1px solid #e0e0e0',
                          borderRadius: '12px', padding: '16px 20px',
                          cursor: 'pointer', transition: 'box-shadow 0.2s',
                          display: 'flex', alignItems: 'center', gap: '16px',
                          borderLeft: `4px solid ${s.color}`,
                        }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '50%',
                          background: s.bg, color: s.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', flexShrink: 0
                        }}>
                          {enq.gender === 'female' ? '👩' : enq.gender === 'male' ? '👨' : '🧑'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#222' }}>
                              {enq.studentFullName}
                            </h4>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                              fontWeight: '600', background: s.bg, color: s.color
                            }}>
                              {s.label}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                            📧 {enq.email} · 📱 {enq.phone}
                          </p>
                          {enq.notes && (
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              💬 {enq.notes}
                            </p>
                          )}
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p style={{ fontSize: '12px', color: '#1565C0', marginTop: '4px', fontWeight: '600' }}>
                            View →
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============= OTHER TABS (Coming Soon) ============= */}
          {!['home', 'enquiries'].includes(activeTab) && (
            <div className="empty-state">
              <div className="empty-icon">🚧</div>
              <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p>This feature is under development. Coming soon!</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentSectionDashboard;
