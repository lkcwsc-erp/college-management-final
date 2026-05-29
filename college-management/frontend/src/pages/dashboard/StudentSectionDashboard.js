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

  // ✅ NEW: All Students states
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

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

  // ✅ NEW: Fetch All Students
 const fetchAllStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await API.get('/auth/students');
      if (res.data.success) setAllStudents(res.data.students || []);
    } catch (err) { console.error('Failed to fetch students:', err); }
    finally { setStudentsLoading(false); }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/auth/students/${id}`);
      fetchAllStudents();
    } catch (err) {
      alert('Failed to delete student: ' + (err.response?.data?.message || 'Error'));
    }
  };
  useEffect(() => {
    if (['home', 'enquiries', 'admissions'].includes(activeTab)) {
      fetchEnquiries();
      fetchAdmissions();
    }
    // ✅ NEW: Load students when tab opens
    if (activeTab === 'students') {
      fetchAllStudents();
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
                  <button onClick={() => setGeneratedCreds(null)} style={{ marginTop: '14px', background: '#2E7D32', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✓ Got It, Close</button>
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
          {activeTab === 'students' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: '4px' }}>👩‍🎓 All Students</h2>
                  <p style={{ color: '#666', fontSize: '14px' }}>Total registered students: <strong>{allStudents.length}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="🔍 Search by name, email or roll no..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '260px' }} />
                  <button onClick={fetchAllStudents} style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
                </div>
              </div>

              {studentsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
              ) : allStudents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👩‍🎓</div>
                  <h3>No Students Yet</h3>
                  <p>Students will appear here after Principal approves their admission or credentials are generated.</p>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 1.3fr 1.1fr 0.8fr 0.7fr', background: '#1565C0', padding: '14px 16px', gap: '8px' }}>
                    {['Name', 'Email', 'Aadhaar', 'Password', 'Status', 'Action'].map(h => (
                      <span key={h} style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{h}</span>
                    ))}
                  </div>
                  {allStudents
                    .filter(s => {
                      if (!studentSearch) return true;
                      const q = studentSearch.toLowerCase();
                      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || (s.aadharNumber || '').includes(q);
                    })
                    .map((s, idx) => (
                      <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 1.3fr 1.1fr 0.8fr 0.7fr', padding: '12px 16px', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                            {s.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{s.name || 'N/A'}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#555', wordBreak: 'break-all' }}>{s.email || 'N/A'}</span>
                        <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>{s.aadharNumber || '—'}</span>
                        <span style={{ fontSize: '12px', color: '#E65100', fontFamily: 'monospace', fontWeight: '600' }}>{s.plainPassword || '—'}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px', background: s.isActive ? '#e8f5e9' : '#ffebee', color: s.isActive ? '#2E7D32' : '#C62828', textAlign: 'center' }}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button onClick={() => handleDeleteStudent(s._id, s.name)}
                          style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                          🗑️
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ══════════════ DOCUMENT VERIFICATION (TC / Bonafide / ID Card / Marksheet) ══════════════ */}
          {activeTab === 'documents' && <DocumentVerificationTab user={user} />}

          {/* ══════════════ GENERATE TC ══════════════ */}
          {activeTab === 'tc' && <GenerateDocTab user={user} docType="TC" label="Transfer Certificate (TC)" icon="📄" />}

          {/* ══════════════ GENERATE BONAFIDE ══════════════ */}
          {activeTab === 'bonafide' && <GenerateDocTab user={user} docType="BONAFIDE" label="Bonafide Certificate" icon="📜" />}

          {/* ══════════════ GENERATE ID CARD ══════════════ */}
          {activeTab === 'idcard' && <GenerateDocTab user={user} docType="ID_CARD" label="ID Card" icon="🪪" />}

          {/* ══════════════ UPDATE PRN / ABC ID ══════════════ */}
          {activeTab === 'prn' && <UpdatePrnTab />}

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
const COLLEGE_NAME = 'Late Kalpana Chawla Mahila College';
const COLLEGE_SUBTITLE = 'Senior Science & Arts College, Gangakhed';
const COLLEGE_ADDRESS = 'Gangakhed, Dist. Parbhani, Maharashtra - 431514';

const printTC = (adm) => {
  const html = `<!DOCTYPE html><html><head><title>Transfer Certificate</title>
  <style>
    body{font-family:'Times New Roman',serif;margin:0;padding:30px;color:#000}
    .page{max-width:720px;margin:auto;border:3px double #000;padding:30px}
    .header{text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:20px}
    .college{font-size:22px;font-weight:bold;letter-spacing:1px}
    .subtitle{font-size:14px;margin:4px 0}
    .doc-title{font-size:18px;font-weight:bold;text-decoration:underline;margin:12px 0 0;letter-spacing:2px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    td{padding:8px 12px;border:1px solid #555;font-size:14px;vertical-align:top}
    td:first-child{width:40%;font-weight:bold;background:#f9f9f9}
    .serial{text-align:right;font-size:13px;margin-bottom:8px}
    .sign-row{display:flex;justify-content:space-between;margin-top:40px;font-size:13px}
    .sign-box{text-align:center;width:180px}
    .sign-line{border-top:1px solid #000;padding-top:6px;margin-top:30px}
    .footer{text-align:center;font-size:11px;color:#555;margin-top:20px;border-top:1px solid #ccc;padding-top:10px}
    @media print{body{padding:0}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <div class="college">${COLLEGE_NAME}</div>
      <div class="subtitle">${COLLEGE_SUBTITLE}</div>
      <div class="subtitle">${COLLEGE_ADDRESS}</div>
      <div class="doc-title">TRANSFER CERTIFICATE</div>
    </div>
    <div class="serial">TC No.: TC-${Date.now().toString().slice(-6)} &nbsp;&nbsp; Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    <table>
      <tr><td>Student Name</td><td>${adm.applicantName || '—'}</td></tr>
      <tr><td>Student ID</td><td>${adm.studentId || '—'}</td></tr>
      <tr><td>PRN Number</td><td>${adm.prnNumber || '—'}</td></tr>
      <tr><td>ABC / APAR ID</td><td>${adm.aparIdNumber || '—'}</td></tr>
      <tr><td>Date of Birth</td><td>${adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN') : '—'}</td></tr>
      <tr><td>Gender</td><td>${adm.gender || '—'}</td></tr>
      <tr><td>Category / Caste</td><td>${adm.category ? adm.category.toUpperCase() : '—'} / ${adm.caste || '—'}</td></tr>
      <tr><td>Course / Subject</td><td>${adm.courseType || '—'} — ${adm.preferredSubject || '—'}</td></tr>
      <tr><td>Admission Year</td><td>${adm.admissionYear || '—'}</td></tr>
      <tr><td>Reason for Leaving</td><td>&nbsp;</td></tr>
      <tr><td>Conduct & Character</td><td>Good</td></tr>
      <tr><td>Date of Issue</td><td>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
    </table>
    <div class="sign-row">
      <div class="sign-box"><div class="sign-line">Class Teacher</div></div>
      <div class="sign-box"><div class="sign-line">Student Section Staff</div></div>
      <div class="sign-box"><div class="sign-line">Principal</div></div>
    </div>
    <div class="footer">This is a computer-generated Transfer Certificate. Valid with official stamp and signature.</div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900'); w.document.write(html); w.document.close();
};

const printBonafide = (adm) => {
  const html = `<!DOCTYPE html><html><head><title>Bonafide Certificate</title>
  <style>
    body{font-family:'Times New Roman',serif;margin:0;padding:40px;color:#000}
    .page{max-width:680px;margin:auto;border:3px double #000;padding:36px}
    .header{text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:24px}
    .college{font-size:22px;font-weight:bold;letter-spacing:1px}
    .subtitle{font-size:14px;margin:4px 0}
    .doc-title{font-size:18px;font-weight:bold;text-decoration:underline;margin:14px 0 0;letter-spacing:2px}
    .cert-no{text-align:right;font-size:13px;margin-bottom:16px}
    .body{font-size:15px;line-height:2;text-align:justify}
    .highlight{font-weight:bold;text-decoration:underline}
    .sign-row{display:flex;justify-content:space-between;margin-top:50px;font-size:13px}
    .sign-box{text-align:center;width:180px}
    .sign-line{border-top:1px solid #000;padding-top:6px;margin-top:30px}
    .footer{text-align:center;font-size:11px;color:#555;margin-top:24px;border-top:1px solid #ccc;padding-top:10px}
    @media print{body{padding:0}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <div class="college">${COLLEGE_NAME}</div>
      <div class="subtitle">${COLLEGE_SUBTITLE}</div>
      <div class="subtitle">${COLLEGE_ADDRESS}</div>
      <div class="doc-title">BONAFIDE CERTIFICATE</div>
    </div>
    <div class="cert-no">Cert. No.: BON-${Date.now().toString().slice(-6)} &nbsp;&nbsp; Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    <div class="body">
      <p>This is to certify that <span class="highlight">${adm.applicantName || '________'}</span>,
      ${adm.gender === 'Female' ? 'D/o' : 'S/o'} <span class="highlight">${adm.fatherName || '________'}</span>,
      is a <em>bona fide</em> student of this college.</p>
      <p>She is currently enrolled in <span class="highlight">${adm.courseType || '________'}</span>
      (Subject: <span class="highlight">${adm.preferredSubject || '________'}</span>)
      for the academic year <span class="highlight">${adm.admissionYear || '________'}</span>.</p>
      <p>Her Student ID is <span class="highlight">${adm.studentId || '________'}</span>
      and PRN is <span class="highlight">${adm.prnNumber || '________'}</span>.</p>
      <p>This certificate is issued for the purpose of <span class="highlight">_________________________</span>
      as requested by the student.</p>
    </div>
    <div class="sign-row">
      <div class="sign-box"><div class="sign-line">Student Section Staff</div></div>
      <div class="sign-box"><div class="sign-line">Principal</div></div>
    </div>
    <div class="footer">This is a computer-generated Bonafide Certificate. Valid with official stamp and signature.</div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=750,height=850'); w.document.write(html); w.document.close();
};

const printIDCard = (adm) => {
  const html = `<!DOCTYPE html><html><head><title>ID Card</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;padding:40px;background:#f0f4f8;display:flex;justify-content:center}
    .card{width:340px;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.15)}
    .card-header{background:linear-gradient(135deg,#0D47A1,#1565C0);color:white;padding:16px;text-align:center}
    .card-header h3{margin:0;font-size:14px;font-weight:800;letter-spacing:0.5px}
    .card-header p{margin:3px 0 0;font-size:10px;opacity:0.85}
    .card-body{background:white;padding:16px}
    .photo-row{display:flex;gap:14px;align-items:center;margin-bottom:14px}
    .photo{width:72px;height:90px;border:2px solid #1565C0;border-radius:6px;background:#e3f2fd;display:flex;align-items:center;justify-content:center;font-size:32px;color:#1565C0;flex-shrink:0}
    .info h2{font-size:15px;color:#0D47A1;margin:0 0 6px;font-weight:800}
    .info p{font-size:11px;color:#444;margin:3px 0;line-height:1.4}
    .info .id{font-size:13px;font-weight:800;color:#1565C0;background:#e3f2fd;padding:3px 8px;border-radius:4px;display:inline-block;margin-top:4px}
    .card-footer{background:#0D47A1;color:white;padding:10px 16px;font-size:10px;display:flex;justify-content:space-between}
    @media print{body{background:white;padding:0}.card{box-shadow:none}}
  </style></head><body>
  <div class="card">
    <div class="card-header">
      <h3>${COLLEGE_NAME}</h3>
      <p>${COLLEGE_SUBTITLE}</p>
    </div>
    <div class="card-body">
      <div class="photo-row">
        <div class="photo">👩</div>
        <div class="info">
          <h2>${adm.applicantName || '—'}</h2>
          <p>Course: ${adm.courseType || '—'}</p>
          <p>Subject: ${adm.preferredSubject || '—'}</p>
          <p>Year: ${adm.admissionYear || '—'}</p>
          <p>DOB: ${adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN') : '—'}</p>
          <span class="id">${adm.studentId || 'ID Pending'}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <span>PRN: ${adm.prnNumber || '—'}</span>
      <span>Valid: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</span>
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=420,height=420'); w.document.write(html); w.document.close();
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
      category: adm.category || '',
      caste: adm.caste || '',
      courseType: req.branch || adm.courseType || '',
      preferredSubject: adm.preferredSubject || '',
      admissionYear: req.admissionYear || adm.admissionYear || '',
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

                {/* Show student data fetched from admissions */}
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

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PRN / ABC ID TAB
// ─────────────────────────────────────────────────────────────────────────────
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
const CarryForwardTab = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [promoting, setPromoting] = useState('');
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

  const handlePromote = async (adm, newYear) => {
    if (!window.confirm(`Promote ${adm.applicantName} to ${newYear}?`)) return;
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

  const filtered = admissions.filter(a => {
    const mf = yearFilter === 'all' || a.admissionYear === yearFilter;
    const q = search.toLowerCase();
    const ms = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q);
    return mf && ms;
  });

  const firstYear  = admissions.filter(a => a.admissionYear === '1st Year').length;
  const secondYear = admissions.filter(a => a.admissionYear === '2nd Year').length;
  const thirdYear  = admissions.filter(a => a.admissionYear === '3rd Year').length;

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 SY / TY Carry Forward</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Promote students from 1st Year → 2nd Year or 2nd Year → 3rd Year.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '1st Year', count: firstYear, color: '#1565C0', bg: '#e3f2fd' },
          { label: '2nd Year', count: secondYear, color: '#7B1FA2', bg: '#f3e5f5' },
          { label: '3rd Year', count: thirdYear, color: '#2E7D32', bg: '#e8f5e9' },
          { label: 'Total', count: admissions.length, color: '#555', bg: '#f5f5f5' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
      </div>

      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#7c5e00' }}>
        ⚠️ <strong>Important:</strong> Carry forward only at the end of the academic year. This action updates the student's year permanently and cannot be undone without manual correction.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or student ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year (→ SY)</option>
          <option value="2nd Year">2nd Year (→ TY)</option>
          <option value="3rd Year">3rd Year (Completed)</option>
        </select>
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1.2fr 1.2fr 1fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
            {['Student', 'Course', 'Current Year', 'Student ID', 'Action'].map(h => (
              <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
            ))}
          </div>
          {filtered.map((adm, idx) => {
            const ny = nextYear(adm.admissionYear);
            return (
              <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1.2fr 1.2fr 1fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                </div>
                <span style={{ fontSize: 12, color: '#333' }}>{adm.courseType || '—'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1565C0' }}>{adm.admissionYear || '—'}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{adm.studentId || '—'}</span>
                <div>
                  {ny ? (
                    <button
                      onClick={() => handlePromote(adm, ny)}
                      disabled={promoting === adm._id}
                      style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: promoting === adm._id ? 'not-allowed' : 'pointer', opacity: promoting === adm._id ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                      {promoting === adm._id ? '⏳...' : `→ ${ny}`}
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>✅ Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSectionDashboard;
