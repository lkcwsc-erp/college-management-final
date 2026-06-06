import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

// ─── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  not_filled: { label: '📝 Not Filled',  bg: '#fff3e0', color: '#E65100' },
  filled:     { label: '📋 Form Filled', bg: '#e3f2fd', color: '#1565C0' },
  approved:   { label: '✅ Approved',    bg: '#e8f5e9', color: '#2E7D32' },
  rejected:   { label: '❌ Rejected',    bg: '#ffebee', color: '#C62828' },
  disbursed:  { label: '💰 Disbursed',   bg: '#f3e5f5', color: '#7B1FA2' },
};

const CATEGORY_COLORS = {
  'sc':         { bg: '#e3f2fd', color: '#1565C0' },
  'st':         { bg: '#e8f5e9', color: '#2E7D32' },
  'obc':        { bg: '#fff3e0', color: '#E65100' },
  'sbc':        { bg: '#f3e5f5', color: '#7B1FA2' },
  'nt-b':       { bg: '#fce4ec', color: '#880E4F' },
  'nt-c':       { bg: '#fce4ec', color: '#880E4F' },
  'nt-d':       { bg: '#fce4ec', color: '#880E4F' },
  'vj/dt(nt-a)':{ bg: '#ede7f6', color: '#4527a0' },
  'ews':        { bg: '#e0f2f1', color: '#00695C' },
  'sebc':       { bg: '#f9fbe7', color: '#558B2F' },
  'open':       { bg: '#f5f5f5', color: '#555' },
  'other':      { bg: '#f5f5f5', color: '#555' },
};
const catColor = (cat) =>
  CATEGORY_COLORS[(cat || 'other').toLowerCase()] || CATEGORY_COLORS.other;

const COURSE_TYPES  = ['B.Sc', 'B.A', 'B.Com'];
const YEAR_OPTIONS  = ['FY', 'SY', 'TY'];
const CATEGORIES    = ['OPEN', 'SC', 'ST', 'OBC', 'VJ/DT(NT-A)', 'NT-B', 'NT-C', 'NT-D', 'SBC', 'EWS', 'SEBC'];
const DOC_KEYS = [
  { key: 'aadhar',            label: '🪪 Aadhar Card' },
  { key: 'casteCertificate',  label: '📄 Caste Certificate' },
  { key: 'casteValidity',     label: '📋 Caste Validity' },
  { key: 'incomeCertificate', label: '💰 Income Certificate' },
  { key: 'domicile',          label: '🏠 Domicile' },
  { key: 'bankPassbook',      label: '🏦 Bank Passbook' },
];

const genAcademicYears = () => {
  const y = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => { const yr = y - 2 + i; return `${yr}-${String(yr+1).slice(-2)}`; });
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => msg ? (
  <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, padding:'12px 22px', borderRadius:10, fontWeight:600, fontSize:14,
    background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
    color: msg.startsWith('✅') ? '#2E7D32' : '#C62828',
    boxShadow:'0 4px 18px rgba(0,0,0,.15)', display:'flex', alignItems:'center', gap:12 }}>
    {msg}
    <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:16,color:'inherit' }}>×</button>
  </div>
) : null;

