import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

// ─── Admission Detail Modal ───────────────────────────────────────────────────
const AdmissionModal = ({ adm, onClose, onRefresh }) => {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleApprove = async () => {
    setLoading(true); setMsg('');
    try {
      await API.put(`/admissions/staff-approve/${adm._id}`, { notes });
      setMsg('✅ Approved! Forwarded to Principal.');
      setTimeout(() => { onClose(); onRefresh(); }, 1500);
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Approval failed.')); }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setMsg('❌ Please enter rejection reason.'); return; }
    setLoading(true); setMsg('');
    try {
      await API.put(`/admissions/staff-reject/${adm._id}`, { reason: rejectReason });
      setMsg('✅ Application rejected.');
      setTimeout(() => { onClose(); onRefresh(); }, 1500);
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Rejection failed.')); }
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1565C0', margin: 0 }}>📋 Admission Form Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555' }}>✕</button>
        </div>
        <div style={{ background: '#fff3e0', color: '#E65100', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '13px', fontWeight: '600', marginBottom: '20px', borderLeft: '4px solid #E65100' }}>
          ⏳ Pending Verification
        </div>

        <Section title="👤 Personal Information">
          <Field label="Full Name" value={adm.applicantName} />
          <Field label="Date of Birth" value={adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN') : null} />
          <Field label="Gender" value={adm.gender} />
          <Field label="Blood Group" value={adm.bloodGroup} />
          <Field label="Category" value={adm.category} />
          <Field label="Caste" value={adm.caste} />
          <Field label="Sub-Caste" value={adm.subCaste} />
          <Field label="Religion" value={adm.religion} />
          <Field label="Nationality" value={adm.nationality} />
          <Field label="Aadhar No." value={adm.aadharNumber} />
          <Field label="APAR / ABC ID" value={adm.aparIdNumber} />
          <Field label="Is Married" value={adm.isMarried ? 'Yes' : 'No'} />
        </Section>

        <Section title="📞 Contact Information">
          <Field label="Email" value={adm.email} />
          <Field label="Phone" value={adm.phone} />
          <Field label="House No." value={adm.houseNumber} />
          <Field label="Street / Area" value={adm.streetArea} />
          <Field label="Subdistrict" value={adm.subdistrict} />
          <Field label="City / Town / Village" value={adm.cityTownVillage} />
          <Field label="District" value={adm.district} />
          <Field label="State" value={adm.state} />
          <Field label="Pincode" value={adm.pincode} />
        </Section>

        <Section title="🎓 Academic Information">
          <Field label="Course Type" value={adm.courseType} />
          <Field label="Preferred Subject" value={adm.preferredSubject} />
          <Field label="Admission Year" value={adm.admissionYear} />
          <Field label="SSC Marks" value={adm.sscObtainedMarks ? `${adm.sscObtainedMarks}/${adm.sscTotalMarks} (${adm.sscPercentage}%)` : null} />
          <Field label="HSC Marks" value={adm.hscObtainedMarks ? `${adm.hscObtainedMarks}/${adm.hscTotalMarks} (${adm.hscPercentage}%)` : null} />
          <Field label="Previous Year Marks" value={adm.prevYearObtainedMarks ? `${adm.prevYearObtainedMarks}/${adm.prevYearTotalMarks} (${adm.prevYearPercentage}%)` : null} />
          <Field label="Has Gap Year" value={adm.hasGap ? 'Yes' : 'No'} />
          <Field label="Has Caste Validity" value={adm.hasCasteValidity ? 'Yes' : 'No'} />
        </Section>

        <Section title="👨‍👩‍👧 Parents Information">
          <Field label="Father's Name" value={adm.fatherName} />
          <Field label="Mother's Name" value={adm.motherName} />
          <Field label="Guardian Name" value={adm.guardianFullName} />
          <Field label="Guardian Phone" value={adm.guardianPhone} />
          <Field label="Annual Income" value={adm.familyIncome} />
        </Section>

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
                <a href={adm[doc.key].startsWith('http') ? adm[doc.key] : `https://college-management-nnve.onrender.com/uploads/${adm[doc.key]}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#1565C0', textDecoration: 'underline' }}>
                  📎 View Document
                </a>
              ) : (
                <span style={{ fontSize: '13px', color: '#bbb' }}>Not uploaded</span>
              )}
            </div>
          ))}
        </Section>

        <div style={{ background: '#f8faff', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#555' }}>
          📅 Submitted on: <strong>{new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
        </div>

        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>🔄 Take Action</h4>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Staff Notes (Optional)</label>
            <textarea rows="2" placeholder="Add any notes for principal..." value={notes} onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {showReject && (
            <div style={{ marginBottom: '16px', background: '#ffebee', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #C62828' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#C62828', display: 'block', marginBottom: '6px' }}>❌ Rejection Reason *</label>
              <textarea rows="3" placeholder="Enter reason for rejection (student will see this)..." value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ffcdd2', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleReject} disabled={loading}
                  style={{ flex: 1, padding: '10px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? '⏳ Rejecting...' : '❌ Confirm Reject'}
                </button>
                <button onClick={() => { setShowReject(false); setRejectReason(''); setMsg(''); }}
                  style={{ padding: '10px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
              {msg}
            </div>
          )}

          {!showReject && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleApprove} disabled={loading}
                style={{ flex: 1, padding: '12px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Processing...' : '✅ Approve & Forward to Principal'}
              </button>
              <button onClick={() => setShowReject(true)}
                style={{ padding: '12px 20px', background: '#ffebee', color: '#C62828', border: '1px solid #C62828', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
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
 const [credForm, setCredForm] = useState({ firstName: '', middleName: '', lastName: '', aadharNumber: '', email: '', phone: '', dateOfBirth: '' });
  const [credLoading, setCredLoading] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await API.get('/enquiries');
      if (res.data.success) setEnquiries(res.data.enquiries || []);
    } catch (err) { console.error('Failed to fetch enquiries:', err); }
    finally { setEnquiriesLoading(false); }
  };

  const fetchAdmissions = async () => {
    setAdmissionsLoading(true);
    try {
      const res = await API.get('/admissions/student-section/pending');
      if (res.data.success) setAdmissions(res.data.admissions || []);
    } catch (err) { console.error('Failed to fetch admissions:', err); }
    finally { setAdmissionsLoading(false); }
  };

  useEffect(() => {
    if (['home', 'enquiries', 'admissions'].includes(activeTab)) {
      fetchEnquiries();
      fetchAdmissions();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id) => {
    if (!statusUpdate.status) { setUpdateMsg('❌ Please select a status.'); return; }
    setUpdateLoading(true); setUpdateMsg('');
    try {
      const res = await API.put(`/enquiries/${id}`, { status: statusUpdate.status, notes: statusUpdate.notes });
      if (res.data.success) {
        setUpdateMsg('✅ Status updated successfully!');
        fetchEnquiries();
        setTimeout(() => { setSelectedEnquiry(null); setStatusUpdate({ status: '', notes: '' }); setUpdateMsg(''); }, 1500);
      }
    } catch (err) { setUpdateMsg('❌ Failed to update. Please try again.'); }
    finally { setUpdateLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try { await API.delete(`/enquiries/${id}`); fetchEnquiries(); setSelectedEnquiry(null); }
    catch (err) { alert('Failed to delete enquiry.'); }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault(); setCredLoading(true); setCredMsg('');
    try {
      const res = await API.post('/auth/register-student', credForm);
      if (res.data.success) {
        setGeneratedCreds({ name: res.data.user.name, email: res.data.user.email, password: res.data.generatedPassword });
        setCredMsg('✅ Student account created successfully!');
        setCredForm({ firstName: '', middleName: '', lastName: '', aadharNumber: '', email: '', phone: '', dateOfBirth: '' });
      }
    } catch (err) { setCredMsg('❌ ' + (err.response?.data?.message || 'Failed to create account')); }
    finally { setCredLoading(false); }
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
    const matchSearch = !searchText || e.studentFullName?.toLowerCase().includes(searchText.toLowerCase()) || e.email?.toLowerCase().includes(searchText.toLowerCase()) || e.phone?.includes(searchText);
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
    { id: 'doc_replace',  label: '📝 Correct Documents' },
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
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.id === 'enquiries' && pendingCount > 0 && (
                <span style={{ marginLeft: '8px', background: '#C62828', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{pendingCount}</span>
              )}
              {tab.id === 'admissions' && admissions.length > 0 && (
                <span style={{ marginLeft: '8px', background: '#E65100', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{admissions.length}</span>
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
              <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #1565C0' }}>
                <h3 style={{ color: '#1565C0', marginBottom: '8px' }}>👋 Welcome to Student Section!</h3>
                <p>Manage student admissions, verify documents, generate certificates, and maintain student records.</p>
              </div>
              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('enquiries')}>
                  <div className="dash-card-icon">📝</div><div><h3>{pendingCount}</h3><p>Pending Enquiries</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">📞</div><div><h3>{contactedCount}</h3><p>Contacted</p></div>
                </div>
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admissions')}>
                  <div className="dash-card-icon">🎓</div><div><h3>{admissions.length}</h3><p>Pending Admissions</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">📊</div><div><h3>{enquiries.length}</h3><p>Total Enquiries</p></div>
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="recent-section" style={{ marginTop: '24px' }}>
                  <h3>⏳ Recent Pending Enquiries</h3>
                  {enquiries.filter(e => e.status === 'pending').slice(0, 5).map(enq => (
                    <div key={enq._id} className="notice-row" style={{ cursor: 'pointer' }}
                      onClick={() => { setActiveTab('enquiries'); setSelectedEnquiry(enq); setStatusUpdate({ status: enq.status, notes: enq.notes || '' }); }}>
                      <span className="notice-dot"></span>
                      <div><p className="notice-title">{enq.studentFullName}</p><p className="notice-date">{enq.phone} · {enq.email}</p></div>
                      <span className="notice-tag">Pending</span>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('enquiries')} style={{ marginTop: '12px', background: 'none', border: '1px solid #1565C0', color: '#1565C0', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
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
                    <span className="notice-tag">{item.tag}</span><h4>{item.label}</h4><p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {activeTab === 'enquiries' && (
            <div>
              {selectedEnquiry && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
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
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: getStatusStyle(selectedEnquiry.status).bg, color: getStatusStyle(selectedEnquiry.status).color }}>
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
                        <textarea rows="3" placeholder="Add internal notes..." value={statusUpdate.notes} onChange={e => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                      {updateMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: updateMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: updateMsg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{updateMsg}</div>
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
                <input type="text" placeholder="🔍 Search by name, email or phone..." value={searchText} onChange={e => setSearchText(e.target.value)}
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
                <button onClick={fetchEnquiries} style={{ padding: '10px 18px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '9px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
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
                      <div key={enq._id} onClick={() => { setSelectedEnquiry(enq); setStatusUpdate({ status: enq.status, notes: enq.notes || '' }); setUpdateMsg(''); }}
                        style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${s.color}` }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
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
                <AdmissionModal adm={selectedAdmission} onClose={() => setSelectedAdmission(null)} onRefresh={fetchAdmissions} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>🎓 Pending Admission Forms ({admissions.length})</h3>
                <button onClick={fetchAdmissions} style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
              </div>
              {admissionsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading admissions...</h3></div>
              ) : admissions.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No Pending Admissions</h3><p>All admission forms have been processed.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {admissions.map(adm => (
                    <div key={adm._id} onClick={() => setSelectedAdmission(adm)}
                      style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #E65100' }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff3e0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎓</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#222' }}>{adm.applicantName}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>📧 {adm.email} · 📱 {adm.phone}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>🎓 {adm.preferredSubject || adm.courseType || 'Course not specified'}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ background: '#fff3e0', color: '#E65100', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>⏳ Pending</span>
                        <p style={{ fontSize: '11px', color: '#aaa', margin: '6px 0 0' }}>{new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
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
              <p style={{ color: '#666', marginBottom: '20px' }}>Create login credentials for a new student. Password is auto-generated from name + date of birth.</p>
              {credMsg && (
                <div style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', background: credMsg.includes('✅') ? '#e8f5e9' : '#ffebee', color: credMsg.includes('✅') ? '#2E7D32' : '#C62828', fontWeight: '500' }}>{credMsg}</div>
              )}
              {generatedCreds && (
                <div style={{ background: '#e8f5e9', border: '2px solid #2E7D32', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ color: '#2E7D32', marginBottom: '14px' }}>✅ Student Account Created!</h3>
                  <p style={{ color: '#555', marginBottom: '14px', fontSize: '14px' }}>Share these login details with the student:</p>
                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', fontSize: '15px' }}>
                    <p style={{ marginBottom: '8px' }}><strong>👤 Name:</strong> {generatedCreds.name}</p>
                    <p style={{ marginBottom: '8px' }}><strong>📧 Email:</strong> {generatedCreds.email}</p>
                    <p><strong>🔑 Password:</strong> <code style={{ background: '#fff3e0', padding: '4px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '16px', color: '#E65100', fontWeight: '700' }}>{generatedCreds.password}</code></p>
                  </div>
                  <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginTop: '14px', fontSize: '13px', color: '#856404' }}>
                    ⚠️ Note this password! Student will use it to login at the student portal.
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: '14px', flexWrap: 'wrap' }}>
                    <button onClick={async () => {
                      try {
                        await API.post('/auth/send-credentials', {
                          studentEmail: generatedCreds.email,
                          studentName: generatedCreds.name,
                          username: generatedCreds.username || generatedCreds.email,
                          password: generatedCreds.password,
                        });
                        alert('✅ Credentials sent to ' + generatedCreds.email);
                      } catch (e) { alert('❌ Failed: ' + (e.response?.data?.message || 'Error')); }
                    }} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      📧 Send Credentials via Email
                    </button>
                    <button onClick={() => setGeneratedCreds(null)} style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✓ Got It, Close</button>
                  </div>
                </div>
              )}
              <div className="form-card">
                <h3 style={{ marginBottom: '16px' }}>📝 New Student Details</h3>
                <form onSubmit={handleCreateStudent}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label>First Name *</label><input type="text" placeholder="e.g. Tejas" value={credForm.firstName} onChange={e => setCredForm({ ...credForm, firstName: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    <div className="form-group"><label>Middle Name</label><input type="text" placeholder="e.g. Sanjay" value={credForm.middleName} onChange={e => setCredForm({ ...credForm, middleName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    <div className="form-group"><label>Last Name</label><input type="text" placeholder="e.g. Bargal" value={credForm.lastName} onChange={e => setCredForm({ ...credForm, lastName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                  </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label>Aadhar Number *</label><input type="text" placeholder="123456789012" maxLength="12" value={credForm.aadharNumber} onChange={e => { if (/^\d{0,12}$/.test(e.target.value)) setCredForm({ ...credForm, aadharNumber: e.target.value }); }} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /><small style={{ color: '#666', display: 'block', marginTop: '4px' }}>12 digit Aadhar number</small></div>
                    <div className="form-group"><label>Email Address *</label><input type="email" placeholder="student@example.com" value={credForm.email} onChange={e => setCredForm({ ...credForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /><small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Student will login with this email</small></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label>Phone Number</label><input type="text" placeholder="9876543210" maxLength="10" value={credForm.phone} onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setCredForm({ ...credForm, phone: e.target.value }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    <div className="form-group"></div>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" value={credForm.dateOfBirth} onChange={e => setCredForm({ ...credForm, dateOfBirth: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>💡 Password will be auto-generated: first 4 letters of name + @ + DD + YY</small>
                  </div>
                  <button type="submit" disabled={credLoading} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', cursor: credLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: credLoading ? 0.6 : 1 }}>
                    {credLoading ? '⏳ Creating...' : '➕ Create Student Account'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ✅ NEW: ALL STUDENTS TAB */}
          {activeTab === 'receipts' && <PaymentReceiptsTab themeColor="#1565C0" />}

          {/* ══ ALL STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student Section Staff can view, edit, and delete student records.</p>
              <StudentViewFull canEdit={true} themeColor="#1565C0" />
            </div>
          )}


          {activeTab === 'documents' && <DocumentVerificationTab user={user} />}

          {/* ══════════════ GENERATE TC ══════════════ */}
          {activeTab === 'tc' && <GenerateDocTab user={user} docType="TC" label="Transfer Certificate (TC)" icon="📄" />}

          {/* ══════════════ GENERATE BONAFIDE ══════════════ */}
          {activeTab === 'bonafide' && <GenerateDocTab user={user} docType="BONAFIDE" label="Bonafide Certificate" icon="📜" />}

          {/* ══════════════ GENERATE ID CARD ══════════════ */}
          {activeTab === 'idcard' && <GenerateDocTab user={user} docType="ID_CARD" label="ID Card" icon="🪪" />}

          {/* ══════════════ UPDATE PRN / ABC ID ══════════════ */}
          {activeTab === 'prn' && <UpdatePrnTab />}

          {/* ══════════════ CORRECT DOCUMENTS ══════════════ */}
          {activeTab === 'doc_replace' && <DocumentReplaceTab />}

          {/* ══════════════ CARRY FORWARD ══════════════ */}
          {activeTab === 'carryforward' && <CarryForwardTab />}

        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT VERIFICATION TAB
// Shows all doc requests that are pending_generation → student section marks complete
// ─────────────────────────────────────────────────────────────────────────────
const DocumentVerificationTab = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('pending_generation');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get('/document-requests/student-section/all');
      setRequests(res.data.requests || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await API.put(`/document-requests/student-section/complete/${selected._id}`, { notes });
      setMsg('✅ Marked as completed!');
      setTimeout(() => { setSelected(null); setNotes(''); setMsg(''); fetchRequests(); }, 1500);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const statusStyle = (s) => ({
    pending_generation: { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Generation' },
    completed:          { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Completed' },
  }[s] || { bg: '#f5f5f5', color: '#666', label: s });

  const filtered = requests.filter(r => {
    const mf = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const ms = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return mf && ms;
  });

  const pending = requests.filter(r => r.status === 'pending_generation').length;

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📋 Document Verification & Generation</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        These requests are fee-verified and approved. Generate & issue the documents.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by student name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Requests</option>
          <option value="pending_generation">⏳ Pending Generation</option>
          <option value="completed">✅ Completed</option>
        </select>
        <button onClick={fetchRequests}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: requests.length, color: '#1565C0', bg: '#e3f2fd' },
          { label: 'Pending', count: pending, color: '#E65100', bg: '#fff3e0' },
          { label: 'Completed', count: requests.filter(r => r.status === 'completed').length, color: '#2E7D32', bg: '#e8f5e9' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
      </div>

      {/* Completion modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#1565C0', marginBottom: 4 }}>✅ Mark Document as Generated</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Confirm you have issued this document to the student.</p>
            <div style={{ background: '#f8faff', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888', fontWeight: 600 }}>Student</span><span>{selected.studentName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888', fontWeight: 600 }}>Document</span><span>{selected.documentTypeLabel}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888', fontWeight: 600 }}>Branch</span><span>{selected.branch || 'N/A'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span style={{ color: '#888', fontWeight: 600 }}>Year</span><span>{selected.admissionYear || 'N/A'}</span></div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Notes (optional)</label>
              <textarea rows="2" placeholder="e.g. Issued physically at counter..." value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleComplete} disabled={saving}
                style={{ flex: 1, background: '#2E7D32', color: '#fff', padding: '11px', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : '✅ Mark as Completed'}
              </button>
              <button onClick={() => { setSelected(null); setNotes(''); setMsg(''); }}
                style={{ padding: '11px 20px', background: '#eee', color: '#333', borderRadius: 9, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><h3>No requests found</h3><p>Document requests approved by Accounts will appear here.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const ss = statusStyle(req.status);
            const isPending = req.status === 'pending_generation';
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e0e0'}`, borderRadius: 12, padding: 18, borderLeft: `4px solid ${ss.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ color: '#1565C0', fontSize: 16, margin: 0 }}>{req.documentTypeLabel || req.documentType}</h4>
                      {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>⚡ Urgent</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Requested: {new Date(req.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                <div style={{ background: '#f8faff', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <span><strong>Name:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                  <span><strong>Year:</strong> {req.admissionYear || 'N/A'}</span>
                  {req.rollNumber && <span><strong>Roll No:</strong> {req.rollNumber}</span>}
                  {req.studentPhone && <span><strong>Phone:</strong> {req.studentPhone}</span>}
                </div>
                {req.reason && <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}><strong>Reason:</strong> {req.reason}</p>}
                {req.accountsNotes && <p style={{ fontSize: 12, color: '#777', marginBottom: 10, fontStyle: 'italic' }}>Accounts Note: {req.accountsNotes}</p>}
                {req.principalNotes && <p style={{ fontSize: 12, color: '#777', marginBottom: 10, fontStyle: 'italic' }}>Principal Note: {req.principalNotes}</p>}
                {isPending && (
                  <button onClick={() => { setSelected(req); setNotes(''); setMsg(''); }}
                    style={{ background: '#2E7D32', color: '#fff', padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    ✅ Mark as Generated / Issued
                  </button>
                )}
                {req.status === 'completed' && (
                  <p style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>✅ Issued by {req.generatedBy} on {req.generatedDate ? new Date(req.generatedDate).toLocaleDateString('en-IN') : '—'}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE DOC TAB  (TC / Bonafide / ID Card)
// Prints the actual document using browser print
// ─────────────────────────────────────────────────────────────────────────────
const COLLEGE_NAME    = 'Late Kalpana Chawla Women\'s Senior College (LKCWSC)';
const COLLEGE_TRUST   = 'Vidya-Niketan Sevabhavi Sanstha\'s';
const COLLEGE_SUBTITLE = 'Affiliated to SNDT Women\'s University, Mumbai';
const COLLEGE_ADDRESS  = 'Gangakhed, Dist. Parbhani, Maharashtra - 431514';
const COLLEGE_CONTACT  = '+91 9307162914  |  lkcwsc.vnssorg.com';

// ─── Shared letterhead HTML ──────────────────────────────────────────────────
const letterheadHTML = () => `
  <div style="border-bottom:3px double #1a237e;padding-bottom:14px;margin-bottom:16px;display:flex;align-items:center;gap:14px">
    <img src="data:image/jpeg;base64,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" style="width:70px;height:70px;object-fit:contain;flex-shrink:0" />
    <div style="flex:1;text-align:center">
      <div style="font-size:10px;color:#555;letter-spacing:0.5px">${COLLEGE_TRUST}</div>
      <div style="font-size:19px;font-weight:bold;color:#1a237e;margin:2px 0;line-height:1.2">${COLLEGE_NAME}</div>
      <div style="font-size:10.5px;color:#333;margin-bottom:2px">${COLLEGE_SUBTITLE}</div>
      <div style="font-size:10px;color:#555">${COLLEGE_ADDRESS}</div>
      <div style="font-size:10px;color:#555">${COLLEGE_CONTACT}</div>
    </div>
  </div>`;

// ─── Print TC ────────────────────────────────────────────────────────────────
const printTC = (adm) => {
  const tcNo = 'TC' + new Date().getFullYear() + '-' + Date.now().toString().slice(-5);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html><html><head><title>Transfer Certificate — ${tcNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#e8eaf6;padding:30px;display:flex;justify-content:center}
    .page{background:white;max-width:700px;width:100%;border:2px solid #1a237e;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.12)}
    .doc-title{text-align:center;font-size:17px;font-weight:bold;letter-spacing:3px;text-decoration:underline;color:#1a237e;margin:0 0 14px}
    .meta{display:flex;justify-content:space-between;font-size:12px;color:#333;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    tr:nth-child(even){background:#f3f4f6}
    td{padding:9px 12px;border:1px solid #9fa8da;font-size:13px;vertical-align:top}
    td:first-child{width:38%;font-weight:bold;color:#283593;background:#e8eaf6}
    td:last-child{color:#111}
    .notice{background:#fff9c4;border:1px solid #f9a825;border-radius:4px;padding:10px 14px;font-size:11.5px;color:#5d4037;margin-bottom:20px}
    .sign-row{display:flex;justify-content:space-between;margin-top:44px}
    .sign-box{text-align:center;width:160px}
    .sign-line{border-top:1px solid #333;padding-top:6px;margin-top:36px;font-size:12px;font-weight:bold}
    .sign-sub{font-size:10px;color:#666}
    .footer{text-align:center;font-size:10px;color:#777;margin-top:20px;border-top:1px dashed #9fa8da;padding-top:10px}
    @media print{body{background:white;padding:0}.page{box-shadow:none;border:2px solid #1a237e}}
  </style></head>
  <body><div class="page">
    ${letterheadHTML()}
    <div class="doc-title">TRANSFER CERTIFICATE</div>
    <div class="meta">
      <span><strong>TC No.:</strong> ${tcNo}</span>
      <span><strong>Date:</strong> ${dateStr}</span>
    </div>
    <table>
      <tr><td>Full Name of Student</td><td><strong>${adm.applicantName || '—'}</strong></td></tr>
      <tr><td>Mother's Name</td><td>${adm.motherName || '—'}</td></tr>
      <tr><td>Father's / Guardian's Name</td><td>${adm.fatherName || '—'}</td></tr>
      <tr><td>Date of Birth</td><td>${adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'}) : '—'}</td></tr>
      <tr><td>Gender</td><td>${adm.gender || '—'}</td></tr>
      <tr><td>Category / Caste / Sub-Caste</td><td>${adm.category ? adm.category.toUpperCase() : '—'} / ${adm.caste || '—'}</td></tr>
      <tr><td>Nationality / Religion</td><td>Indian / ${adm.religion || '—'}</td></tr>
      <tr><td>Student ID (ERP)</td><td>${adm.studentId || '—'}</td></tr>
      <tr><td>PRN Number</td><td>${adm.prnNumber || '—'}</td></tr>
      <tr><td>ABC / APAR ID</td><td>${adm.aparIdNumber || '—'}</td></tr>
      <tr><td>Course</td><td>${adm.courseType || '—'}</td></tr>
      <tr><td>Subject / Stream</td><td>${adm.preferredSubject || '—'}</td></tr>
      <tr><td>Year of Admission</td><td>${adm.admissionYear || '—'}</td></tr>
      <tr><td>Last Exam Appeared</td><td>—</td></tr>
      <tr><td>Result of Last Exam</td><td>—</td></tr>
      <tr><td>Fees Paid Up To</td><td>—</td></tr>
      <tr><td>Reason for Leaving</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>
      <tr><td>Conduct &amp; Character</td><td>Good</td></tr>
      <tr><td>Remarks</td><td>&nbsp;</td></tr>
      <tr><td>Date of Issue</td><td>${dateStr}</td></tr>
    </table>
    <div class="notice">⚠️ This Transfer Certificate should be submitted to the institution to which the student seeks admission. Once issued, it cannot be duplicated without formal application.</div>
    <div class="sign-row">
      <div class="sign-box">
        <div class="sign-line">Class Teacher</div>
        <div class="sign-sub">LKCWSC</div>
      </div>
      <div class="sign-box">
        <div class="sign-line">Student Section</div>
        <div class="sign-sub">LKCWSC</div>
      </div>
      <div class="sign-box">
        <div class="sign-line">Principal</div>
        <div class="sign-sub">LKCWSC, Gangakhed</div>
      </div>
    </div>
    <div class="footer">
      Generated through LKCWSC ERP System &nbsp;|&nbsp; Valid only with official stamp and signature &nbsp;|&nbsp; TC No.: ${tcNo}
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=960'); w.document.write(html); w.document.close();
};

// ─── Print Bonafide ──────────────────────────────────────────────────────────
const printBonafide = (adm) => {
  const certNo = 'BON' + new Date().getFullYear() + '-' + Date.now().toString().slice(-5);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const acadYear = (() => { const y = new Date().getFullYear(); const m = new Date().getMonth()+1; return m>=6?`${y}-${y+1}`:`${y-1}-${y}`; })();
  const dOrS = adm.gender === 'Male' ? 'S/o' : 'D/o';
  const html = `<!DOCTYPE html><html><head><title>Bonafide Certificate — ${certNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#e8eaf6;padding:30px;display:flex;justify-content:center}
    .page{background:white;max-width:660px;width:100%;border:2px solid #1a237e;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.12)}
    .doc-title{text-align:center;font-size:17px;font-weight:bold;letter-spacing:3px;text-decoration:underline;color:#1a237e;margin:0 0 16px}
    .meta{display:flex;justify-content:space-between;font-size:12px;color:#333;margin-bottom:20px}
    .cert-body{font-size:14px;line-height:2.1;text-align:justify;color:#111}
    .cert-body p{margin-bottom:14px}
    .hl{font-weight:bold;border-bottom:1px solid #333}
    .purpose-box{border:1px solid #9fa8da;border-radius:4px;padding:12px 16px;margin:20px 0;font-size:13px;color:#555;background:#f8f9ff}
    .sign-row{display:flex;justify-content:space-between;margin-top:50px}
    .sign-box{text-align:center;width:180px}
    .sign-line{border-top:1px solid #333;padding-top:6px;margin-top:40px;font-size:12px;font-weight:bold}
    .sign-sub{font-size:10px;color:#666}
    .footer{text-align:center;font-size:10px;color:#777;margin-top:20px;border-top:1px dashed #9fa8da;padding-top:10px}
    @media print{body{background:white;padding:0}.page{box-shadow:none}}
  </style></head>
  <body><div class="page">
    ${letterheadHTML()}
    <div class="doc-title">BONAFIDE CERTIFICATE</div>
    <div class="meta">
      <span><strong>Cert. No.:</strong> ${certNo}</span>
      <span><strong>Date:</strong> ${dateStr}</span>
    </div>
    <div class="cert-body">
      <p>This is to certify that <span class="hl">${adm.applicantName || '____________________'}</span>,
      <em>${dOrS}</em> <span class="hl">${adm.fatherName || '____________________'}</span>,
      resident of <span class="hl">${adm.address || '____________________'}</span>,
      is a <em>bona fide</em> student of this college for the academic year
      <span class="hl">${acadYear}</span>.</p>

      <p>She is currently enrolled in <span class="hl">${adm.courseType || '________'}</span>
      (Subject: <span class="hl">${adm.preferredSubject || '________'}</span>),
      <span class="hl">${adm.admissionYear || '________'}</span>.</p>

      <p>Her Student ID (ERP) is <span class="hl">${adm.studentId || '________'}</span>,
      PRN Number is <span class="hl">${adm.prnNumber || '________'}</span>
      and ABC / APAR ID is <span class="hl">${adm.aparIdNumber || '________'}</span>.</p>

      <p>Her conduct and character are <span class="hl">Good</span>.</p>

      <p>This certificate is issued on her request for the purpose of
      <span class="hl">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>.</p>
    </div>
    <div class="purpose-box">
      📌 <strong>Note:</strong> This certificate is valid for a period of six months from the date of issue. For duplicate certificate, a fresh application with fees must be submitted.
    </div>
    <div class="sign-row">
      <div class="sign-box">
        <div class="sign-line">Student Section</div>
        <div class="sign-sub">LKCWSC</div>
      </div>
      <div class="sign-box">
        <div class="sign-line">Principal</div>
        <div class="sign-sub">LKCWSC, Gangakhed</div>
      </div>
    </div>
    <div class="footer">
      Generated through LKCWSC ERP System &nbsp;|&nbsp; Valid with official stamp and signature &nbsp;|&nbsp; Cert. No.: ${certNo}
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=740,height=900'); w.document.write(html); w.document.close();
};

// ─── Print ID Card ───────────────────────────────────────────────────────────
const printIDCard = (adm) => {
  const validYear = new Date().getFullYear();
  const html = `<!DOCTYPE html><html><head><title>ID Card — ${adm.applicantName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#e8eaf6;padding:40px;display:flex;justify-content:center;align-items:flex-start;gap:20px;flex-wrap:wrap}
    .card{width:320px;border-radius:10px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.2);font-family:Arial,sans-serif}
    .card-top{background:linear-gradient(135deg,#1a237e,#283593);color:white;padding:14px 16px;text-align:center}
    .trust-name{font-size:8.5px;opacity:0.8;letter-spacing:0.5px;margin-bottom:2px}
    .college-name{font-size:11.5px;font-weight:bold;letter-spacing:0.3px;line-height:1.3;margin-bottom:1px}
    .affil{font-size:8px;opacity:0.75}
    .id-label{background:#ffd54f;color:#1a237e;font-size:11px;font-weight:bold;letter-spacing:2px;text-align:center;padding:4px}
    .card-body{background:white;padding:14px}
    .row{display:flex;gap:12px;align-items:flex-start}
    .photo{width:70px;height:85px;border:2px solid #1a237e;border-radius:4px;background:#e8eaf6;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;color:#1a237e}
    .info{flex:1}
    .name{font-size:13px;font-weight:bold;color:#1a237e;margin-bottom:5px;line-height:1.2}
    .field{font-size:10px;color:#444;margin:2px 0;line-height:1.4}
    .field span{font-weight:600;color:#1a237e}
    .id-chip{background:#1a237e;color:white;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:3px;display:inline-block;margin-top:5px;letter-spacing:0.5px}
    .card-bottom{background:#1a237e;color:white;padding:7px 14px;display:flex;justify-content:space-between;align-items:center;font-size:9px}
    .barcode{font-family:monospace;font-size:7px;letter-spacing:2px;opacity:0.6}
    @media print{body{background:white;padding:20px}.card{box-shadow:none}}
  </style></head>
  <body>
  <div class="card">
    <div class="card-top">
      <div class="trust-name">${COLLEGE_TRUST}</div>
      <div class="college-name">Late Kalpana Chawla Women's Senior College</div>
      <div class="affil">Affiliated to SNDT Women's University | Gangakhed</div>
    </div>
    <div class="id-label">STUDENT IDENTITY CARD</div>
    <div class="card-body">
      <div class="row">
        <div class="photo">👩</div>
        <div class="info">
          <div class="name">${adm.applicantName || '—'}</div>
          <div class="field"><span>Course:</span> ${adm.courseType || '—'}</div>
          <div class="field"><span>Subject:</span> ${adm.preferredSubject || '—'}</div>
          <div class="field"><span>Year:</span> ${adm.admissionYear || '—'}</div>
          <div class="field"><span>DOB:</span> ${adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN') : '—'}</div>
          <div class="field"><span>PRN:</span> ${adm.prnNumber || '—'}</div>
          <div class="id-chip">${adm.studentId || 'ID PENDING'}</div>
        </div>
      </div>
    </div>
    <div class="card-bottom">
      <div>Valid: ${validYear}–${validYear+1}</div>
      <div class="barcode">||| ${adm.studentId || '0000'} |||</div>
      <div>lkcwsc.vnssorg.com</div>
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=400,height=380'); w.document.write(html); w.document.close();
};

const GenerateDocTab = ({ user, docType, label, icon }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [admMap, setAdmMap] = useState({});
  const [admLoading, setAdmLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [completing, setCompleting] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/document-requests/student-section/all');
      const all = (res.data.requests || []).filter(r => r.documentType === docType);
      setRequests(all);
    } catch { }
    finally { setLoading(false); }

    setAdmLoading(true);
    try {
      const res2 = await API.get('/admissions/student-section/approved');
      const map = {};
      (res2.data.admissions || []).forEach(a => { map[a.email] = a; });
      setAdmMap(map);
    } catch { }
    finally { setAdmLoading(false); }
  };

  useEffect(() => { fetchData(); }, [docType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = (req) => {
    const adm = admMap[req.studentEmail] || {};
    const merged = {
      applicantName: req.studentName,
      email: req.studentEmail,
      studentId: adm.studentId || '',
      prnNumber: adm.prnNumber || '',
      aparIdNumber: adm.aparIdNumber || '',
      dateOfBirth: adm.dateOfBirth || '',
      gender: adm.gender || 'Female',
      fatherName: adm.fatherName || '',
      motherName: adm.motherName || '',
      category: adm.category || '',
      caste: adm.caste || '',
      courseType: req.branch || adm.courseType || '',
      preferredSubject: adm.preferredSubject || '',
      admissionYear: req.admissionYear || adm.admissionYear || '',
      address: adm.address || '',
      religion: adm.religion || '',
    };
    if (docType === 'TC') printTC(merged);
    else if (docType === 'BONAFIDE') printBonafide(merged);
    else printIDCard(merged);
  };

  const handleComplete = async (req) => {
    setCompleting(req._id);
    try {
      await API.put(`/document-requests/student-section/complete/${req._id}`, { notes: `${label} generated and issued.` });
      setMsg('✅ Marked as completed!');
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setCompleting(''); }
  };

  const pending = requests.filter(r => r.status === 'pending_generation');
  const completed = requests.filter(r => r.status === 'completed');
  const filtered = requests.filter(r => !search || r.studentName?.toLowerCase().includes(search.toLowerCase()) || r.studentEmail?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>{icon} Generate {label}</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Print and issue {label.toLowerCase()} for approved requests.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <button onClick={fetchData}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Pending: {pending.length}</div>
        <div style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Completed: {completed.length}</div>
      </div>

      {loading || admLoading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{icon}</div>
          <h3>No {label} Requests</h3>
          <p>Approved {label.toLowerCase()} requests from Accounts section will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const isPending = req.status === 'pending_generation';
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e0e0'}`, borderRadius: 12, padding: 18, borderLeft: `4px solid ${isPending ? '#E65100' : '#2E7D32'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <h4 style={{ color: '#1565C0', fontSize: 15, margin: 0 }}>{req.studentName}</h4>
                    <p style={{ fontSize: 12, color: '#888', margin: '3px 0 0' }}>{req.studentEmail} · {req.branch || 'N/A'} · {req.admissionYear || 'N/A'}</p>
                    {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>⚡ Urgent</span>}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: isPending ? '#fff3e0' : '#e8f5e9', color: isPending ? '#E65100' : '#2E7D32' }}>
                    {isPending ? '⏳ Pending' : '✅ Completed'}
                  </span>
                </div>
                {req.reason && <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}><strong>Reason:</strong> {req.reason}</p>}
                {admMap[req.studentEmail] && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 12, color: '#0c4a6e' }}>
                    Student ID: <strong>{admMap[req.studentEmail].studentId || '—'}</strong> &nbsp;·&nbsp;
                    PRN: <strong>{admMap[req.studentEmail].prnNumber || '—'}</strong> &nbsp;·&nbsp;
                    ABC ID: <strong>{admMap[req.studentEmail].aparIdNumber || '—'}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => handlePrint(req)}
                    style={{ background: '#1565C0', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    🖨️ Print {label}
                  </button>
                  {isPending && (
                    <button onClick={() => handleComplete(req)} disabled={completing === req._id}
                      style={{ background: '#2E7D32', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: completing === req._id ? 'not-allowed' : 'pointer', opacity: completing === req._id ? 0.7 : 1 }}>
                      {completing === req._id ? '⏳...' : '✅ Mark Issued'}
                    </button>
                  )}
                </div>
                {req.status === 'completed' && req.generatedBy && (
                  <p style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600, marginTop: 8 }}>
                    ✅ Issued by {req.generatedBy} on {req.generatedDate ? new Date(req.generatedDate).toLocaleDateString('en-IN') : '—'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UpdatePrnTab = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { _id, prnNumber, aparIdNumber }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/student-section/approved');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-prn/${editing._id}`, {
        prnNumber: editing.prnNumber,
        aparIdNumber: editing.aparIdNumber,
      });
      setMsg('✅ PRN / ABC ID updated successfully!');
      setTimeout(() => setMsg(''), 3000);
      setEditing(null);
      fetchAdmissions();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to update')); }
    finally { setSaving(false); }
  };

  const filtered = admissions.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🔢 Update PRN / ABC ID</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Add or update the PRN Number and ABC (APAR) ID for enrolled students.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name, student ID or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#1565C0', marginBottom: 4 }}>🔢 Update PRN / ABC ID</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Student: <strong>{editing.applicantName}</strong> ({editing.studentId || 'No ID'})</p>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>PRN Number</label>
              <input type="text" placeholder="Enter PRN Number" value={editing.prnNumber}
                onChange={e => setEditing({ ...editing, prnNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>ABC ID (APAR ID)</label>
              <input type="text" placeholder="Enter ABC / APAR ID" value={editing.aparIdNumber}
                onChange={e => setEditing({ ...editing, aparIdNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, background: '#1565C0', color: '#fff', padding: 12, borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={() => { setEditing(null); setMsg(''); }}
                style={{ padding: '12px 20px', background: '#eee', color: '#333', borderRadius: 9, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔢</div><h3>No students found</h3><p>Approved students will appear here.</p></div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.3fr 1.4fr 0.8fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
            {['Student', 'Student ID', 'PRN Number', 'ABC / APAR ID', 'Action'].map(h => (
              <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
            ))}
          </div>
          {filtered.map((adm, idx) => (
            <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.3fr 1.4fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.courseType} · {adm.admissionYear}</p>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{adm.studentId || '—'}</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.prnNumber ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                {adm.prnNumber || '⚠️ Not set'}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.aparIdNumber ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                {adm.aparIdNumber || '⚠️ Not set'}
              </span>
              <button onClick={() => setEditing({ _id: adm._id, applicantName: adm.applicantName, studentId: adm.studentId, prnNumber: adm.prnNumber || '', aparIdNumber: adm.aparIdNumber || '' })}
                style={{ background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARRY FORWARD TAB
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CARRY FORWARD TAB — with result check
// ─────────────────────────────────────────────────────────────────────────────
const CarryForwardTab = () => {
  const [admissions, setAdmissions]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [yearFilter, setYearFilter]       = useState('all');
  const [promoting, setPromoting]         = useState('');
  const [msg, setMsg]                     = useState('');
  const [results, setResults]             = useState({});
  const [loadingResult, setLoadingResult] = useState('');
  const [expandedResult, setExpandedResult] = useState(null); // admissionId to show full marksheet

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/student-section/approved');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const fetchResult = async (adm) => {
    setLoadingResult(adm._id);
    try {
      const res = await API.get(`/results/by-email/${encodeURIComponent(adm.email)}`);
      const allResults = res.data.results || [];
      if (allResults.length === 0) {
        setResults(prev => ({ ...prev, [adm._id]: { status: 'no_result', allResults: [] } }));
        return;
      }
      // Sort by year desc, semester desc → latest first
      allResults.sort((a, b) => b.year - a.year || b.semester - a.semester);
      const latest = allResults[0];
      const subjects = latest.subjects || [];
      const atktSubs = subjects.filter(s => Number(s.obtainedMarks) < Number(s.maxMarks) * 0.35);
      const status = latest.result ||
        (atktSubs.length === subjects.length && subjects.length > 0 ? 'fail' :
         atktSubs.length > 0 ? 'atkt' :
         (latest.percentage >= 75 ? 'distinction' : 'pass'));
      setResults(prev => ({
        ...prev,
        [adm._id]: {
          status,
          percentage: latest.percentage,
          semester: latest.semester,
          year: latest.year,
          subjects,
          atktSubjects: atktSubs.map(s => s.name),
          totalSubjects: subjects.length,
          allResults,
        }
      }));
    } catch {
      setResults(prev => ({ ...prev, [adm._id]: { status: 'error', allResults: [] } }));
    }
    finally { setLoadingResult(''); }
  };

  const handlePromote = async (adm, newYear) => {
    const r = results[adm._id];
    if (!r || r.status === 'no_result') {
      alert('⚠️ Please check the result first before promoting.'); return;
    }
    if (r.status === 'fail') {
      if (!window.confirm(`⚠️ ${adm.applicantName} has FAILED all subjects (${r.percentage}%).
Are you sure you want to promote?`)) return;
    } else if (r.status === 'atkt') {
      if (!window.confirm(`⚠️ ${adm.applicantName} has ATKT in: ${r.atktSubjects.join(', ')}.
Promote to ${newYear} with ATKT?`)) return;
    } else {
      if (!window.confirm(`Promote ${adm.applicantName} (${r.percentage}%) to ${newYear}?`)) return;
    }
    setPromoting(adm._id);
    try {
      await API.put(`/admissions/carry-forward/${adm._id}`, { newYear });
      setMsg(`✅ ${adm.applicantName} promoted to ${newYear}!`);
      setTimeout(() => setMsg(''), 4000);
      fetchAdmissions();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setPromoting(''); }
  };

  const nextYear = (current) => {
    if (current === '1st Year') return '2nd Year';
    if (current === '2nd Year') return '3rd Year';
    return null;
  };

  const statusColor = (s) => ({
    pass:        { bg: '#e8f5e9', color: '#2E7D32', border: '#a5d6a7' },
    distinction: { bg: '#e8f5e9', color: '#1b5e20', border: '#66bb6a' },
    atkt:        { bg: '#fff3e0', color: '#E65100', border: '#ffb74d' },
    fail:        { bg: '#ffebee', color: '#C62828', border: '#ef9a9a' },
    no_result:   { bg: '#f5f5f5', color: '#888',    border: '#e0e0e0' },
    error:       { bg: '#ffebee', color: '#C62828', border: '#ef9a9a' },
  }[s] || { bg: '#f5f5f5', color: '#888', border: '#e0e0e0' });

  const statusLabel = (r) => {
    if (!r) return null;
    const sc = statusColor(r.status);
    const labels = {
      no_result:   'No Result Uploaded',
      error:       'Fetch Error',
      pass:        `✅ PASS — ${r.percentage}%`,
      distinction: `🏅 DISTINCTION — ${r.percentage}%`,
      atkt:        `⚠️ ATKT — ${r.atktSubjects?.length} subject(s) failed`,
      fail:        `❌ FAIL — All subjects failed`,
    };
    return (
      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
        {labels[r.status] || r.status}
      </span>
    );
  };

  const gradeColor = (obtained, max) => {
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    if (pct < 35) return { bg: '#ffebee', color: '#C62828', label: 'F' };
    if (pct < 45) return { bg: '#fff3e0', color: '#E65100', label: 'B' };
    if (pct < 55) return { bg: '#fff8e1', color: '#F57F17', label: 'B+' };
    if (pct < 65) return { bg: '#f3e5f5', color: '#7B1FA2', label: 'A' };
    if (pct < 75) return { bg: '#e3f2fd', color: '#1565C0', label: 'A+' };
    return { bg: '#e8f5e9', color: '#2E7D32', label: 'O' };
  };

  const filtered = admissions.filter(a => {
    const mf = yearFilter === 'all' || a.admissionYear === yearFilter;
    const q = search.toLowerCase();
    const ms = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q);
    return mf && ms;
  });

  const counts = {
    first:  admissions.filter(a => a.admissionYear === '1st Year').length,
    second: admissions.filter(a => a.admissionYear === '2nd Year').length,
    third:  admissions.filter(a => a.admissionYear === '3rd Year').length,
  };

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 SY / TY Carry Forward</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        Check last semester marksheet first, then promote student to next year.
      </p>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14,
          background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
          color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '1st Year', count: counts.first,  color: '#1565C0', bg: '#e3f2fd' },
          { label: '2nd Year', count: counts.second, color: '#7B1FA2', bg: '#f3e5f5' },
          { label: '3rd Year', count: counts.third,  color: '#2E7D32', bg: '#e8f5e9' },
          { label: 'Total',    count: admissions.length, color: '#555', bg: '#f5f5f5' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
      </div>

      {/* Warning */}
      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#7c5e00' }}>
        📌 <strong>Step 1:</strong> Click <strong>📊 Check Marksheet</strong> to view last semester result.
        &nbsp;&nbsp;<strong>Step 2:</strong> Review marks/status. &nbsp;&nbsp;<strong>Step 3:</strong> Click promote if eligible.
        <br/>Result must be checked before promoting. Pass / ATKT / Fail determines eligibility.
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or student ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year (→ 2nd Year)</option>
          <option value="2nd Year">2nd Year (→ 3rd Year)</option>
          <option value="3rd Year">3rd Year (Completed)</option>
        </select>
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((adm) => {
            const ny = nextYear(adm.admissionYear);
            const r  = results[adm._id];
            const sc = r ? statusColor(r.status) : { bg: '#fff', color: '#888', border: '#e0e7ef' };
            const isExpanded = expandedResult === adm._id;

            return (
              <div key={adm._id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${r ? sc.border : '#e0e7ef'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${r ? sc.color : '#bbb'}` }}>

                {/* Student header row */}
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h4 style={{ color: '#1565C0', fontSize: 15, margin: 0 }}>{adm.applicantName}</h4>
                      <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1565C0', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{adm.admissionYear}</span>
                      {statusLabel(r)}
                    </div>
                    <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>
                      {adm.email} · {adm.courseType || '—'} · ID: {adm.studentId || '—'}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => { fetchResult(adm); setExpandedResult(adm._id); }}
                      disabled={loadingResult === adm._id}
                      style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: loadingResult === adm._id ? 'not-allowed' : 'pointer', opacity: loadingResult === adm._id ? 0.7 : 1 }}>
                      {loadingResult === adm._id ? '⏳ Loading...' : '📊 Check Marksheet'}
                    </button>
                    {r && (
                      <button
                        onClick={() => setExpandedResult(isExpanded ? null : adm._id)}
                        style={{ background: '#f0f4ff', color: '#1565C0', border: '1px solid #c7d7f9', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {isExpanded ? '▲ Hide' : '▼ View Details'}
                      </button>
                    )}
                    {ny && r && r.status !== 'no_result' && r.status !== 'error' && (
                      <button
                        onClick={() => handlePromote(adm, ny)}
                        disabled={promoting === adm._id}
                        style={{
                          background: r.status === 'fail' ? '#ffebee' : r.status === 'atkt' ? '#fff3e0' : '#2E7D32',
                          color: r.status === 'fail' ? '#C62828' : r.status === 'atkt' ? '#E65100' : '#fff',
                          border: `2px solid ${r.status === 'fail' ? '#ef9a9a' : r.status === 'atkt' ? '#ffb74d' : '#2E7D32'}`,
                          borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                          cursor: promoting === adm._id ? 'not-allowed' : 'pointer',
                          opacity: promoting === adm._id ? 0.7 : 1,
                        }}>
                        {promoting === adm._id ? '⏳...' : `→ Promote to ${ny}`}
                      </button>
                    )}
                    {!ny && <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>✅ Course Completed</span>}
                  </div>
                </div>

                {/* Expanded marksheet */}
                {isExpanded && r && r.status !== 'no_result' && r.status !== 'error' && r.subjects?.length > 0 && (
                  <div style={{ borderTop: `1px solid ${sc.border}`, background: r.status === 'fail' ? '#fff8f8' : r.status === 'atkt' ? '#fffaf5' : '#f8fff8' }}>
                    {/* Result summary bar */}
                    <div style={{ padding: '10px 20px', background: sc.bg, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${sc.border}` }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>
                        📋 Sem {r.semester} — {r.year} Result
                      </span>
                      <span style={{ fontSize: 13, color: '#555' }}>
                        Total: <strong>{r.subjects.reduce((s, sub) => s + (sub.obtainedMarks || 0), 0)}</strong>
                        /{r.subjects.reduce((s, sub) => s + (sub.maxMarks || 0), 0)}
                      </span>
                      <span style={{ fontSize: 13, color: '#555' }}>
                        Percentage: <strong style={{ color: sc.color }}>{r.percentage}%</strong>
                      </span>
                      {r.status === 'atkt' && (
                        <span style={{ fontSize: 13, color: '#E65100', fontWeight: 600 }}>
                          ATKT: {r.atktSubjects.length} subject(s)
                        </span>
                      )}
                    </div>

                    {/* Subject-wise table */}
                    <div style={{ padding: '14px 20px' }}>
                      <div style={{ background: '#1565C0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '8px 14px', borderRadius: '8px 8px 0 0', gap: 8 }}>
                        {['Subject', 'Max Marks', 'Obtained', 'Grade', 'Status'].map(h => (
                          <span key={h} style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{h}</span>
                        ))}
                      </div>
                      {r.subjects.map((sub, i) => {
                        const gc = gradeColor(sub.obtainedMarks, sub.maxMarks);
                        const pct = sub.maxMarks > 0 ? Math.round((sub.obtainedMarks / sub.maxMarks) * 100) : 0;
                        const isFail = sub.obtainedMarks < sub.maxMarks * 0.35;
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '9px 14px', gap: 8, alignItems: 'center', background: isFail ? '#fff5f5' : i % 2 === 0 ? '#fafbff' : '#fff', borderBottom: '1px solid #f0f4f8' }}>
                            <span style={{ fontSize: 13, fontWeight: isFail ? 700 : 500, color: isFail ? '#C62828' : '#222' }}>
                              {isFail ? '⚠️ ' : ''}{sub.name || `Subject ${i + 1}`}
                            </span>
                            <span style={{ fontSize: 13, color: '#555' }}>{sub.maxMarks}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isFail ? '#C62828' : '#1565C0' }}>
                              {sub.obtainedMarks} <span style={{ fontSize: 10, color: '#888' }}>({pct}%)</span>
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: gc.bg, color: gc.color, textAlign: 'center' }}>
                              {sub.grade || gc.label}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isFail ? '#C62828' : '#2E7D32' }}>
                              {isFail ? '❌ ATKT' : '✅ Pass'}
                            </span>
                          </div>
                        );
                      })}
                      {/* Summary row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '10px 14px', gap: 8, alignItems: 'center', background: sc.bg, borderRadius: '0 0 8px 8px', borderTop: `2px solid ${sc.color}` }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: sc.color }}>TOTAL</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{r.subjects.reduce((s, sub) => s + (sub.maxMarks || 0), 0)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{r.subjects.reduce((s, sub) => s + (sub.obtainedMarks || 0), 0)} <span style={{ fontSize: 10 }}>({r.percentage}%)</span></span>
                        <span></span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: sc.color }}>{r.status.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* ATKT summary */}
                    {r.status === 'atkt' && (
                      <div style={{ margin: '0 20px 14px', background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                        <strong style={{ color: '#E65100' }}>⚠️ ATKT in {r.atktSubjects.length} Subject(s):</strong>
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {r.atktSubjects.map((s, i) => (
                            <span key={i} style={{ background: '#ffebee', color: '#C62828', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: '#555', marginTop: 8, marginBottom: 0 }}>
                          Student must clear these subjects. Can be promoted with ATKT pending.
                        </p>
                      </div>
                    )}

                    {r.status === 'fail' && (
                      <div style={{ margin: '0 20px 14px', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C62828' }}>
                        ❌ <strong>All subjects failed.</strong> Promotion is not recommended. Staff must approve manually if promoting.
                      </div>
                    )}

                    {(r.status === 'pass' || r.status === 'distinction') && (
                      <div style={{ margin: '0 20px 14px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2E7D32' }}>
                        ✅ <strong>All subjects cleared.</strong> Student is eligible for promotion to {ny || 'next year'}.
                      </div>
                    )}
                  </div>
                )}

                {/* No result message */}
                {isExpanded && r && r.status === 'no_result' && (
                  <div style={{ padding: '16px 20px', background: '#f9f9f9', borderTop: '1px solid #eee', fontSize: 13, color: '#888', textAlign: 'center' }}>
                    📭 No marksheet found for this student. Ask the Examination Section to upload the result first.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const DOCUMENT_FIELDS = [
  { key: 'aadharNumber',              label: '🪪 Aadhar Number',             type: 'text',   note: 'Must be 12 digits' },
  { key: 'aadharName',                label: '🪪 Name on Aadhar',            type: 'text',   note: '' },
  { key: 'aparIdNumber',              label: '🎓 ABC / APAR ID',             type: 'text',   note: '' },
  { key: 'casteCertificateNo',        label: '📜 Caste Certificate No.',      type: 'text',   note: '' },
  { key: 'casteCertificateAuthority', label: '📜 Caste Authority',           type: 'text',   note: '' },
  { key: 'sscObtainedMarks',          label: '📝 SSC Obtained Marks',        type: 'number', note: '' },
  { key: 'sscTotalMarks',             label: '📝 SSC Total Marks',           type: 'number', note: '' },
  { key: 'sscPercentage',             label: '📝 SSC Percentage (%)',        type: 'number', note: '' },
  { key: 'hscObtainedMarks',          label: '📝 HSC Obtained Marks',        type: 'number', note: '' },
  { key: 'hscTotalMarks',             label: '📝 HSC Total Marks',           type: 'number', note: '' },
  { key: 'hscPercentage',             label: '📝 HSC Percentage (%)',        type: 'number', note: '' },
  { key: 'prevYearObtainedMarks',     label: '📊 Prev Year Obtained Marks',  type: 'number', note: '' },
  { key: 'prevYearTotalMarks',        label: '📊 Prev Year Total Marks',     type: 'number', note: '' },
  { key: 'prevYearPercentage',        label: '📊 Prev Year Percentage (%)',  type: 'number', note: '' },
];

const DocumentReplaceTab = () => {
  const [admissions, setAdmissions]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [editFields, setEditFields]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState('');
  const [activeField, setActiveField] = useState(null);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/student-section/approved');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const openStudent = (adm) => {
    setSelected(adm);
    setEditFields({});
    setMsg('');
    setActiveField(null);
  };

  const handleSave = async () => {
    if (Object.keys(editFields).length === 0) {
      setMsg('❌ No changes made.'); return;
    }
    setSaving(true);
    try {
      await API.put(`/admissions/update-documents/${selected._id}`, editFields);
      setMsg('✅ Documents updated successfully!');
      setEditFields({});
      fetchAdmissions();
      // Refresh selected
      const res = await API.get('/admissions/student-section/approved');
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to update')); }
    finally { setSaving(false); }
  };

  const filtered = admissions.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  const changedCount = Object.keys(editFields).length;

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📝 Correct Student Documents</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Fix incorrect or wrongly submitted document details for enrolled students.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name, student ID or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Edit Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ color: '#1565C0', margin: 0 }}>📝 Edit Documents</h3>
                <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>{selected.applicantName} — {selected.studentId || 'No ID'}</p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#7c5e00' }}>
              ⚠️ Only change fields that have wrong/incorrect data submitted by student. All changes are logged.
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {DOCUMENT_FIELDS.map(field => {
                const current = editFields[field.key] !== undefined ? editFields[field.key] : (selected[field.key] || '');
                const isChanged = editFields[field.key] !== undefined && editFields[field.key] !== (selected[field.key] || '');
                const isActive = activeField === field.key;
                return (
                  <div key={field.key} style={{ border: `1px solid ${isChanged ? '#fbbf24' : '#e0e7ef'}`, borderRadius: 8, padding: 10, background: isChanged ? '#fffbeb' : '#fafbff' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1565C0', marginBottom: 5 }}>
                      {field.label}
                      {isChanged && <span style={{ marginLeft: 6, color: '#E65100', fontSize: 10 }}>● Changed</span>}
                    </label>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
                      Current: <strong style={{ color: '#555' }}>{selected[field.key] || '—'}</strong>
                    </div>
                    <input
                      type={field.type}
                      placeholder={`Enter new ${field.label}`}
                      value={current}
                      onFocus={() => setActiveField(field.key)}
                      onBlur={() => setActiveField(null)}
                      onChange={e => setEditFields(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) || '' : e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: `2px solid ${isActive ? '#1565C0' : isChanged ? '#fbbf24' : '#e0e7ef'}`, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: 'white' }}
                    />
                    {field.note && <p style={{ fontSize: 10, color: '#aaa', margin: '3px 0 0' }}>{field.note}</p>}
                  </div>
                );
              })}
            </div>

            {changedCount > 0 && (
              <div style={{ background: '#fff3e0', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#E65100' }}>
                ⚠️ <strong>{changedCount} field{changedCount > 1 ? 's' : ''} changed.</strong> Review carefully before saving.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving || changedCount === 0}
                style={{ flex: 1, background: saving || changedCount === 0 ? '#aaa' : '#1565C0', color: '#fff', padding: 12, borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving || changedCount === 0 ? 'not-allowed' : 'pointer', opacity: changedCount === 0 ? 0.5 : 1 }}>
                {saving ? '⏳ Saving...' : `💾 Save ${changedCount > 0 ? `(${changedCount} change${changedCount > 1 ? 's' : ''})` : 'Changes'}`}
              </button>
              <button onClick={() => { setSelected(null); setMsg(''); setEditFields({}); }}
                style={{ padding: '12px 22px', background: '#eee', color: '#333', borderRadius: 9, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><h3>No students found</h3></div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 0.8fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
            {['Student', 'Course / Year', 'Aadhar No.', 'ABC / APAR ID', 'Action'].map(h => (
              <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
            ))}
          </div>
          {filtered.map((adm, idx) => (
            <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, margin: 0 }}>{adm.courseType || '—'}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.admissionYear}</p>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.aadharNumber ? '#222' : '#E65100', fontWeight: 600 }}>
                {adm.aadharNumber ? adm.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') : '⚠️ Missing'}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.aparIdNumber ? '#222' : '#aaa', fontWeight: 600 }}>
                {adm.aparIdNumber || '—'}
              </span>
              <button onClick={() => openStudent(adm)}
                style={{ background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



// ─── Shared Payment Receipts Tab ─────────────────────────────────────────────
const PaymentReceiptsTab = ({ themeColor = "#1565C0" }) => {
  const [receipts, setReceipts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [errMsg, setErrMsg]         = useState("");

  const fetchReceipts = async () => {
    setLoading(true); setErrMsg("");
    try {
      const res = await API.get("/admissions/receipts/all");
      setReceipts(res.data.receipts || []);
    } catch (e) { setErrMsg("Failed to load: " + (e.response?.data?.message || "Error")); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const filtered = receipts.filter(r => {
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q) || r.studentId?.toLowerCase().includes(q) || r.receiptNo?.toLowerCase().includes(q);
    const mt = typeFilter === "all" || r.feeType === typeFilter;
    const now = new Date(); let md = true;
    if (dateFilter === "today") { const d = new Date(r.paidAt); md = d.toDateString() === now.toDateString(); }
    else if (dateFilter === "week") { const d = new Date(r.paidAt); md = (now - d) <= 7*24*60*60*1000; }
    else if (dateFilter === "month") { const d = new Date(r.paidAt); md = d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }
    return mq && mt && md;
  });

  const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const feeTypes = [...new Set(receipts.map(r => r.feeType).filter(Boolean))];

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>🧾 Payment Receipts</h2>
      <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>All fee receipts collected by Accounts Section.</p>
      {errMsg && <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 14, background: "#ffebee", color: "#C62828" }}>{errMsg}</div>}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ background: "#e8f5e9", color: "#2E7D32", borderRadius: 14, padding: "14px 20px", fontWeight: 700, fontSize: 15 }}>💰 Total: ₹{totalAmount.toLocaleString("en-IN")}</div>
        <div style={{ background: "#e3f2fd", color: themeColor, borderRadius: 14, padding: "14px 20px", fontWeight: 700, fontSize: 15 }}>🧾 Count: {filtered.length}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 Name, ID, receipt no..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 9, border: "1px solid #ddd", fontSize: 14 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #ddd", fontSize: 13 }}>
          <option value="all">All Fee Types</option>
          {feeTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #ddd", fontSize: 13 }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button onClick={fetchReceipts} style={{ padding: "9px 14px", background: "#f0f4ff", color: themeColor, border: "1px solid #ddd", borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🔄</button>
      </div>
      {loading ? <div className="empty-state"><p style={{fontSize:"2rem"}}>⏳</p><h3>Loading...</h3></div>
      : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🧾</div><h3>No receipts found</h3></div>
      : (
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e0e7ef", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr", background: themeColor, padding: "12px 16px", gap: 8 }}>
            {["Receipt No","Student","Email","Fee Type","Amount","Mode","Date"].map(h => <span key={h} style={{color:"#fff",fontWeight:700,fontSize:12}}>{h}</span>)}
          </div>
          {filtered.map((r, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr", padding: "11px 16px", gap: 8, alignItems: "center", borderBottom: "1px solid #f0f4f8", background: idx%2===0?"#fafbff":"#fff" }}>
              <span style={{fontSize:11,fontFamily:"monospace",color:themeColor,fontWeight:700}}>{r.receiptNo||"—"}</span>
              <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{r.studentName}</p><p style={{fontSize:10,color:"#888",margin:0}}>{r.studentId||""} · {r.admissionYear||""}</p></div>
              <span style={{fontSize:11,color:"#555"}}>{r.studentEmail}</span>
              <span style={{fontSize:12}}>{r.feeTypeLabel||r.feeType||"—"}</span>
              <span style={{fontSize:13,fontWeight:700,color:"#2E7D32"}}>₹{(r.amount||0).toLocaleString("en-IN")}</span>
              <span style={{fontSize:11,background:r.paymentMode==="online"?"#e3f2fd":"#e8f5e9",color:r.paymentMode==="online"?"#1565C0":"#2E7D32",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{r.paymentMode==="online"?"🌐 Online":"💵 Cash"}</span>
              <span style={{fontSize:11,color:"#888"}}>{r.paidAt?new Date(r.paidAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"}):"—"}</span>
            </div>
          ))}
          <div style={{padding:"12px 16px",background:"#f8faff",borderTop:"2px solid #e0e7ef",display:"flex",justifyContent:"flex-end",gap:20}}>
            <span style={{fontSize:13,fontWeight:700,color:"#2E7D32"}}>Total: ₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSectionDashboard;
