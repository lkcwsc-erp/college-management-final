import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import AdminReports from '../../components/AdminReports';
import StudentViewFull from './StudentViewFull';

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

  // Doc fee states
  const [docFeeTypes, setDocFeeTypes] = useState([]);
  const [docFeeLoading, setDocFeeLoading] = useState(false);

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

  const fetchDocFeeTypes = async () => {
    setDocFeeLoading(true);
    try {
      const res = await API.get('/doc-fee-types');
      setDocFeeTypes(res.data.docFeeTypes || []);
    } catch {}
    finally { setDocFeeLoading(false); }
  };

  useEffect(() => {
    fetchRequests();
    fetchAdmissions();
    fetchDocFeeTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'admissions') fetchAdmissions();
    if (activeTab === 'tc') fetchRequests();
    if (activeTab === 'doc_fees') fetchDocFeeTypes();
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
  const pendingDocFees = docFeeTypes.filter(d => d.status === 'pending');

  const tabs = [
    { id: 'home',         label: '🏠 Dashboard' },
    { id: 'admissions',   label: '📝 Admission Approvals' },
    { id: 'tc',           label: '🎓 TC Approvals' },
    { id: 'doc_requests', label: '📋 Document Requests' },
    { id: 'resources',    label: '📚 Resources' },
    { id: 'reports',      label: '📊 College Reports' },
    { id: 'staff',        label: '👥 Staff Overview' },
    { id: 'notices',      label: '📢 Important Notices' },
    { id: 'all_students', label: '👩‍🎓 All Students' },
    { id: 'doc_fees',      label: '💰 Doc Fee Approvals' },
    { id: 'fee_struct',   label: '🏛️ Fee Structure Approvals' },
  ];

  return (
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
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
              {tab.id === 'doc_fees' && pendingDocFees.length > 0 && (
                <span style={{ background: '#dc3545', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', marginLeft: '6px' }}>
                  {pendingDocFees.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── MAIN ── */}
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

              {pendingDocFees.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '24px', borderRadius: '12px', marginTop: '20px', border: '2px solid #ffb74d' }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>⚠️ {pendingDocFees.length} Doc Fee Type{pendingDocFees.length > 1 ? 's' : ''} Awaiting Approval!</h3>
                  <button onClick={() => setActiveTab('doc_fees')}
                    style={{ background: '#E65100', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    💰 Review Doc Fees Now →
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

          {/* ── COLLEGE REPORTS ── */}
          {/* ── DOC REQUESTS ── */}
          {activeTab === 'doc_requests' && <PrincipalDocRequestsTab />}

          {/* ── RESOURCES ── */}
          {activeTab === 'resources' && <PrincipalResourcesTab />}


          {activeTab === 'reports' && (
            <div>
              <AdminReports themeColor="#C62828" />
              <div style={{ marginTop: 24 }}>
                <PrincipalPassFailReport />
              </div>
            </div>
          )}

          {/* ── STAFF OVERVIEW ── */}
          {activeTab === 'staff' && <PrincipalStaffTab />}

          {/* ── NOTICES ── */}
          {activeTab === 'notices' && <PrincipalNoticesTab />}

          {/* ── ALL STUDENTS ── */}
          {activeTab === 'fee_struct' && (
            <FeeStructApprovalTab role="principal" />
          )}

          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color: '#C62828', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Principal has full access — view, edit, and delete student records.</p>
              <StudentViewFull canEdit={true} themeColor="#C62828" role="principal" />
            </div>
          )}

          {/* ── DOC FEE APPROVALS ── */}
          {activeTab === 'doc_fees' && (
            <div>
              <h2 style={{ color: '#C62828', marginBottom: 4 }}>💰 Document Fee Type Approvals</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Accounts Section ne naye document fee types add kiye hain — approve ya reject karo.
              </p>

              {docFeeLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : (
                <>
                  {/* Pending */}
                  <h3 style={{ color: '#E65100', marginBottom: 12 }}>
                    ⏳ Pending Approvals ({pendingDocFees.length})
                  </h3>
                  {pendingDocFees.length === 0 ? (
                    <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '16px 20px', color: '#2E7D32', fontWeight: 600, marginBottom: 24 }}>
                      ✅ No pending approvals
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                      {pendingDocFees.map(doc => (
                        <div key={doc._id} style={{ background: '#fff', border: '2px solid #fbbf24', borderRadius: 12, padding: 18, borderLeft: '4px solid #E65100' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <h4 style={{ color: '#1a1a2e', margin: '0 0 4px', fontSize: 16 }}>{doc.label}</h4>
                              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                                Added by: {doc.addedBy} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 18, fontWeight: 800, color: '#1565C0' }}>₹{doc.price}</span>
                              <span style={{ background: '#fff3e0', color: '#E65100', fontSize: 12, padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>⏳ Pending</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                            <button onClick={async () => {
                              try {
                                await API.put(`/doc-fee-types/${doc._id}/approve`);
                                showMsg('✅ Document fee type approved!');
                                fetchDocFeeTypes();
                              } catch (e) { showMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
                            }} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                              ✅ Approve
                            </button>
                            <button onClick={async () => {
                              const reason = window.prompt('Rejection reason:');
                              if (!reason) return;
                              try {
                                await API.put(`/doc-fee-types/${doc._id}/reject`, { reason });
                                showMsg('Rejected.');
                                fetchDocFeeTypes();
                              } catch (e) { showMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
                            }} style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '9px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approved */}
                  <h3 style={{ color: '#1565C0', marginBottom: 12 }}>
                    ✅ Approved ({docFeeTypes.filter(d => d.status === 'approved').length})
                  </h3>
                  <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px 120px', background: '#1565C0', padding: '12px 16px', gap: 8 }}>
                      {['Document Type', 'Fee (₹)', 'Added By', 'Status'].map(h => (
                        <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>
                      ))}
                    </div>
                    {docFeeTypes.filter(d => d.status === 'approved').length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: 13 }}>No approved fee types yet.</div>
                    ) : (
                      docFeeTypes.filter(d => d.status === 'approved').map((doc, idx) => (
                        <div key={doc._id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px 120px', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{doc.label}</span>
                          <span style={{ fontWeight: 700, color: '#1565C0' }}>₹{doc.price}</span>
                          <span style={{ fontSize: 12, color: '#555' }}>{doc.isDefault ? '⚙️ Default' : doc.addedBy}</span>
                          <span style={{ fontSize: 11, background: '#e8f5e9', color: '#2E7D32', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>✅ Approved</span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── TC MODAL ── */}
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


// ─── Payment Receipts Tab ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const _PaymentReceiptsTab = ({ themeColor }) => {
  const [receipts, setReceipts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [errMsg, setErrMsg]         = useState('');

  const fetchReceipts = async () => {
    setLoading(true); setErrMsg('');
    try {
      const res = await API.get('/admissions/receipts/all');
      setReceipts(res.data.receipts || []);
    } catch (e) { setErrMsg('Failed to load: ' + (e.response?.data?.message || 'Error')); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const filtered = receipts.filter(r => {
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q) || r.studentId?.toLowerCase().includes(q) || r.receiptNo?.toLowerCase().includes(q);
    const mt = typeFilter === 'all' || r.feeType === typeFilter;
    const now = new Date(); let md = true;
    if (dateFilter === 'today') { const d = new Date(r.paidAt); md = d.toDateString() === now.toDateString(); }
    else if (dateFilter === 'week') { const d = new Date(r.paidAt); md = (now - d) <= 7 * 24 * 60 * 60 * 1000; }
    else if (dateFilter === 'month') { const d = new Date(r.paidAt); md = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
    return mq && mt && md;
  });

  const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const feeTypes = [...new Set(receipts.map(r => r.feeType).filter(Boolean))];

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>🧾 Payment Receipts</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>All fee receipts collected by Accounts Section.</p>
      {errMsg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14, background: '#ffebee', color: '#C62828' }}>{errMsg}</div>}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 14, padding: '14px 20px', fontWeight: 700, fontSize: 15 }}>💰 Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
        <div style={{ background: '#e3f2fd', color: themeColor, borderRadius: 14, padding: '14px 20px', fontWeight: 700, fontSize: 15 }}>🧾 Count: {filtered.length}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Name, ID, receipt no..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Fee Types</option>
          {feeTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button onClick={fetchReceipts} style={{ padding: '9px 14px', background: '#f0f4ff', color: themeColor, border: '1px solid #ddd', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🔄</button>
      </div>
      {loading ? <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🧾</div><h3>No receipts found</h3></div>
          : (
            <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
                {['Receipt No', 'Student', 'Email', 'Fee Type', 'Amount', 'Mode', 'Date'].map(h => <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>)}
              </div>
              {filtered.map((r, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr', padding: '11px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: themeColor, fontWeight: 700 }}>{r.receiptNo || '—'}</span>
                  <div><p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{r.studentName}</p><p style={{ fontSize: 10, color: '#888', margin: 0 }}>{r.studentId || ''} · {r.admissionYear || ''}</p></div>
                  <span style={{ fontSize: 11, color: '#555' }}>{r.studentEmail}</span>
                  <span style={{ fontSize: 12 }}>{r.feeTypeLabel || r.feeType || '—'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32' }}>₹{(r.amount || 0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 11, background: r.paymentMode === 'online' ? '#e3f2fd' : '#e8f5e9', color: r.paymentMode === 'online' ? '#1565C0' : '#2E7D32', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{r.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>{r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</span>
                </div>
              ))}
              <div style={{ padding: '12px 16px', background: '#f8faff', borderTop: '2px solid #e0e7ef', display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32' }}>Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
    </div>
  );
};


// ─── Pass/Fail Report ────────────────────────────────────────────────────────
const PrincipalPassFailReport = () => {
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [semFilter, setSemFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/results/all-results')
      .then(res => setResults(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r => {
    const ms = !semFilter || String(r.semester) === semFilter;
    const my = !yearFilter || String(r.year) === yearFilter;
    return ms && my;
  });

  const sems  = [...new Set(results.map(r => r.semester))].sort();
  const years = [...new Set(results.map(r => r.year))].sort().reverse();

  const passCount = filtered.filter(r => r.result === 'PASS' || r.result === 'DISTINCTION').length;
  const failCount = filtered.filter(r => r.result === 'FAIL').length;
  const atktCount = filtered.filter(r => r.result === 'ATKT').length;

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
      <h3 style={{ color: '#C62828', marginBottom: 16 }}>📊 Pass / Fail Report</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#e3f2fd', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1565C0' }}>{filtered.length}</div>
        </div>
        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>Pass / Distinction</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1b5e20' }}>{passCount}</div>
        </div>
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#E65100', fontWeight: 600 }}>ATKT</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#E65100' }}>{atktCount}</div>
        </div>
        <div style={{ background: '#ffebee', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#C62828', fontWeight: 600 }}>Fail</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#C62828' }}>{failCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="">All Semesters</option>
          {sems.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 20, fontSize: '1.5rem' }}>⏳</div>
        : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 14 }}>No results found.</div>
          : (
            <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e7ef' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 0.8fr 0.8fr 0.8fr', background: '#C62828', padding: '10px 14px', gap: 8 }}>
                {['Student', 'Course/Year', 'Semester', '%', 'Result', ''].map(h => (
                  <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>
                ))}
              </div>
              {filtered.map((r, idx) => {
                const resColor = { DISTINCTION: '#1b5e20', PASS: '#2E7D32', ATKT: '#E65100', FAIL: '#C62828' }[r.result] || '#888';
                return (
                  <div key={r._id || idx} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 0.8fr 0.8fr 0.8fr', padding: '9px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{r.studentName || r.studentEmail}</p>
                      <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{r.studentEmail}</p>
                    </div>
                    <span style={{ fontSize: 12 }}>{r.courseType || '—'}</span>
                    <span style={{ fontSize: 12 }}>Sem {r.semester} · {r.year}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{r.percentage}%</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: resColor, padding: '2px 6px', borderRadius: 8, background: `${resColor}18` }}>{r.result}</span>
                    <span style={{ fontSize: 10, color: '#888' }}>{r.subjects?.length || 0} subj.</span>
                  </div>
                );
              })}
            </div>
          )}
    </div>
  );
};


// ─── Staff Overview Tab ───────────────────────────────────────────────────────
const ROLE_AUTHORITIES = {
  staff_student: {
    label: 'Student Section Staff', icon: '👩‍🎓', color: '#1565C0', bg: '#e3f2fd',
    authorities: [
      '📝 Admission Enquiry Management',
      '🎓 Pending Admission Approval (Forward to Principal)',
      '👥 Generate Student Login Credentials',
      '📄 Issue TC / Bonafide / ID Card',
      '🔢 Update PRN / ABC ID',
      '🎓 SY/TY Carry Forward',
      '📋 Document Request Processing',
      '📬 Receive Admin Messages',
      '🧾 View Payment Receipts',
      '👩‍🎓 View/Edit All Students',
    ],
  },
  staff_accounts: {
    label: 'Accounts Section Staff', icon: '💰', color: '#2E7D32', bg: '#e8f5e9',
    authorities: [
      '💰 Collect Student Fees',
      '🧾 Generate Fee Receipts',
      '📄 Document Fee Collection',
      '💼 View/Edit Fee Structure',
      '🏗️ Record College Expenses',
      '📊 Finance Overview Dashboard',
      '📋 Document Request Fee Collection',
      '📥 Export Financial Reports',
      '👩‍🎓 View All Students',
    ],
  },
  staff_exam: {
    label: 'Exam Section Staff', icon: '📝', color: '#E65100', bg: '#fff3e0',
    authorities: [
      '📋 Publish Exam Forms (Regular/Backlog)',
      '📝 View Student Exam Form Requests',
      '📊 Upload Student Results',
      '📈 Pass/Fail/ATKT Report',
      '✅ Verify TC (Result Verification)',
      '🔍 Document Request Verification',
      '📁 Academic Year Result Management',
    ],
  },
  staff_scholarship: {
    label: 'Scholarship Section Staff', icon: '🏅', color: '#7B1FA2', bg: '#f3e5f5',
    authorities: [
      '🎖️ MahaDBT Scholarship Management',
      '📋 View Student Scholarship Status',
      '✅ Approve/Update Scholarship Forms',
      '💰 Scholarship Amount Entry',
      '📊 Academic Year-wise Scholarship Data',
      '📥 Export Scholarship Reports',
    ],
  },
  staff_principal: {
    label: 'Principal Office Staff', icon: '🏛️', color: '#C62828', bg: '#ffebee',
    authorities: [
      '📋 Assist Principal in Document Work',
      '📢 Post Important Notices',
      '📁 Manage College Resources',
      '👁️ View All Student Records',
    ],
  },
  admin: {
    label: 'Administrator', icon: '⚙️', color: '#333', bg: '#f5f5f5',
    authorities: [
      '👥 Full Staff Management (Add/Edit/Delete)',
      '👩‍🎓 Full Student Management',
      '📚 Course Add/Edit/Delete',
      '🏆 Achievement Add/Edit/Delete',
      '📢 Notice Add/Edit/Delete',
      '✉️ Send Messages to All Staff/Students',
      '🖼️ Gallery Management',
      '📋 All Document Requests',
      '💼 Fee Structure Approval',
      '📊 Full Reports Access',
    ],
  },
};

const PrincipalStaffTab = () => {
  const [staff, setStaff]     = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView]       = useState('authority');
  const [expandedRole, setExpandedRole] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/auth/staff'),
      API.get('/faculty'),
    ]).then(([sRes, fRes]) => {
      setStaff(sRes.data.staff || []);
      setFaculty(fRes.data.faculty || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const staffByRole = {};
  staff.forEach(s => {
    if (!staffByRole[s.role]) staffByRole[s.role] = [];
    staffByRole[s.role].push(s);
  });

  return (
    <div>
      <h2 style={{ color: '#C62828', marginBottom: 4 }}>👥 Staff, Faculty & Authorities</h2>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>Staff authorities, role-wise members, and teaching faculty overview.</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f0f4f8', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['authority', '🔐 Authorities'], ['staff', `🧑‍💼 Staff (${staff.length})`], ['faculty', `👩‍🏫 Faculty (${faculty.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: view === id ? '#C62828' : 'transparent', color: view === id ? '#fff' : '#555' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div> : (

        view === 'authority' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(ROLE_AUTHORITIES).map(([role, info]) => {
              const members = staffByRole[role] || [];
              const isExpanded = expandedRole === role;
              return (
                <div key={role} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${info.color}33`, overflow: 'hidden' }}>
                  <div onClick={() => setExpandedRole(isExpanded ? null : role)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', background: info.bg, borderLeft: `5px solid ${info.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{info.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15, color: info.color }}>{info.label}</h4>
                        <span style={{ fontSize: 12, color: '#888' }}>{members.length} member{members.length !== 1 ? 's' : ''} assigned</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: info.color }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '16px 20px' }}>
                      <h5 style={{ color: info.color, marginBottom: 10, fontSize: 13 }}>🔐 Authorities & Permissions</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 6, marginBottom: members.length > 0 ? 16 : 0 }}>
                        {info.authorities.map((auth, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', background: info.bg, padding: '6px 12px', borderRadius: 8 }}>
                            <span style={{ color: info.color }}>✓</span>{auth}
                          </div>
                        ))}
                      </div>
                      {members.length > 0 && (
                        <div>
                          <h5 style={{ color: '#555', marginBottom: 10, fontSize: 13 }}>👤 Assigned Members ({members.length})</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                            {members.map(m => (
                              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8faff', borderRadius: 10, padding: '10px 14px', border: '1px solid #e0e7ef' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                                  {m.photo ? <img src={m.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : info.icon}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{m.name}</div>
                                  <div style={{ fontSize: 11, color: '#888' }}>{m.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {members.length === 0 && <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>⚠️ No staff assigned yet.</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )

        : view === 'staff' ? (
          staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}><div style={{ fontSize: '2.5rem' }}>👥</div><p>No staff records found.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {staff.map(s => {
                const info = ROLE_AUTHORITIES[s.role] || { label: s.role, icon: '👤', color: '#555', bg: '#f5f5f5' };
                return (
                  <div key={s._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: 16, borderLeft: `4px solid ${info.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                        {s.photo ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : info.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#1a1a2e' }}>{s.name}</h4>
                        <span style={{ fontSize: 11, fontWeight: 700, color: info.color, background: info.bg, padding: '2px 8px', borderRadius: 8 }}>{info.label}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <div>📧 {s.email}</div>
                      {s.phone && <div style={{ marginTop: 4 }}>📞 {s.phone}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )

        : (
          faculty.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}><div style={{ fontSize: '2.5rem' }}>👩‍🏫</div><p>No faculty records found.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {faculty.map(f => (
                <div key={f._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: 16, borderLeft: '4px solid #1565C0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                      {f.photo ? <img src={f.photo.startsWith('http') ? f.photo : `${process.env.REACT_APP_API_URL}/uploads/${f.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : '👩‍🏫'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, color: '#1a1a2e' }}>{f.name}</h4>
                      <div style={{ fontSize: 12, color: '#1565C0', fontWeight: 600 }}>{f.designation}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {f.department && <div>🏫 {f.department}</div>}
                    {f.qualification && <div style={{ marginTop: 2 }}>🎓 {f.qualification}</div>}
                    {f.experience && <div style={{ marginTop: 2 }}>⏱ {f.experience}</div>}
                    {f.email && <div style={{ marginTop: 2 }}>📧 {f.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          )
        )
      )}
    </div>
  );
};



const PrincipalNoticesTab = () => {
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [staff, setStaff]         = useState([]);
  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [photo, setPhoto]         = useState('');
  const [photoName, setPhotoName] = useState('');
  const [audience, setAudience]   = useState('all');
  const [specificEmails, setSpecificEmails] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  const fetchNotices = () => {
    setLoading(true);
    API.get('/notices').then(res => setNotices(res.data.notices || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
    API.get('/auth/staff').then(res => setStaff(res.data.staff || [])).catch(() => {});
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg('❌ Image must be under 2MB.'); return; }
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const roleLabel = (role) => ({
    staff_student: 'Student Section', staff_accounts: 'Accounts', staff_exam: 'Exam',
    staff_scholarship: 'Scholarship', staff_principal: 'Principal', admin: 'Admin',
  }[role] || role);

  const handleAdd = async () => {
    if (!title.trim()) { setMsg('❌ Title required.'); return; }
    setSaving(true);
    try {
      await API.post('/notices', {
        title,
        content: body || ' ',
        attachment: photo || '',
        targetAudience: audience === 'all' ? 'all' : audience === 'students' ? 'student' : 'staff',
        specificRecipients: audience === 'specific' ? specificEmails : [],
      });
      setMsg('✅ Notice posted!');
      setTitle(''); setBody(''); setPhoto(''); setPhotoName(''); setSpecificEmails([]); setAudience('all');
      setTimeout(() => setMsg(''), 3000);
      fetchNotices();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try { await API.delete(`/notices/${id}`); fetchNotices(); } catch {}
  };

  const audienceLabel = (n) => {
    if (n.targetAudience === 'student') return '👩‍🎓 Students';
    if (n.targetAudience === 'staff') return '👥 All Staff';
    if (n.specificRecipients?.length > 0) return `👤 ${n.specificRecipients.length} staff`;
    return '🌐 Everyone';
  };

  return (
    <div>
      <h2 style={{ color: '#C62828', marginBottom: 4 }}>📢 Notices & Circulars</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Post notices for students, staff, or specific staff members.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20 }}>
        <h4 style={{ color: '#C62828', marginBottom: 16 }}>📝 Post New Notice</h4>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 8 }}>Send To *</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ k: 'all', l: '🌐 Everyone' }, { k: 'students', l: '👩‍🎓 All Students' }, { k: 'staff', l: '👥 All Staff' }, { k: 'specific', l: '👤 Specific Staff' }].map(o => (
              <button key={o.k} onClick={() => setAudience(o.k)}
                style={{ padding: '7px 16px', borderRadius: 20, border: `2px solid ${audience === o.k ? '#C62828' : '#ddd'}`, background: audience === o.k ? '#ffebee' : '#fff', color: audience === o.k ? '#C62828' : '#555', fontWeight: audience === o.k ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {audience === 'specific' && (
          <div style={{ marginBottom: 14, background: '#f8faff', borderRadius: 10, padding: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 8 }}>Select Staff Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {staff.map(s => (
                <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: `1px solid ${specificEmails.includes(s.email) ? '#C62828' : '#ddd'}`, background: specificEmails.includes(s.email) ? '#ffebee' : '#fff', cursor: 'pointer', fontSize: 12 }}>
                  <input type="checkbox" checked={specificEmails.includes(s.email)}
                    onChange={e => setSpecificEmails(prev => e.target.checked ? [...prev, s.email] : prev.filter(x => x !== s.email))} style={{ cursor: 'pointer' }} />
                  <span style={{ fontWeight: 600, color: specificEmails.includes(s.email) ? '#C62828' : '#333' }}>{s.name}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>({roleLabel(s.role)})</span>
                </label>
              ))}
            </div>
            {specificEmails.length > 0 && <p style={{ fontSize: 11, color: '#C62828', marginTop: 8, fontWeight: 600 }}>✅ {specificEmails.length} staff selected</p>}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Title *</label>
          <input type="text" placeholder="Notice title..." value={title} onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Content</label>
          <textarea rows="3" placeholder="Notice content..." value={body} onChange={e => setBody(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>📷 Attach Photo (optional, max 2MB)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              📎 Choose Image
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
            {photoName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>✅ {photoName}</span>
                <button onClick={() => { setPhoto(''); setPhotoName(''); }} style={{ background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>
          {photo && <img src={photo} alt="preview" style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8, border: '1px solid #ddd', marginTop: 8, objectFit: 'contain', display: 'block' }} />}
        </div>
        <button onClick={handleAdd} disabled={saving}
          style={{ background: '#C62828', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? '⏳ Posting...' : '📢 Post Notice'}
        </button>
      </div>

      {loading ? <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p></div>
        : notices.length === 0 ? <div className="empty-state"><div className="empty-icon">📢</div><h3>No notices yet</h3></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notices.map(n => (
                <div key={n._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: 16, borderLeft: '4px solid #C62828', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <h4 style={{ color: '#1a1a2e', fontSize: 15, margin: '0 0 4px' }}>{n.title}</h4>
                      <span style={{ fontSize: 11, background: '#fff3e0', color: '#E65100', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{audienceLabel(n)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : ''}</span>
                      <button onClick={() => handleDelete(n._id)} style={{ background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️</button>
                    </div>
                  </div>
                  {n.content && n.content !== ' ' && <p style={{ fontSize: 13, color: '#555', margin: '6px 0' }}>{n.content}</p>}
                  {n.attachment && <img src={n.attachment} alt="notice" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #ddd', objectFit: 'contain', display: 'block', marginTop: 8 }} />}
                </div>
              ))}
            </div>
          )}
    </div>
  );
};


// ─── Principal Document Requests Tab ─────────────────────────────────────────
const PrincipalDocRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState('pending_principal');
  const [saving, setSaving]     = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [msg, setMsg]               = useState('');

  const DOC_CFG = {
    BONAFIDE:           { label: 'Bonafide Certificate',           icon: '📋', color: '#7B1FA2', fee: 200 },
    MIGRATION:          { label: 'Migration Certificate',          icon: '📜', color: '#795548', fee: 200 },
    PROVISIONAL_DEGREE: { label: 'Provisional Degree Certificate', icon: '📜', color: '#0277BD', fee: 100 },
    DEGREE:             { label: 'Degree Certificate',             icon: '🎓', color: '#1B5E20', fee: 100 },
    TC:                 { label: 'Transfer Certificate',           icon: '🎓', color: '#1565C0', fee: 0 },
  };

  const fetchRequests = () => {
    setLoading(true);
    API.get('/document-requests/principal/all')
      .then(res => setRequests(res.data.requests || []))
      .catch(() => setMsg('❌ Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (req) => {
    setSaving(req._id);
    try {
      await API.put(`/document-requests/principal/approve/${req._id}`, { notes: 'Approved by Principal' });
      setMsg('✅ Approved — document will be issued');
      fetchRequests();
    } catch (e) { setMsg('❌ Failed'); }
    finally { setSaving(''); }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) return;
    setSaving(rejectModal._id);
    try {
      await API.put(`/document-requests/principal/reject/${rejectModal._id}`, { reason: rejectNote });
      setMsg('✅ Rejected');
      setRejectModal(null); setRejectNote('');
      fetchRequests();
    } catch (e) { setMsg('❌ Failed'); }
    finally { setSaving(''); }
  };

  const statusStyle = (s) => ({
    pending_principal:     { bg: '#fff3e0', color: '#E65100', label: '⏳ Awaiting My Approval' },
    rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Me' },
    pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' },
    completed:             { bg: '#e3f2fd', color: '#1565C0', label: '🏁 Issued' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending_principal').length;

  return (
    <div>
      <h2 style={{ color: '#C62828', marginBottom: 4 }}>📋 Document Requests — Final Approval</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>These requests have been approved by Admin. Your approval is the final step.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828', fontWeight: 500 }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Pending: {pendingCount}</div>
        <div style={{ background: '#e3f2fd', color: '#1565C0', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Total: {requests.length}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['pending_principal','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 20, border: `2px solid ${filter===f?'#C62828':'#ddd'}`, background: filter===f?'#C62828':'#fff', color: filter===f?'#fff':'#555', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              {f === 'pending_principal' ? '⏳ Pending' : '📋 All'}
            </button>
          ))}
          <button onClick={fetchRequests} style={{ padding: '6px 14px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🔄</button>
        </div>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 26, maxWidth: 440, width: '100%' }}>
            <h3 style={{ color: '#C62828', marginBottom: 12 }}>❌ Reject Request</h3>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>{rejectModal.studentName} — {DOC_CFG[rejectModal.documentType]?.label}</p>
            <textarea rows="3" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason..."
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={handleReject} disabled={!rejectNote.trim() || saving === rejectModal._id}
                style={{ background: '#C62828', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                {saving === rejectModal._id ? '⏳...' : '❌ Confirm'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                style={{ background: '#eee', color: '#333', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
      : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: '#f8faff', borderRadius: 12 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
          <p>{filter === 'pending_principal' ? 'No pending approvals.' : 'No requests.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const cfg = DOC_CFG[req.documentType] || { label: req.documentType, icon: '📄', color: '#555' };
            const st  = statusStyle(req.status);
            const isPending = req.status === 'pending_principal';
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e7ef'}`, borderRadius: 12, padding: 18, borderLeft: `5px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <div>
                      <h4 style={{ color: cfg.color, fontSize: 15, margin: 0 }}>{cfg.label}</h4>
                      {cfg.fee > 0 && <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>₹{cfg.fee}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  <span><strong>Student:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch || '—'}</span>
                  <span><strong>Year:</strong> {req.admissionYear || '—'}</span>
                  {req.reason && <span style={{ gridColumn: '1/-1' }}><strong>Reason:</strong> {req.reason}</span>}
                  {req.adminNotes && <span style={{ gridColumn: '1/-1', color: '#7B1FA2', fontStyle: 'italic' }}>Admin Note: {req.adminNotes}</span>}
                </div>
                {isPending && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleApprove(req)} disabled={saving === req._id}
                      style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {saving === req._id ? '⏳...' : '✅ Approve — Issue Document'}
                    </button>
                    <button onClick={() => { setRejectModal(req); setRejectNote(''); }}
                      style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ❌ Reject
                    </button>
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


// ─── Principal Resources Tab ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  study_material:  { label: 'Study Material',   icon: '📄', color: '#1565C0', bg: '#e3f2fd' },
  syllabus:        { label: 'Syllabus',          icon: '📋', color: '#7B1FA2', bg: '#f3e5f5' },
  question_paper:  { label: 'Question Papers',   icon: '📝', color: '#E65100', bg: '#fff3e0' },
  elibrary:        { label: 'E-Library',         icon: '📚', color: '#2E7D32', bg: '#e8f5e9' },
  other:           { label: 'Other',             icon: '📎', color: '#795548', bg: '#efebe9' },
};

const BLANK_RES = { title:'', description:'', type:'study_material', link:'', course:'', year:'', icon:'📄', isActive:true };

const PrincipalResourcesTab = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const [form, setForm]           = useState({ ...BLANK_RES });
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm]   = useState(false);

  const fetchResources = () => {
    setLoading(true);
    API.get('/resources')
      .then(res => setResources(res.data.resources || []))
      .catch(() => setMsg('❌ Failed to load resources'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, []);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleSave = async () => {
    if (!form.title.trim()) { showMsg('❌ Title required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/resources/${editId}`, form);
        showMsg('✅ Resource updated!');
      } else {
        await API.post('/resources', form);
        showMsg('✅ Resource added!');
      }
      setForm({ ...BLANK_RES }); setEditId(null); setShowForm(false);
      fetchResources();
    } catch (e) { showMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      showMsg('✅ Deleted');
      fetchResources();
    } catch { showMsg('❌ Failed to delete'); }
  };

  const handleEdit = (r) => {
    setForm({ title: r.title, description: r.description||'', type: r.type||'study_material', link: r.link||'', course: r.course||'', year: r.year||'', icon: r.icon||'📄', isActive: r.isActive });
    setEditId(r._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = filterType === 'all' ? resources : resources.filter(r => r.type === filterType);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#C62828', marginBottom:4 }}>📚 Resources</h2>
          <p style={{ color:'#666', fontSize:14 }}>Post study materials, syllabus, question papers and e-library links for students.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setForm({ ...BLANK_RES }); setEditId(null); }}
          style={{ background:'#C62828', color:'#fff', border:'none', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          {showForm ? '✕ Cancel' : '➕ Add Resource'}
        </button>
      </div>

      {msg && <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:14, fontSize:14, fontWeight:500, background: msg.startsWith('✅')?'#e8f5e9':'#ffebee', color: msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background:'#fff', borderRadius:14, border:'2px solid #C62828', padding:22, marginBottom:24 }}>
          <h4 style={{ color:'#C62828', marginBottom:16 }}>{editId ? '✏️ Edit Resource' : '➕ Add New Resource'}</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Title *</label>
              <input type="text" placeholder="e.g. B.Sc. Chemistry Syllabus 2025" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, icon: TYPE_CONFIG[e.target.value]?.icon || '📄' }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }}>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Course</label>
              <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }}>
                <option value="">All Courses</option>
                <option value="B.Sc.">B.Sc.</option>
                <option value="B.A.">B.A.</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Year</label>
              <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }}>
                <option value="">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Link / URL</label>
              <input type="text" placeholder="https://..." value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:5 }}>Description</label>
              <textarea rows="2" placeholder="Brief description..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="resActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              <label htmlFor="resActive" style={{ fontSize:13, fontWeight:600 }}>Active (visible to students)</label>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ background:'#C62828', color:'#fff', border:'none', borderRadius:8, padding:'10px 26px', fontSize:14, fontWeight:700, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving...' : editId ? '💾 Update' : '✅ Add Resource'}
            </button>
            <button onClick={() => { setShowForm(false); setForm({ ...BLANK_RES }); setEditId(null); }}
              style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 18px', fontSize:14, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','🗂️ All'], ...Object.entries(TYPE_CONFIG).map(([k,v]) => [k, `${v.icon} ${v.label}`])].map(([k,l]) => (
          <button key={k} onClick={() => setFilterType(k)}
            style={{ padding:'6px 14px', borderRadius:20, border:`2px solid ${filterType===k?'#C62828':'#ddd'}`, background: filterType===k?'#C62828':'#fff', color: filterType===k?'#fff':'#555', fontWeight:600, fontSize:12, cursor:'pointer' }}>
            {l} {k === 'all' ? `(${resources.length})` : `(${resources.filter(r=>r.type===k).length})`}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign:'center', padding:40, fontSize:'2rem' }}>⏳</div>
      : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#888', background:'#f8faff', borderRadius:12 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📭</div>
          <p>No resources posted yet.</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop:12, background:'#C62828', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>➕ Add First Resource</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.map(r => {
            const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.other;
            return (
              <div key={r._id} style={{ background:'#fff', borderRadius:12, border:`1px solid ${r.isActive?'#e0e7ef':'#f5f5f5'}`, padding:16, opacity: r.isActive?1:0.6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:22 }}>{r.icon || cfg.icon}</span>
                    <div>
                      <h4 style={{ margin:0, fontSize:14, color:'#1a1a2e' }}>{r.title}</h4>
                      <span style={{ fontSize:11, background: cfg.bg, color: cfg.color, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{cfg.label}</span>
                    </div>
                  </div>
                  {!r.isActive && <span style={{ fontSize:10, background:'#f5f5f5', color:'#aaa', padding:'2px 8px', borderRadius:10 }}>Hidden</span>}
                </div>
                {r.description && <p style={{ fontSize:12, color:'#666', marginBottom:8 }}>{r.description}</p>}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                  {r.course && <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'2px 8px', borderRadius:8, fontWeight:600 }}>{r.course}</span>}
                  {r.year   && <span style={{ fontSize:11, background:'#e8f5e9', color:'#2E7D32', padding:'2px 8px', borderRadius:8, fontWeight:600 }}>{r.year}</span>}
                </div>
                {r.link && (
                  <a href={r.link} target="_blank" rel="noreferrer"
                    style={{ display:'inline-block', fontSize:12, color:'#1565C0', fontWeight:600, marginBottom:10 }}>
                    🔗 Open Link
                  </a>
                )}
                <div style={{ display:'flex', gap:8, borderTop:'1px solid #f0f4f8', paddingTop:10 }}>
                  <button onClick={() => handleEdit(r)}
                    style={{ flex:1, background:'#e3f2fd', color:'#1565C0', border:'none', borderRadius:7, padding:'6px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(r._id)}
                    style={{ flex:1, background:'#ffebee', color:'#C62828', border:'none', borderRadius:7, padding:'6px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    🗑️ Delete
                  </button>
                </div>
                <div style={{ fontSize:10, color:'#aaa', marginTop:6 }}>
                  Added: {new Date(r.createdAt).toLocaleDateString('en-IN')} {r.createdBy ? `by ${r.createdBy}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   FeeStructApprovalTab — used by both Principal and Admin
   role: 'principal' | 'admin'
═══════════════════════════════════════════════════════════ */
const FeeStructApprovalTab = ({ role }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await API.get('/fee-structure-approvals');
      setApprovals(res.data.approvals || []);
    } catch { flash('❌ Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id, action, note = '') => {
    try {
      const endpoint = role === 'principal'
        ? (action === 'approve' ? `/fee-structure-approvals/${id}/principal-approve` : `/fee-structure-approvals/${id}/principal-reject`)
        : (action === 'approve' ? `/fee-structure-approvals/${id}/admin-approve`     : `/fee-structure-approvals/${id}/admin-reject`);
      await API.put(endpoint, { note, reason: note });
      flash(`✅ ${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
      fetchApprovals();
    } catch (e) { flash('❌ ' + (e.response?.data?.message || 'Action failed')); }
  };

  const pending = approvals.filter(a =>
    role === 'principal' ? a.status === 'pending_principal' : a.status === 'pending_admin'
  );
  const done = approvals.filter(a =>
    role === 'principal'
      ? ['approved', 'rejected_by_principal', 'rejected_by_admin', 'pending_admin'].includes(a.status)
      : ['approved', 'rejected_by_admin'].includes(a.status)
  );

  const statusBadge = (s) => {
    const map = {
      pending_principal: { bg:'#fff3e0', color:'#E65100', label:'⏳ Pending Principal' },
      pending_admin:     { bg:'#e3f2fd', color:'#1565C0', label:'⏳ Pending Admin' },
      approved:          { bg:'#e8f5e9', color:'#2E7D32', label:'✅ Approved' },
      rejected_by_principal: { bg:'#ffebee', color:'#C62828', label:'❌ Rejected by Principal' },
      rejected_by_admin:     { bg:'#ffebee', color:'#C62828', label:'❌ Rejected by Admin' },
    };
    const c = map[s] || { bg:'#f5f5f5', color:'#555', label: s };
    return <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:10, background:c.bg, color:c.color }}>{c.label}</span>;
  };

  const SEM_LABELS = ['S-I','S-II','S-III','S-IV','S-V','S-VI'];

  return (
    <div>
      <h2 style={{ color:'#1565C0', marginBottom:4 }}>🏛️ Fee Structure Approvals</h2>
      <p style={{ color:'#666', marginBottom:16, fontSize:14 }}>
        Accounts Section ne fee amounts edit kiye hain — review karo aur approve ya reject karo.
      </p>
      {msg && <div style={{ padding:'10px 16px', borderRadius:9, marginBottom:14, fontWeight:600, fontSize:14, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>⏳ Loading...</div>
      ) : (
        <>
          <h3 style={{ color:'#E65100', marginBottom:12, fontSize:15 }}>
            ⏳ Pending Your Approval ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <div style={{ background:'#f8faff', borderRadius:12, border:'1px solid #e0e7ef', padding:'30px', textAlign:'center', color:'#aaa', marginBottom:24 }}>
              ✅ No pending approvals
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
              {pending.map(a => (
                <div key={a._id} style={{ background:'#fff', borderRadius:12, border:'2px solid #ffcc80', padding:'16px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <span style={{ fontSize:15, fontWeight:700, color:'#333' }}>{a.itemName}</span>
                      <span style={{ fontSize:12, color:'#888', marginLeft:10 }}>{a.courseKey} — {a.itemSection}</span>
                      {a.isNewItem && <span style={{ fontSize:11, fontWeight:700, marginLeft:8, background:'#e3f2fd', color:'#1565C0', padding:'2px 8px', borderRadius:8 }}>New Item</span>}
                    </div>
                    {statusBadge(a.status)}
                  </div>
                  {/* Amount comparison */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:14 }}>
                    <div style={{ background:'#f5f5f5', borderRadius:8, padding:'10px 14px' }}>
                      <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#888' }}>OLD AMOUNTS</p>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {SEM_LABELS.map((sl, i) => (
                          <span key={i} style={{ fontSize:12, color:'#888' }}>{sl}: ₹{(a.oldAmounts?.[i]||0).toLocaleString('en-IN')}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ background:'#e8f5e9', borderRadius:8, padding:'10px 14px' }}>
                      <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#2E7D32' }}>NEW AMOUNTS</p>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {SEM_LABELS.map((sl, i) => (
                          <span key={i} style={{ fontSize:12, fontWeight:700, color:'#2E7D32' }}>{sl}: ₹{(a.newAmounts?.[i]||0).toLocaleString('en-IN')}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:12 }}>
                    Submitted by: <strong>{a.submittedBy}</strong> — {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => handleAction(a._id, 'approve')}
                      style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'9px 22px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => handleAction(a._id, 'reject', 'Rejected')}
                      style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:8, padding:'9px 22px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {done.length > 0 && (
            <>
              <h3 style={{ color:'#888', marginBottom:12, fontSize:15 }}>📋 Recently Reviewed ({done.length})</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {done.slice(0, 10).map(a => (
                  <div key={a._id} style={{ background:'#fafbff', borderRadius:10, border:'1px solid #e0e7ef', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600, color:'#333' }}>{a.itemName}</span>
                      <span style={{ fontSize:12, color:'#888', marginLeft:8 }}>{a.courseKey}</span>
                    </div>
                    {statusBadge(a.status)}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalDashboard;
