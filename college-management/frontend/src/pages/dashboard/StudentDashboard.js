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

  // Admission states
  const [admissions, setAdmissions] = useState([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [admActionType, setAdmActionType] = useState('');
  const [admNotes, setAdmNotes] = useState('');
  const [admLoading, setAdmLoading] = useState(false);
  const [admMsg, setAdmMsg] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await API.get('/enquiries');
      if (res.data.success) setEnquiries(res.data.enquiries || []);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Fetch pending admissions
  const fetchAdmissions = async () => {
    setAdmissionsLoading(true);
    try {
      const res = await API.get('/admissions/student-section/pending');
      if (res.data.success) setAdmissions(res.data.admissions || []);
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  useEffect(() => {
    if (['enquiries', 'home'].includes(activeTab)) fetchEnquiries();
    if (['admissions', 'home'].includes(activeTab)) fetchAdmissions();
  }, [activeTab]);

  // Enquiry status update
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

  // Admission Approve
  const handleAdmApprove = async () => {
    if (!selectedAdmission) return;
    setAdmLoading(true);
    try {
      const res = await API.put(`/admissions/staff-approve/${selectedAdmission._id}`, { notes: admNotes });
      setAdmMsg('✅ ' + res.data.message);
      setTimeout(() => {
        setSelectedAdmission(null);
        setAdmActionType('');
        setAdmNotes('');
        setAdmMsg('');
        fetchAdmissions();
      }, 1500);
    } catch (err) {
      setAdmMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setAdmLoading(false);
    }
  };

  // Admission Reject
  const handleAdmReject = async () => {
    if (!selectedAdmission) return;
    if (!admNotes.trim()) {
      setAdmMsg('❌ Please provide rejection reason');
      return;
    }
    setAdmLoading(true);
    try {
      const res = await API.put(`/admissions/staff-reject/${selectedAdmission._id}`, { reason: admNotes });
      setAdmMsg('✅ ' + res.data.message);
      setTimeout(() => {
        setSelectedAdmission(null);
        setAdmActionType('');
        setAdmNotes('');
        setAdmMsg('');
        fetchAdmissions();
      }, 1500);
    } catch (err) {
      setAdmMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setAdmLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' },
      contacted: { bg: '#e3f2fd', color: '#1565C0', label: '📞 Contacted' },
      credentials_issued: { bg: '#e8f5e9', color: '#2E7D32', label: '🔑 Credentials Issued' },
      converted: { bg: '#f3e5f5', color: '#6A1B9A', label: '🎓 Converted' },
      rejected: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    };
    return styles[status] || { bg: '#f5f5f5', color: '#555', label: status };
  };

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

  // Document URL helper
  const docUrl = (filename) => `https://college-management-nnve.onrender.com/uploads/${filename}`;

  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'enquiries', label: '📝 Admission Enquiries' },
    { id: 'admissions', label: '🎓 Pending Admissions' },
    { id: 'credentials', label: '👥 Generate Credentials' },
    { id: 'documents', label: '📋 Document Verification' },
    { id: 'carryforward', label: '🎓 SY/TY Carry Forward' },
    { id: 'tc', label: '📄 Generate TC' },
    { id: 'bonafide', label: '📜 Generate Bonafide' },
    { id: 'idcard', label: '🪪 Generate ID Card' },
    { id: 'prn', label: '🔢 Update PRN/ABC ID' },
    { id: 'students', label: '👩‍🎓 All Students' },
  ];

  // Document fields for admission view
  const docFields = [
    { key: 'studentPhoto', label: '📸 Student Photo' },
    { key: 'signaturePhoto', label: '✍️ Signature' },
    { key: 'aadharPhoto', label: '🪪 Aadhar Card' },
    { key: 'sscMarksheet', label: '📄 SSC Marksheet' },
    { key: 'hscMarksheet', label: '📄 HSC Marksheet' },
    { key: 'prevYearMarksheet', label: '📄 Previous Year Marksheet' },
    { key: 'gapCertificate', label: '📅 Gap Certificate' },
    { key: 'casteCertificate', label: '📋 Caste Certificate' },
    { key: 'casteValidityCertificate', label: '✅ Caste Validity' },
    { key: 'domicileCertificate', label: '🏠 Domicile Certificate' },
    { key: 'incomeCertificate', label: '💰 Income Certificate' },
    { key: 'transferCertificate', label: '📜 Transfer Certificate' },
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
                <span style={{ marginLeft: '8px', background: '#C62828', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {pendingCount}
                </span>
              )}
              {tab.id === 'admissions' && admissions.length > 0 && (
                <span style={{ marginLeft: '8px', background: '#C62828', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {admissions.length}
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
              <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #1565C0' }}>
                <h3 style={{ color: '#1565C0', marginBottom: '8px' }}>👋 Welcome to Student Section!</h3>
                <p>Manage student admissions, verify documents, generate certificates, and maintain student records.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admissions')}>
                  <div className="dash-card-icon">🎓</div>
                  <div><h3>{admissions.length}</h3><p>Pending Admissions</p></div>
                </div>
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('enquiries')}>
                  <div className="dash-card-icon">📝</div>
                  <div><h3>{pendingCount}</h3><p>Pending Enquiries</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">📞</div>
                  <div><h3>{contactedCount}</h3><p>Contacted</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">🎓</div>
                  <div><h3>{convertedCount}</h3><p>Converted</p></div>
                </div>
              </div>

              {admissions.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', marginTop: '24px', border: '2px solid #ffb74d' }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>
                    ⚠️ {admissions.length} Admission Form{admissions.length > 1 ? 's' : ''} Pending Review!
                  </h3>
                  <p style={{ color: '#555', marginBottom: '14px' }}>
                    Review admission forms, verify documents, and forward to Principal.
                  </p>
                  <button onClick={() => setActiveTab('admissions')}
                    style={{ background: '#E65100', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    🎓 Review Admissions Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============= ENQUIRIES TAB ============= */}
          {activeTab === 'enquiries' && (
            <div>
              {selectedEnquiry && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ color: '#1565C0', margin: 0 }}>📋 Enquiry Details</h3>
                      <button onClick={() => { setSelectedEnquiry(null); setStatusUpdate({ status: '', notes: '' }); setUpdateMsg(''); }}
                        style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555' }}>✕</button>
                    </div>
                    <div style={{ background: '#f8faff', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      {[
                        { label: 'Full Name', value: selectedEnquiry.studentFullName },
                        { label: 'Email', value: selectedEnquiry.email },
                        { label: 'Mobile', value: selectedEnquiry.phone },
                      ].map((row, i) => (
                        <div key={i} className="fees-info-row">
                          <span className="fees-info-label">{row.label}</span>
                          <span className="fees-info-value">{row.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                      <h4 style={{ color: '#333', marginBottom: '12px' }}>🔄 Update Status</h4>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>New Status *</label>
                        <select value={statusUpdate.status}
                          onChange={e => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
                          <option value="">Select Status</option>
                          <option value="pending">⏳ Pending</option>
                          <option value="contacted">📞 Contacted</option>
                          <option value="credentials_issued">🔑 Credentials Issued</option>
                          <option value="converted">🎓 Converted</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Staff Notes</label>
                        <textarea rows="3" placeholder="Add internal notes..."
                          value={statusUpdate.notes}
                          onChange={e => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }} />
                      </div>
                      {updateMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: updateMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: updateMsg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
                          {updateMsg}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleStatusUpdate(selectedEnquiry._id)} disabled={updateLoading}
                          style={{ flex: 1, padding: '11px', background: '#1565C0', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                          {updateLoading ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                        <button onClick={() => handleDelete(selectedEnquiry._id)}
                          style={{ padding: '11px 18px', background: '#ffebee', color: '#C62828', border: '1px solid #C62828', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="🔍 Search by name, email or phone..."
                  value={searchText} onChange={e => setSearchText(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px' }}>
                  <option value="all">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="converted">🎓 Converted</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                <button onClick={fetchEnquiries}
                  style={{ padding: '10px 18px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '9px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {enquiriesLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Enquiries Found</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredEnquiries.map(enq => {
                    const s = getStatusStyle(enq.status);
                    return (
                      <div key={enq._id}
                        onClick={() => { setSelectedEnquiry(enq); setStatusUpdate({ status: enq.status, notes: enq.notes || '' }); setUpdateMsg(''); }}
                        style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          {enq.gender === 'female' ? '👩' : enq.gender === 'male' ? '👨' : '🧑'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#222' }}>{enq.studentFullName}</h4>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: s.bg, color: s.color }}>{s.label}</span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>📧 {enq.email} · 📱 {enq.phone}</p>
                        </div>
                        <p style={{ fontSize: '12px', color: '#1565C0', fontWeight: '600' }}>View →</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============= ADMISSIONS TAB ============= */}
          {activeTab === 'admissions' && (
            <div>
              <h3 style={{ marginBottom: '8px', color: '#1565C0' }}>🎓 Pending Admission Forms</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Review full admission form, verify documents, then approve to forward to Principal.
              </p>

              {admissionsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading admissions...</h3></div>
              ) : admissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Pending Admissions</h3>
                  <p>All admission forms have been processed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {admissions.map(adm => (
                    <div key={adm._id}
                      style={{ background: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e0e0e0', borderLeft: '4px solid #E65100', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ color: '#1565C0', marginBottom: '6px' }}>{adm.applicantName}</h4>
                        <p style={{ fontSize: '13px', color: '#666' }}>
                          📧 {adm.email} · 📱 {adm.phone}
                        </p>
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                          Applied: {new Date(adm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => { setSelectedAdmission(adm); setAdmActionType(''); setAdmNotes(''); setAdmMsg(''); }}
                        style={{ background: '#1565C0', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                        👁️ View Full Form
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============= OTHER TABS (Coming Soon) ============= */}
          {!['home', 'enquiries', 'admissions'].includes(activeTab) && (
            <div className="empty-state">
              <div className="empty-icon">🚧</div>
              <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p>This feature is under development. Coming soon!</p>
            </div>
          )}

        </div>
      </main>

      {/* ============= ADMISSION FULL VIEW MODAL ============= */}
      {selectedAdmission && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => { setSelectedAdmission(null); setAdmActionType(''); setAdmNotes(''); setAdmMsg(''); }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '30px' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1565C0', margin: 0 }}>🎓 Admission Form</h2>
              <button onClick={() => { setSelectedAdmission(null); setAdmActionType(''); setAdmNotes(''); setAdmMsg(''); }}
                style={{ background: '#eee', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            {/* Personal Info */}
            <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '16px' }}>👤 Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8faff', padding: '16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
              <p><strong>Name:</strong> {selectedAdmission.applicantName || '—'}</p>
              <p><strong>Email:</strong> {selectedAdmission.email || '—'}</p>
              <p><strong>Phone:</strong> {selectedAdmission.phone || '—'}</p>
              <p><strong>DOB:</strong> {selectedAdmission.dateOfBirth ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString() : '—'}</p>
              <p><strong>Gender:</strong> {selectedAdmission.gender || '—'}</p>
              <p><strong>Category:</strong> {selectedAdmission.category?.toUpperCase() || '—'}</p>
              <p><strong>Aadhar No:</strong> {selectedAdmission.aadharNumber || '—'}</p>
              <p><strong>Course Type:</strong> {selectedAdmission.courseType || '—'}</p>
            </div>

            {/* Address */}
            <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '16px' }}>🏠 Address</h3>
            <div style={{ background: '#f8faff', padding: '16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
              <p><strong>Address:</strong> {selectedAdmission.address || '—'}</p>
              <p><strong>City:</strong> {selectedAdmission.city || '—'} · <strong>District:</strong> {selectedAdmission.district || '—'}</p>
              <p><strong>Pincode:</strong> {selectedAdmission.pincode || '—'}</p>
            </div>

            {/* Parent Info */}
            <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '16px' }}>👨‍👩‍👧 Parent Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8faff', padding: '16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
              <p><strong>Father:</strong> {selectedAdmission.fatherName || '—'}</p>
              <p><strong>Mother:</strong> {selectedAdmission.motherName || '—'}</p>
              <p><strong>Parent Mobile:</strong> {selectedAdmission.parentMobile || '—'}</p>
              <p><strong>Annual Income:</strong> {selectedAdmission.annualIncome || '—'}</p>
            </div>

            {/* Academic */}
            <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '16px' }}>📚 Academic Details</h3>
            <div style={{ background: '#f8faff', padding: '16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
              <p style={{ fontWeight: '600', marginBottom: '6px' }}>SSC (10th):</p>
              <p>School: {selectedAdmission.sscSchoolName || '—'} · Board: {selectedAdmission.sscBoard || '—'} · Year: {selectedAdmission.sscYOP || '—'} · {selectedAdmission.sscPercentage ? selectedAdmission.sscPercentage + '%' : '—'}</p>
              <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>HSC (12th):</p>
              <p>College: {selectedAdmission.hscCollegeName || '—'} · Board: {selectedAdmission.hscBoard || '—'} · Year: {selectedAdmission.hscYOP || '—'} · {selectedAdmission.hscPercentage ? selectedAdmission.hscPercentage + '%' : '—'}</p>
            </div>

            {/* Documents */}
            <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '16px' }}>📎 Uploaded Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {docFields.map(doc => {
                if (!selectedAdmission[doc.key]) return null;
                return (
                  <div key={doc.key} style={{ background: '#f8faff', border: '1px solid #e3f2fd', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <img src={docUrl(selectedAdmission[doc.key])} alt={doc.label}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    <p style={{ fontSize: '11px', color: '#1565C0', fontWeight: '500', marginBottom: '4px' }}>{doc.label}</p>
                    <a href={docUrl(selectedAdmission[doc.key])} target="_blank" rel="noreferrer"
                      style={{ fontSize: '11px', color: '#1565C0', textDecoration: 'underline' }}>View Full</a>
                  </div>
                );
              })}
              {docFields.every(doc => !selectedAdmission[doc.key]) && (
                <p style={{ color: '#888', gridColumn: '1/-1' }}>No documents uploaded</p>
              )}
            </div>

            {/* Message */}
            {admMsg && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: admMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: admMsg.startsWith('✅') ? '#2E7D32' : '#C62828', fontWeight: '500' }}>
                {admMsg}
              </div>
            )}

            {/* Action Section */}
            {!admActionType ? (
              <div style={{ display: 'flex', gap: '12px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <button onClick={() => setAdmActionType('approve')}
                  style={{ background: '#28a745', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  ✅ Approve & Forward to Principal
                </button>
                <button onClick={() => setAdmActionType('reject')}
                  style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  ❌ Reject
                </button>
              </div>
            ) : (
              <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h4 style={{ color: admActionType === 'approve' ? '#28a745' : '#dc3545', marginBottom: '12px' }}>
                  {admActionType === 'approve' ? '✅ Approve Admission' : '❌ Reject Admission'}
                </h4>
                {admActionType === 'approve' && (
                  <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#2E7D32' }}>
                    ℹ️ After approval, this form will go to Principal for final approval and Student ID generation.
                  </div>
                )}
                <textarea rows="3"
                  placeholder={admActionType === 'approve' ? 'Notes for Principal (optional)...' : 'Rejection reason (required)...'}
                  value={admNotes} onChange={e => setAdmNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={admActionType === 'approve' ? handleAdmApprove : handleAdmReject} disabled={admLoading}
                    style={{ background: admActionType === 'approve' ? '#28a745' : '#dc3545', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: admLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: admLoading ? 0.6 : 1 }}>
                    {admLoading ? '⏳ Processing...' : (admActionType === 'approve' ? '✅ Confirm Approve' : '❌ Confirm Reject')}
                  </button>
                  <button onClick={() => { setAdmActionType(''); setAdmNotes(''); }}
                    style={{ background: '#eee', color: '#333', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSectionDashboard;
