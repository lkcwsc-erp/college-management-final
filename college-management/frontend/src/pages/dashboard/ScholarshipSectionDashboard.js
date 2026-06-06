import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  not_filled: { label: '📝 Not Filled',  bg: '#fff3e0', color: '#E65100', dot: '#FF9800' },
  filled:     { label: '📋 Form Filled', bg: '#e3f2fd', color: '#1565C0', dot: '#42A5F5' },
  approved:   { label: '✅ Approved',    bg: '#e8f5e9', color: '#2E7D32', dot: '#66BB6A' },
  rejected:   { label: '❌ Rejected',    bg: '#ffebee', color: '#C62828', dot: '#EF5350' },
  disbursed:  { label: '💰 Disbursed',   bg: '#f3e5f5', color: '#7B1FA2', dot: '#AB47BC' },
};

const CATEGORY_COLORS = {
  sc:        { bg: '#e3f2fd', color: '#1565C0' },
  st:        { bg: '#e8f5e9', color: '#2E7D32' },
  obc:       { bg: '#fff3e0', color: '#E65100' },
  sbc:       { bg: '#f3e5f5', color: '#7B1FA2' },
  'nt-b':    { bg: '#fce4ec', color: '#880E4F' },
  'nt-c':    { bg: '#fce4ec', color: '#880E4F' },
  'nt-d':    { bg: '#fce4ec', color: '#880E4F' },
  'vj/dt(nt-a)': { bg: '#fce4ec', color: '#880E4F' },
  ews:       { bg: '#e0f2f1', color: '#00695C' },
  sebc:      { bg: '#fff8e1', color: '#F57F17' },
  open:      { bg: '#f5f5f5', color: '#555' },
  other:     { bg: '#f5f5f5', color: '#555' },
};

const DOC_FIELDS = [
  { key: 'aadhar',           label: 'Aadhaar Card',         urlKey: 'aadharPhoto' },
  { key: 'casteCertificate', label: 'Caste Certificate',    urlKey: 'casteCertificate' },
  { key: 'casteValidity',    label: 'Caste Validity',       urlKey: 'casteValidityCertificate' },
  { key: 'incomeCertificate',label: 'Income Certificate',   urlKey: 'incomeCertificate' },
  { key: 'domicile',         label: 'Domicile Certificate', urlKey: 'domicileCertificate' },
  { key: 'bankPassbook',     label: 'Bank Passbook',        urlKey: 'bankPassbook' },
];

const VERIFICATION_STATUS = {
  pending:  { label: 'Pending',  bg: '#fff3e0', color: '#E65100' },
  verified: { label: 'Verified', bg: '#e8f5e9', color: '#2E7D32' },
  rejected: { label: 'Rejected', bg: '#ffebee', color: '#C62828' },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // core state
  const [activeTab,    setActiveTab]    = useState('home');
  const [admissions,   setAdmissions]   = useState([]);
  const [dashboard,    setDashboard]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [msg,          setMsg]          = useState('');

  // list filters
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter,   setYearFilter]   = useState('all');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);

  // detail / edit
  const [selected,     setSelected]     = useState(null);
  const [editMode,     setEditMode]     = useState(false);
  const [editData,     setEditData]     = useState({});
  const [saving,       setSaving]       = useState(false);
  const [showPass,     setShowPass]     = useState({});
  const [autoCalcing,  setAutoCalcing]  = useState(false);

  // master tab
  const [masters,      setMasters]      = useState([]);
  const [masterLoading,setMasterLoading]= useState(false);
  const [masterForm,   setMasterForm]   = useState({ category:'', courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'' });
  const [masterSaving, setMasterSaving] = useState(false);
  const [masterMsg,    setMasterMsg]    = useState('');
  const [editMasterId, setEditMasterId] = useState(null);
  const [importFile,   setImportFile]   = useState(null);
  const [importing,    setImporting]    = useState(false);

  // export
  const [exporting,    setExporting]    = useState(false);

  const LIMIT = 20;

  /* ── Fetchers ─────────────────────────────── */
  const flashMsg = (m, delay = 3500) => {
    setMsg(m);
    setTimeout(() => setMsg(''), delay);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await API.get('/scholarships/dashboard');
      setDashboard(res.data.dashboard);
    } catch { }
  }, []);

  const fetchAdmissions = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (search)       params.append('search', search);
      if (catFilter    !== 'all') params.append('category',         catFilter);
      if (statusFilter !== 'all') params.append('scholarshipStatus', statusFilter);
      if (yearFilter   !== 'all') params.append('admissionYear',    yearFilter);

      const res = await API.get(`/scholarships/register?${params}`);
      setAdmissions(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      setPage(pg);
    } catch { }
    finally { setLoading(false); }
  }, [search, catFilter, statusFilter, yearFilter]);

  const fetchMasters = useCallback(async () => {
    setMasterLoading(true);
    try {
      const res = await API.get('/scholarships/master');
      setMasters(res.data.scholarships || []);
    } catch { }
    finally { setMasterLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'register') fetchAdmissions(1);
  }, [activeTab, fetchAdmissions]);
  useEffect(() => {
    if (activeTab === 'master') fetchMasters();
  }, [activeTab, fetchMasters]);

  /* ── Actions ─────────────────────────────── */
  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save MahaDBT credentials
      await API.put(`/scholarships/mahadbt/${selected._id}`, {
        mahaDBTUsername: editData.mahaDBTUsername,
        mahaDBTPassword: editData.mahaDBTPassword,
        mahaDBTAppNo:    editData.mahaDBTAppNo,
        mahaDBTMobile:   editData.mahaDBTMobile,
      });
      // Save scholarship status
      await API.put(`/scholarships/status/${selected._id}`, {
        scholarshipStatus:        editData.scholarshipStatus,
        scholarshipNote:          editData.scholarshipNote,
        scholarshipReceivedAmount: editData.scholarshipReceivedAmount,
        verifiedBy:               user?.name,
      });
      flashMsg('✅ Saved successfully!');
      // Refresh selected student
      await API.get(`/scholarships/receipt/${selected._id}`);
      const full = await API.get('/scholarships/register?limit=1&search=' + selected.studentId);
      if (full.data.students?.[0]) setSelected(s => ({ ...s, ...full.data.students[0] }));
      setEditMode(false);
      setEditData({});
      fetchDashboard();
    } catch (e) { flashMsg('❌ ' + (e.response?.data?.message || 'Save failed')); }
    finally { setSaving(false); }
  };

  const handleAutoCalculate = async () => {
    setAutoCalcing(true);
    try {
      const res = await API.post(`/scholarships/calculate/${selected._id}`);
      const d = res.data.data;
      setSelected(s => ({
        ...s,
        scholarshipAmount:         d.scholarshipAmount,
        scholarshipEligibleAmount: d.scholarshipEligibleAmount,
        scholarshipPendingAmount:  d.scholarshipPendingAmount,
      }));
      setEditData(p => ({ ...p, scholarshipAmount: d.scholarshipAmount }));
      flashMsg(`✅ Auto-calculated: ₹${fmt(d.scholarshipEligibleAmount)} eligible`);
    } catch (e) { flashMsg('❌ ' + (e.response?.data?.message || 'Calculation failed')); }
    finally { setAutoCalcing(false); }
  };

  const handleDocVerification = async (admissionId, documentType, status, remark = '') => {
    try {
      await API.put(`/scholarships/document-verification/${admissionId}`, {
        documentType, status, remark, verifiedBy: user?.name,
      });
      setSelected(s => ({
        ...s,
        [`${documentType}VerificationStatus`]: status,
        [`${documentType}VerificationRemark`]: remark,
      }));
      flashMsg(`✅ ${documentType} marked as ${status}`);
    } catch (e) { flashMsg('❌ ' + (e.response?.data?.message || 'Update failed')); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (catFilter    !== 'all') params.append('category',         catFilter);
      if (statusFilter !== 'all') params.append('scholarshipStatus', statusFilter);
      if (yearFilter   !== 'all') params.append('admissionYear',    yearFilter);
      const res = await API.get(`/scholarships/register/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = 'scholarship_register.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { flashMsg('❌ Export failed'); }
    finally { setExporting(false); }
  };

  const handleMasterSave = async () => {
    setMasterSaving(true);
    setMasterMsg('');
    try {
      if (editMasterId) {
        await API.put(`/scholarships/master/${editMasterId}`, { ...masterForm, updatedBy: user?.name });
        setMasterMsg('✅ Updated!');
      } else {
        await API.post('/scholarships/master', { ...masterForm, createdBy: user?.name });
        setMasterMsg('✅ Created!');
      }
      setMasterForm({ category:'', courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'' });
      setEditMasterId(null);
      fetchMasters();
      setTimeout(() => setMasterMsg(''), 3000);
    } catch (e) { setMasterMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setMasterSaving(false); }
  };

  const handleMasterDelete = async (id) => {
    if (!window.confirm('Delete this master record?')) return;
    try {
      await API.delete(`/scholarships/master/${id}`);
      fetchMasters();
    } catch { }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    const fd = new FormData(); fd.append('file', importFile); fd.append('createdBy', user?.name);
    try {
      const res = await API.post('/scholarships/master/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMasterMsg(`✅ Import done: ${res.data.results?.success?.length || 0} created`);
      setImportFile(null);
      fetchMasters();
    } catch (e) { setMasterMsg('❌ Import failed: ' + (e.response?.data?.message || 'Error')); }
    finally { setImporting(false); }
  };

  /* ── Derived stats ───────────────────────── */
  const db = dashboard || {};

  const tabs = [
    { id: 'home',      label: '🏠 Dashboard' },
    { id: 'students',  label: '👩‍🎓 Students',   badge: db.notFilled },
    { id: 'register',  label: '📋 Register' },
    { id: 'master',    label: '⚙️ Master Data' },
    { id: 'mahadbt',   label: '🌐 MahaDBT' },
    { id: 'all_students', label: '👁️ All Students' },
  ];

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
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
            <button
              key={t.id}
              className={activeTab === t.id ? 'active' : ''}
              onClick={() => { setActiveTab(t.id); setMsg(''); }}
            >
              {t.label}
              {t.badge > 0 && (
                <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>🏅 Scholarship Section</h2>
          <div className="user-info"><span>👋 {user?.name}</span></div>
        </div>

        {msg && (
          <div style={{ margin: '12px 24px 0', padding: '12px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
            {msg}
          </div>
        )}

        <div className="dashboard-content">

          {/* ══════════════════════════════
               HOME / DASHBOARD
          ══════════════════════════════ */}
          {activeTab === 'home' && (
            <HomeDashboard
              db={db}
              user={user}
              onRefresh={fetchDashboard}
              onGoTab={setActiveTab}
            />
          )}

          {/* ══════════════════════════════
               STUDENTS — paginated list
          ══════════════════════════════ */}
          {activeTab === 'students' && (
            <StudentsTab
              admissions={admissions}
              loading={loading}
              search={search} setSearch={setSearch}
              catFilter={catFilter} setCatFilter={setCatFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              yearFilter={yearFilter} setYearFilter={setYearFilter}
              page={page} totalPages={totalPages} totalCount={totalCount}
              onPageChange={(p) => fetchAdmissions(p)}
              onRefresh={() => fetchAdmissions(1)}
              onExport={handleExport} exporting={exporting}
              onView={(adm) => { setSelected(adm); setEditMode(false); setEditData({}); setMsg(''); setActiveTab('detail'); }}
            />
          )}

          {/* ══════════════════════════════
               REGISTER TAB (same list, alias)
          ══════════════════════════════ */}
          {activeTab === 'register' && (
            <StudentsTab
              admissions={admissions}
              loading={loading}
              search={search} setSearch={setSearch}
              catFilter={catFilter} setCatFilter={setCatFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              yearFilter={yearFilter} setYearFilter={setYearFilter}
              page={page} totalPages={totalPages} totalCount={totalCount}
              onPageChange={(p) => fetchAdmissions(p)}
              onRefresh={() => fetchAdmissions(1)}
              onExport={handleExport} exporting={exporting}
              onView={(adm) => { setSelected(adm); setEditMode(false); setEditData({}); setMsg(''); setActiveTab('detail'); }}
              showAmounts
            />
          )}

          {/* ══════════════════════════════
               STUDENT DETAIL
          ══════════════════════════════ */}
          {activeTab === 'detail' && selected && (
            <StudentDetail
              selected={selected}
              editMode={editMode} setEditMode={setEditMode}
              editData={editData} setEditData={setEditData}
              saving={saving}
              autoCalcing={autoCalcing}
              showPass={showPass} setShowPass={setShowPass}
              msg={msg}
              onBack={() => setActiveTab('students')}
              onSave={handleSave}
              onAutoCalculate={handleAutoCalculate}
              onDocVerify={handleDocVerification}
            />
          )}

          {/* ══════════════════════════════
               MASTER DATA TAB
          ══════════════════════════════ */}
          {activeTab === 'master' && (
            <MasterTab
              masters={masters}
              loading={masterLoading}
              form={masterForm} setForm={setMasterForm}
              saving={masterSaving}
              msg={masterMsg}
              editId={editMasterId}
              importFile={importFile} setImportFile={setImportFile}
              importing={importing}
              onSave={handleMasterSave}
              onEdit={(m) => { setEditMasterId(m._id); setMasterForm({ category: m.category, courseType: m.courseType, admissionYear: m.admissionYear, academicYear: m.academicYear, scholarshipAmount: m.scholarshipAmount, description: m.description || '' }); }}
              onDelete={handleMasterDelete}
              onCancelEdit={() => { setEditMasterId(null); setMasterForm({ category:'', courseType:'', admissionYear:'FY', academicYear:'2025-26', scholarshipAmount:'', description:'' }); }}
              onImport={handleImport}
            />
          )}

          {/* ══════════════════════════════
               MAHADBT CREDENTIALS
          ══════════════════════════════ */}
          {activeTab === 'mahadbt' && (
            <MahaDBTTab
              admissions={admissions}
              loading={loading}
              search={search} setSearch={setSearch}
              showPass={showPass} setShowPass={setShowPass}
              onRefresh={() => fetchAdmissions(1)}
              onView={(adm) => { setSelected(adm); setEditMode(false); setEditData({}); setMsg(''); setActiveTab('detail'); }}
            />
          )}

          {/* ══════════════════════════════
               ALL STUDENTS
          ══════════════════════════════ */}
          {activeTab === 'all_students' && (
            <div>
              <h2 style={{ color: '#7B1FA2', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Full student view — read only.</p>
              <StudentViewFull canEdit={false} themeColor="#7B1FA2" role="scholarship" />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   HOME DASHBOARD
═══════════════════════════════════════════════════════════ */
const HomeDashboard = ({ db, user, onRefresh, onGoTab }) => {
  const cards = [
    { label: 'Total Students',    value: db.totalStudents    || 0, icon: '👩‍🎓', cls: 'blue' },
    { label: 'Not Filled',        value: db.notFilled        || 0, icon: '📝', cls: 'orange' },
    { label: 'Filled',            value: db.filled           || 0, icon: '📋', cls: 'green' },
    { label: 'Approved',          value: db.approved         || 0, icon: '✅', cls: 'green' },
    { label: 'Rejected',          value: db.rejected         || 0, icon: '❌', cls: 'red' },
    { label: 'Disbursed',         value: db.disbursed        || 0, icon: '💰', cls: 'purple' },
  ];
  const amtCards = [
    { label: 'Total Eligible',   value: db.totalEligibleAmount  || 0, color: '#1565C0', bg: '#e3f2fd' },
    { label: 'Total Received',   value: db.totalReceivedAmount  || 0, color: '#2E7D32', bg: '#e8f5e9' },
    { label: 'Total Pending',    value: db.totalPendingAmount   || 0, color: '#E65100', bg: '#fff3e0' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,#7B1FA2,#4A148C)', padding: '20px 24px', borderRadius: 14, marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>🏅 Welcome, {user?.name}!</h3>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>Scholarship Management — AY 2025-26</p>
        </div>
        <button onClick={onRefresh} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Status cards */}
      <div className="dash-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className={`dash-card ${c.cls}`} style={{ cursor: 'pointer' }} onClick={() => onGoTab('students')}>
            <div className="dash-card-icon">{c.icon}</div>
            <div><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      {/* Amount cards */}
      <h3 style={{ margin: '0 0 14px', color: '#333', fontSize: 15 }}>💰 Scholarship Amounts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {amtCards.map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888', fontWeight: 600 }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.color }}>₹{fmt(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Status progress */}
      <h3 style={{ margin: '0 0 14px', color: '#333', fontSize: 15 }}>📊 Status Breakdown</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden' }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg], idx) => {
          const count = db[key] || (key === 'not_filled' ? db.notFilled : 0) || 0;
          const total = db.totalStudents || 1;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: idx < 4 ? '1px solid #f0f4f8' : 'none', gap: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color, minWidth: 130 }}>{cfg.label}</span>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 10, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color, minWidth: 70, textAlign: 'right' }}>{count} <span style={{ fontSize: 11, color: '#aaa' }}>({pct}%)</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   STUDENTS TAB
═══════════════════════════════════════════════════════════ */
const StudentsTab = ({
  admissions, loading, search, setSearch,
  catFilter, setCatFilter, statusFilter, setStatusFilter,
  yearFilter, setYearFilter,
  page, totalPages, totalCount,
  onPageChange, onRefresh, onExport, exporting, onView, showAmounts = false,
}) => {
  const themeColor = '#7B1FA2';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: themeColor, margin: '0 0 4px' }}>
            {showAmounts ? '📋 Scholarship Register' : '👩‍🎓 Student Scholarship Status'}
          </h2>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
            {totalCount} students total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRefresh} style={btnStyle('#f3e5f5', themeColor, '#ce93d8')}>🔄 Refresh</button>
          <button onClick={onExport} disabled={exporting} style={btnStyle('#e8f5e9', '#2E7D32', '#a5d6a7')}>
            {exporting ? '⏳...' : '📥 Excel'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="🔍 Search name, ID, PRN, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, ...inputStyle }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Categories</option>
          {['SC','ST','OBC','VJ/DT(NT-A)','NT-B','NT-C','NT-D','SBC','EWS','SEBC','OPEN'].map(c =>
            <option key={c} value={c.toLowerCase()}>{c}</option>
          )}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Years</option>
          {['FY','SY','TY'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingState />
      ) : admissions.length === 0 ? (
        <EmptyState icon="📭" msg="No students found" />
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: showAmounts
                ? '2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1.2fr 0.7fr'
                : '2fr 1fr 1fr 1fr 1.5fr 0.8fr',
              background: themeColor, padding: '12px 16px', gap: 8
            }}>
              {(showAmounts
                ? ['Student', 'Category', 'Course', 'Year', 'Total Fees', 'Scholarship', 'Net Payable', 'Status', 'Action']
                : ['Student', 'Category', 'Course/Year', 'Student ID', 'Scholarship Status', 'Action']
              ).map(h => <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>)}
            </div>

            {admissions.map((adm, idx) => {
              const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
              const cc = CATEGORY_COLORS[(adm.category || 'other').toLowerCase()] || CATEGORY_COLORS.other;
              const netPayable = (adm.totalFees || 0) - (adm.scholarshipAmount || 0);
              return (
                <div key={adm._id} style={{
                  display: 'grid',
                  gridTemplateColumns: showAmounts
                    ? '2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1.2fr 0.7fr'
                    : '2fr 1fr 1fr 1fr 1.5fr 0.8fr',
                  padding: '11px 16px', gap: 8, alignItems: 'center',
                  borderBottom: '1px solid #f0f4f8',
                  background: idx % 2 === 0 ? '#fafbff' : '#fff',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: cc.bg, color: cc.color, textTransform: 'uppercase' }}>
                    {adm.category || '—'}
                  </span>
                  {showAmounts ? (
                    <>
                      <span style={{ fontSize: 12, color: '#555' }}>{adm.courseType || '—'}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{adm.admissionYear || '—'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>₹{fmt(adm.totalFees)}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1FA2' }}>₹{fmt(adm.scholarshipAmount)}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1565C0' }}>₹{fmt(netPayable)}</span>
                    </>
                  ) : (
                    <>
                      <div>
                        <p style={{ fontSize: 12, margin: 0 }}>{adm.courseType || '—'}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.admissionYear}</p>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{adm.studentId || '—'}</span>
                    </>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                  <button
                    onClick={() => onView(adm)}
                    style={{ background: '#f3e5f5', color: themeColor, border: `1px solid #ce93d8`, borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    👁️ View
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
              <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={pageBtn(page === 1)}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => onPageChange(p)}
                    style={{ ...pageBtn(false), background: p === page ? '#7B1FA2' : '#fff', color: p === page ? '#fff' : '#333', border: `1px solid ${p === page ? '#7B1FA2' : '#ddd'}` }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={pageBtn(page === totalPages)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   STUDENT DETAIL
═══════════════════════════════════════════════════════════ */
const StudentDetail = ({
  selected, editMode, setEditMode, editData, setEditData,
  saving, autoCalcing, showPass, setShowPass,
  msg, onBack, onSave, onAutoCalculate, onDocVerify,
}) => {
  const netPayable = (selected.totalFees || 0) - (selected.scholarshipAmount || 0);
  const balance    = netPayable - (selected.feesPaid || 0);

  return (
    <div>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={btnStyle('#f3e5f5', '#7B1FA2', '#ce93d8')}>← Back</button>
        <h2 style={{ color: '#6A1B9A', margin: 0 }}>👩‍🎓 {selected.applicantName}</h2>
      </div>

      {msg && <MsgBanner msg={msg} />}

      {/* ── Fee Summary Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Fees',    value: `₹${fmt(selected.totalFees)}`,          color: '#1565C0', bg: '#e3f2fd' },
          { label: 'Scholarship',   value: `₹${fmt(selected.scholarshipAmount)}`,   color: '#7B1FA2', bg: '#f3e5f5' },
          { label: 'Net Payable',   value: `₹${fmt(netPayable)}`,                  color: '#E65100', bg: '#fff3e0' },
          { label: 'Paid',          value: `₹${fmt(selected.feesPaid)}`,            color: '#2E7D32', bg: '#e8f5e9' },
          { label: 'Balance',       value: `₹${fmt(balance)}`,                     color: balance > 0 ? '#C62828' : '#2E7D32', bg: balance > 0 ? '#ffebee' : '#e8f5e9' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${c.color}22` }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: '#888', fontWeight: 600 }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Info Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Personal */}
        <InfoCard title="👤 Personal Details" color="#7B1FA2" rows={[
          ['Name',           selected.applicantName],
          ['Father\'s Name', selected.fatherName],
          ['Mother\'s Name', selected.motherName],
          ['Date of Birth',  selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString('en-IN') : null],
          ['Gender',         selected.gender],
          ['Category',       (selected.category || '').toUpperCase()],
          ['Caste',          selected.caste],
          ['Sub-Caste',      selected.subCaste],
          ['Religion',       selected.religion],
          ['Family Income',  selected.familyIncome ? `₹${selected.familyIncome}` : null],
        ]} />

        {/* Academic */}
        <InfoCard title="🎓 Academic Details" color="#1565C0" rows={[
          ['Student ID',   selected.studentId],
          ['PRN Number',   selected.prnNumber],
          ['ABC / APAR ID',selected.aparIdNumber],
          ['Aadhaar No.',  selected.aadharNumber],
          ['Course',       selected.courseType],
          ['Subject',      selected.preferredSubject],
          ['Year',         selected.admissionYear],
          ['Academic Year',selected.academicYear],
          ['SSC %',        selected.sscPercentage ? `${selected.sscPercentage}%` : null],
          ['HSC %',        selected.hscPercentage ? `${selected.hscPercentage}%` : null],
          ['Mobile',       selected.phone],
          ['Email',        selected.email],
        ]} />
      </div>

      {/* ── Document Verification ── */}
      <DocVerificationCard
        selected={selected}
        onVerify={onDocVerify}
      />

      {/* ── Scholarship & MahaDBT ── */}
      <ScholarshipEditCard
        selected={selected}
        editMode={editMode} setEditMode={setEditMode}
        editData={editData} setEditData={setEditData}
        saving={saving} autoCalcing={autoCalcing}
        showPass={showPass} setShowPass={setShowPass}
        onSave={onSave}
        onAutoCalculate={onAutoCalculate}
      />
    </div>
  );
};


/* ─── Info Card ─────────────────────────────────────────── */
const InfoCard = ({ title, color, rows }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
    <h4 style={{ color, marginBottom: 12, fontSize: 14, margin: '0 0 12px' }}>{title}</h4>
    {rows.map(([l, v]) => v ? (
      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
        <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
        <span style={{ color: '#222', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
      </div>
    ) : null)}
  </div>
);


/* ─── Document Verification Card ───────────────────────── */
const DocVerificationCard = ({ selected, onVerify }) => {
  const [remarks, setRemarks] = useState({});

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 16 }}>
      <h4 style={{ color: '#2E7D32', margin: '0 0 14px', fontSize: 14 }}>📂 Document Verification</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
        {DOC_FIELDS.map(({ key, label, urlKey }) => {
          const url    = selected[urlKey];
          const status = selected[`${key}VerificationStatus`] || 'pending';
          const remark = selected[`${key}VerificationRemark`] || '';
          const vcfg   = VERIFICATION_STATUS[status];

          return (
            <div key={key} style={{ background: '#fafbff', border: '1px solid #e0e7ef', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{url ? '📄' : '❌'}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: url ? '#1a1a2e' : '#aaa' }}>{label}</p>
                    {url
                      ? <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#1565C0' }}>View Doc</a>
                      : <span style={{ fontSize: 10, color: '#aaa' }}>Not uploaded</span>
                    }
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: vcfg.bg, color: vcfg.color }}>
                  {vcfg.label}
                </span>
              </div>
              {url && (
                <>
                  <input
                    type="text"
                    placeholder="Remark (optional)..."
                    value={remarks[key] ?? remark}
                    onChange={e => setRemarks(r => ({ ...r, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e7ef', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onVerify(selected._id, key, 'verified', remarks[key] ?? remark)}
                      style={{ flex: 1, padding: '5px 0', background: status === 'verified' ? '#2E7D32' : '#e8f5e9', color: status === 'verified' ? '#fff' : '#2E7D32', border: `1px solid #a5d6a7`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✅ Verify
                    </button>
                    <button
                      onClick={() => onVerify(selected._id, key, 'rejected', remarks[key] ?? remark)}
                      style={{ flex: 1, padding: '5px 0', background: status === 'rejected' ? '#C62828' : '#ffebee', color: status === 'rejected' ? '#fff' : '#C62828', border: `1px solid #ef9a9a`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => onVerify(selected._id, key, 'pending', '')}
                      style={{ padding: '5px 8px', background: '#f5f5f5', color: '#888', border: `1px solid #ddd`, borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
                    >
                      ↩
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


/* ─── Scholarship & MahaDBT Edit Card ───────────────────── */
const ScholarshipEditCard = ({
  selected, editMode, setEditMode, editData, setEditData,
  saving, autoCalcing, showPass, setShowPass,
  onSave, onAutoCalculate,
}) => {
  const themeColor = '#7B1FA2';

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ce93d8', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ color: themeColor, margin: 0, fontSize: 14 }}>🏅 Scholarship & MahaDBT</h4>
        {!editMode ? (
          <button
            onClick={() => {
              setEditMode(true);
              setEditData({
                scholarshipStatus:         selected.scholarshipStatus,
                scholarshipNote:           selected.scholarshipNote || '',
                scholarshipReceivedAmount: selected.scholarshipReceivedAmount || 0,
                mahaDBTUsername:           selected.mahaDBTUsername || '',
                mahaDBTPassword:           selected.mahaDBTPassword || '',
                mahaDBTAppNo:              selected.mahaDBTAppNo || '',
                mahaDBTMobile:             selected.mahaDBTMobile || selected.phone || '',
              });
            }}
            style={{ background: themeColor, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onAutoCalculate} disabled={autoCalcing}
              style={btnStyle('#e3f2fd', '#1565C0', '#90caf9')}
            >
              {autoCalcing ? '⏳...' : '🔄 Auto-Calculate'}
            </button>
            <button onClick={onSave} disabled={saving}
              style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving...' : '💾 Save'}
            </button>
            <button onClick={() => { setEditMode(false); setEditData({}); }}
              style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {!editMode ? (
        /* ── View Mode ── */
        <div style={{ fontSize: 13 }}>
          {/* Scholarship summary rows */}
          {[
            ['Scholarship Status',   STATUS_CONFIG[selected.scholarshipStatus]?.label || '—'],
            ['Eligible Amount',      selected.scholarshipEligibleAmount > 0 ? `₹${fmt(selected.scholarshipEligibleAmount)}` : '—'],
            ['Scholarship Amount',   selected.scholarshipAmount > 0 ? `₹${fmt(selected.scholarshipAmount)}` : '—'],
            ['Received Amount',      selected.scholarshipReceivedAmount > 0 ? `₹${fmt(selected.scholarshipReceivedAmount)}` : '—'],
            ['Pending Amount',       selected.scholarshipPendingAmount > 0 ? `₹${fmt(selected.scholarshipPendingAmount)}` : '—'],
            ['Verified By',          selected.scholarshipVerifiedBy || '—'],
            ['Verified Date',        selected.scholarshipVerifiedDate ? new Date(selected.scholarshipVerifiedDate).toLocaleDateString('en-IN') : '—'],
            ['MahaDBT Username',     selected.mahaDBTUsername || '—'],
            ['MahaDBT Mobile',       selected.mahaDBTMobile || selected.phone || '—'],
            ['MahaDBT Password',     selected.mahaDBTPassword ? '••••••' : '—'],
            ['Application No.',      selected.mahaDBTAppNo || '—'],
            ['Notes',                selected.scholarshipNote || '—'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8' }}>
              <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
              <span style={{ color: '#222', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                {l === 'MahaDBT Password' && selected.mahaDBTPassword ? (
                  <>
                    {showPass[selected._id] ? selected.mahaDBTPassword : '••••••'}
                    <button
                      onClick={() => setShowPass(p => ({ ...p, [selected._id]: !p[selected._id] }))}
                      style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                    >
                      {showPass[selected._id] ? '🙈' : '👁️'}
                    </button>
                  </>
                ) : v}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* ── Edit Mode ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Scholarship Status" color={themeColor}>
            <select value={editData.scholarshipStatus} onChange={e => setEditData(p => ({ ...p, scholarshipStatus: e.target.value }))} style={fieldStyle}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FormField>

          <FormField label="MahaDBT Application No." color={themeColor}>
            <input type="text" placeholder="App number" value={editData.mahaDBTAppNo}
              onChange={e => setEditData(p => ({ ...p, mahaDBTAppNo: e.target.value }))} style={fieldStyle} />
          </FormField>

          <FormField label="MahaDBT Username" color={themeColor}>
            <input type="text" placeholder="Portal username" value={editData.mahaDBTUsername}
              onChange={e => setEditData(p => ({ ...p, mahaDBTUsername: e.target.value }))} style={fieldStyle} />
          </FormField>

          <FormField label="MahaDBT Mobile Number" color={themeColor}>
            <input type="tel" placeholder="Registered mobile number" value={editData.mahaDBTMobile}
              onChange={e => setEditData(p => ({ ...p, mahaDBTMobile: e.target.value }))} style={fieldStyle} />
          </FormField>

          <FormField label="MahaDBT Password" color={themeColor}>
            <input type="text" placeholder="Portal password" value={editData.mahaDBTPassword}
              onChange={e => setEditData(p => ({ ...p, mahaDBTPassword: e.target.value }))} style={fieldStyle} />
          </FormField>

          <FormField label="💰 Scholarship Received Amount (₹)" color={themeColor}>
            <input type="number" min="0" placeholder="Amount received so far"
              value={editData.scholarshipReceivedAmount}
              onChange={e => setEditData(p => ({ ...p, scholarshipReceivedAmount: e.target.value }))} style={fieldStyle} />
          </FormField>

          <FormField label="Notes" color={themeColor}>
            <textarea rows="2" placeholder="Any notes..." value={editData.scholarshipNote}
              onChange={e => setEditData(p => ({ ...p, scholarshipNote: e.target.value }))}
              style={{ ...fieldStyle, resize: 'vertical' }} />
          </FormField>
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   MASTER DATA TAB
═══════════════════════════════════════════════════════════ */
const MasterTab = ({
  masters, loading, form, setForm, saving, msg, editId,
  importFile, setImportFile, importing,
  onSave, onEdit, onDelete, onCancelEdit, onImport,
}) => {
  const themeColor = '#7B1FA2';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: themeColor, margin: '0 0 4px' }}>⚙️ Scholarship Master Data</h2>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>Manage category-wise MahaDBT receivable amounts</p>
        </div>
      </div>

      {msg && <MsgBanner msg={msg} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

        {/* ── Add/Edit Form ── */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 16 }}>
            <h4 style={{ color: themeColor, margin: '0 0 16px', fontSize: 14 }}>
              {editId ? '✏️ Edit Record' : '➕ Add New Record'}
            </h4>

            <FormField label="Category" color={themeColor}>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={fieldStyle}>
                <option value="">Select Category</option>
                {['SC','ST','OBC','VJ/DT(NT-A)','NT-B','NT-C','NT-D','SBC','EWS','SEBC','OPEN'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </FormField>

            <FormField label="Course Type" color={themeColor}>
              <select value={form.courseType} onChange={e => setForm(p => ({ ...p, courseType: e.target.value }))} style={fieldStyle}>
                <option value="">Select Course</option>
                {['B.Sc','B.A','B.Com','B.Ed','BCA','BBA'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </FormField>

            <FormField label="Admission Year" color={themeColor}>
              <select value={form.admissionYear} onChange={e => setForm(p => ({ ...p, admissionYear: e.target.value }))} style={fieldStyle}>
                {['FY','SY','TY'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </FormField>

            <FormField label="Academic Year" color={themeColor}>
              <input type="text" placeholder="e.g. 2025-26" value={form.academicYear}
                onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} style={fieldStyle} />
            </FormField>

            <FormField label="Scholarship Amount (₹)" color={themeColor}>
              <input type="number" min="0" placeholder="e.g. 25740" value={form.scholarshipAmount}
                onChange={e => setForm(p => ({ ...p, scholarshipAmount: e.target.value }))} style={fieldStyle} />
            </FormField>

            <FormField label="Description" color={themeColor}>
              <input type="text" placeholder="Optional note..." value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={fieldStyle} />
            </FormField>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={onSave} disabled={saving} style={{ flex: 1, padding: '10px', background: themeColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: 13 }}>
                {saving ? '⏳...' : editId ? '💾 Update' : '➕ Add'}
              </button>
              {editId && (
                <button onClick={onCancelEdit} style={{ padding: '10px 14px', background: '#eee', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Excel Import */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
            <h4 style={{ color: '#1565C0', margin: '0 0 12px', fontSize: 14 }}>📥 Import from Excel</h4>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 10px' }}>
              Excel columns: Category | CourseType | AdmissionYear | AcademicYear | ScholarshipAmount | Description
            </p>
            <input
              type="file" accept=".xlsx,.xls"
              onChange={e => setImportFile(e.target.files[0])}
              style={{ fontSize: 13, marginBottom: 10 }}
            />
            <button
              onClick={onImport} disabled={!importFile || importing}
              style={{ width: '100%', padding: '9px', background: importFile ? '#1565C0' : '#e0e7ef', color: importFile ? '#fff' : '#aaa', border: 'none', borderRadius: 8, fontWeight: 600, cursor: importFile ? 'pointer' : 'not-allowed', fontSize: 13 }}
            >
              {importing ? '⏳ Importing...' : '📥 Import'}
            </button>
          </div>
        </div>

        {/* ── Master List ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: themeColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>📋 Master Records ({masters.length})</span>
          </div>

          {loading ? <LoadingState /> : masters.length === 0 ? (
            <EmptyState icon="📋" msg="No records yet" />
          ) : (
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 1fr 1.2fr 0.8fr', padding: '9px 16px', background: '#f8f9ff', borderBottom: '2px solid #e0e7ef', gap: 8 }}>
                {['Category','Course','Year','Acad. Year','Amount',''].map(h =>
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{h}</span>
                )}
              </div>
              {masters.map((m, idx) => {
                const cc = CATEGORY_COLORS[m.category?.toLowerCase()] || CATEGORY_COLORS.other;
                return (
                  <div key={m._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 1fr 1.2fr 0.8fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: cc.bg, color: cc.color }}>{m.category}</span>
                    <span style={{ fontSize: 12, color: '#333' }}>{m.courseType}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{m.admissionYear}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>{m.academicYear}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32' }}>₹{fmt(m.scholarshipAmount)}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => onEdit(m)} style={{ fontSize: 11, padding: '3px 8px', background: '#f3e5f5', color: themeColor, border: 'none', borderRadius: 5, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => onDelete(m._id)} style={{ fontSize: 11, padding: '3px 8px', background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 5, cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   MAHADBT TAB
═══════════════════════════════════════════════════════════ */
const MahaDBTTab = ({ admissions, loading, search, setSearch, showPass, setShowPass, onRefresh, onView }) => {
  const themeColor = '#7B1FA2';
  const filtered = admissions.filter(a =>
    !search || a.applicantName?.toLowerCase().includes(search.toLowerCase()) || a.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>🌐 MahaDBT Portal Credentials</h2>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>Manage MahaDBT usernames, passwords and application numbers.</p>

      <div style={{ background: '#fff3e0', border: '1px solid #ffe082', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#7c5e00' }}>
        🔒 Confidential — do not share with unauthorized persons.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Search name or student ID..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1, ...inputStyle }} />
        <button onClick={onRefresh} style={btnStyle('#f3e5f5', themeColor, '#ce93d8')}>🔄 Refresh</button>
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon="🌐" msg="No credentials found" /> : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1.2fr 1.5fr 1.2fr 1fr 0.7fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
            {['Student','Category','Username','Mobile','Password','App No.','Status',''].map(h =>
              <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>
            )}
          </div>
          {filtered.map((adm, idx) => {
            const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
            const cc = CATEGORY_COLORS[(adm.category || 'other').toLowerCase()] || CATEGORY_COLORS.other;
            return (
              <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1.2fr 1.5fr 1.2fr 1fr 0.7fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{adm.applicantName}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.studentId || '—'}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: cc.bg, color: cc.color, padding: '2px 6px', borderRadius: 6 }}>{adm.category || '—'}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTUsername ? '#1565C0' : '#aaa' }}>{adm.mahaDBTUsername || '—'}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTMobile || adm.phone ? '#2E7D32' : '#aaa' }}>
                  {adm.mahaDBTMobile || adm.phone || '—'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTPassword ? '#555' : '#aaa' }}>
                    {adm.mahaDBTPassword ? (showPass[adm._id] ? adm.mahaDBTPassword : '••••••') : '—'}
                  </span>
                  {adm.mahaDBTPassword && (
                    <button onClick={() => setShowPass(p => ({ ...p, [adm._id]: !p[adm._id] }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                      {showPass[adm._id] ? '🙈' : '👁️'}
                    </button>
                  )}
                </div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{adm.mahaDBTAppNo || '—'}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
                <button onClick={() => onView(adm)} style={{ background: '#f3e5f5', color: themeColor, border: `1px solid #ce93d8`, borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✏️ Edit</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */
const LoadingState = () => (
  <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
);

const EmptyState = ({ icon, msg }) => (
  <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{msg}</h3></div>
);

const MsgBanner = ({ msg }) => (
  <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
    {msg}
  </div>
);

const FormField = ({ label, color, children }) => (
  <div className="form-group" style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: color || '#555', marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);

/* ── Style helpers ── */
const inputStyle = {
  padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14,
};
const fieldStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, boxSizing: 'border-box',
};
const btnStyle = (bg, color, border) => ({
  padding: '9px 14px', background: bg, color, border: `1px solid ${border}`, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer',
});
const pageBtn = (disabled) => ({
  padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: disabled ? '#ccc' : '#333', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13,
});

export default ScholarshipSectionDashboard;
