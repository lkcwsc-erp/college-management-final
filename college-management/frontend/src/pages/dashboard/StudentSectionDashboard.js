import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ─── Admission Detail Modal ───────────────────────────────────────────────────
const AdmissionModal = ({ adm, onClose, onRefresh }) => {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setMsg('');
    try {
      await API.put(`/admissions/staff-approve/${adm._id}`, { notes });
      setMsg('✅ Approved! Forwarded to Principal.');
      setTimeout(() => { onClose(); onRefresh(); }, 1500);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Approval failed.'));
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setMsg('❌ Please enter rejection reason.'); return; }
    setLoading(true);
    setMsg('');
    try {
      await API.put(`/admissions/staff-reject/${adm._id}`, { reason: rejectReason });
      setMsg('✅ Application rejected.');
      setTimeout(() => { onClose(); onRefresh(); }, 1500);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Rejection failed.'));
    }
    setLoading(false);
  };

  const Field = ({ label, value }) => (
    <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ width: '180px', flexShrink: 0, fontSize: '13px', color: '#888', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#333' }}>{value || '—'}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ color: '#1565C0', borderBottom: '2px solid #e3f2fd', paddingBottom: '6px', marginBottom: '10px' }}>{title}</h4>
      {children}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px',
        maxHeight: '90vh', overflowY: 'auto', padding: '28px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1565C0', margin: 0 }}>📋 Admission Form Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555' }}>✕</button>
        </div>

        {/* Status Badge */}
        <div style={{
          background: '#fff3e0', color: '#E65100', padding: '8px 16px',
          borderRadius: '20px', display: 'inline-block', fontSize: '13px',
          fontWeight: '600', marginBottom: '20px', borderLeft: '4px solid #E65100'
        }}>
          ⏳ Pending Verification
        </div>

        {/* Personal Info */}
        <Section title="👤 Personal Information">
          <Field label="Full Name" value={adm.applicantName} />
          <Field label="Date of Birth" value={adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN') : null} />
          <Field label="Gender" value={adm.gender} />
          <Field label="Blood Group" value={adm.bloodGroup} />
          <Field label="Category" value={adm.category} />
          <Field label="Caste" value={adm.caste} />
          <Field label="Religion" value={adm.religion} />
          <Field label="Nationality" value={adm.nationality} />
          <Field label="Aadhar No." value={adm.aadharNumber} />
          <Field label="APAR ID" value={adm.aparId} />
        </Section>

        {/* Contact Info */}
        <Section title="📞 Contact Information">
          <Field label="Email" value={adm.email} />
          <Field label="Phone" value={adm.phone} />
          <Field label="Address" value={adm.address} />
          <Field label="City" value={adm.city} />
          <Field label="State" value={adm.state} />
          <Field label="Pincode" value={adm.pincode} />
        </Section>

        {/* Academic Info */}
        <Section title="🎓 Academic Information">
          <Field label="Preferred Course" value={adm.preferredSubject || adm.course} />
          <Field label="SSC Marks" value={adm.sscObtainedMarks ? `${adm.sscObtainedMarks}/${adm.sscTotalMarks} (${adm.sscPercentage}%)` : null} />
          <Field label="HSC Marks" value={adm.hscObtainedMarks ? `${adm.hscObtainedMarks}/${adm.hscTotalMarks} (${adm.hscPercentage}%)` : null} />
          <Field label="Previous Year Marks" value={adm.prevYearObtainedMarks ? `${adm.prevYearObtainedMarks}/${adm.prevYearTotalMarks} (${adm.prevYearPercentage}%)` : null} />
          <Field label="Has Gap Year" value={adm.hasGap ? 'Yes' : 'No'} />
        </Section>

        {/* Parents Info */}
        <Section title="👨‍👩‍👧 Parents Information">
          <Field label="Father's Name" value={adm.fatherName} />
          <Field label="Father's Phone" value={adm.fatherPhone} />
          <Field label="Father's Occupation" value={adm.fatherOccupation} />
          <Field label="Mother's Name" value={adm.motherName} />
          <Field label="Mother's Phone" value={adm.motherPhone} />
          <Field label="Annual Income" value={adm.annualIncome} />
        </Section>

        {/* Documents */}
        <Section title="📄 Uploaded Documents">
          {[
            { label: 'Student Photo', key: 'studentPhoto' },
            { label: 'Signature', key: 'signaturePhoto' },
            { label: 'Aadhar Card', key: 'aadharPhoto' },
            { label: 'SSC Marksheet', key: 'sscMarksheet' },
            { label: 'HSC Marksheet', key: 'hscMarksheet' },
            { label: 'Previous Year Marksheet', key: 'prevYearMarksheet' },
            { label: 'Caste Certificate', key: 'casteCertificate' },
            { label: 'Caste Validity', key: 'casteValidityCertificate' },
            { label: 'Domicile Certificate', key: 'domicileCertificate' },
            { label: 'Income Certificate', key: 'incomeCertificate' },
            { label: 'Transfer Certificate', key: 'transferCertificate' },
            { label: 'Gap Certificate', key: 'gapCertificate' },
            { label: 'Bank Passbook', key: 'bankPassbook' },
            { label: 'Marriage Certificate', key: 'marriageCertificate' },
          ].map(doc => (
            <div key={doc.key} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
              <span style={{ width: '180px', flexShrink: 0, fontSize: '13px', color: '#888', fontWeight: '600' }}>{doc.label}</span>
              {adm[doc.key] ? (
                <a
                href={`https://college-management-nnve.onrender.com/uploads/${adm[doc.key]}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ fontSize: '13px', color: '#1565C0', textDecoration: 'underline' }}
>
  📎 View Document
</a>
              ) : (
                <span style={{ fontSize: '13px', color: '#bbb' }}>Not uploaded</span>
              )}
            </div>
          ))}
        </Section>

        {/* Submitted On */}
        <div style={{ background: '#f8faff', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#555' }}>
          📅 Submitted on: <strong>{new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
        </div>

        {/* Action Buttons */}
        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>🔄 Take Action</h4>

          {/* Staff Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
              Staff Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add any notes for principal..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Reject Reason */}
          {showReject && (
            <div style={{ marginBottom: '16px', background: '#ffebee', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #C62828' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#C62828', display: 'block', marginBottom: '6px' }}>
                ❌ Rejection Reason *
              </label>
              <textarea
                rows="3"
                placeholder="Enter reason for rejection (student will see this)..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ffcdd2', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  style={{ flex: 1, padding: '10px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {loading ? '⏳ Rejecting...' : '❌ Confirm Reject'}
                </button>
                <button
                  onClick={() => { setShowReject(false); setRejectReason(''); setMsg(''); }}
                  style={{ padding: '10px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px',
              background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
              color: msg.startsWith('✅') ? '#2E7D32' : '#C62828',
            }}>
              {msg}
            </div>
          )}

          {!showReject && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleApprove}
                disabled={loading}
                style={{
                  flex: 1, padding: '12px', background: '#2E7D32', color: '#fff',
                  border: 'none', borderRadius: '9px', fontWeight: '600',
                  fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Processing...' : '✅ Approve & Forward to Principal'}
              </button>
              <button
                onClick={() => setShowReject(true)}
                style={{
                  padding: '12px 20px', background: '#ffebee', color: '#C62828',
                  border: '1px solid #C62828', borderRadius: '9px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                ❌ Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const StudentSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const [enquiries, setEnquiries] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
 // Generate Credentials states
  const [credForm, setCredForm] = useState({
    firstName: '', middleName: '', lastName: '', email: '', phone: '', dateOfBirth: ''
  });
  const [credLoading, setCredLoading] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const handleLogout = () => { logout(); navigate('/'); };

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
    if (['home', 'enquiries', 'admissions'].includes(activeTab)) {
      fetchEnquiries();
      fetchAdmissions();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id) => {
    if (!statusUpdate.status) { setUpdateMsg('❌ Please select a status.'); return; }
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
// Create Student Account
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredMsg('');
    try {
      const res = await API.post('/auth/register-student', credForm);
      if (res.data.success) {
        setGeneratedCreds({
          name: res.data.user.name,
          email: res.data.user.email,
          password: res.data.generatedPassword
        });
        setCredMsg('✅ Student account created successfully!');
        setCredForm({ firstName: '', middleName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
      }
    } catch (err) {
      setCredMsg('❌ ' + (err.response?.data?.message || 'Failed to create account'));
    } finally {
      setCredLoading(false);
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
    { id: 'home',         label: '🏠 Dashboard' },
    { id: 'enquiries',    label: '📝 Admission Enquiries' },
    { id: 'admissions',   label: '🎓 Pending Admissions' },
    { id: 'credentials',  label: '👥 Generate Credentials' },
    { id: 'documents',    label: '📋 Document Verification' },
    { id: 'carryforward', label: '🎓 SY/TY Carry Forward' },
    { id: 'tc',           label: '📄 Generate TC' },
    { id: 'bonafide',     label: '📜 Generate Bonafide' },
    { id: 'idcard',       label: '🪪 Generate ID Card' },
    { id: 'prn',          label: '🔢 Update PRN/ABC ID' },
    { id: 'students',     label: '👩‍🎓 All Students' },
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
                  marginLeft: '8px', background: '#C62828', color: '#fff',
                  borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700',
                }}>
                  {pendingCount}
                </span>
              )}
              {tab.id === 'admissions' && admissions.length > 0 && (
                <span style={{
                  marginLeft: '8px', background: '#E65100', color: '#fff',
                  borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700',
                }}>
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

          {/* ── HOME ── */}
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
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admissions')}>
                  <div className="dash-card-icon">🎓</div>
                  <div><h3>{admissions.length}</h3><p>Pending Admissions</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">📊</div>
                  <div><h3>{enquiries.length}</h3><p>Total Enquiries</p></div>
                </div>
              </div>

              {pendingCount > 0 && (
                <div className="recent-section" style={{ marginTop: '24px' }}>
                  <h3>⏳ Recent Pending Enquiries</h3>
                  {enquiries.filter(e => e.status === 'pending').slice(0, 5).map(enq => (
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
                  <button onClick={() => setActiveTab('enquiries')} style={{
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
                  { label: '🎓 Pending Admissions', sub: 'Verify admission forms', tab: 'admissions', tag: 'Important' },
                  { label: '👥 Generate Login', sub: 'Create student login credentials', tab: 'credentials', tag: 'Quick' },
                  { label: '📋 Verify Documents', sub: 'Review uploaded student documents', tab: 'documents', tag: 'Important' },
                ].map((item, i) => (
                  <div key={i} className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab(item.tab)}>
                    <span className="notice-tag">{item.tag}</span>
                    <h4>{item.label}</h4>
                    <p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {activeTab === 'enquiries' && (
            <div>
              {selectedEnquiry && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
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
                      <div className="fees-info-row">
                        <span className="fees-info-label">Current Status</span>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          background: getStatusStyle(selectedEnquiry.status).bg,
                          color: getStatusStyle(selectedEnquiry.status).color,
                        }}>
                          {getStatusStyle(selectedEnquiry.status).label}
                        </span>
                      </div>
                    </div>

                    {selectedEnquiry.notes && (
                      <div style={{ background: '#fffde7', borderRadius: '8px', padding: '12px', marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>💬 Student Message:</p>
                        <p style={{ fontSize: '13px', color: '#555' }}>{selectedEnquiry.notes}</p>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                      <h4 style={{ color: '#333', marginBottom: '12px' }}>🔄 Update Status</h4>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>New Status *</label>
                        <select value={statusUpdate.status} onChange={e => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
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
                        <textarea rows="3" placeholder="Add internal notes..."
                          value={statusUpdate.notes} onChange={e => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>

                      {updateMsg && (
                        <div style={{
                          padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px',
                          background: updateMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
                          color: updateMsg.startsWith('✅') ? '#2E7D32' : '#C62828',
                        }}>{updateMsg}</div>
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleStatusUpdate(selectedEnquiry._id)} disabled={updateLoading}
                          style={{ flex: 1, padding: '11px', background: '#1565C0', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: updateLoading ? 'not-allowed' : 'pointer', opacity: updateLoading ? 0.7 : 1 }}>
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

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name, email or phone..."
                  value={searchText} onChange={e => setSearchText(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '9px', border: '1px solid #ddd', fontSize: '14px' }}>
                  <option value="all">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="credentials_issued">🔑 Credentials Issued</option>
                  <option value="converted">🎓 Converted</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                <button onClick={fetchEnquiries} style={{ padding: '10px 18px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '9px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total', count: enquiries.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Pending', count: pendingCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Contacted', count: contactedCount, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Converted', count: convertedCount, color: '#2E7D32', bg: '#e8f5e9' },
                ].map((pill, i) => (
                  <div key={i} style={{ background: pill.bg, color: pill.color, borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600' }}>
                    {pill.label}: {pill.count}
                  </div>
                ))}
              </div>

              {enquiriesLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading enquiries...</h3></div>
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
                          background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px',
                          padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow 0.2s',
                          display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${s.color}`,
                        }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                      >
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
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p style={{ fontSize: '12px', color: '#1565C0', marginTop: '4px', fontWeight: '600' }}>View →</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ADMISSIONS ── */}
          {activeTab === 'admissions' && (
            <div>
              {selectedAdmission && (
                <AdmissionModal
                  adm={selectedAdmission}
                  onClose={() => setSelectedAdmission(null)}
                  onRefresh={fetchAdmissions}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>🎓 Pending Admission Forms ({admissions.length})</h3>
                <button onClick={fetchAdmissions} style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

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
                      onClick={() => setSelectedAdmission(adm)}
                      style={{
                        background: '#fff', border: '1px solid #e0e0e0',
                        borderRadius: '12px', padding: '16px 20px',
                        cursor: 'pointer', transition: 'box-shadow 0.2s',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        borderLeft: '4px solid #E65100',
                      }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff3e0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        🎓
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#222' }}>{adm.applicantName}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                          📧 {adm.email} · 📱 {adm.phone}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
                          🎓 {adm.preferredSubject || adm.course || 'Course not specified'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ background: '#fff3e0', color: '#E65100', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          ⏳ Pending
                        </span>
                        <p style={{ fontSize: '11px', color: '#aaa', margin: '6px 0 0' }}>
                          {new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '12px', color: '#1565C0', marginTop: '4px', fontWeight: '600' }}>View Details →</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* ── GENERATE CREDENTIALS ── */}
{activeTab === 'credentials' && (
  <div>
    <h3 style={{ marginBottom: '8px', color: '#1565C0' }}>👥 Generate Student Login</h3>
    <p style={{ color: '#666', marginBottom: '20px' }}>
      Create login credentials for a new student. Password is auto-generated from name + date of birth.
    </p>

    {credMsg && (
      <div style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', background: credMsg.includes('✅') ? '#e8f5e9' : '#ffebee', color: credMsg.includes('✅') ? '#2E7D32' : '#C62828', fontWeight: '500' }}>
        {credMsg}
      </div>
    )}

    {/* Generated Credentials Popup */}
    {generatedCreds && (
      <div style={{ background: '#e8f5e9', border: '2px solid #2E7D32', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: '#2E7D32', marginBottom: '14px' }}>✅ Student Account Created!</h3>
        <p style={{ color: '#555', marginBottom: '14px', fontSize: '14px' }}>
          Share these login details with the student:
        </p>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', fontSize: '15px' }}>
          <p style={{ marginBottom: '8px' }}><strong>👤 Name:</strong> {generatedCreds.name}</p>
          <p style={{ marginBottom: '8px' }}><strong>📧 Email:</strong> {generatedCreds.email}</p>
          <p><strong>🔑 Password:</strong> <code style={{ background: '#fff3e0', padding: '4px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '16px', color: '#E65100', fontWeight: '700' }}>{generatedCreds.password}</code></p>
        </div>
        <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginTop: '14px', fontSize: '13px', color: '#856404' }}>
          ⚠️ Note this password! Student will use it to login at the student portal.
        </div>
        <button onClick={() => setGeneratedCreds(null)}
          style={{ marginTop: '14px', background: '#2E7D32', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          ✓ Got It, Close
        </button>
      </div>
    )}

    {/* Create Form */}
    <div className="form-card">
      <h3 style={{ marginBottom: '16px' }}>📝 New Student Details</h3>
      <form onSubmit={handleCreateStudent}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>First Name *</label>
            <input type="text" placeholder="e.g. Tejas"
              value={credForm.firstName}
              onChange={e => setCredForm({ ...credForm, firstName: e.target.value })}
              required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input type="text" placeholder="e.g. Sanjay"
              value={credForm.middleName}
              onChange={e => setCredForm({ ...credForm, middleName: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="e.g. Bargal"
              value={credForm.lastName}
              onChange={e => setCredForm({ ...credForm, lastName: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" placeholder="student@gmail.com"
              value={credForm.email}
              onChange={e => setCredForm({ ...credForm, email: e.target.value })}
              required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="9876543210" maxLength="10"
              value={credForm.phone}
              onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setCredForm({ ...credForm, phone: e.target.value }); }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input type="date"
            value={credForm.dateOfBirth}
            onChange={e => setCredForm({ ...credForm, dateOfBirth: e.target.value })}
            required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
            💡 Password will be auto-generated: first 4 letters of name + @ + DD + YY
          </small>
        </div>

        <button type="submit" disabled={credLoading}
          style={{ background: '#1565C0', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', cursor: credLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: credLoading ? 0.6 : 1 }}>
          {credLoading ? '⏳ Creating...' : '➕ Create Student Account'}
        </button>
      </form>
    </div>
  </div>
)}
          {/* ── OTHER TABS ── */}
          {!['home', 'enquiries', 'admissions', 'credentials'].includes(activeTab) && (
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