// ─── Main Component ────────────────────────────────────────────────────────────
const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [toast,     setToast]     = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // ── Register (student list) state ──────────────────────────────────────────
  const [students,      setStudents]    = useState([]);
  const [regTotal,      setRegTotal]    = useState(0);
  const [regPage,       setRegPage]     = useState(1);
  const [regPages,      setRegPages]    = useState(1);
  const [regLoading,    setRegLoading]  = useState(false);
  const [regFilters,    setRegFilters]  = useState({ search:'', courseType:'', category:'', scholarshipStatus:'', admissionYear:'', academicYear:'' });

  // ── Dashboard stats ────────────────────────────────────────────────────────
  const [dashStats,     setDashStats]   = useState(null);
  const [dashLoading,   setDashLoading] = useState(false);
  const [dashAY,        setDashAY]      = useState('');

  // ── Selected student detail ────────────────────────────────────────────────
  const [selected,      setSelected]    = useState(null);
  const [showPass,      setShowPass]    = useState({});

  // ── Status update ──────────────────────────────────────────────────────────
  const [statusForm,    setStatusForm]  = useState({ scholarshipStatus:'', scholarshipNote:'', scholarshipReceivedAmount:'', verifiedBy:'' });
  const [statusSaving,  setStatusSaving]= useState(false);

  // ── MahaDBT credentials update ─────────────────────────────────────────────
  const [mahaForm,      setMahaForm]    = useState({ mahaDBTUsername:'', mahaDBTPassword:'', mahaDBTMobile:'', mahaDBTAppNo:'' });
  const [mahaSaving,    setMahaSaving]  = useState(false);

  // ── Document verification ──────────────────────────────────────────────────
  const [docVer,        setDocVer]      = useState({});   // { [key]: { status, remark } }
  const [docSaving,     setDocSaving]   = useState(null); // key being saved

  // ── Scholarship Master state ───────────────────────────────────────────────
  const [masters,       setMasters]     = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const BLANK_MASTER = { category:'SC', courseType:'B.Sc', admissionYear:'FY', academicYear:'', scholarshipAmount:'', description:'' };
  const [masterForm,    setMasterForm]  = useState(BLANK_MASTER);
  const [masterEditId,  setMasterEditId]= useState(null);
  const [masterMsg,     setMasterMsg]   = useState('');

  // ── Auto-calculate ─────────────────────────────────────────────────────────
  const [calcLoading,   setCalcLoading] = useState(false);
  const [calcResult,    setCalcResult]  = useState(null);

  // ── All-students tab (legacy admissions route) ─────────────────────────────
  const [admissions,    setAdmissions]  = useState([]);
  const [admLoading,    setAdmLoading]  = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // Data fetchers
  // ──────────────────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async (ay = dashAY) => {
    setDashLoading(true);
    try {
      const res = await API.get(`/scholarships/dashboard${ay ? `?academicYear=${ay}` : ''}`);
      setDashStats(res.data.dashboard);
    } catch { /* silent */ }
    finally { setDashLoading(false); }
  }, [dashAY]);

  const fetchRegister = useCallback(async (page = 1, filters = regFilters) => {
    setRegLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 25 });
      if (filters.search)           p.append('search',           filters.search);
      if (filters.courseType)       p.append('courseType',       filters.courseType);
      if (filters.category)         p.append('category',         filters.category);
      if (filters.scholarshipStatus)p.append('scholarshipStatus',filters.scholarshipStatus);
      if (filters.admissionYear)    p.append('admissionYear',    filters.admissionYear);
      if (filters.academicYear)     p.append('academicYear',     filters.academicYear);
      const res = await API.get(`/scholarships/register?${p}`);
      setStudents(res.data.students || []);
      setRegTotal(res.data.total   || 0);
      setRegPage( res.data.page    || 1);
      setRegPages(res.data.totalPages || 1);
    } catch { showToast('❌ Failed to load student register.'); }
    finally { setRegLoading(false); }
  }, [regFilters]);

  const fetchMasters = useCallback(async () => {
    setMasterLoading(true);
    try {
      const res = await API.get('/scholarships/master');
      setMasters(res.data.scholarships || []);
    } catch { /* silent */ }
    finally { setMasterLoading(false); }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    setAdmLoading(true);
    try {
      const res = await API.get('/admissions/scholarship-section/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setAdmLoading(false); }
  }, []);

  const fetchStudentDetail = async (id) => {
    try {
      const res = await API.get(`/scholarships/student/${id}`);
      const s = res.data.student;
      setSelected(s);
      setStatusForm({
        scholarshipStatus: s.scholarshipStatus || 'not_filled',
        scholarshipNote:   s.scholarshipNote   || '',
        scholarshipReceivedAmount: s.scholarshipReceivedAmount || '',
        verifiedBy: user?.name || '',
      });
      setMahaForm({
        mahaDBTUsername: s.mahaDBTUsername || '',
        mahaDBTPassword: s.mahaDBTPassword || '',
        mahaDBTMobile:   s.mahaDBTMobile   || '',
        mahaDBTAppNo:    s.mahaDBTAppNo    || '',
      });
      // init doc verification state
      const dv = {};
      DOC_KEYS.forEach(d => {
        dv[d.key] = {
          status: s[`${d.key}VerificationStatus`] || 'pending',
          remark: s[`${d.key}VerificationRemark`] || '',
        };
      });
      setDocVer(dv);
      setCalcResult(null);
    } catch { showToast('❌ Could not load student details.'); }
  };

  useEffect(() => { fetchDashboard(); fetchMasters(); fetchAdmissions(); }, []);
  useEffect(() => { if (activeTab === 'register') fetchRegister(1); }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/'); };

  // ──────────────────────────────────────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (!selected) return;
    setStatusSaving(true);
    try {
      await API.put(`/scholarships/status/${selected._id}`, statusForm);
      showToast('✅ Scholarship status updated!');
      await fetchStudentDetail(selected.studentId);
      await fetchDashboard();
    } catch (e) { showToast('❌ ' + (e.response?.data?.message || 'Failed to update status.')); }
    finally { setStatusSaving(false); }
  };

  const handleMahaDBTUpdate = async () => {
    if (!selected) return;
    setMahaSaving(true);
    try {
      await API.put(`/scholarships/mahadbt/${selected._id}`, mahaForm);
      showToast('✅ MahaDBT credentials saved!');
      await fetchStudentDetail(selected.studentId);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message || 'Failed.')); }
    finally { setMahaSaving(false); }
  };

  const handleDocVerify = async (docKey) => {
    if (!selected) return;
    setDocSaving(docKey);
    try {
      await API.put(`/scholarships/document-verification/${selected._id}`, {
        documentType: docKey,
        status:       docVer[docKey]?.status || 'pending',
        remark:       docVer[docKey]?.remark || '',
        verifiedBy:   user?.name || '',
      });
      showToast('✅ Document verification saved!');
      await fetchStudentDetail(selected.studentId);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message || 'Failed.')); }
    finally { setDocSaving(null); }
  };

  const handleAutoCalculate = async () => {
    if (!selected) return;
    setCalcLoading(true);
    setCalcResult(null);
    try {
      const res = await API.post(`/scholarships/calculate/${selected._id}`);
      setCalcResult(res.data.data);
      showToast('✅ Scholarship auto-calculated!');
      await fetchStudentDetail(selected.studentId);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message || 'No matching master record found.')); }
    finally { setCalcLoading(false); }
  };

  // Master CRUD
  const saveMaster = async () => {
    if (!masterForm.category || !masterForm.courseType || !masterForm.admissionYear || !masterForm.academicYear || masterForm.scholarshipAmount === '') {
      setMasterMsg('❌ All required fields must be filled.'); return;
    }
    try {
      const payload = { ...masterForm, scholarshipAmount: Number(masterForm.scholarshipAmount), createdBy: user?.name || '' };
      if (masterEditId) {
        await API.put(`/scholarships/master/${masterEditId}`, { ...payload, updatedBy: user?.name || '' });
        setMasterMsg('✅ Scholarship master updated!');
      } else {
        await API.post('/scholarships/master', payload);
        setMasterMsg('✅ Scholarship master created!');
      }
      setMasterForm(BLANK_MASTER);
      setMasterEditId(null);
      await fetchMasters();
      setTimeout(() => setMasterMsg(''), 4000);
    } catch (e) { setMasterMsg('❌ ' + (e.response?.data?.message || 'Failed.')); }
  };

  const deleteMaster = async (id) => {
    if (!window.confirm('Delete this scholarship master record?')) return;
    try {
      await API.delete(`/scholarships/master/${id}`);
      showToast('✅ Deleted successfully.');
      await fetchMasters();
    } catch { showToast('❌ Delete failed.'); }
  };

  const startEditMaster = (m) => {
    setMasterEditId(m._id);
    setMasterForm({ category: m.category, courseType: m.courseType, admissionYear: m.admissionYear, academicYear: m.academicYear, scholarshipAmount: m.scholarshipAmount, description: m.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export register
  const exportRegister = async () => {
    try {
      const p = new URLSearchParams();
      if (regFilters.academicYear)      p.append('academicYear', regFilters.academicYear);
      if (regFilters.courseType)        p.append('courseType',   regFilters.courseType);
      if (regFilters.category)          p.append('category',     regFilters.category);
      if (regFilters.scholarshipStatus) p.append('scholarshipStatus', regFilters.scholarshipStatus);
      const res = await API.get(`/scholarships/register/export?${p}`, { responseType: 'blob' });
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a    = document.createElement('a'); a.href = url;
      a.download = `scholarship_register_${regFilters.academicYear || 'all'}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      showToast('✅ Excel exported!');
    } catch { showToast('❌ Export failed.'); }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Sidebar tabs
  // ──────────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'home',       label: '🏠 Dashboard' },
    { id: 'register',   label: '👩‍🎓 Scholarship Register' },
    { id: 'mahadbt',    label: '🌐 MahaDBT Credentials' },
    { id: 'master',     label: '⚙️ Scholarship Master' },
    { id: 'all_students', label: '📋 All Students' },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <Toast msg={toast} onClose={() => setToast('')} />

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🏅</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Scholarship Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>🏅 Scholarship Section</h2>
          <div className="user-info"><span>👋 {user?.name}</span></div>
        </div>

        <div className="dashboard-content">

          {/* ══════════════════════════ HOME / DASHBOARD ══════════════════════════ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background:'linear-gradient(135deg,#f3e5f5,#fce4ec)', padding:20, borderRadius:12, marginBottom:20, borderLeft:'5px solid #7B1FA2' }}>
                <h3 style={{ color:'#6A1B9A', marginBottom:6 }}>🏅 Welcome, {user?.name}!</h3>
                <p style={{ color:'#555' }}>Scholarship dashboard — live stats from the database.</p>
              </div>

              {/* Academic Year filter */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <label style={{ fontWeight:600, fontSize:13, color:'#555' }}>Academic Year:</label>
                <select value={dashAY} onChange={e => { setDashAY(e.target.value); fetchDashboard(e.target.value); }}
                  style={{ padding:'7px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Years</option>
                  {genAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => fetchDashboard(dashAY)} disabled={dashLoading}
                  style={{ padding:'7px 14px', background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {dashLoading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div> : dashStats ? (
                <>
                  {/* Student counts */}
                  <div className="dash-cards" style={{ marginBottom:20 }}>
                    {[
                      { icon:'👩‍🎓', label:'Total Students', val:dashStats.totalStudents,   cls:'blue' },
                      { icon:'📝', label:'Not Filled',       val:dashStats.notFilled,        cls:'orange' },
                      { icon:'📋', label:'Form Filled',      val:dashStats.filled,           cls:'green' },
                      { icon:'✅', label:'Approved',         val:dashStats.approved,         cls:'green' },
                      { icon:'❌', label:'Rejected',         val:dashStats.rejected,         cls:'red' },
                      { icon:'💰', label:'Disbursed',        val:dashStats.disbursed,        cls:'purple' },
                    ].map(c => (
                      <div key={c.label} className={`dash-card ${c.cls}`}
                        style={c.cls==='purple' ? { background:'linear-gradient(135deg,#f3e5f5,#e1bee7)', borderRadius:12, padding:'16px 20px', display:'flex', gap:14, alignItems:'center' } : {}}>
                        <div className="dash-card-icon">{c.icon}</div>
                        <div><h3>{c.val}</h3><p>{c.label}</p></div>
                      </div>
                    ))}
                  </div>

                  {/* Financial summary */}
                  <h3 style={{ margin:'0 0 12px', color:'#333' }}>💰 Financial Summary</h3>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
                    {[
                      { label:'Total Eligible Amount', val:dashStats.totalEligibleAmount, bg:'#e3f2fd', color:'#1565C0' },
                      { label:'Total Received Amount', val:dashStats.totalReceivedAmount,  bg:'#e8f5e9', color:'#2E7D32' },
                      { label:'Total Pending Amount',  val:dashStats.totalPendingAmount,   bg:'#fff3e0', color:'#E65100' },
                    ].map(s => (
                      <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'16px 24px', flex:1, minWidth:180 }}>
                        <p style={{ fontSize:12, color:s.color, fontWeight:600, margin:'0 0 4px' }}>{s.label}</p>
                        <p style={{ fontSize:22, fontWeight:800, color:s.color, margin:0 }}>{fmt(s.val)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status bar chart */}
                  <h3 style={{ margin:'0 0 12px', color:'#333' }}>📊 Status Overview</h3>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', overflow:'hidden', marginBottom:24 }}>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg], idx) => {
                      const count = dashStats[key] || 0;
                      const pct   = dashStats.totalStudents > 0 ? Math.round((count / dashStats.totalStudents) * 100) : 0;
                      return (
                        <div key={key} style={{ display:'flex', alignItems:'center', padding:'12px 20px', borderBottom: idx<4?'1px solid #f0f4f8':'none', gap:14 }}>
                          <span style={{ fontSize:13, fontWeight:700, padding:'3px 12px', borderRadius:20, background:cfg.bg, color:cfg.color, minWidth:140 }}>{cfg.label}</span>
                          <div style={{ flex:1, background:'#f5f5f5', borderRadius:10, height:10, overflow:'hidden' }}>
                            <div style={{ width:`${pct}%`, height:'100%', background:cfg.color, borderRadius:10, transition:'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize:14, fontWeight:700, color:cfg.color, minWidth:70, textAlign:'right' }}>
                            {count} <span style={{ fontSize:11, color:'#aaa' }}>({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state"><div className="empty-icon">📊</div><h3>No data available</h3></div>
              )}
            </div>
          )}

          {/* ══════════════════════ SCHOLARSHIP REGISTER ══════════════════════ */}
          {activeTab === 'register' && !selected && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                <div>
                  <h2 style={{ color:'#6A1B9A', marginBottom:4 }}>👩‍🎓 Scholarship Register</h2>
                  <p style={{ color:'#666', fontSize:14 }}>Complete scholarship data for all students. {regTotal} records.</p>
                </div>
                <button onClick={exportRegister}
                  style={{ padding:'9px 18px', background:'#2E7D32', color:'#fff', border:'none', borderRadius:9, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  📥 Export Excel
                </button>
              </div>

              {/* Filters */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, marginBottom:16 }}>
                <input type="text" placeholder="🔍 Search name / ID…" value={regFilters.search}
                  onChange={e => setRegFilters(f => ({ ...f, search:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }} />
                <select value={regFilters.courseType} onChange={e => setRegFilters(f => ({ ...f, courseType:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Courses</option>
                  {COURSE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={regFilters.category} onChange={e => setRegFilters(f => ({ ...f, category:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={regFilters.admissionYear} onChange={e => setRegFilters(f => ({ ...f, admissionYear:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Years</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={regFilters.scholarshipStatus} onChange={e => setRegFilters(f => ({ ...f, scholarshipStatus:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={regFilters.academicYear} onChange={e => setRegFilters(f => ({ ...f, academicYear:e.target.value }))}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                  <option value="">All Acad. Years</option>
                  {genAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => fetchRegister(1)} disabled={regLoading}
                  style={{ padding:'8px 16px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  🔍 Search
                </button>
              </div>

              <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                <span style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:600 }}>Showing: {students.length} / {regTotal}</span>
                <span style={{ background:'#f3e5f5', color:'#7B1FA2', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:600 }}>Page {regPage} / {regPages}</span>
              </div>

              {regLoading ? (
                <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
              ) : students.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No students found</h3></div>
              ) : (
                <>
                  <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)', marginBottom:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr', background:'#7B1FA2', padding:'12px 16px', gap:8 }}>
                      {['Student','Course','Year','Category','Scholarship','Received','Pending','Status','Action'].map(h => (
                        <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
                      ))}
                    </div>
                    {students.map((s, idx) => {
                      const sc = STATUS_CONFIG[s.scholarshipStatus] || STATUS_CONFIG.not_filled;
                      const cc = catColor(s.category);
                      return (
                        <div key={s._id} style={{ display:'grid', gridTemplateColumns:'2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr', padding:'11px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                          <div>
                            <p style={{ fontWeight:600, fontSize:13, color:'#1a1a2e', margin:0 }}>{s.applicantName}</p>
                            <p style={{ fontSize:11, color:'#888', margin:'2px 0 0' }}>{s.studentId || s.mahaDBTAppNo || '—'}</p>
                          </div>
                          <span style={{ fontSize:12 }}>{s.courseType || '—'}</span>
                          <span style={{ fontSize:12 }}>{s.admissionYear || '—'}</span>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:10, background:cc.bg, color:cc.color, textTransform:'uppercase' }}>{s.category || '—'}</span>
                          <span style={{ fontSize:12, fontWeight:600 }}>{fmt(s.scholarshipAmount)}</span>
                          <span style={{ fontSize:12, color:'#2E7D32', fontWeight:600 }}>{fmt(s.scholarshipReceivedAmount)}</span>
                          <span style={{ fontSize:12, color:'#E65100', fontWeight:600 }}>{fmt(s.scholarshipPendingAmount)}</span>
                          <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:10, background:sc.bg, color:sc.color }}>{sc.label}</span>
                          <button onClick={async () => { await fetchStudentDetail(s.studentId); setActiveTab('detail'); }}
                            style={{ background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            👁️ View
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {regPages > 1 && (
                    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                      {regPage > 1 && (
                        <button onClick={() => { const p = regPage-1; setRegPage(p); fetchRegister(p); }}
                          style={{ padding:'6px 16px', background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:8, fontWeight:600, cursor:'pointer' }}>← Prev</button>
                      )}
                      <span style={{ padding:'6px 14px', fontSize:13, fontWeight:600, color:'#555' }}>Page {regPage} of {regPages}</span>
                      {regPage < regPages && (
                        <button onClick={() => { const p = regPage+1; setRegPage(p); fetchRegister(p); }}
                          style={{ padding:'6px 16px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>Next →</button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════ STUDENT DETAIL ══════════════════════════ */}
          {activeTab === 'detail' && selected && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <button onClick={() => { setSelected(null); setActiveTab('register'); }}
                  style={{ background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  ← Back
                </button>
                <h2 style={{ color:'#6A1B9A', margin:0 }}>👩‍🎓 {selected.applicantName}</h2>
              </div>

              {/* Financial Overview */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
                {[
                  { label:'Total Fees',           val:fmt(selected.totalFees),                bg:'#e3f2fd', color:'#1565C0' },
                  { label:'Scholarship Amount',    val:fmt(selected.scholarshipAmount),        bg:'#f3e5f5', color:'#7B1FA2' },
                  { label:'Net Payable',           val:fmt(selected.netPayable),               bg:'#fff3e0', color:'#E65100' },
                  { label:'Fees Paid',             val:fmt(selected.feesPaid),                 bg:'#e8f5e9', color:'#2E7D32' },
                  { label:'Balance',               val:fmt(selected.balance),                  bg:'#ffebee', color:'#C62828' },
                  { label:'Eligible Amount',       val:fmt(selected.scholarshipEligibleAmount),bg:'#e8eaf6', color:'#3949ab' },
                  { label:'Received Amount',       val:fmt(selected.scholarshipReceivedAmount),bg:'#e8f5e9', color:'#2E7D32' },
                  { label:'Pending Amount',        val:fmt(selected.scholarshipPendingAmount), bg:'#fff3e0', color:'#E65100' },
                ].map(c => (
                  <div key={c.label} style={{ background:c.bg, borderRadius:10, padding:'12px 16px', flex:1, minWidth:120 }}>
                    <p style={{ fontSize:11, color:c.color, fontWeight:600, margin:'0 0 2px' }}>{c.label}</p>
                    <p style={{ fontSize:16, fontWeight:800, color:c.color, margin:0 }}>{c.val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                {/* ── Scholarship Status Update ── */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ce93d8', padding:20 }}>
                  <h4 style={{ color:'#7B1FA2', marginBottom:14, fontSize:14 }}>🏅 Scholarship Status</h4>

                  {/* Auto-Calculate */}
                  <div style={{ background:'#f9f0ff', border:'1px solid #ce93d8', borderRadius:10, padding:14, marginBottom:16 }}>
                    <p style={{ fontSize:12, color:'#6A1B9A', fontWeight:600, marginBottom:8 }}>🤖 Auto-Calculate from Master</p>
                    <p style={{ fontSize:11, color:'#888', marginBottom:10 }}>Matches this student's category + course + year to the Scholarship Master and fills the amount automatically.</p>
                    <button onClick={handleAutoCalculate} disabled={calcLoading}
                      style={{ padding:'8px 18px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:13, cursor:calcLoading?'not-allowed':'pointer', opacity:calcLoading?0.7:1 }}>
                      {calcLoading ? '⏳ Calculating…' : '⚡ Auto-Calculate Scholarship'}
                    </button>
                    {calcResult && (
                      <div style={{ marginTop:12, fontSize:12, color:'#2E7D32', background:'#e8f5e9', borderRadius:8, padding:'8px 12px' }}>
                        ✅ Scholarship: {fmt(calcResult.scholarshipAmount)} | Net Payable: {fmt(calcResult.netPayable)} | Balance: {fmt(calcResult.balance)}
                      </div>
                    )}
                  </div>

                  <div style={{ display:'grid', gap:12 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Status *</label>
                      <select value={statusForm.scholarshipStatus}
                        onChange={e => setStatusForm(f => ({ ...f, scholarshipStatus:e.target.value }))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13 }}>
                        {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    {['approved','disbursed'].includes(statusForm.scholarshipStatus) && (
                      <div>
                        <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Received Amount (₹)</label>
                        <input type="number" min="0" value={statusForm.scholarshipReceivedAmount}
                          onChange={e => setStatusForm(f => ({ ...f, scholarshipReceivedAmount:e.target.value }))}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, boxSizing:'border-box' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Notes</label>
                      <textarea rows={2} value={statusForm.scholarshipNote}
                        onChange={e => setStatusForm(f => ({ ...f, scholarshipNote:e.target.value }))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, resize:'vertical', boxSizing:'border-box' }} />
                    </div>
                    <button onClick={handleStatusUpdate} disabled={statusSaving}
                      style={{ padding:'10px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:13, cursor:statusSaving?'not-allowed':'pointer', opacity:statusSaving?0.7:1 }}>
                      {statusSaving ? '⏳ Saving…' : '💾 Update Status'}
                    </button>
                  </div>
                </div>

                {/* ── MahaDBT Credentials ── */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:'#1565C0', marginBottom:14, fontSize:14 }}>🌐 MahaDBT Credentials</h4>
                  <div style={{ background:'#fff3e0', border:'1px solid #ffe082', borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:11, color:'#7c5e00' }}>
                    🔒 Confidential — do not share with unauthorized persons.
                  </div>
                  <div style={{ display:'grid', gap:12 }}>
                    {[
                      { label:'MahaDBT Username', key:'mahaDBTUsername', type:'text',     placeholder:'Portal username' },
                      { label:'MahaDBT Password', key:'mahaDBTPassword', type:'text',     placeholder:'Portal password' },
                      { label:'Mobile Number',    key:'mahaDBTMobile',   type:'tel',      placeholder:'Registered mobile' },
                      { label:'Application No.',  key:'mahaDBTAppNo',    type:'text',     placeholder:'App/Reference no.' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>{f.label}</label>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <input type={f.key==='mahaDBTPassword' && !showPass['edit'] ? 'password' : f.type}
                            placeholder={f.placeholder} value={mahaForm[f.key]}
                            onChange={e => setMahaForm(m => ({ ...m, [f.key]:e.target.value }))}
                            style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' }} />
                          {f.key==='mahaDBTPassword' && (
                            <button onClick={() => setShowPass(p => ({ ...p, edit:!p.edit }))}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                              {showPass.edit ? '🙈' : '👁️'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button onClick={handleMahaDBTUpdate} disabled={mahaSaving}
                      style={{ padding:'10px', background:'#1565C0', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:13, cursor:mahaSaving?'not-allowed':'pointer', opacity:mahaSaving?0.7:1 }}>
                      {mahaSaving ? '⏳ Saving…' : '💾 Save MahaDBT Credentials'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Document Verification ── */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20, marginTop:16 }}>
                <h4 style={{ color:'#2E7D32', marginBottom:16, fontSize:14 }}>📂 Document Verification</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                  {DOC_KEYS.map(doc => {
                    const state = docVer[doc.key] || { status:'pending', remark:'' };
                    const statusColor = { pending:'#E65100', verified:'#2E7D32', rejected:'#C62828' }[state.status] || '#555';
                    const statusBg    = { pending:'#fff3e0', verified:'#e8f5e9', rejected:'#ffebee' }[state.status] || '#f5f5f5';
                    return (
                      <div key={doc.key} style={{ border:`2px solid ${statusBg}`, borderRadius:10, padding:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                          <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{doc.label}</p>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:10, background:statusBg, color:statusColor }}>
                            {state.status.toUpperCase()}
                          </span>
                        </div>
                        <select value={state.status}
                          onChange={e => setDocVer(dv => ({ ...dv, [doc.key]:{ ...dv[doc.key], status:e.target.value } }))}
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'1px solid #ddd', fontSize:12, marginBottom:8 }}>
                          <option value="pending">⏳ Pending</option>
                          <option value="verified">✅ Verified</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                        <input type="text" placeholder="Remark (optional)" value={state.remark}
                          onChange={e => setDocVer(dv => ({ ...dv, [doc.key]:{ ...dv[doc.key], remark:e.target.value } }))}
                          style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'1px solid #ddd', fontSize:12, marginBottom:8, boxSizing:'border-box' }} />
                        <button onClick={() => handleDocVerify(doc.key)} disabled={docSaving===doc.key}
                          style={{ width:'100%', padding:'7px', background:'#2E7D32', color:'#fff', border:'none', borderRadius:7, fontWeight:600, fontSize:12, cursor:docSaving===doc.key?'not-allowed':'pointer', opacity:docSaving===doc.key?0.7:1 }}>
                          {docSaving===doc.key ? '⏳ Saving…' : '💾 Save'}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {selected.scholarshipVerifiedBy && (
                  <p style={{ fontSize:12, color:'#888', marginTop:14 }}>
                    ✅ Last verified by: <strong>{selected.scholarshipVerifiedBy}</strong> on {fmtDate(selected.scholarshipVerifiedDate)}
                  </p>
                )}
              </div>

              {/* ── Personal & Academic Info ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:'#7B1FA2', marginBottom:14, fontSize:14 }}>👤 Personal Details</h4>
                  {[
                    ['Name', selected.applicantName], ['Father', selected.fatherName], ['Mother', selected.motherName],
                    ['DOB', fmtDate(selected.dateOfBirth)], ['Gender', selected.gender],
                    ['Category', (selected.category||'—').toUpperCase()], ['Caste', selected.caste],
                    ['Religion', selected.religion], ['Family Income', selected.familyIncome ? fmt(selected.familyIncome) : '—'],
                    ['Mobile', selected.phone], ['Email', selected.email],
                  ].map(([l,v]) => v && v !== '—' && (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:12 }}>
                      <span style={{ color:'#888', fontWeight:600 }}>{l}</span>
                      <span style={{ color:'#222', textAlign:'right', maxWidth:'55%', wordBreak:'break-all' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:'#1565C0', marginBottom:14, fontSize:14 }}>🎓 Academic Details</h4>
                  {[
                    ['Student ID', selected.studentId], ['PRN', selected.prnNumber],
                    ['ABC / APAR ID', selected.aparIdNumber], ['Aadhar No.', selected.aadharNumber],
                    ['Course', selected.courseType], ['Year', selected.admissionYear],
                    ['Academic Year', selected.academicYear], ['Subject', selected.preferredSubject],
                    ['SSC %', selected.sscPercentage ? `${selected.sscPercentage}%` : '—'],
                    ['HSC %', selected.hscPercentage ? `${selected.hscPercentage}%` : '—'],
                    ['Address', selected.address],
                  ].map(([l,v]) => v && v !== '—' && (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:12 }}>
                      <span style={{ color:'#888', fontWeight:600 }}>{l}</span>
                      <span style={{ color:'#222', textAlign:'right', maxWidth:'55%', wordBreak:'break-all' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Documents on File ── */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20, marginTop:16 }}>
                <h4 style={{ color:'#2E7D32', marginBottom:14, fontSize:14 }}>📎 Uploaded Documents</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:10 }}>
                  {[
                    ['Caste Certificate', selected.casteCertificate],
                    ['Caste Validity', selected.casteValidityCertificate],
                    ['Income Certificate', selected.incomeCertificate],
                    ['Domicile', selected.domicileCertificate],
                    ['SSC Marksheet', selected.sscMarksheet],
                    ['HSC Marksheet', selected.hscMarksheet],
                    ['Aadhar Photo', selected.aadharPhoto],
                    ['Bank Passbook', selected.bankPassbook],
                    ['Student Photo', selected.studentPhoto],
                  ].map(([l, url]) => (
                    <div key={l} style={{ background:url?'#e8f5e9':'#fafafa', border:`1px solid ${url?'#a5d6a7':'#e0e0e0'}`, borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:16 }}>{url ? '✅' : '❌'}</span>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:url?'#2E7D32':'#aaa', margin:0 }}>{l}</p>
                        {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:10, color:'#1565C0' }}>View ↗</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ MAHADBT CREDENTIALS TAB ══════════════════════ */}
          {activeTab === 'mahadbt' && (
            <div>
              <h2 style={{ color:'#6A1B9A', marginBottom:4 }}>🌐 MahaDBT Portal Credentials</h2>
              <p style={{ color:'#666', marginBottom:16, fontSize:14 }}>All students' MahaDBT usernames, passwords and application numbers.</p>
              <div style={{ background:'#fff3e0', border:'1px solid #ffe082', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:13, color:'#7c5e00' }}>
                🔒 Confidential — do not share with unauthorized persons.
              </div>

              <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                <input type="text" placeholder="🔍 Search by name or student ID…" value={regFilters.search}
                  onChange={e => setRegFilters(f => ({ ...f, search:e.target.value }))}
                  style={{ flex:1, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14 }} />
                <button onClick={() => fetchRegister(1)} style={{ padding:'9px 16px', background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:9, fontWeight:600, cursor:'pointer' }}>🔄 Refresh</button>
              </div>

              {admLoading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading…</h3></div> : (
                <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1.5fr 1.2fr 1fr', background:'#7B1FA2', padding:'12px 16px', gap:8 }}>
                    {['Student','Category','MahaDBT Username','MahaDBT Password','App No.','Status'].map(h => (
                      <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
                    ))}
                  </div>
                  {admissions
                    .filter(a => !regFilters.search || a.applicantName?.toLowerCase().includes(regFilters.search.toLowerCase()) || a.studentId?.toLowerCase().includes(regFilters.search.toLowerCase()))
                    .map((adm, idx) => {
                      const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
                      const cc = catColor(adm.category);
                      return (
                        <div key={adm._id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1.5fr 1.2fr 1fr', padding:'11px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                          <div>
                            <p style={{ fontWeight:600, fontSize:13, margin:0 }}>{adm.applicantName}</p>
                            <p style={{ fontSize:11, color:'#888', margin:0 }}>{adm.studentId || '—'}</p>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', color:cc.color }}>{adm.category || '—'}</span>
                          <span style={{ fontSize:12, fontFamily:'monospace', color:adm.mahaDBTUsername?'#1565C0':'#aaa' }}>{adm.mahaDBTUsername || '—'}</span>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ fontSize:12, fontFamily:'monospace', color:adm.mahaDBTPassword?'#555':'#aaa' }}>
                              {adm.mahaDBTPassword ? (showPass[adm._id] ? adm.mahaDBTPassword : '••••••') : '—'}
                            </span>
                            {adm.mahaDBTPassword && (
                              <button onClick={() => setShowPass(p => ({ ...p, [adm._id]:!p[adm._id] }))}
                                style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, padding:0 }}>
                                {showPass[adm._id] ? '🙈' : '👁️'}
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize:12, fontFamily:'monospace' }}>{adm.mahaDBTAppNo || '—'}</span>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10, background:sc.bg, color:sc.color }}>{sc.label}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════ SCHOLARSHIP MASTER ══════════════════════ */}
          {activeTab === 'master' && (
            <div>
              <h2 style={{ color:'#6A1B9A', marginBottom:4 }}>⚙️ Scholarship Master</h2>
              <p style={{ color:'#666', marginBottom:20, fontSize:14 }}>Define scholarship amounts per category, course, and year. Used for auto-calculation.</p>

              {/* Form */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:22, marginBottom:24 }}>
                <h4 style={{ color:'#7B1FA2', marginBottom:16 }}>{masterEditId ? '✏️ Edit Master Record' : '➕ Add New Master Record'}</h4>
                {masterMsg && (
                  <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13, fontWeight:600, background:masterMsg.startsWith('✅')?'#e8f5e9':'#ffebee', color:masterMsg.startsWith('✅')?'#2E7D32':'#C62828' }}>{masterMsg}</div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Category *</label>
                    <select value={masterForm.category} onChange={e => setMasterForm(f => ({ ...f, category:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Course Type *</label>
                    <select value={masterForm.courseType} onChange={e => setMasterForm(f => ({ ...f, courseType:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                      {COURSE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Admission Year *</label>
                    <select value={masterForm.admissionYear} onChange={e => setMasterForm(f => ({ ...f, admissionYear:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Academic Year *</label>
                    <select value={masterForm.academicYear} onChange={e => setMasterForm(f => ({ ...f, academicYear:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13 }}>
                      <option value="">Select…</option>
                      {genAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Scholarship Amount (₹) *</label>
                    <input type="number" min="0" placeholder="e.g. 25740" value={masterForm.scholarshipAmount}
                      onChange={e => setMasterForm(f => ({ ...f, scholarshipAmount:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' }} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Description</label>
                    <input type="text" placeholder="Optional note about this scholarship" value={masterForm.description}
                      onChange={e => setMasterForm(f => ({ ...f, description:e.target.value }))}
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={saveMaster}
                    style={{ padding:'10px 24px', background:'#7B1FA2', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    {masterEditId ? '💾 Update' : '➕ Add'}
                  </button>
                  {masterEditId && (
                    <button onClick={() => { setMasterForm(BLANK_MASTER); setMasterEditId(null); setMasterMsg(''); }}
                      style={{ padding:'10px 18px', background:'#eee', color:'#333', border:'none', borderRadius:9, fontSize:13, cursor:'pointer' }}>Cancel</button>
                  )}
                </div>
              </div>

              {/* Master list */}
              {masterLoading ? (
                <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading…</h3></div>
              ) : masters.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">⚙️</div><h3>No master records yet</h3></div>
              ) : (
                <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.2fr 1.2fr 1.5fr 1fr', background:'#7B1FA2', padding:'12px 16px', gap:8 }}>
                    {['Category','Course','Year','Academic Year','Amount','Description','Actions'].map(h => (
                      <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
                    ))}
                  </div>
                  {masters.map((m, idx) => {
                    const cc = catColor(m.category);
                    return (
                      <div key={m._id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.2fr 1.2fr 1.5fr 1fr', padding:'11px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                        <span style={{ fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:10, background:cc.bg, color:cc.color, textTransform:'uppercase' }}>{m.category}</span>
                        <span style={{ fontSize:12 }}>{m.courseType}</span>
                        <span style={{ fontSize:12 }}>{m.admissionYear}</span>
                        <span style={{ fontSize:12 }}>{m.academicYear}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#7B1FA2' }}>{fmt(m.scholarshipAmount)}</span>
                        <span style={{ fontSize:11, color:'#888' }}>{m.description || '—'}</span>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => startEditMaster(m)}
                            style={{ background:'#e3f2fd', color:'#1565C0', border:'1px solid #90caf9', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}>✏️ Edit</button>
                          <button onClick={() => deleteMaster(m._id)}
                            style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:6, padding:'4px 8px', fontSize:11, fontWeight:600, cursor:'pointer' }}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════ ALL STUDENTS ══════════════════════════ */}
          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color:'#7B1FA2', marginBottom:4 }}>📋 All Students</h2>
              <p style={{ color:'#666', marginBottom:20, fontSize:14 }}>Complete student information. Read-only view.</p>
              <StudentViewFull canEdit={false} themeColor="#7B1FA2" role="scholarship" />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ScholarshipSectionDashboard;
