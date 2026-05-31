import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';
import StudentsReport from '../../components/StudentsReport';

// ─── Admission Detail Modal ───────────────────────────────────────────────────
const AdmissionModal = ({ adm, onClose, onRefresh, showMsg }) => {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await API.put(`/admissions/principal-approve/${adm._id}`, { notes });
      setMsg('✅ Approved! Student ID: ' + res.data.studentId);
      setTimeout(() => { onClose(); onRefresh(); }, 2000);
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
      await API.put(`/admissions/principal-reject/${adm._id}`, { reason: rejectReason });
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
      <h4 style={{ color: '#C62828', borderBottom: '2px solid #ffebee', paddingBottom: '6px', marginBottom: '10px' }}>{title}</h4>
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
          <h3 style={{ color: '#C62828', margin: 0 }}>📋 Admission Form — Final Review</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555' }}>✕</button>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: '#e8f5e9', color: '#2E7D32', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            ✅ Verified by Student Section
          </div>
          <div style={{ background: '#fff3e0', color: '#E65100', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            ⏳ Awaiting Your Final Approval
          </div>
        </div>

        {/* Staff Notes */}
        {adm.staffNotes && (
          <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '12px', marginBottom: '16px', borderLeft: '4px solid #2E7D32' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#2E7D32', marginBottom: '4px' }}>💬 Student Section Notes:</p>
            <p style={{ fontSize: '13px', color: '#555' }}>{adm.staffNotes}</p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>By: {adm.staffApprovedBy} on {adm.staffApprovedDate ? new Date(adm.staffApprovedDate).toLocaleDateString('en-IN') : '—'}</p>
          </div>
        )}

        {/* Personal Info */}
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

        {/* Contact */}
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
       
        {/* Academic */}
        <Section title="🎓 Academic Information">
          <Field label="Course Type" value={adm.courseType} />
          <Field label="Preferred Subject" value={adm.preferredSubject} />
          <Field label="Admission Year" value={adm.admissionYear} />
          <Field label="SSC Marks" value={adm.sscObtainedMarks ? `${adm.sscObtainedMarks}/${adm.sscTotalMarks} (${adm.sscPercentage}%)` : null} />
          <Field label="HSC Marks" value={adm.hscObtainedMarks ? `${adm.hscObtainedMarks}/${adm.hscTotalMarks} (${adm.hscPercentage}%)` : null} />
          <Field label="Previous Year" value={adm.prevYearObtainedMarks ? `${adm.prevYearObtainedMarks}/${adm.prevYearTotalMarks} (${adm.prevYearPercentage}%)` : null} />
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
          ].map(doc => (
            <div key={doc.key} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
              <span style={{ width: '180px', flexShrink: 0, fontSize: '13px', color: '#888', fontWeight: '600' }}>{doc.label}</span>
              {adm[doc.key] ? (
               <a href={adm[doc.key].startsWith('http') ? adm[doc.key] : `https://college-management-nnve.onrender.com/uploads/${adm[doc.key]}`} target="_blank" rel="noopener noreferrer"
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
          📅 Submitted: <strong>{new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
        </div>

        {/* Action */}
        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>🔄 Final Decision</h4>

          <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#E65100', borderLeft: '4px solid #E65100' }}>
            ⚠️ Approving will <strong>generate a unique Student ID</strong> and send it to student's email automatically.
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Principal Notes (Optional)</label>
            <textarea rows="2" placeholder="Any notes..." value={notes} onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {showReject && (
            <div style={{ marginBottom: '16px', background: '#ffebee', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #C62828' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#C62828', display: 'block', marginBottom: '6px' }}>❌ Rejection Reason *</label>
              <textarea rows="3" placeholder="Enter reason (student will see this)..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ffcdd2', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleReject} disabled={loading}
                  style={{ flex: 1, padding: '10px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? '⏳ Rejecting...' : '❌ Confirm Reject'}
                </button>
                <button onClick={() => { setShowReject(false); setRejectReason(''); }}
                  style={{ padding: '10px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {msg && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontWeight: '600',
              background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
              color: msg.startsWith('✅') ? '#2E7D32' : '#C62828',
            }}>{msg}</div>
          )}

          {!showReject && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleApprove} disabled={loading}
                style={{ flex: 1, padding: '12px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Processing...' : '✅ Final Approve & Generate Student ID'}
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

// ─── Main Principal Dashboard ─────────────────────────────────────────────────
const PrincipalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // TC states
  const [tcRequests, setTcRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Admission states
  const [admissions, setAdmissions] = useState([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  const [message, setMessage] = useState('');

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const fetchRequests = () => {
    API.get('/document-requests/principal/all')
      .then(res => setTcRequests(res.data.requests || []))
      .catch(() => {});
  };

  const fetchAdmissions = async () => {
    setAdmissionsLoading(true);
    try {
      const res = await API.get('/admissions/principal/pending');
      if (res.data.success) setAdmissions(res.data.admissions || []);
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (activeTab === 'admissions') fetchAdmissions();
    if (activeTab === 'tc') fetchRequests();
  }, [activeTab]);

  const handleApprove = async () => {
    if (!selectedReq) return;
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/principal/approve/${selectedReq._id}`, { notes });
      showMsg('✅ ' + res.data.message);
      setSelectedReq(null); setActionType(''); setNotes('');
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!notes.trim()) { showMsg('❌ Please provide rejection reason'); return; }
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/principal/reject/${selectedReq._id}`, { reason: notes });
      showMsg('✅ ' + res.data.message);
      setSelectedReq(null); setActionType(''); setNotes('');
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally { setLoading(false); }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending_principal': return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending My Approval' };
      case 'rejected_by_principal': return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Me' };
      case 'approved_by_principal':
      case 'pending_generation': return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved & Forwarded' };
      case 'completed': return { bg: '#e3f2fd', color: '#1565C0', label: '✅ Completed' };
      default: return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const pendingTC = tcRequests.filter(r => r.status === 'pending_principal');
  const processedTC = tcRequests.filter(r => r.status !== 'pending_principal');

  const tabs = [
    { id: 'home',       label: '🏠 Dashboard' },
    { id: 'admissions', label: '📝 Admission Approvals' },
    { id: 'tc',         label: '🎓 TC Approvals' },
    { id: 'reports',    label: '📊 College Reports' },
    { id: 'staff',      label: '👥 Staff Overview' },
    { id: 'notices',    label: '📢 Important Notices' },
    { id: 'all_students', label: '👩‍🎓 All Students' },
  ];

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
          {tabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.id === 'tc' && pendingTC.length > 0 && (
                <span style={{ background: '#dc3545', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', marginLeft: '6px' }}>
                  {pendingTC.length}
                </span>
              )}
              {tab.id === 'admissions' && admissions.length > 0 && (
                <span style={{ background: '#E65100', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', marginLeft: '6px' }}>
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
          <h2>👨‍🏫 Principal Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Principal)</span></div>
        </div>

        {message && (
          <div style={{
            margin: '20px', padding: '14px 18px', borderRadius: '10px',
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2E7D32' : '#C62828', fontWeight: '500'
          }}>{message}</div>
        )}

        <div className="dashboard-content">

          {/* ── HOME ── */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)', padding: '24px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #C62828' }}>
                <h3 style={{ color: '#C62828', marginBottom: '8px' }}>👨‍🏫 Welcome, {user?.name}!</h3>
                <p style={{ color: '#555' }}>Review admission forms, approve TC requests, and monitor college operations.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admissions')}>
                  <div className="dash-card-icon">📝</div>
                  <div><h3>{admissions.length}</h3><p>Pending Admissions</p></div>
                </div>
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tc')}>
                  <div className="dash-card-icon">⏳</div>
                  <div><h3>{pendingTC.length}</h3><p>Pending TC Approvals</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div><h3>{processedTC.length}</h3><p>Processed TC Requests</p></div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">🎓</div>
                  <div><h3>{tcRequests.length}</h3><p>Total TC Requests</p></div>
                </div>
              </div>

              {admissions.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '24px', borderRadius: '12px', marginTop: '20px', border: '2px solid #ffb74d' }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>⚠️ {admissions.length} Admission Form{admissions.length > 1 ? 's' : ''} Awaiting Your Approval!</h3>
                  <p style={{ color: '#555', marginBottom: '14px' }}>Student Section has verified these forms. Your final approval will generate Student IDs.</p>
                  <button onClick={() => setActiveTab('admissions')}
                    style={{ background: '#E65100', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    📝 Review Admissions Now →
                  </button>
                </div>
              )}

              {pendingTC.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '24px', borderRadius: '12px', marginTop: '20px', border: '2px solid #ffb74d' }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>⚠️ {pendingTC.length} TC Request{pendingTC.length > 1 ? 's' : ''} Awaiting Your Approval!</h3>
                  <button onClick={() => setActiveTab('tc')}
                    style={{ background: '#E65100', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    🎓 Review TC Requests Now →
                  </button>
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
                  showMsg={showMsg}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: '#C62828', margin: 0 }}>📝 Admission Approvals</h3>
                  <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Forms verified by Student Section — awaiting your final approval</p>
                </div>
                <button onClick={fetchAdmissions}
                  style={{ padding: '9px 16px', background: '#ffebee', color: '#C62828', border: '1px solid #ffcdd2', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {admissionsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : admissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Pending Admissions</h3>
                  <p>All admission forms have been processed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {admissions.map(adm => (
                    <div key={adm._id} onClick={() => setSelectedAdmission(adm)}
                      style={{
                        background: '#fff', border: '2px solid #ffcdd2', borderRadius: '12px',
                        padding: '18px 22px', cursor: 'pointer', transition: 'box-shadow 0.2s',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        borderLeft: '5px solid #C62828',
                      }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffebee', color: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                        🎓
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#222' }}>{adm.applicantName}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>📧 {adm.email} · 📱 {adm.phone}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>🎓 {adm.preferredSubject || adm.course || 'Course not specified'}</p>
                        {adm.staffApprovedBy && (
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#2E7D32' }}>✅ Verified by: {adm.staffApprovedBy}</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ background: '#fff3e0', color: '#E65100', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          ⏳ Pending
                        </span>
                        <p style={{ fontSize: '11px', color: '#aaa', margin: '6px 0 0' }}>
                          {new Date(adm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '12px', color: '#C62828', marginTop: '4px', fontWeight: '600' }}>Review & Decide →</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TC APPROVALS ── */}
          {activeTab === 'tc' && (
            <div>
              <h2 style={{ color: '#C62828', marginBottom: '8px' }}>🎓 Transfer Certificate (TC) Approvals</h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>Review TC requests forwarded by Accounts Section.</p>

              <h3 style={{ color: '#E65100', marginBottom: '14px' }}>⏳ Pending TC Approvals ({pendingTC.length})</h3>

              {pendingTC.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>All Clear!</h3><p>No TC requests pending.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  {pendingTC.map(req => (
                    <div key={req._id} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '2px solid #fbbf24', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ color: '#1565C0', marginBottom: '6px', fontSize: '20px' }}>🎓 Transfer Certificate (TC)</h4>
                          <p style={{ fontSize: '13px', color: '#666' }}>Requested: {new Date(req.createdAt).toLocaleString()}</p>
                        </div>
                        <span style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: '#fff3e0', color: '#E65100' }}>⏳ Pending Final Approval</span>
                      </div>

                      <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #bae6fd', fontSize: '13px' }}>
                        <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '10px' }}>👤 Student Details:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <span><strong>Name:</strong> {req.studentName}</span>
                          <span><strong>Email:</strong> {req.studentEmail}</span>
                          <span><strong>Phone:</strong> {req.studentPhone || 'N/A'}</span>
                          <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                        <button onClick={() => { setSelectedReq(req); setActionType('approve'); setNotes(''); }}
                          style={{ background: '#28a745', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                          ✅ Approve TC
                        </button>
                        <button onClick={() => { setSelectedReq(req); setActionType('reject'); setNotes(''); }}
                          style={{ background: '#dc3545', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                          ❌ Reject TC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ color: '#1565C0', marginBottom: '14px', marginTop: '40px' }}>📋 Processed TC Requests ({processedTC.length})</h3>
              {processedTC.length === 0 ? (
                <p style={{ color: '#888' }}>No processed TC requests yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {processedTC.map(req => {
                    const s = getStatusStyle(req.status);
                    return (
                      <div key={req._id} style={{ background: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '4px' }}>🎓 TC — {req.studentName}</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>{req.studentEmail} • {req.branch}</p>
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COLLEGE REPORTS (Students) ── */}
          {activeTab === 'reports' && <StudentsReport themeColor="#C62828" />}

          {/* ── OTHER TABS ── */}
{!['home', 'admissions', 'tc', 'reports'].includes(activeTab) && (
            <div className="empty-state">
              <div className="empty-icon">🚧</div>
              <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p>This feature is under development. Coming soon!</p>
            </div>
          )}

          {/* ══ ALL STUDENTS ══ */}
          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color: '#C62828', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Principal has full access — view, edit, and delete student records.</p>
              <StudentViewFull canEdit={true} themeColor="#C62828" />
            </div>
          )}
        </div>
      </main>

      {/* TC MODAL */}
      {selectedReq && actionType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}
          onClick={() => { setSelectedReq(null); setActionType(''); setNotes(''); }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: actionType === 'approve' ? '#28a745' : '#dc3545', marginBottom: '14px' }}>
              {actionType === 'approve' ? '✅ Approve TC Request' : '❌ Reject TC Request'}
            </h2>
            <div style={{ background: '#f8faff', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              <p><strong>Student:</strong> {selectedReq.studentName}</p>
              <p><strong>Email:</strong> {selectedReq.studentEmail}</p>
            </div>
            <div className="form-group">
              <label>{actionType === 'approve' ? 'Notes (optional)' : 'Rejection Reason *'}</label>
              <textarea rows="3" placeholder={actionType === 'approve' ? 'Any notes...' : 'Why rejecting?'}
                value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={actionType === 'approve' ? handleApprove : handleReject} disabled={loading}
                style={{ background: actionType === 'approve' ? '#28a745' : '#dc3545', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Processing...' : (actionType === 'approve' ? '✅ Confirm Approve' : '❌ Confirm Reject')}
              </button>
              <button onClick={() => { setSelectedReq(null); setActionType(''); setNotes(''); }}
                style={{ background: '#eee', color: '#333', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
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
