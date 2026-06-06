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
      // Verify Aadhar against pending admissions
      const admRes = await API.get('/admissions/staff-view/all');
      const allAdm = admRes.data.admissions || [];
      const matchedAdm = allAdm.find(a =>
        a.aadharNumber && a.aadharNumber.replace(/\s/g,'') === credForm.aadharNumber.replace(/\s/g,'')
      );
      if (!matchedAdm) {
        setCredMsg('❌ Aadhar number not found in any approved admission. Please verify the Aadhar number matches the admission form.');
        setCredLoading(false);
        return;
      }
      // Aadhar matched — auto-fill email and name from admission if empty
      const enrichedForm = {
        ...credForm,
        email: credForm.email || matchedAdm.email,
        firstName: credForm.firstName || (matchedAdm.applicantName||'').split(' ')[0],
        dateOfBirth: credForm.dateOfBirth || (matchedAdm.dateOfBirth ? matchedAdm.dateOfBirth.split('T')[0] : ''),
      };
      setCredMsg('✅ Aadhar verified — matched with ' + matchedAdm.applicantName);

      const res = await API.post('/auth/register-student', enrichedForm);
      if (res.data.success) {
        setGeneratedCreds({ name: res.data.user.name, email: res.data.user.email, password: res.data.generatedPassword });
        setCredMsg('✅ Aadhar verified ✅ Student account created for ' + matchedAdm.applicantName + '!');
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
    { id: 'generate_docs', label: '📄 Documents & Certificates' },
    { id: 'carryforward', label: '🎓 SY/TY Carry Forward' },
    { id: 'prn',          label: '🔢 Update PRN/ABC ID' },
    { id: 'students',     label: '👩‍🎓 All Students' },
    { id: 'receipts',     label: '🧾 Payment Receipts' },
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
                    <div className="form-group"><label>Aadhar Number *</label><input type="text" placeholder="123456789012" maxLength="12" value={credForm.aadharNumber} onChange={e => { if (/^\d{0,12}$/.test(e.target.value)) setCredForm({ ...credForm, aadharNumber: e.target.value }); }} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${credForm.aadharNumber.length===12?'#2E7D32':'#ddd'}` }} />
                    <small style={{ color: credForm.aadharNumber.length===12?'#2E7D32':'#666', display: 'block', marginTop: '4px', fontWeight: credForm.aadharNumber.length===12?700:400 }}>
                      {credForm.aadharNumber.length===12 ? '✅ 12 digits — will be verified against admission form' : `${credForm.aadharNumber.length}/12 digits`}
                    </small></div>
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
              <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>View, edit, correct documents, and manage all enrolled students. Click 👁️ to open a student record, then use ✏️ Edit to correct any information.</p>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student Section Staff can view, edit, and delete student records.</p>
              <StudentViewFull canEdit={true} themeColor="#1565C0" role="student_section" />
            </div>
          )}






          {/* ══════════════ UPDATE PRN / ABC ID ══════════════ */}
          {activeTab === 'prn' && <UpdatePrnTab />}

          {/* ══════════════ CORRECT DOCUMENTS ══════════════ */}

          {/* ══════════════ DOCUMENTS & CERTIFICATES ══════════════ */}
          {activeTab === 'generate_docs' && <AllDocumentsTab user={user} />}

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

const printTC = (adm) => {

  const today   = new Date();
  const dateStr = String(today.getDate()).padStart(2,'0') + '/' + String(today.getMonth()+1).padStart(2,'0') + '/' + today.getFullYear();

  const dobObj  = adm.dateOfBirth ? new Date(adm.dateOfBirth) : null;
  const dobStr  = dobObj ? String(dobObj.getDate()).padStart(2,'0')+'/'+String(dobObj.getMonth()+1).padStart(2,'0')+'/'+dobObj.getFullYear() : '';

  // DOB in words
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen',
    'Twenty','Twenty-One','Twenty-Two','Twenty-Three','Twenty-Four','Twenty-Five','Twenty-Six',
    'Twenty-Seven','Twenty-Eight','Twenty-Nine','Thirty','Thirty-One'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const yearToWords = (y) => {
    if (y>=1000){const th=Math.floor(y/1000),rem=y%1000,thW=ones[th]+' Thousand';if(rem===0)return thW;if(rem<100)return thW+' '+(rem<ones.length?ones[rem]:tens[Math.floor(rem/10)]+(rem%10?'-'+ones[rem%10]:''));const h=Math.floor(rem/100),r=rem%100,hw=ones[h]+' Hundred',rw=r===0?'':(r<ones.length?ones[r]:tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:''));return thW+' '+hw+(rw?' '+rw:'');}
    const h=Math.floor(y/100),r=y%100;return(ones[h]+' Hundred'+(r===0?'':(r<ones.length?' '+ones[r]:' '+tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:'')))).trim();
  };
  const dobWords = dobObj ? ones[dobObj.getDate()]+' '+monthNames[dobObj.getMonth()]+' '+yearToWords(dobObj.getFullYear()) : '';

  const ct = (adm.courseType||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : (adm.courseType||'') + (adm.preferredSubject?' — '+adm.preferredSubject:'');

  const html = `<!DOCTYPE html><html><head><title>Transfer Certificate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#f0f0f0;display:flex;justify-content:center;padding:20px;font-size:13px}
    .page{background:white;width:720px;border:1.5px solid #000;padding:0;box-shadow:0 4px 20px rgba(0,0,0,.15)}
    .hdr{display:flex;align-items:center;gap:10px;border-bottom:1.5px solid #000;padding:8px 12px}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:8.5px;color:#555}
    .hname{font-size:13px;font-weight:800;color:#000;line-height:1.3;margin:2px 0}
    .haddr{font-size:8.5px;color:#444;margin-top:1px}
    .titlesec{text-align:center;padding:6px 0 2px;border-bottom:1px solid #000}
    .title{font-size:15px;font-weight:bold;letter-spacing:2px;text-decoration:underline;text-underline-offset:3px}
    .subtitle{font-size:11px;font-style:italic;margin-top:1px}
    .disclaimer{font-size:9.5px;font-style:italic;padding:5px 14px;border-bottom:1px solid #ccc;color:#333;line-height:1.4}
    .regrow{display:flex;justify-content:space-between;padding:5px 14px;border-bottom:1px solid #ccc;font-size:12px}
    .reglabel{font-weight:600}
    .regval{font-weight:bold}
    /* Editable fields */
    input[type=text]{border:none;border-bottom:1px dotted #555;outline:none;font-family:'Times New Roman',serif;font-size:13px;background:transparent;padding:1px 4px;min-width:180px;font-weight:bold}
    input[type=text]:focus{border-bottom:1.5px solid #000;background:#fffde7}
    /* Table rows */
    .rows{padding:2px 14px}
    .row{display:flex;align-items:baseline;padding:5px 0;border-bottom:1px dotted #ccc;font-size:13px}
    .rnum{width:22px;flex-shrink:0;font-weight:600}
    .rlabel{width:210px;flex-shrink:0}
    .rcolon{width:16px;flex-shrink:0}
    .rval{flex:1;font-weight:bold}
    .rval input{width:100%;min-width:unset}
    /* Footer */
    .foot{display:flex;justify-content:space-between;align-items:flex-end;padding:12px 14px 10px}
    .fsign{text-align:center;min-width:100px}
    .fsign-line{border-top:1px solid #000;margin-top:32px;padding-top:4px;font-size:12px;font-weight:bold}
    /* Print button */
    .print-btn{display:block;margin:10px auto;padding:8px 28px;background:#1a237e;color:white;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer}
    @media print{
      body{background:white;padding:0}
      .page{box-shadow:none}
      .print-btn{display:none}
      input[type=text]{border-bottom:1px dotted #555}
    }
  </style></head><body>
  <div class="page">
  <img src="/ College logo.png" class="logo"/>
    <div class="hdr">
      <div class="htxt">
        <div class="h1">Vidya Niketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="h2">Late Kalpana Chawala Arts &amp; Science Mahila Senior College Gangakhed,</div>
        <div class="h3">Lecturer Colony Gangakhed, Dist Parbhani - 431514</div>
        <div class="h4">📞 +91 9307162914 &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com &nbsp;|&nbsp; ✉️ lkcwsc@vnssorg.com</div>
      </div>
    </div>

    <div class="titlesec">
      <div class="title">TRANSFER CERTIFICATE</div>
      <div class="subtitle">(vide Rule 17)</div>
    </div>

    <div class="disclaimer">
      <em>(No Change in any entry in this certificate shall be made except by the authority issuing it and any infringement of this requirement is liable to involve the imposition of penalty of such as that of Rustication)</em>
    </div>

    <div class="regrow">
      <span><span class="reglabel">Register No. : </span><input type="text" value="" style="min-width:100px"/></span>
      <span><span class="reglabel">T.C. No. : </span><span class="regval">TC${String(new Date().getFullYear()).slice(-2)}-${Date.now().toString().slice(-5)}</span></span>
    </div>

    <div class="rows">
      <div class="row"><span class="rnum">1.</span><span class="rlabel">Name of Student in Full</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.applicantName||''}"/></span></div>
      <div class="row"><span class="rnum">2.</span><span class="rlabel">Mother's Name</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.motherName||''}"/></span></div>
      <div class="row"><span class="rnum">3.</span><span class="rlabel">Caste &amp; Sub-Caste</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.caste||''}"/></span></div>
      <div class="row"><span class="rnum">4.</span><span class="rlabel">Place of Birth</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum"></span><span class="rlabel">Nationality</span><span class="rcolon">:</span><span class="rval"><input type="text" value="Indian" style="min-width:120px"/></span></div>
      <div class="row"><span class="rnum">5.</span><span class="rlabel">Date of Birth</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${dobStr}" style="min-width:120px"/></span></div>
      <div class="row"><span class="rnum"></span><span class="rlabel">(In Words)</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${dobWords}" style="width:100%"/></span></div>
      <div class="row"><span class="rnum">6.</span><span class="rlabel">Last School / College attended</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">7.</span><span class="rlabel">Date of Admission</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">8.</span><span class="rlabel">Progress</span><span class="rcolon">:</span><span class="rval"><input type="text" value="Satisfactory"/></span></div>
      <div class="row"><span class="rnum">9.</span><span class="rlabel">Conduct</span><span class="rcolon">:</span><span class="rval"><input type="text" value="Good"/></span></div>
      <div class="row"><span class="rnum">10.</span><span class="rlabel">Date of Leaving</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${dateStr}"/></span></div>
      <div class="row"><span class="rnum">11.</span><span class="rlabel">Standard in which studying and since when</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${courseFull + (adm.admissionYear?' ('+adm.admissionYear+')':'')}"/></span></div>
      <div class="row"><span class="rnum">12.</span><span class="rlabel">Reason of Leaving College</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">13.</span><span class="rlabel">Remarks</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row" style="border-bottom:none;padding-top:8px"><span class="rnum">14.</span><span style="flex:1;font-weight:bold">Certified that the above information is in accordance with the college record.</span></div>
    </div>

    <div class="foot">
      <div class="fsign">
        <div style="font-size:12px;margin-bottom:2px">Date : ${dateStr}</div>
      </div>
      <div class="fsign">
        <div class="fsign-line">Clark</div>
      </div>
      <div class="fsign">
        <div class="fsign-line">Principal</div>
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">🖨️ Print TC</button>
  </div>
  </body></html>`;

  const w = window.open('','_blank','width=800,height=900');
  w.document.write(html);
  w.document.close();
};


const printBonafide = (adm) => {
  const certNo  = 'BON' + new Date().getFullYear().toString().slice(-2) + '-' + Date.now().toString().slice(-4);
  const now     = new Date();
  const day     = String(now.getDate()).padStart(2,'0');
  const month   = String(now.getMonth()+1).padStart(2,'0');
  const fullYear= now.getFullYear();
  const acadY1  = now.getMonth()+1 >= 6 ? fullYear : fullYear-1;
  const acadYear= acadY1 + '-' + String(acadY1+1).slice(-2);

  const dobObj  = adm.dateOfBirth ? new Date(adm.dateOfBirth) : null;
  const dobDD   = dobObj ? String(dobObj.getDate()).padStart(2,'0') : '____';
  const dobMM   = dobObj ? String(dobObj.getMonth()+1).padStart(2,'0') : '____';
  const dobYYYY = dobObj ? String(dobObj.getFullYear()) : '______';

  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty','Twenty-One','Twenty-Two','Twenty-Three','Twenty-Four','Twenty-Five','Twenty-Six','Twenty-Seven','Twenty-Eight','Twenty-Nine','Thirty','Thirty-One'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const yearToWords = (y) => {
    if (y>=1000){const th=Math.floor(y/1000),rem=y%1000,thW=ones[th]+' Thousand';if(rem===0)return thW;if(rem<100)return thW+' '+(rem<ones.length?ones[rem]:tens[Math.floor(rem/10)]+(rem%10?'-'+ones[rem%10]:''));const h=Math.floor(rem/100),r=rem%100,hw=ones[h]+' Hundred',rw=r===0?'':(r<ones.length?ones[r]:tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:''));return thW+' '+hw+(rw?' '+rw:'');}
    const h=Math.floor(y/100),r=y%100;return(ones[h]+' Hundred'+(r===0?'':(r<ones.length?' '+ones[r]:' '+tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:'')))).trim();
  };
  const dobWords = dobObj ? ones[dobObj.getDate()]+' '+monthNames[dobObj.getMonth()]+' '+yearToWords(dobObj.getFullYear()) : '________________';

  const ct = (adm.courseType||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : (adm.courseType||'') + (adm.preferredSubject?' — '+adm.preferredSubject:'');

  const logo = "/ College-logo.png";
  const html = `<!DOCTYPE html><html><head><title>Bonafide Certificate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#f0f0f0;display:flex;justify-content:center;padding:20px}
    .page{background:white;width:730px;border:2px solid #000}
    /* Header */
    .hdr{display:flex;align-items:center;gap:10px;border-bottom:2px solid #000;padding:10px 14px}
    .logo{width:82px;height:82px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .h1{font-size:11px;color:#333}
    .h2{font-size:11px;color:#333}
    .h3{font-size:21px;font-weight:900;color:#000;margin:3px 0 2px}
    .h4{font-size:11px;color:#000;margin-bottom:1px}
    .h5{font-size:10px;color:#555}
    /* Title */
    .titlebar{text-align:center;padding:8px 0;border-bottom:1px solid #000}
    .titletxt{font-size:17px;font-weight:900;letter-spacing:5px;text-decoration:underline;text-underline-offset:4px}
    /* Meta */
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;padding:6px 18px;border-bottom:1px solid #ccc;font-size:12.5px}
    .mrow{display:flex;gap:4px;align-items:baseline}
    .ml{font-weight:700}
    .mv{border-bottom:1px solid #000;flex:1;min-width:80px;padding-left:3px;font-weight:bold}
    /* Body */
    .body{padding:10px 20px 8px;font-size:14px;line-height:1.5}
    .body p{margin:0 0 8px 0}
    .ul{border-bottom:1.5px solid #000;display:inline-block;font-weight:bold;min-width:200px;text-align:center}
    .ul-sm{border-bottom:1.5px solid #000;display:inline-block;font-weight:bold;min-width:44px;text-align:center}
    .ul-lg{border-bottom:1.5px solid #000;display:inline-block;min-width:340px;font-weight:bold}
    /* Footer */
    .foot{display:flex;justify-content:flex-end;align-items:flex-end;padding:10px 20px 12px}
    .signbox{text-align:center;min-width:120px}
    .signline{border-top:1px solid #000;padding-top:5px;font-size:13px;font-weight:bold;margin-top:36px}
    /* ERP */
    .erp{border-top:1px dashed #aaa;padding:5px 18px;font-size:9.5px;color:#666;display:flex;justify-content:space-between}
    .sysgen{padding:3px 18px 5px;font-size:9px;color:#888;text-align:center}
    @media print{body{background:white;padding:0}.page{box-shadow:none}}
  </style></head><body><div class="page">
    <div class="hdr">
      <img src="${logo}" class="logo"/>
      <div class="htxt">
        <div class="h1">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="h2">Affiliated to S.N.D.T. Women's University, Mumbai</div>
        <div class="h3">Late Kalpana Chawla Women's Senior College</div>
        <div class="h4">Lecture Colony, Gangakhed, Tq. Gangakhed, Dist. Parbhani, Maharashtra – 431514</div>
        <div class="h5">📞 +91 9307162914 &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com</div>
      </div>
    </div>
    <div class="titlebar"><span class="titletxt">BONAFIDE &nbsp; CERTIFICATE</span></div>
    <div class="meta">
      <div class="mrow"><span class="ml">Certificate No.:</span><span class="mv">&nbsp;${certNo}</span></div>
      <div class="mrow"><span class="ml">Date:</span><span class="mv">&nbsp;${day} / ${month} / ${fullYear}</span></div>
      <div class="mrow"><span class="ml">Student ID:</span><span class="mv">&nbsp;${adm.studentId||'____________________'}</span></div>
      <div class="mrow"><span class="ml">Academic Year:</span><span class="mv">&nbsp;${acadYear}</span></div>
    </div>
    <div class="body">
      <p>This is to certify that Miss &nbsp;<span class="ul">&nbsp;${adm.applicantName||''}&nbsp;</span>&nbsp; is a bonafide student of Late Kalpana Chawla Women's Senior College, Gangakhed. She is studying in <span class="ul" style="min-width:220px">&nbsp;${courseFull||'____________________'}&nbsp;</span> Course, <span class="ul" style="min-width:80px">&nbsp;${adm.admissionYear||'________'}&nbsp;</span> during the Academic Year &nbsp;<strong>${acadYear}</strong>. As per college records, her Date of Birth is &nbsp;<span class="ul-sm">&nbsp;${dobDD}&nbsp;</span>&nbsp;/&nbsp;<span class="ul-sm">&nbsp;${dobMM}&nbsp;</span>&nbsp;/&nbsp;<span class="ul-sm" style="min-width:60px">&nbsp;${dobYYYY}&nbsp;</span> (In Words): &nbsp;<span class="ul-lg">&nbsp;${dobWords}&nbsp;</span>. To the best of my knowledge and belief, her conduct and moral character are <strong>good</strong>. This certificate is issued on her request for official purpose.</p>
    </div>
    <div class="foot">
      <div class="signbox">
        <div class="signline">Principal</div>
      </div>
    </div>
    <div class="erp"><span>ERP Verification ID: <strong>ERP${certNo}</strong></span><span>Generated Through College ERP System</span></div>
    <div class="sysgen">This is a system generated certificate.</div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}></body></html>`;
  const w = window.open('','_blank','width=800,height=700'); w.document.write(html); w.document.close();
};


const printIDCard = (adm) => {
  const logo = "/ College-logo.png";

  const validYear = new Date().getFullYear();
  const dobStr = adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) : '--';
  const ct = (adm.courseType||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'Bachelor of Science (B.Sc.)'
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'Bachelor of Arts (B.A.)' : adm.courseType||'--';

  const html = `<!DOCTYPE html><html><head><title>ID Card</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:240px;background:#fff;font-family:Arial,sans-serif}
    .card{width:240px;background:#fff;border:2px solid #1a237e;border-radius:4px;overflow:hidden}
    .hdr{background:#1a237e;padding:8px 6px 6px;text-align:center}
    .logo{width:55px;height:55px;object-fit:contain;border-radius:50%;border:2px solid rgba(255,255,255,0.4);margin-bottom:4px}
    .sanstha{font-size:6.5px;color:rgba(255,255,255,0.8);font-style:italic}
    .college{font-size:9px;font-weight:700;color:#fff;line-height:1.3;margin:2px 0}
    .affil{font-size:6px;color:rgba(255,255,255,0.75)}
    .titlebar{background:#FFD700;padding:4px;text-align:center}
    .titletext{color:#1a237e;font-size:8.5px;font-weight:900;letter-spacing:2px}
    .photowrap{background:#f8f9ff;padding:10px 0 8px;text-align:center;border-bottom:1px solid #e8eaf6}
    .photobox{width:72px;height:85px;border:2px solid #1a237e;margin:0 auto 6px;overflow:hidden;background:#c5cae9;display:flex;align-items:center;justify-content:center;border-radius:2px}
    .photobox img{width:100%;height:100%;object-fit:cover}
    .stuname{font-size:11px;font-weight:700;color:#1a237e;padding:0 4px;line-height:1.2}
    .body{padding:8px 10px 4px}
    .row{display:flex;align-items:baseline;padding:3px 0;border-bottom:1px dashed #e8eaf6}
    .lbl{font-size:8.5px;font-weight:700;color:#555;width:60px;flex-shrink:0}
    .val{font-size:8.5px;font-weight:700;color:#1a237e;flex:1}
    .chip{background:#1a237e;color:#FFD700;text-align:center;padding:5px;font-size:10px;font-weight:700;letter-spacing:1px}
    .sig{display:grid;grid-template-columns:1fr 1fr;padding:6px 10px 4px;gap:6px;border-top:1px solid #e8eaf6}
    .sigbox{text-align:center}
    .sigline{border-top:1px solid #333;padding-top:2px;font-size:7px;color:#333;font-weight:700}
    .foot{background:#1a237e;padding:5px 8px}
    .footrow{display:flex;justify-content:space-between;font-size:6.5px;color:rgba(255,255,255,0.9)}
    .footaddr{font-size:6px;color:rgba(255,255,255,0.7);text-align:center;margin-top:2px}
    @media print{@page{size:240px 420px;margin:0}html,body{width:240px}}
  </style></head><body>
  <div class="card">
    <div class="hdr">
      <img src="${logo}" class="logo"/><br/>
      <span class="sanstha">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</span><br/>
      <span class="college">Late Kalpana Chawla Women's<br/>Senior College (LKCWSC)</span><br/>
      <span class="affil">Affiliated to SNDT Women's University, Mumbai</span>
    </div>
    <div class="titlebar"><span class="titletext">STUDENT IDENTITY CARD</span></div>
    <div class="photowrap">
      <div class="photobox">
        ${adm.studentPhoto ? `<img src="${adm.studentPhoto}" alt="photo"/>` : '<div style="font-size:32px;text-align:center;padding-top:20px">👩</div>'}
      </div>
      <div class="stuname">${adm.applicantName||'--'}</div>
    </div>
    <div class="body">
      <div class="row"><span class="lbl">Course</span><span class="val">${courseFull}</span></div>
      <div class="row"><span class="lbl">Year</span><span class="val">${adm.admissionYear||'--'}</span></div>
      <div class="row"><span class="lbl">Date of Birth</span><span class="val">${dobStr}</span></div>
      <div class="row"><span class="lbl">Mobile No.</span><span class="val">${adm.phone||'--'}</span></div>
      <div class="row"><span class="lbl">Blood Group</span><span class="val">${adm.bloodGroup||'--'}</span></div>
      <div class="row" style="border:none"><span class="lbl">Valid</span><span class="val">${validYear} – ${validYear+1}</span></div>
    </div>
    <div class="chip">${adm.studentId||'ID PENDING'}</div>
    <div class="sig">
      <div class="sigbox"><div style="height:18px"></div><div class="sigline">Student Signature</div></div>
      <div class="sigbox"><div style="height:18px"></div><div class="sigline">Principal</div></div>
    </div>
    <div class="foot">
      <div class="footrow"><span>+91 9307162914</span><span>lkcwsc@vnssorg.com</span></div>
      <div class="footrow" style="margin-top:1px;justify-content:center"><span>lkcwsc.vnssorg.com</span></div>
      <div class="footaddr">Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra – 431514</div>
    </div>
  </div>
  <scri${'pt'}>
  window.onload = () => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => {
      html2canvas(document.querySelector('.card'), {scale:3, useCORS:true, allowTaint:true, backgroundColor:'#ffffff'}).then(canvas => {
        const a = document.createElement('a');
        a.download = 'IDCard_${(adm.applicantName||"student").replace(/\s+/g,"_")}.jpg';
        a.href = canvas.toDataURL('image/jpeg', 0.96);
        a.click();
        setTimeout(()=>window.close(), 800);
      });
    };
    document.head.appendChild(s);
  };
  </scri${'pt'}></body></html>`;

  const w = window.open('','_blank','width=290,height=480');
  w.document.write(html); w.document.close();
};


const DOC_CONFIG = {
  TC:        { label: 'Transfer Certificate', icon: '📄', color: '#1565C0', bg: '#e3f2fd' },
  BONAFIDE:  { label: 'Bonafide Certificate',  icon: '📜', color: '#7B1FA2', bg: '#f3e5f5' },
  ID_CARD:   { label: 'ID Card',               icon: '🪪', color: '#2E7D32', bg: '#e8f5e9' },
  MARKSHEET: { label: 'Marksheet',             icon: '📋', color: '#E65100', bg: '#fff3e0' },
  MIGRATION: { label: 'Migration Certificate', icon: '📜', color: '#795548', bg: '#efebe9' },
};

const AllDocumentsTab = ({ user }) => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [admMap, setAdmMap]       = useState({});
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completing, setCompleting] = useState('');
  const [rejecting, setRejecting]   = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [msg, setMsg]               = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, admRes] = await Promise.all([
        API.get('/document-requests/student-section/all'),
        API.get('/admissions/staff-view/all'),
      ]);
      setRequests(reqRes.data.requests || []);
      const map = {};
      (admRes.data.admissions || []).forEach(a => { map[a.email] = a; });
      setAdmMap(map);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePrint = (req) => {
    const adm = admMap[req.studentEmail] || {};
    const merged = {
      applicantName: req.studentName, email: req.studentEmail,
      studentId: adm.studentId||'', prnNumber: adm.prnNumber||'',
      aparIdNumber: adm.aparIdNumber||'', dateOfBirth: adm.dateOfBirth||'',
      gender: adm.gender||'Female', fatherName: adm.fatherName||'',
      motherName: adm.motherName||'', category: adm.category||'',
      caste: adm.caste||'',
      courseType: req.branch||adm.courseType||adm.course||adm.hscStream||'',
      preferredSubject: adm.preferredSubject||adm.subject||'',
      admissionYear: req.admissionYear||adm.admissionYear||'',
      address: adm.address||'', religion: adm.religion||'',
    };
    if (req.documentType === 'TC') printTC(merged);
    else if (req.documentType === 'BONAFIDE') printBonafide(merged);
    else printIDCard(merged);
  };

  const handleComplete = async (req) => {
    setCompleting(req._id);
    try {
      await API.put(`/document-requests/student-section/complete/${req._id}`, {
        notes: `${DOC_CONFIG[req.documentType]?.label || req.documentType} generated and issued.`
      });
      setMsg('✅ Marked as issued!');
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setCompleting(''); }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) return;
    setRejecting(rejectModal._id);
    try {
      await API.put(`/document-requests/accounts/reject/${rejectModal._id}`, { reason: rejectNote });
      setMsg('✅ Request rejected.');
      setRejectModal(null); setRejectNote('');
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setRejecting(''); }
  };

  const filtered = requests.filter(r => {
    const mt = typeFilter === 'all' || r.documentType === typeFilter;
    const ms = statusFilter === 'all' || r.status === statusFilter;
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return mt && ms && mq;
  });

  const pending = requests.filter(r => r.status === 'pending_generation').length;

  const statusStyle = (s) => ({
    pending_accounts:      { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Accounts' },
    rejected_by_accounts:  { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' },
    pending_exam:          { bg: '#e3f2fd', color: '#1565C0', label: '🔍 At Exam Section' },
    rejected_by_exam:      { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Exam' },
    pending_principal:     { bg: '#fff3e0', color: '#E65100', label: '🔄 At Principal' },
    rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
    pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Issue' },
    completed:             { bg: '#f3e5f5', color: '#7B1FA2', label: '🏁 Issued' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📄 Documents & Certificates</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Print TC, Bonafide, ID Card and mark as issued. All document types in one place.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Pending: {pending}</div>
        <div style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Issued: {requests.filter(r=>r.status==='completed').length}</div>
        {Object.entries(DOC_CONFIG).map(([k,v]) => {
          const c = requests.filter(r=>r.documentType===k).length;
          return c > 0 ? <div key={k} style={{ background: v.bg, color: v.color, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>{v.icon} {v.label}: {c}</div> : null;
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Types</option>
          {Object.entries(DOC_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Status</option>
          <option value="pending_generation">✅ Ready to Issue</option>
          <option value="completed">🏁 Issued</option>
          <option value="pending_accounts">⏳ At Accounts</option>
          <option value="pending_exam">🔍 At Exam Section</option>
          <option value="pending_principal">🔄 At Principal</option>
          <option value="rejected_by_accounts">❌ Rejected</option>
        </select>
        <button onClick={fetchData}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 26, maxWidth: 440, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#C62828', marginBottom: 12 }}>❌ Reject Request</h3>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>Student: <strong>{rejectModal.studentName}</strong> — {DOC_CONFIG[rejectModal.documentType]?.label}</p>
            <textarea rows="3" placeholder="Reason for rejection..." value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleReject} disabled={!rejectNote.trim() || rejecting === rejectModal._id}
                style={{ background: '#C62828', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {rejecting === rejectModal._id ? '⏳...' : '❌ Confirm Reject'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                style={{ background: '#eee', color: '#333', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
      : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><h3>No requests found</h3><p>Document requests will appear here after Accounts section approves them.</p></div>
      : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const cfg = DOC_CONFIG[req.documentType] || { label: req.documentType, icon: '📄', color: '#555', bg: '#f5f5f5' };
            const ss  = statusStyle(req.status);
            const isReady = req.status === 'pending_generation';
            const canPrint = ['TC','BONAFIDE','ID_CARD'].includes(req.documentType);
            const adm = admMap[req.studentEmail] || {};
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isReady ? cfg.color+'55' : '#e0e7ef'}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${cfg.color}` }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: isReady ? cfg.bg+'aa' : '#fafbff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h4 style={{ color: cfg.color, fontSize: 15, margin: 0 }}>{cfg.label}</h4>
                        {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>⚡ Urgent</span>}
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 12, background: ss.bg, color: ss.color }}>{ss.label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canPrint && (
                      <button onClick={() => handlePrint(req)}
                        style={{ background: cfg.color, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        🖨️ Print {cfg.label}
                      </button>
                    )}
                    {isReady && (
                      <button onClick={() => handleComplete(req)} disabled={completing === req._id}
                        style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: completing===req._id?'not-allowed':'pointer', opacity: completing===req._id?0.7:1 }}>
                        {completing === req._id ? '⏳...' : '✅ Mark Issued'}
                      </button>
                    )}
                    {isReady && (
                      <button onClick={() => { setRejectModal(req); setRejectNote(''); }}
                        style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: '10px 18px 14px', fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderTop: '1px solid #f0f4f8' }}>
                  <span><strong>Student:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch||'—'}</span>
                  <span><strong>Year:</strong> {req.admissionYear||'—'}</span>
                  {adm.studentId && <span><strong>Student ID:</strong> {adm.studentId}</span>}
                  {adm.prnNumber && <span><strong>PRN:</strong> {adm.prnNumber}</span>}
                  {req.reason && <span style={{gridColumn:'1/-1'}}><strong>Reason:</strong> {req.reason}</span>}
                  {req.accountsNotes && <span style={{gridColumn:'1/-1',color:'#777',fontStyle:'italic'}}>Accounts: {req.accountsNotes}</span>}
                  {req.principalNotes && <span style={{gridColumn:'1/-1',color:'#777',fontStyle:'italic'}}>Principal: {req.principalNotes}</span>}
                </div>
                {req.status === 'completed' && req.generatedBy && (
                  <div style={{ padding: '6px 18px 10px', fontSize: 12, color: '#7B1FA2', fontWeight: 600, borderTop: '1px solid #f0f4f8' }}>
                    🏁 Issued by {req.generatedBy} on {req.generatedDate ? new Date(req.generatedDate).toLocaleDateString('en-IN') : '—'}
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


export default StudentSectionDashboard;
