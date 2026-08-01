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
  sc:            { bg: '#e3f2fd', color: '#1565C0' },
  st:            { bg: '#e8f5e9', color: '#2E7D32' },
  obc:           { bg: '#fff3e0', color: '#E65100' },
  sbc:           { bg: '#f3e5f5', color: '#7B1FA2' },
  'nt-b':        { bg: '#fce4ec', color: '#880E4F' },
  'nt-c':        { bg: '#fce4ec', color: '#880E4F' },
  'nt-d':        { bg: '#fce4ec', color: '#880E4F' },
  'vj/dt(nt-a)': { bg: '#fce4ec', color: '#880E4F' },
  ews:           { bg: '#e0f2f1', color: '#00695C' },
  sebc:          { bg: '#fff8e1', color: '#F57F17' },
  open:          { bg: '#f5f5f5', color: '#555' },
  other:         { bg: '#f5f5f5', color: '#555' },
};

const RESERVED_CATEGORIES = ['sc','st','obc','sbc','nt-b','nt-c','nt-d','vj/dt(nt-a)','ews','sebc'];

const DOC_FIELDS = [
  { key: 'aadhar',            label: 'Aadhaar Card',         urlKey: 'aadharPhoto' },
  { key: 'casteCertificate',  label: 'Caste Certificate',    urlKey: 'casteCertificate' },
  { key: 'casteValidity',     label: 'Caste Validity',       urlKey: 'casteValidityCertificate' },
  { key: 'incomeCertificate', label: 'Income Certificate',   urlKey: 'incomeCertificate' },
  { key: 'domicile',          label: 'Domicile Certificate', urlKey: 'domicileCertificate' },
  { key: 'bankPassbook',      label: 'Bank Passbook',        urlKey: 'bankPassbook' },
];

const VERIFICATION_STATUS = {
  pending:  { label: 'Pending',  bg: '#fff3e0', color: '#E65100' },
  verified: { label: 'Verified', bg: '#e8f5e9', color: '#2E7D32' },
  rejected: { label: 'Rejected', bg: '#ffebee', color: '#C62828' },
};

// FALLBACK ONLY — used if the Accounts Section hasn't created a fee structure
// for the selected academic year yet (or the API call fails). The live,
// year-wise + category-wise amounts always come from the Accounts Section's
// fee structure via the backend (see fetchFeeStructureMap below).
const FALLBACK_FEE_STRUCTURE = {
  'B.Sc': {
    FY: {
      'Enrollment Fee': 400,
      'Admission Fee':  550,
      'Tuition Fee':    16500,
      'Gymkhana Fee':   700,
      'Laboratory Fee': 5250,
      'Library Fee':    1000,
      'Other Fee':      1740,
    },
    SY: {
      'Enrollment Fee': 0,
      'Admission Fee':  550,
      'Tuition Fee':    16500,
      'Gymkhana Fee':   700,
      'Laboratory Fee': 5250,
      'Library Fee':    1000,
      'Other Fee':      1340,
    },
    TY: {
      'Enrollment Fee': 0,
      'Admission Fee':  550,
      'Tuition Fee':    16500,
      'Gymkhana Fee':   700,
      'Laboratory Fee': 5250,
      'Library Fee':    1000,
      'Other Fee':      1340,
    },
  },
  'B.A': {
    FY: {
      'Enrollment Fee':              400,
      'Admission Fee':               550,
      'Tuition Fee':                 5500,
      'Gymkhana Fee':                700,
      'Laboratory Fee (Psy/Geog)':   300,
      'Library Fee':                 1000,
      'Other Fee':                   1540,
    },
    SY: {
      'Enrollment Fee':              0,
      'Admission Fee':               550,
      'Tuition Fee':                 5500,
      'Gymkhana Fee':                700,
      'Laboratory Fee (Psy/Geog)':   300,
      'Library Fee':                 1000,
      'Other Fee':                   1540,
    },
    TY: {
      'Enrollment Fee':              0,
      'Admission Fee':               550,
      'Tuition Fee':                 5500,
      'Gymkhana Fee':                700,
      'Laboratory Fee (Psy/Geog)':   300,
      'Library Fee':                 1000,
      'Other Fee':                   1340,
    },
  },
};

const ALL_CATEGORIES = ['SC','ST','OBC','VJ/DT(NT-A)','NT-B','NT-C','NT-D','SBC','EWS','SEBC','OPEN'];
const ACADEMIC_YEARS = ['2023-24','2024-25','2025-26','2026-27','2027-28','2028-29','2029-30'];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

/* ─────────────────────────────────────────────
   FEE STRUCTURE — sourced from Accounts Section
   The Accounts Section creates/edits the actual fee structure per
   course + academic year (semester-wise). Here we fetch that same
   data (by academicYear) and derive:
     - yearTotals      { FY, SY, TY }  → full fee (Reserved categories)
     - tuitionByYear    { FY, SY, TY }  → Tuition Fee only (OPEN category)
     - headwiseByYear   { FY:{head:amt}, SY:{...}, TY:{...} } → for display
   Course keys are normalized both ways: 'B.Sc' (UI) <-> 'B.Sc.' (backend).
───────────────────────────────────────────── */
const YEAR_SEM_IDX = { FY: [0, 1], SY: [2, 3], TY: [4, 5] };

const deriveYearTotalsLocal = (items) => {
  const totals = {};
  Object.entries(YEAR_SEM_IDX).forEach(([yr, idxs]) => {
    totals[yr] = (items || []).reduce((sum, it) => sum + (it.s?.[idxs[0]] || 0) + (it.s?.[idxs[1]] || 0), 0);
  });
  return totals;
};

const deriveTuitionByYearLocal = (items) => {
  const tuitionItems = (items || []).filter(it => /tuition\s*fee/i.test(it.name || ''));
  const totals = {};
  Object.entries(YEAR_SEM_IDX).forEach(([yr, idxs]) => {
    totals[yr] = tuitionItems.reduce((sum, it) => sum + (it.s?.[idxs[0]] || 0) + (it.s?.[idxs[1]] || 0), 0);
  });
  return totals;
};

const deriveHeadwiseByYearLocal = (items) => {
  const headwise = { FY: {}, SY: {}, TY: {} };
  Object.entries(YEAR_SEM_IDX).forEach(([yr, idxs]) => {
    (items || []).forEach(it => {
      const val = (it.s?.[idxs[0]] || 0) + (it.s?.[idxs[1]] || 0);
      if (val) headwise[yr][it.name] = (headwise[yr][it.name] || 0) + val;
    });
  });
  return headwise;
};

// Fetch ALL of the Accounts Section's fee structures in one call and group
// them by academic year. This way:
//   • the year dropdowns show EXACTLY the years Accounts has created
//     (whichever years Accounts adds will show up here to select)
//   • selecting a year shows THAT year's live amounts — no stale cache.
// Returns { years: ['2027-28','2026-27',...], byYear: { '2026-27': map, ... } }
// or null on network/server failure.
const fetchAllFeeStructureMaps = async () => {
  try {
    const res = await API.get('/fee-structure', { params: { _ts: Date.now() } });
    const docs = res.data.structures || [];
    const byYear = {};
    docs.forEach(doc => {
      if (!doc.academicYear) return;
      const entry = {
        items: doc.items || [],
        yearTotals: doc.yearTotals || deriveYearTotalsLocal(doc.items),
        tuitionByYear: doc.tuitionByYear || deriveTuitionByYearLocal(doc.items),
        headwiseByYear: doc.headwiseByYear || deriveHeadwiseByYearLocal(doc.items),
      };
      if (!byYear[doc.academicYear]) byYear[doc.academicYear] = {};
      byYear[doc.academicYear][doc.courseType] = entry;                    // 'B.Sc.' / 'B.A.'
      byYear[doc.academicYear][doc.courseType.replace(/\.$/, '')] = entry; // 'B.Sc'  / 'B.A' (matches UI select values)
    });
    // Newest year first: '2027-28' > '2026-27' > ...
    const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
    return { years, byYear };
  } catch (err) {
    console.warn('Could not load fee structures from Accounts Section:', err?.response?.data?.message || err.message);
    return null;
  }
};

// Given the fetched map + course/category info, compute the scholarship amount:
//   OPEN category            → Tuition Fee only
//   Reserved categories      → full fee structure total (Full MahaDBT benefit)
const computeScholarshipAmount = (feeMapForYear, courseType, admissionYear, isOpen) => {
  const entry = feeMapForYear?.[courseType];
  if (!entry) return '';
  const val = isOpen ? entry.tuitionByYear?.[admissionYear] : entry.yearTotals?.[admissionYear];
  return val || val === 0 ? val : '';
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab,     setActiveTab]     = useState('home');
  const [admissions,    setAdmissions]    = useState([]);
  const [dashboard,     setDashboard]     = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [msg,           setMsg]           = useState('');

  const [search,        setSearch]        = useState('');
  const [catFilter,     setCatFilter]     = useState('all');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [yearFilter,    setYearFilter]    = useState('all');
  const [academicYear,  setAcademicYear]  = useState('all');
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalCount,    setTotalCount]    = useState(0);

  const [selected,      setSelected]      = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [editData,      setEditData]      = useState({});
  const [saving,        setSaving]        = useState(false);
  const [showPass,      setShowPass]      = useState({});
  const [autoCalcing,   setAutoCalcing]   = useState(false);

  const [masters,       setMasters]       = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterForm,    setMasterForm]    = useState({
    categories: [],
    courseType: '',
    admissionYear: 'FY',
    academicYear: '2025-26',
    scholarshipAmount: '',
    description: '',
  });
  const [masterSaving,  setMasterSaving]  = useState(false);
  const [masterMsg,     setMasterMsg]     = useState('');
  const [editMasterId,  setEditMasterId]  = useState(null);

  const [exporting,     setExporting]     = useState(false);

  const LIMIT = 20;

  const flashMsg = (m, delay = 3500) => {
    setMsg(m);
    setTimeout(() => setMsg(''), delay);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (academicYear !== 'all') params.append('academicYear', academicYear);
      const res = await API.get(`/scholarships/dashboard?${params}`);
      setDashboard(res.data.dashboard);
    } catch { }
  }, [academicYear]);

  const fetchAdmissions = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (search)                params.append('search',            search);
      if (catFilter    !== 'all') params.append('category',         catFilter);
      if (statusFilter !== 'all') params.append('scholarshipStatus', statusFilter);
      if (yearFilter   !== 'all') params.append('admissionYear',    yearFilter);
      if (academicYear !== 'all') params.append('academicYear',     academicYear);

      const res = await API.get(`/scholarships/register?${params}`);
      setAdmissions(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total     || 0);
      setPage(pg);
    } catch { }
    finally { setLoading(false); }
  }, [search, catFilter, statusFilter, yearFilter, academicYear]);

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

  const handleViewStudent = useCallback(async (adm) => {
    setSelected(adm);
    setEditMode(false);
    setEditData({});
    setMsg('');
    setActiveTab('detail');
    setDetailLoading(true);

    try {
      const res = await API.get('/admissions/scholarship-section/all');
      const full = (res.data.admissions || []).find(
        a => String(a._id) === String(adm._id)
      );
      if (full) setSelected(full);
    } catch (err) {
      console.warn('Could not load full admission record:', err?.response?.data?.message || err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/scholarships/mahadbt/${selected._id}`, {
        mahaDBTUsername: editData.mahaDBTUsername,
        mahaDBTPassword: editData.mahaDBTPassword,
        mahaDBTAppNo:    editData.mahaDBTAppNo,
        mahaDBTMobile:   editData.mahaDBTMobile,
      });
      await API.put(`/scholarships/status/${selected._id}`, {
        scholarshipStatus:         editData.scholarshipStatus,
        scholarshipNote:           editData.scholarshipNote,
        category:                  editData.category,
        scholarshipReceivedAmount: editData.scholarshipReceivedAmount,
        verifiedBy:                user?.name,
      });
      flashMsg('✅ Saved successfully!');
      await handleViewStudent(selected);
      setEditMode(false);
      setEditData({});
      fetchDashboard();
    } catch (e) {
      flashMsg('❌ ' + (e.response?.data?.message || 'Save failed'));
    } finally {
      setSaving(false);
    }
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
    } catch (e) {
      flashMsg('❌ ' + (e.response?.data?.message || 'Calculation failed'));
    } finally {
      setAutoCalcing(false);
    }
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
    } catch (e) {
      flashMsg('❌ ' + (e.response?.data?.message || 'Update failed'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (catFilter    !== 'all') params.append('category',          catFilter);
      if (statusFilter !== 'all') params.append('scholarshipStatus', statusFilter);
      if (yearFilter   !== 'all') params.append('admissionYear',     yearFilter);
      if (academicYear !== 'all') params.append('academicYear',      academicYear);
      const res = await API.get(`/scholarships/register/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'scholarship_register.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      flashMsg('❌ Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleMasterSave = async () => {
    if (!masterForm.categories || masterForm.categories.length === 0) {
      setMasterMsg('❌ Please select at least one category');
      return;
    }
    setMasterSaving(true); setMasterMsg('');
    try {
      if (editMasterId) {
        await API.put(`/scholarships/master/${editMasterId}`, { ...masterForm, updatedBy: user?.name });
        setMasterMsg('✅ Updated!');
      } else {
        const promises = masterForm.categories.map(cat =>
          API.post('/scholarships/master', {
            ...masterForm,
            category: cat,
            categories: masterForm.categories,
            createdBy: user?.name,
          })
        );
        await Promise.all(promises);
        setMasterMsg(`✅ Created ${masterForm.categories.length} record(s)!`);
      }
      setMasterForm({ categories: [], courseType: '', admissionYear: 'FY', academicYear: '2025-26', scholarshipAmount: '', description: '' });
      setEditMasterId(null);
      fetchMasters();
      setTimeout(() => setMasterMsg(''), 3000);
    } catch (e) {
      setMasterMsg('❌ ' + (e.response?.data?.message || 'Failed'));
    } finally {
      setMasterSaving(false);
    }
  };

  const handleMasterDelete = async (id) => {
    if (!window.confirm('Delete this master record?')) return;
    try {
      await API.delete(`/scholarships/master/${id}`);
      fetchMasters();
    } catch { }
  };

  const db = dashboard || {};

  const tabs = [
    { id: 'home',         label: '🏠 Dashboard' },
    { id: 'students',     label: '👩‍🎓 Students',   badge: db.notFilled },
    { id: 'register',     label: '📋 Register' },
    { id: 'master',       label: '📊 MahaDBT Fees Structure' },
    { id: 'mahadbt',      label: '🌐 MahaDBT' },
    { id: 'all_students', label: '👁️ All Students' },
  ];

  return (
    <div className="dashboard-layout">
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
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => { setActiveTab(t.id); setMsg(''); }}>
              {t.label}
              {t.badge > 0 && (
                <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
      </aside>

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

          {activeTab === 'home' && (
            <HomeDashboard
              db={db} user={user}
              onRefresh={fetchDashboard}
              onGoTab={setActiveTab}
              onExport={handleExport}
              exporting={exporting}
              academicYear={academicYear}
              setAcademicYear={setAcademicYear}
            />
          )}

          {(activeTab === 'students' || activeTab === 'register') && (
            <StudentsTab
              admissions={admissions} loading={loading}
              search={search} setSearch={setSearch}
              catFilter={catFilter} setCatFilter={setCatFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              yearFilter={yearFilter} setYearFilter={setYearFilter}
              academicYear={academicYear} setAcademicYear={setAcademicYear}
              page={page} totalPages={totalPages} totalCount={totalCount}
              onPageChange={fetchAdmissions}
              onRefresh={() => fetchAdmissions(1)}
              onExport={handleExport} exporting={exporting}
              onView={handleViewStudent}
              showAmounts={activeTab === 'register'}
            />
          )}

          {activeTab === 'detail' && selected && (
            <StudentDetail
              selected={selected}
              detailLoading={detailLoading}
              editMode={editMode} setEditMode={setEditMode}
              editData={editData} setEditData={setEditData}
              saving={saving} autoCalcing={autoCalcing}
              showPass={showPass} setShowPass={setShowPass}
              msg={msg}
              onBack={() => setActiveTab('students')}
              onSave={handleSave}
              onAutoCalculate={handleAutoCalculate}
              onDocVerify={handleDocVerification}
            />
          )}

          {activeTab === 'master' && (
            <MasterTab
              masters={masters} loading={masterLoading}
              form={masterForm} setForm={setMasterForm}
              saving={masterSaving} msg={masterMsg} editId={editMasterId}
              onSave={handleMasterSave}
              onEdit={(m) => {
                setEditMasterId(m._id);
                setMasterForm({
                  categories:        m.categories || (m.category ? [m.category] : []),
                  courseType:        m.courseType,
                  admissionYear:     m.admissionYear,
                  academicYear:      m.academicYear,
                  scholarshipAmount: m.scholarshipAmount,
                  description:       m.description || '',
                });
              }}
              onDelete={handleMasterDelete}
              onCancelEdit={() => {
                setEditMasterId(null);
                setMasterForm({ categories: [], courseType: '', admissionYear: 'FY', academicYear: '2025-26', scholarshipAmount: '', description: '' });
              }}
            />
          )}

          {activeTab === 'mahadbt' && (
            <MahaDBTTab
              admissions={admissions} loading={loading}
              search={search} setSearch={setSearch}
              showPass={showPass} setShowPass={setShowPass}
              onRefresh={() => fetchAdmissions(1)}
              onView={handleViewStudent}
            />
          )}

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
   ACADEMIC YEAR FILTER (shared)
═══════════════════════════════════════════════════════════ */
const AcademicYearFilter = ({ value, onChange, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, ...style }}>
    <option value="all">All Academic Years</option>
    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
  </select>
);


/* ═══════════════════════════════════════════════════════════
   HOME DASHBOARD
═══════════════════════════════════════════════════════════ */
const HomeDashboard = ({ db, onRefresh, onGoTab, onExport, exporting, academicYear, setAcademicYear }) => {
  const cards = [
    { label: 'Total Students', value: db.totalStudents || 0, icon: '👩‍🎓', cls: 'blue' },
    { label: 'Not Filled',     value: db.notFilled     || 0, icon: '📝',  cls: 'orange' },
    { label: 'Filled',         value: db.filled        || 0, icon: '📋',  cls: 'green' },
    { label: 'Approved',       value: db.approved      || 0, icon: '✅',  cls: 'green' },
    { label: 'Rejected',       value: db.rejected      || 0, icon: '❌',  cls: 'red' },
    { label: 'Disbursed',      value: db.disbursed     || 0, icon: '💰',  cls: 'purple' },
  ];
  const amtCards = [
    { label: 'Total Eligible', value: db.totalEligibleAmount || 0, color: '#1565C0', bg: '#e3f2fd' },
    { label: 'Total Received', value: db.totalReceivedAmount || 0, color: '#2E7D32', bg: '#e8f5e9' },
    { label: 'Total Pending',  value: db.totalPendingAmount  || 0, color: '#E65100', bg: '#fff3e0' },
  ];
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ margin:0, color:'#7B1FA2', fontSize:18 }}>🏅 Scholarship Dashboard</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)}
            style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #ce93d8', fontSize:13, color:'#333', cursor:'pointer' }}>
            <option value="all">All Academic Years</option>
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={onRefresh} style={{ background:'#f3e5f5', color:'#7B1FA2', border:'1px solid #ce93d8', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>🔄 Refresh</button>
          <button onClick={onExport} disabled={exporting} style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:700 }}>
            {exporting ? '⏳...' : '📥 Export Excel'}
          </button>
        </div>
      </div>

      <div className="dash-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className={`dash-card ${c.cls}`} style={{ cursor: 'pointer' }} onClick={() => onGoTab('students')}>
            <div className="dash-card-icon">{c.icon}</div>
            <div><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: '0 0 14px', color: '#333', fontSize: 15 }}>💰 Scholarship Amounts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {amtCards.map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888', fontWeight: 600 }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.color }}>₹{fmt(c.value)}</p>
          </div>
        ))}
      </div>

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
const StudentsTab = ({ admissions, loading, search, setSearch, catFilter, setCatFilter, statusFilter, setStatusFilter, yearFilter, setYearFilter, academicYear, setAcademicYear, page, totalPages, totalCount, onPageChange, onRefresh, onExport, exporting, onView, showAmounts = false }) => {
  const themeColor = '#7B1FA2';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: themeColor, margin: '0 0 4px' }}>{showAmounts ? '📋 Scholarship Register' : '👩‍🎓 Student Scholarship Status'}</h2>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>{totalCount} students total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRefresh} style={btnStyle('#f3e5f5', themeColor, '#ce93d8')}>🔄 Refresh</button>
          <button onClick={onExport} disabled={exporting} style={btnStyle('#e8f5e9', '#2E7D32', '#a5d6a7')}>{exporting ? '⏳...' : '📥 Excel'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="text" placeholder="🔍 Search name, ID, PRN, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, ...inputStyle }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Years</option>
          {['FY','SY','TY'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <AcademicYearFilter value={academicYear} onChange={setAcademicYear} />
      </div>

      {loading ? <LoadingState /> : admissions.length === 0 ? <EmptyState icon="📭" msg="No students found" /> : (
        <>
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: showAmounts ? '2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1.2fr 0.7fr' : '2fr 1fr 1fr 1fr 1.5fr 0.8fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
              {(showAmounts ? ['Student','Category','Course','Year','Total Fees','Scholarship','Net Payable','Status','Action'] : ['Student','Category','Course/Year','Student ID','Scholarship Status','Action']).map(h => <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>)}
            </div>
            {admissions.map((adm, idx) => {
              const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
              const cc = CATEGORY_COLORS[(adm.category || 'other').toLowerCase()] || CATEGORY_COLORS.other;
              const netPayable = (adm.totalFees || 0) - (adm.scholarshipAmount || 0);
              return (
                <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: showAmounts ? '2fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 1.2fr 0.7fr' : '2fr 1fr 1fr 1fr 1.5fr 0.8fr', padding: '11px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: cc.bg, color: cc.color, textTransform: 'uppercase' }}>{adm.category || '—'}</span>
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
                      <div><p style={{ fontSize: 12, margin: 0 }}>{adm.courseType || '—'}</p><p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.admissionYear}</p></div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{adm.studentId || '—'}</span>
                    </>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <button onClick={() => onView(adm)} style={{ background: '#f3e5f5', color: themeColor, border: `1px solid #ce93d8`, borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>👁️ View</button>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
              <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={pageBtn(page === 1)}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return <button key={p} onClick={() => onPageChange(p)} style={{ ...pageBtn(false), background: p === page ? '#7B1FA2' : '#fff', color: p === page ? '#fff' : '#333', border: `1px solid ${p === page ? '#7B1FA2' : '#ddd'}` }}>{p}</button>;
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
const StudentDetail = ({ selected, detailLoading, editMode, setEditMode, editData, setEditData, saving, autoCalcing, showPass, setShowPass, msg, onBack, onSave, onAutoCalculate, onDocVerify }) => {
  const netPayable = (selected.totalFees || 0) - (selected.scholarshipAmount || 0);
  const balance    = netPayable - (selected.feesPaid || 0);
  const catKey = (selected.category || '').toLowerCase();
  const isReserved = RESERVED_CATEGORIES.includes(catKey);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={btnStyle('#f3e5f5', '#7B1FA2', '#ce93d8')}>← Back</button>
        <h2 style={{ color: '#6A1B9A', margin: 0 }}>👩‍🎓 {selected.applicantName}</h2>
        {detailLoading && <span style={{ fontSize: 12, color: '#888', background: '#f5f5f5', padding: '4px 12px', borderRadius: 20 }}>⏳ Loading documents...</span>}
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: isReserved ? '#e8f5e9' : '#fff3e0', color: isReserved ? '#2E7D32' : '#E65100', border: `1px solid ${isReserved ? '#a5d6a7' : '#ffcc80'}` }}>
          {isReserved ? '✅ Full MahaDBT Benefit' : '📐 Tuition Fee Only (OPEN)'}
        </span>
      </div>

      {msg && <MsgBanner msg={msg} />}

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Fee Flow</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ background: '#e3f2fd', borderRadius: 10, padding: '12px 16px', border: '1px solid #90caf9', minWidth: 110, textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#1565C0', fontWeight: 700 }}>TOTAL FEES</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1565C0' }}>₹{fmt(selected.totalFees)}</p>
          </div>
          <div style={{ fontSize: 18, color: '#aaa', fontWeight: 300 }}>−</div>
          <div style={{ background: '#f3e5f5', borderRadius: 10, padding: '12px 16px', border: '2px solid #ce93d8', minWidth: 110, textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#7B1FA2', fontWeight: 700 }}>SCHOLARSHIP</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#7B1FA2' }}>₹{fmt(selected.scholarshipAmount)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 9, color: '#AB47BC' }}>{isReserved ? 'Full MahaDBT' : 'Tuition Only'}</p>
          </div>
          <div style={{ fontSize: 18, color: '#aaa', fontWeight: 300 }}>=</div>
          <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 16px', border: '1px solid #ffcc80', minWidth: 110, textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#E65100', fontWeight: 700 }}>NET PAYABLE</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#E65100' }}>₹{fmt(netPayable)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 9, color: '#E65100' }}>Total − Scholarship</p>
          </div>
          <div style={{ width: 1, height: 50, background: '#e0e7ef', margin: '0 4px' }} />
          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', border: '1px solid #a5d6a7', minWidth: 110, textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#2E7D32', fontWeight: 700 }}>PAID</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>₹{fmt(selected.feesPaid)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 9, color: '#388E3C' }}>from student</p>
          </div>
          <div style={{ fontSize: 18, color: '#aaa', fontWeight: 300 }}>=</div>
          <div style={{ background: balance > 0 ? '#ffebee' : '#e8f5e9', borderRadius: 10, padding: '12px 16px', border: `1px solid ${balance > 0 ? '#ef9a9a' : '#a5d6a7'}`, minWidth: 110, textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: balance > 0 ? '#C62828' : '#2E7D32', fontWeight: 700 }}>BALANCE DUE</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: balance > 0 ? '#C62828' : '#2E7D32' }}>₹{fmt(balance)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 9, color: balance > 0 ? '#C62828' : '#2E7D32' }}>{balance > 0 ? 'pending' : '✅ cleared'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <InfoCard title="👤 Personal Details" color="#7B1FA2" rows={[
          ['Name',           selected.applicantName],
          ["Father's Name",  selected.fatherName],
          ["Mother's Name",  selected.motherName],
          ['Date of Birth',  selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString('en-IN') : null],
          ['Gender',         selected.gender],
          ['Category',       (selected.category || '').toUpperCase()],
          ['Caste',          selected.caste],
          ['Sub-Caste',      selected.subCaste],
          ['Religion',       selected.religion],
          ['Family Income',  selected.familyIncome ? `₹${selected.familyIncome}` : null],
        ]} />
        <InfoCard title="🎓 Academic Details" color="#1565C0" rows={[
          ['Student ID',    selected.studentId],
          ['PRN Number',    selected.prnNumber],
          ['ABC / APAR ID', selected.aparIdNumber],
          ['Aadhaar No.',   selected.aadharNumber],
          ['Course',        selected.courseType],
          ['Subject',       selected.preferredSubject],
          ['Year',          selected.admissionYear],
          ['Academic Year', selected.academicYear],
          ['SSC %',         selected.sscPercentage ? `${selected.sscPercentage}%` : null],
          ['HSC %',         selected.hscPercentage ? `${selected.hscPercentage}%` : null],
          ['Mobile',        selected.phone],
          ['Email',         selected.email],
        ]} />
      </div>

      <DocVerificationCard selected={selected} onVerify={onDocVerify} detailLoading={detailLoading} />

      <ScholarshipEditCard
        selected={selected}
        editMode={editMode} setEditMode={setEditMode}
        editData={editData} setEditData={setEditData}
        saving={saving} autoCalcing={autoCalcing}
        showPass={showPass} setShowPass={setShowPass}
        onSave={onSave} onAutoCalculate={onAutoCalculate}
      />
    </div>
  );
};


/* ─── Info Card ─────────────────────────────────────────── */
const InfoCard = ({ title, color, rows }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
    <h4 style={{ color, margin: '0 0 12px', fontSize: 14 }}>{title}</h4>
    {rows.map(([l, v]) => v ? (
      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
        <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
        <span style={{ color: '#222', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
      </div>
    ) : null)}
  </div>
);


/* ─── Document Verification Card ───────────────────────── */
const DocVerificationCard = ({ selected, onVerify, detailLoading }) => {
  const [remarks, setRemarks] = useState({});

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h4 style={{ color: '#2E7D32', margin: 0, fontSize: 14 }}>📂 Document Verification</h4>
        {detailLoading && <span style={{ fontSize: 11, color: '#888' }}>⏳ Loading...</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
        {DOC_FIELDS.map(({ key, label, urlKey }) => {
          const url    = selected[urlKey];
          const status = selected[`${key}VerificationStatus`] || 'pending';
          const remark = selected[`${key}VerificationRemark`] || '';
          const vcfg   = VERIFICATION_STATUS[status];

          return (
            <div key={key} style={{ background: '#fafbff', border: `1px solid ${url ? '#c8e6c9' : '#e0e7ef'}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{url ? '📄' : '❌'}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: url ? '#1a1a2e' : '#aaa' }}>{label}</p>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#1565C0', textDecoration: 'underline', fontWeight: 600 }}>
                        🔗 View Document
                      </a>
                    ) : (
                      <span style={{ fontSize: 10, color: '#aaa' }}>{detailLoading ? 'Loading...' : 'Not uploaded'}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: vcfg.bg, color: vcfg.color }}>{vcfg.label}</span>
              </div>
              {url && (
                <>
                  <input type="text" placeholder="Remark (optional)..." value={remarks[key] ?? remark} onChange={e => setRemarks(r => ({ ...r, [key]: e.target.value }))} style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e7ef', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onVerify(selected._id, key, 'verified', remarks[key] ?? remark)} style={{ flex: 1, padding: '5px 0', background: status === 'verified' ? '#2E7D32' : '#e8f5e9', color: status === 'verified' ? '#fff' : '#2E7D32', border: `1px solid #a5d6a7`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✅ Verify</button>
                    <button onClick={() => onVerify(selected._id, key, 'rejected', remarks[key] ?? remark)} style={{ flex: 1, padding: '5px 0', background: status === 'rejected' ? '#C62828' : '#ffebee', color: status === 'rejected' ? '#fff' : '#C62828', border: `1px solid #ef9a9a`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>❌ Reject</button>
                    <button onClick={() => onVerify(selected._id, key, 'pending', '')} style={{ padding: '5px 8px', background: '#f5f5f5', color: '#888', border: `1px solid #ddd`, borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>↩</button>
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
const ScholarshipEditCard = ({ selected, editMode, setEditMode, editData, setEditData, saving, autoCalcing, showPass, setShowPass, onSave, onAutoCalculate }) => {
  const themeColor = '#7B1FA2';
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ce93d8', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ color: themeColor, margin: 0, fontSize: 14 }}>🏅 Scholarship & MahaDBT</h4>
        {!editMode ? (
          <button onClick={() => { setEditMode(true); setEditData({ scholarshipStatus: selected.scholarshipStatus, scholarshipNote: selected.scholarshipNote || '', category: selected.category || '', scholarshipReceivedAmount: selected.scholarshipReceivedAmount || 0, mahaDBTUsername: selected.mahaDBTUsername || '', mahaDBTPassword: selected.mahaDBTPassword || '', mahaDBTAppNo: selected.mahaDBTAppNo || '', mahaDBTMobile: selected.mahaDBTMobile || selected.phone || '' }); }}
            style={{ background: themeColor, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onAutoCalculate} disabled={autoCalcing} style={btnStyle('#e3f2fd', '#1565C0', '#90caf9')}>{autoCalcing ? '⏳...' : '🔄 Auto-Calculate'}</button>
            <button onClick={onSave} disabled={saving} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Saving...' : '💾 Save'}</button>
            <button onClick={() => { setEditMode(false); setEditData({}); }} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>

      {!editMode ? (
        <div style={{ fontSize: 13 }}>
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
            ['Category',             selected.category || '—'],
            ['Notes',                selected.scholarshipNote || '—'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8' }}>
              <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
              <span style={{ color: '#222', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                {l === 'MahaDBT Password' && selected.mahaDBTPassword ? (
                  <>{showPass[selected._id] ? selected.mahaDBTPassword : '••••••'}<button onClick={() => setShowPass(p => ({ ...p, [selected._id]: !p[selected._id] }))} style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>{showPass[selected._id] ? '🙈' : '👁️'}</button></>
                ) : v}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Scholarship Status" color={themeColor}><select value={editData.scholarshipStatus} onChange={e => setEditData(p => ({ ...p, scholarshipStatus: e.target.value }))} style={fieldStyle}>{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></FormField>
          <FormField label="MahaDBT Application No." color={themeColor}><input type="text" placeholder="App number" value={editData.mahaDBTAppNo} onChange={e => setEditData(p => ({ ...p, mahaDBTAppNo: e.target.value }))} style={fieldStyle} /></FormField>
          <FormField label="MahaDBT Username" color={themeColor}><input type="text" placeholder="Portal username" value={editData.mahaDBTUsername} onChange={e => setEditData(p => ({ ...p, mahaDBTUsername: e.target.value }))} style={fieldStyle} /></FormField>
          <FormField label="MahaDBT Mobile Number" color={themeColor}><input type="tel" placeholder="Registered mobile number" value={editData.mahaDBTMobile} onChange={e => setEditData(p => ({ ...p, mahaDBTMobile: e.target.value }))} style={fieldStyle} /></FormField>
          <FormField label="MahaDBT Password" color={themeColor}><input type="text" placeholder="Portal password" value={editData.mahaDBTPassword} onChange={e => setEditData(p => ({ ...p, mahaDBTPassword: e.target.value }))} style={fieldStyle} /></FormField>
          <FormField label="💰 Scholarship Received Amount (₹)" color={themeColor}><input type="number" min="0" placeholder="Amount received so far" value={editData.scholarshipReceivedAmount} onChange={e => setEditData(p => ({ ...p, scholarshipReceivedAmount: e.target.value }))} style={fieldStyle} /></FormField>
          <FormField label="Category" color={themeColor}>
            <select value={editData.category} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))} style={fieldStyle}>
              <option value="">— Select Category —</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Notes" color={themeColor}><textarea rows="2" placeholder="Any notes..." value={editData.scholarshipNote} onChange={e => setEditData(p => ({ ...p, scholarshipNote: e.target.value }))} style={{ ...fieldStyle, resize: 'vertical' }} /></FormField>
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   MASTER DATA TAB
═══════════════════════════════════════════════════════════ */
const MasterTab = ({ masters, loading, form, setForm, saving, msg, editId, onSave, onEdit, onDelete, onCancelEdit }) => {
  const themeColor = '#7B1FA2';
  const [activeView, setActiveView] = useState('feeStructure');

  // All fee structures from the Accounts Section, grouped by academic year.
  const [allStructs,   setAllStructs]   = useState(null);    // { years:[], byYear:{} } | null
  const [structStatus, setStructStatus] = useState('idle');  // idle | loading | ok | empty | error
  const [feeAY,        setFeeAY]        = useState('');

  const loadAllStructures = useCallback(async () => {
    setStructStatus('loading');
    const data = await fetchAllFeeStructureMaps();
    if (data === null) { setStructStatus('error'); setAllStructs(null); return; }
    setAllStructs(data);
    setStructStatus(data.years.length ? 'ok' : 'empty');
    // Default the Fee Structure view to the newest year Accounts created.
    setFeeAY(prev => (prev && data.years.includes(prev)) ? prev : (data.years[0] || '2025-26'));
  }, []);

  useEffect(() => { loadAllStructures(); }, [loadAllStructures]);

  // Year dropdown options = jo jo year Accounts Section ne create kiye hain.
  // Agar server se kuch nahi mila (empty/error), static list fallback.
  const yearOptions = allStructs?.years?.length ? allStructs.years : ACADEMIC_YEARS;

  // Fee-structure map for a given academic year — straight from the freshly
  // fetched data (no per-year cache, so switching year is never stale).
  const getFeeMap = useCallback(
    (ay) => (allStructs?.byYear?.[ay] && Object.keys(allStructs.byYear[ay]).length ? allStructs.byYear[ay] : null),
    [allStructs]
  );

  // Recompute the auto-filled scholarship amount whenever category / course /
  // admission-year / academic-year changes — always for the CURRENTLY
  // SELECTED academic year, so switching year (e.g. 2026-27, 2027-28) pulls
  // that year's fee structure from the Accounts Section, category-wise.
  const recalcAmount = (patch) => {
    const next = { ...form, ...patch };
    const cats = next.categories || [];
    const isOpen = cats.length === 1 && cats[0] === 'OPEN';
    if (!next.courseType || !next.admissionYear || !next.academicYear || cats.length === 0) {
      setForm(next);
      return;
    }
    const map = getFeeMap(next.academicYear);
    let autoAmt = '';
    if (map) {
      autoAmt = computeScholarshipAmount(map, next.courseType, next.admissionYear, isOpen);
    } else {
      // Fallback: Accounts Section hasn't created this year's structure yet.
      const structure = FALLBACK_FEE_STRUCTURE[next.courseType]?.[next.admissionYear];
      if (structure) {
        autoAmt = isOpen
          ? structure['Tuition Fee'] || ''
          : Object.values(structure).reduce((s, v) => s + Number(v || 0), 0) || '';
      }
    }
    setForm({ ...next, scholarshipAmount: autoAmt });
  };

  const toggleCategory = (cat) => {
    const cats = form.categories || [];
    const newCats = cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat];
    recalcAmount({ categories: newCats });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: themeColor, margin: '0 0 4px' }}>📊 MahaDBT Fees Structure</h2>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>Fee-wise scholarship receivable amounts per category & course — plus editable fee structure</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setActiveView('feeStructure')} style={{ ...btnStyle(activeView === 'feeStructure' ? themeColor : '#f3e5f5', activeView === 'feeStructure' ? '#fff' : themeColor, '#ce93d8') }}>🏛️ Fee Structure</button>
          <button onClick={() => setActiveView('records')} style={{ ...btnStyle(activeView === 'records' ? themeColor : '#f3e5f5', activeView === 'records' ? '#fff' : themeColor, '#ce93d8') }}>📋 Custom Records</button>
        </div>
      </div>

      {msg && <MsgBanner msg={msg} />}

      {activeView === 'feeStructure' && (
        <FeeStructureView
          academicYear={feeAY || yearOptions[0]}
          setAcademicYear={setFeeAY}
          yearOptions={yearOptions}
          remoteMap={getFeeMap(feeAY || yearOptions[0])}
          fetchStatus={structStatus === 'ok' && !getFeeMap(feeAY || yearOptions[0]) ? 'empty' : structStatus}
          onRefresh={loadAllStructures}
          themeColor={themeColor}
        />
      )}

      {activeView === 'records' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
            <h4 style={{ color: themeColor, margin: '0 0 16px', fontSize: 14 }}>{editId ? '✏️ Edit Record' : '➕ Add New Record'}</h4>

            <FormField label="Categories (select one or more)" color={themeColor}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_CATEGORIES.map(cat => {
                  const selected = (form.categories || []).includes(cat);
                  const cc = CATEGORY_COLORS[cat.toLowerCase()] || CATEGORY_COLORS.other;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        border: `2px solid ${selected ? cc.color : '#ddd'}`,
                        background: selected ? cc.bg : '#fafafa',
                        color: selected ? cc.color : '#888',
                        fontSize: 12,
                        fontWeight: selected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {selected ? '✓ ' : ''}{cat}
                    </button>
                  );
                })}
              </div>
              {form.categories?.length > 0 && (
                <p style={{ fontSize: 11, color: '#7B1FA2', margin: '6px 0 0', fontWeight: 600 }}>
                  Selected: {form.categories.join(', ')}
                </p>
              )}
            </FormField>

            <FormField label="Course Type" color={themeColor}>
              <select value={form.courseType} onChange={e => recalcAmount({ courseType: e.target.value })} style={fieldStyle}>
                <option value="">Select Course</option>
                {['B.Sc','B.A'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Admission Year" color={themeColor}>
              <select value={form.admissionYear} onChange={e => recalcAmount({ admissionYear: e.target.value })} style={fieldStyle}>
                {['FY','SY','TY'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </FormField>

            <FormField label="Academic Year" color={themeColor}>
              <select value={form.academicYear} onChange={e => recalcAmount({ academicYear: e.target.value })} style={fieldStyle}>
                {!yearOptions.includes(form.academicYear) && form.academicYear && (
                  <option value={form.academicYear}>{form.academicYear}</option>
                )}
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>
                {structStatus === 'loading'
                  ? '⏳ Loading fee structures...'
                  : getFeeMap(form.academicYear)
                    ? `✅ ${form.academicYear}'s fee structure has been loaded live from the Accounts Section.`
                    : `⚠️ Accounts Section hasn't created a fee structure for ${form.academicYear} yet — fallback amounts are being used.`}
              </p>
            </FormField>

            {form.scholarshipAmount !== '' && form.courseType && (
              <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 10, background: (form.categories||[]).includes('OPEN') ? '#fff3e0' : '#e8f5e9', border: `1px solid ${(form.categories||[]).includes('OPEN') ? '#ffcc80' : '#a5d6a7'}` }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: (form.categories||[]).includes('OPEN') ? '#E65100' : '#2E7D32' }}>
                  {(form.categories||[]).includes('OPEN') ? '📐 OPEN: Tuition Fee only' : '✅ Reserved: Full MahaDBT benefit'}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 800, color: (form.categories||[]).includes('OPEN') ? '#E65100' : '#2E7D32' }}>
                  ₹{Number(form.scholarshipAmount).toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <FormField label="Scholarship Amount (₹)" color={themeColor}>
              <input type="number" min="0" placeholder="Auto-filled from fee structure" value={form.scholarshipAmount} onChange={e => setForm(p => ({ ...p, scholarshipAmount: e.target.value }))} style={{ ...fieldStyle, background: form.scholarshipAmount ? '#f0fff4' : '#fff' }} />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>Auto-filled when you select Category + Course + Year. You can edit manually if needed.</p>
            </FormField>

            <FormField label="Description" color={themeColor}>
              <input type="text" placeholder="Optional note..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={fieldStyle} />
            </FormField>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={onSave} disabled={saving} style={{ flex: 1, padding: '10px', background: themeColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: 13 }}>
                {saving ? '⏳...' : editId ? '💾 Update' : `➕ Add (${form.categories?.length || 0} categories)`}
              </button>
              {editId && <button onClick={onCancelEdit} style={{ padding: '10px 14px', background: '#eee', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', background: themeColor }}><span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>📋 Custom Records ({masters.length})</span></div>
            {loading ? <LoadingState /> : masters.length === 0 ? <EmptyState icon="📋" msg="No records yet" /> : (
              <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 1fr 1.2fr 0.8fr', padding: '9px 16px', background: '#f8f9ff', borderBottom: '2px solid #e0e7ef', gap: 8 }}>
                  {['Category','Course','Year','Acad. Year','Amount',''].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{h}</span>)}
                </div>
                {masters.map((m, idx) => {
                  const catDisplay = m.categories?.length > 1 ? `${m.categories[0]} +${m.categories.length - 1}` : (m.category || m.categories?.[0] || '—');
                  const cc = CATEGORY_COLORS[(m.category || m.categories?.[0] || 'other').toLowerCase()] || CATEGORY_COLORS.other;
                  return (
                    <div key={m._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 1fr 1.2fr 0.8fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                      <span title={m.categories?.join(', ')} style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: cc.bg, color: cc.color, cursor: 'help' }}>{catDisplay}</span>
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
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   FEE STRUCTURE VIEW — live, year-wise, from Accounts Section
═══════════════════════════════════════════════════════════ */
const FeeStructureView = ({ academicYear, setAcademicYear, yearOptions, remoteMap, fetchStatus, onRefresh, themeColor }) => {
  const COURSES = ['B.Sc', 'B.A'];
  const YEARS   = ['FY', 'SY', 'TY'];

  const [activeCourse, setActiveCourse] = useState('B.Sc');

  // ── Fee item editor (add / edit / delete a raw fee item) ──────────────
  // These go through the SAME Principal → Admin approval pipeline as the
  // Accounts Section — nothing here is ever applied directly.
  const [editingId, setEditingId]   = useState(null);
  const [editAmounts, setEditAmounts] = useState(['', '', '', '', '', '']);
  const [addingNew, setAddingNew]   = useState(false);
  const [newForm, setNewForm]       = useState({ selected: {}, amounts: {}, customOn: false, customName: '', customAmounts: ['', '', '', '', '', ''] });
  const [busy, setBusy]             = useState(false);
  const [editorMsg, setEditorMsg]   = useState('');
  const semLabels = ['Sem I', 'Sem II', 'Sem III', 'Sem IV', 'Sem V', 'Sem VI'];
  const courseKeyDot = `${activeCourse}.`;

  const flashEditorMsg = (m) => { setEditorMsg(m); setTimeout(() => setEditorMsg(''), 5000); };

  const submitItemChange = async ({ itemId, itemName, itemSection, oldAmounts, newAmounts, isNewItem, isDeletion }) => {
    setBusy(true);
    try {
      await API.post('/fee-structure-approvals/submit', {
        courseKey: courseKeyDot,
        itemId, itemName,
        itemSection: itemSection || 'College',
        academicYear,
        oldAmounts, newAmounts,
        isNewItem: !!isNewItem,
        isDeletion: !!isDeletion,
      });
      flashEditorMsg(isDeletion
        ? '🗑️ Delete request sent for Principal → Admin approval!'
        : '✅ Submitted — sent to Principal for approval! It will reflect here once fully approved.');
      setEditingId(null);
      setAddingNew(false);
      setNewForm({ selected: {}, amounts: {}, customOn: false, customName: '', customAmounts: ['', '', '', '', '', ''] });
    } catch (e) {
      flashEditorMsg('❌ ' + (e.response?.data?.message || 'Failed to submit for approval'));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => { setEditingId(item.id); setEditAmounts((item.s || [0,0,0,0,0,0]).map(v => String(v ?? 0))); };
  const saveEdit = (item) => submitItemChange({
    itemId: item.id, itemName: item.name, itemSection: item.section,
    oldAmounts: item.s || [], newAmounts: editAmounts.map(v => Number(v) || 0),
    isNewItem: false, isDeletion: false,
  });
  const deleteItem = (item) => {
    if (!window.confirm(`Send a request to delete "${item.name}" for ${academicYear}? This needs Principal → Admin approval.`)) return;
    submitItemChange({ itemId: item.id, itemName: item.name, itemSection: item.section, oldAmounts: item.s || [], newAmounts: item.s || [], isNewItem: false, isDeletion: true });
  };
  const toggleHeadSelect = (name) => {
    setNewForm(f => {
      const selected = { ...f.selected, [name]: !f.selected[name] };
      const amounts = { ...f.amounts };
      if (selected[name] && !amounts[name]) amounts[name] = ['', '', '', '', '', ''];
      return { ...f, selected, amounts };
    });
  };
  const setHeadAmount = (name, i, val) => {
    setNewForm(f => {
      const arr = [...(f.amounts[name] || ['', '', '', '', '', ''])];
      arr[i] = val;
      return { ...f, amounts: { ...f.amounts, [name]: arr } };
    });
  };
  const addSelectedHeads = async () => {
    const picks = Object.keys(newForm.selected).filter(n => newForm.selected[n]);
    if (newForm.customOn && newForm.customName.trim()) picks.push(newForm.customName.trim());
    if (picks.length === 0) { flashEditorMsg('❌ Select at least one fee head (or add a custom one)'); return; }
    setBusy(true);
    try {
      for (const name of picks) {
        const amounts = name === newForm.customName.trim() && newForm.customOn && !newForm.amounts[name]
          ? newForm.customAmounts
          : (newForm.amounts[name] || ['', '', '', '', '', '']);
        await API.post('/fee-structure-approvals/submit', {
          courseKey: courseKeyDot,
          itemId: 'schol_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          itemName: name,
          itemSection: 'College',
          academicYear,
          oldAmounts: [],
          newAmounts: amounts.map(v => Number(v) || 0),
          isNewItem: true,
          isDeletion: false,
        });
      }
      flashEditorMsg(`✅ ${picks.length} fee head${picks.length > 1 ? 's' : ''} submitted — sent to Principal for approval!`);
      setAddingNew(false);
      setNewForm({ selected: {}, amounts: {}, customOn: false, customName: '', customAmounts: ['', '', '', '', '', ''] });
    } catch (e) {
      flashEditorMsg('❌ ' + (e.response?.data?.message || 'Failed to submit for approval'));
    } finally {
      setBusy(false);
    }
  };

  // Fall back to the static reference structure only if Accounts Section
  // hasn't created this academic year's structure yet.
  const entry = remoteMap?.[activeCourse];
  const fallbackYearData = FALLBACK_FEE_STRUCTURE[activeCourse] || {};
  const rawHeadwise = entry?.headwiseByYear || {
    FY: fallbackYearData.FY || {}, SY: fallbackYearData.SY || {}, TY: fallbackYearData.TY || {},
  };
  const yearTotals     = entry?.yearTotals || {
    FY: Object.values(fallbackYearData.FY || {}).reduce((s, v) => s + Number(v || 0), 0),
    SY: Object.values(fallbackYearData.SY || {}).reduce((s, v) => s + Number(v || 0), 0),
    TY: Object.values(fallbackYearData.TY || {}).reduce((s, v) => s + Number(v || 0), 0),
  };
  const tuitionByYear  = entry?.tuitionByYear || {
    FY: fallbackYearData.FY?.['Tuition Fee'] || 0,
    SY: fallbackYearData.SY?.['Tuition Fee'] || 0,
    TY: fallbackYearData.TY?.['Tuition Fee'] || 0,
  };

  // ── Fixed display heads ──────────────────────────────────────────────
  // The Scholarship view ALWAYS shows these same 7 fee heads (as before).
  // Sirf amounts selected academic year ke Accounts fee structure ke items
  // are aggregated — every other item gets folded into "Other Fee",
  // taaki total bilkul Accounts structure ke total se match kare.
  const DISPLAY_HEADS = ['Enrollment Fee', 'Admission Fee', 'Tuition Fee', 'Gymkhana Fee', 'Laboratory Fee', 'Library Fee', 'Other Fee'];
  const matchHead = (name) => {
    const n = String(name || '').trim();
    if (/^enrollment\s*fee/i.test(n))          return 'Enrollment Fee';
    if (/^admission\s*fee/i.test(n))           return 'Admission Fee';
    if (/tuition\s*fee/i.test(n))              return 'Tuition Fee';
    if (/gymkhana/i.test(n))                   return 'Gymkhana Fee';
    if (/^laboratory\s*fee/i.test(n))          return 'Laboratory Fee';
    if (/^library\s*fee$/i.test(n))            return 'Library Fee';
    return null; // sab kuch aur → 'Other Fee'
  };
  const groupHeads = (raw, total) => {
    const out = { 'Enrollment Fee': 0, 'Admission Fee': 0, 'Tuition Fee': 0, 'Gymkhana Fee': 0, 'Laboratory Fee': 0, 'Library Fee': 0, 'Other Fee': 0 };
    let named = 0;
    Object.entries(raw || {}).forEach(([name, amt]) => {
      const head = matchHead(name);
      if (head) { out[head] += Number(amt) || 0; named += Number(amt) || 0; }
    });
    out['Other Fee'] = Math.max(0, (Number(total) || 0) - named);
    return out;
  };
  const headwiseByYear = {
    FY: groupHeads(rawHeadwise.FY, yearTotals.FY),
    SY: groupHeads(rawHeadwise.SY, yearTotals.SY),
    TY: groupHeads(rawHeadwise.TY, yearTotals.TY),
  };
  const allHeads = DISPLAY_HEADS;

  // Map a display head back to its underlying raw fee item(s) so it can be
  // edited/deleted right from this table. "Other Fee" is a catch-all of
  // whatever doesn't match a named head, so it can list several items.
  const findItemsForHead = (headName) => {
    const items = entry?.items || [];
    if (headName === 'Other Fee') return items.filter(it => !matchHead(it.name));
    return items.filter(it => matchHead(it.name) === headName);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 0, background: '#f0f4f8', borderRadius: 10, padding: 4 }}>
          {COURSES.map(c => (
            <button key={c} onClick={() => setActiveCourse(c)}
              style={{ padding: '8px 28px', borderRadius: 8, border: 'none',
                background: activeCourse === c ? themeColor : 'transparent',
                color: activeCourse === c ? '#fff' : '#555',
                fontWeight: activeCourse === c ? 700 : 500,
                fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ ...inputStyle, minWidth: 130 }}>
            {(yearOptions || ACADEMIC_YEARS).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={onRefresh} style={{ ...btnStyle('#f3e5f5', themeColor, '#ce93d8'), fontWeight: 700 }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {fetchStatus === 'loading' && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f5f5f5', color: '#666', fontSize: 13, marginBottom: 14 }}>
          ⏳ Loading {academicYear} fee structure...
        </div>
      )}
      {fetchStatus === 'empty' && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fff3e0', border: '1px solid #ffcc80', color: '#E65100', fontSize: 13, marginBottom: 14 }}>
          ⚠️ Accounts Section hasn't created a fee structure for <strong>{academicYear}</strong> yet.
          Fallback (2025-26 reference) amounts are shown below — this will update automatically as soon as Accounts Section creates this year.
        </div>
      )}
      {fetchStatus === 'error' && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ffebee', border: '1px solid #ef9a9a', color: '#C62828', fontSize: 13, marginBottom: 14 }}>
          ❌ Could not load the fee structure from the server. Try "🔄 Refresh".
        </div>
      )}
      {fetchStatus === 'ok' && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2E7D32', fontSize: 13, marginBottom: 14 }}>
          ✅ <strong>{academicYear}</strong>'s fee structure has been loaded live from the Accounts Section.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#1565C0' }}>
            🎓 Reserved (SC / ST / OBC / SBC / NT-B / NT-C / NT-D / VJ-DT / EWS / SEBC)
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#1565C0' }}>
            <strong>Full MahaDBT benefit</strong> — scholarship covers all fee components. Student pays ₹0 from pocket.
          </p>
        </div>
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#E65100' }}>📐 OPEN Category</p>
          <p style={{ margin: 0, fontSize: 12, color: '#E65100' }}>
            Scholarship = <strong>Tuition Fee only</strong>. Remaining fees are paid by student.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.9fr', background: themeColor, padding: '13px 20px', gap: 8 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Fee Head</span>
          {YEARS.map(y => (
            <span key={y} style={{ color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
              {y === 'FY' ? 'First Year' : y === 'SY' ? 'Second Year' : 'Third Year'}
            </span>
          ))}
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'right' }}>Actions</span>
        </div>

        {/* Fee rows */}
        {allHeads.map((head, idx) => {
          const isTuition = /tuition\s*fee/i.test(head);
          const hasAnyValue = YEARS.some(y => Number(headwiseByYear[y]?.[head] || 0) > 0);
          const matchedItems = findItemsForHead(head);
          const singleItem = matchedItems.length === 1 ? matchedItems[0] : null;
          const isEditingThis = singleItem && editingId === singleItem.id;
          if (!hasAnyValue && !singleItem) return null;

          return (
            <div key={head} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 0.9fr',
              padding: '11px 20px',
              gap: 8,
              alignItems: 'center',
              borderBottom: '1px solid #f0f4f8',
              background: isTuition ? '#fdf3ff' : idx % 2 === 0 ? '#fafbff' : '#fff',
            }}>
              {/* Fee head label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: isTuition ? 700 : 500, color: isTuition ? '#7B1FA2' : '#333' }}>
                  {head}{isTuition ? ' (OPEN category applies here)' : ''}
                </span>
              </div>

              {/* Value per year — 2 semester inputs per year when editing this row's item */}
              {YEARS.map((y, yi) => {
                const val = headwiseByYear[y]?.[head] ?? 0;
                if (isEditingThis) {
                  const [s1, s2] = [yi * 2, yi * 2 + 1];
                  return (
                    <div key={y} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <input type="number" min="0" value={editAmounts[s1]} title={semLabels[s1]}
                        onChange={e => setEditAmounts(a => { const n = [...a]; n[s1] = e.target.value; return n; })}
                        style={{ ...inputStyle, width: 54, padding: '4px 5px', fontSize: 11 }} />
                      <input type="number" min="0" value={editAmounts[s2]} title={semLabels[s2]}
                        onChange={e => setEditAmounts(a => { const n = [...a]; n[s2] = e.target.value; return n; })}
                        style={{ ...inputStyle, width: 54, padding: '4px 5px', fontSize: 11 }} />
                    </div>
                  );
                }
                return (
                  <div key={y} style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: val ? 600 : 400,
                      color: val ? (isTuition ? '#7B1FA2' : '#444') : '#ccc' }}>
                      {val ? `₹${fmt(val)}` : '—'}
                    </span>
                  </div>
                );
              })}

              {/* Direct edit / delete for this head */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {singleItem ? (
                  isEditingThis ? (
                    <>
                      <button onClick={() => saveEdit(singleItem)} disabled={busy} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 9px', fontSize: 11, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>✖</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(singleItem)} title="Edit this fee" style={{ background: '#e3f2fd', color: '#1565C0', border: 'none', borderRadius: 6, padding: '5px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deleteItem(singleItem)} disabled={busy} title="Delete this fee" style={{ background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 6, padding: '5px 9px', fontSize: 11, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>🗑️</button>
                    </>
                  )
                ) : null}
              </div>
            </div>
          );
        })}

        {/* OPEN (Tuition Fee only) row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.9fr',
          padding: '13px 20px', gap: 8, background: '#fff3e0', borderTop: `2px solid #ffcc8044` }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#E65100' }}>Total — OPEN Category</span>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#E65100' }}>Tuition Fee only</p>
          </div>
          {YEARS.map(y => (
            <span key={y} style={{ fontSize: 15, fontWeight: 800, color: '#E65100', textAlign: 'center' }}>
              ₹{fmt(tuitionByYear[y])}
            </span>
          ))}
          <span />
        </div>

        {/* Reserved Total row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.9fr',
          padding: '13px 20px', gap: 8, background: '#f3e5f5', borderTop: `2px solid ${themeColor}44` }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: themeColor }}>Total — Reserved Categories</span>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9C27B0' }}>Full MahaDBT benefit</p>
          </div>
          {YEARS.map(y => (
            <span key={y} style={{ fontSize: 15, fontWeight: 800, color: themeColor, textAlign: 'center' }}>
              ₹{fmt(yearTotals[y])}
            </span>
          ))}
          <span />
        </div>

        {/* ➕ Add Fee Head — directly here, right below the fee heads */}
        <div style={{ padding: '14px 20px', background: '#fafbff', borderTop: '1px solid #eee' }}>
          {editorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600,
              background: editorMsg.startsWith('❌') ? '#ffebee' : '#e8f5e9',
              color: editorMsg.startsWith('❌') ? '#C62828' : '#2E7D32' }}>
              {editorMsg}
            </div>
          )}
          {!addingNew ? (
            <button onClick={() => setAddingNew(true)} disabled={fetchStatus !== 'ok'}
              title={fetchStatus !== 'ok' ? "Available once Accounts Section has created this year's structure" : ''}
              style={{ ...btnStyle(themeColor, '#fff', themeColor), fontWeight: 700, opacity: fetchStatus !== 'ok' ? 0.5 : 1, cursor: fetchStatus !== 'ok' ? 'not-allowed' : 'pointer' }}>
              ➕ Add Fee Head
            </button>
          ) : (
            <div>
              {(() => {
                const otherCourseKey = activeCourse === 'B.Sc' ? 'B.A' : 'B.Sc';
                const COMMON_SUGGESTED_HEADS = ['Sports Fee', 'Exam Fee', 'Uniform Fee', 'Hostel Fee', 'Identity Card Fee', 'Magazine Fee', 'Insurance Fee', 'Development Fee', 'Computer Fee', 'Internet Fee'];
                const existingNames = new Set((entry?.items || []).map(it => it.name));
                const otherCourseNames = (remoteMap?.[otherCourseKey]?.items || []).map(it => it.name);
                const candidateNames = Array.from(new Set([...otherCourseNames, ...COMMON_SUGGESTED_HEADS]))
                  .filter(n => !existingNames.has(n));

                return (
                  <>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 10px' }}>
                      Select the fee head(s) to add — just like the fee-collection checklist:
                    </p>
                    <div style={{ border: '1px solid #e0e7ef', borderRadius: 10, overflow: 'hidden', maxHeight: 320, overflowY: 'auto', marginBottom: 14 }}>
                      {candidateNames.length === 0 && !newForm.customOn && (
                        <div style={{ padding: 14, fontSize: 13, color: '#999', textAlign: 'center' }}>No ready-made suggestions left — use "Custom Fee Head" below.</div>
                      )}
                      {candidateNames.map((name, idx) => {
                        const isSel = !!newForm.selected[name];
                        return (
                          <div key={name}>
                            <div onClick={() => toggleHeadSelect(name)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px',
                                borderBottom: '1px solid #f0f4f8', cursor: 'pointer', userSelect: 'none',
                                background: isSel ? '#e8f4ff' : idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" checked={isSel} readOnly style={{ width: 15, height: 15, cursor: 'pointer' }} />
                                <span style={{ fontSize: 13, color: '#333' }}>{name}</span>
                              </div>
                            </div>
                            {isSel && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, padding: '8px 14px 12px', background: '#f5faff' }}
                                onClick={e => e.stopPropagation()}>
                                {semLabels.map((lbl, i) => (
                                  <div key={lbl}>
                                    <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>{lbl}</label>
                                    <input type="number" min="0" value={newForm.amounts[name]?.[i] ?? ''}
                                      onChange={e => setHeadAmount(name, i, e.target.value)}
                                      style={{ ...inputStyle, width: '100%', padding: '4px 5px', fontSize: 11 }} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Custom fee head — not in the suggested list */}
                      <div onClick={() => setNewForm(f => ({ ...f, customOn: !f.customOn }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: '2px solid #eee',
                          cursor: 'pointer', userSelect: 'none', background: newForm.customOn ? '#fff3e0' : '#fafbff' }}>
                        <input type="checkbox" checked={newForm.customOn} readOnly style={{ width: 15, height: 15, cursor: 'pointer' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#E65100' }}>➕ Custom Fee Head (not listed above)</span>
                      </div>
                      {newForm.customOn && (
                        <div style={{ padding: '10px 14px 14px', background: '#fff8ef' }} onClick={e => e.stopPropagation()}>
                          <input type="text" placeholder="e.g. Lab Kit Fee" value={newForm.customName}
                            onChange={e => setNewForm(f => ({ ...f, customName: e.target.value }))}
                            style={{ ...inputStyle, width: '100%', maxWidth: 320, marginBottom: 8 }} />
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                            {semLabels.map((lbl, i) => (
                              <div key={lbl}>
                                <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>{lbl}</label>
                                <input type="number" min="0" value={newForm.customAmounts[i]}
                                  onChange={e => setNewForm(f => { const a = [...f.customAmounts]; a[i] = e.target.value; return { ...f, customAmounts: a }; })}
                                  style={{ ...inputStyle, width: '100%', padding: '4px 5px', fontSize: 11 }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addSelectedHeads} disabled={busy} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                  {busy ? '⏳ Submitting...' : '✅ Submit for Approval'}
                </button>
                <button onClick={() => { setAddingNew(false); setNewForm({ selected: {}, amounts: {}, customOn: false, customName: '', customAmounts: ['', '', '', '', '', ''] }); }}
                  style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#888', margin: '10px 0 0' }}>
                Goes to <strong>Principal → Admin</strong> for approval before it applies anywhere.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick summary cards per year */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {YEARS.map(y => {
          const yearLabel = y === 'FY' ? 'First Year' : y === 'SY' ? 'Second Year' : 'Third Year';
          return (
            <div key={y} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: themeColor, borderBottom: `2px solid ${themeColor}22`, paddingBottom: 6 }}>
                {activeCourse} — {yearLabel} ({academicYear})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>Total Fees</span>
                  <span style={{ fontWeight: 700, color: '#333' }}>₹{fmt(yearTotals[y])}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1565C0' }}>Reserved Scholarship</span>
                  <span style={{ fontWeight: 700, color: '#1565C0' }}>₹{fmt(yearTotals[y])}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#E65100' }}>OPEN Scholarship</span>
                  <span style={{ fontWeight: 700, color: '#E65100' }}>₹{fmt(tuitionByYear[y])}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 14, fontSize: 11, color: '#999' }}>
        ✏️ Fee structure is created/edited from the <strong>Accounts Section → Fee Structure</strong> tab, or right here using the "➕ Add Fee Head" option above.
        This view only reads it — select a different academic year above to see that year's amounts here
        and have them auto-applied (category-wise) in the "Custom Records" form.
      </p>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   MAHADBT TAB
═══════════════════════════════════════════════════════════ */
const MahaDBTTab = ({ admissions, loading, search, setSearch, showPass, setShowPass, onRefresh, onView }) => {
  const themeColor = '#7B1FA2';
  const filtered = admissions.filter(a => !search || a.applicantName?.toLowerCase().includes(search.toLowerCase()) || a.studentId?.toLowerCase().includes(search.toLowerCase()));

  const totalEligible  = admissions.reduce((s, a) => s + (a.scholarshipEligibleAmount || 0), 0);
  const totalReceived  = admissions.reduce((s, a) => s + (a.scholarshipReceivedAmount  || 0), 0);
  const totalPending   = admissions.reduce((s, a) => s + (a.scholarshipPendingAmount   || 0), 0);
  const approvedCount  = admissions.filter(a => a.scholarshipStatus === 'approved' || a.scholarshipStatus === 'disbursed').length;
  const disbursedCount = admissions.filter(a => a.scholarshipStatus === 'disbursed').length;

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>🌐 MahaDBT Portal Credentials</h2>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>Manage MahaDBT usernames, passwords and application numbers.</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:16 }}>
        <div style={{ background:'#f3e5f5', border:'1px solid #ce93d8', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#7B1FA2' }}>TOTAL ELIGIBLE</p>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#7B1FA2' }}>₹{fmt(totalEligible)}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#9C27B0' }}>College la milnar</p>
        </div>
        <div style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#2E7D32' }}>RECEIVED ✅</p>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#2E7D32' }}>₹{fmt(totalReceived)}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#388E3C' }}>Milale</p>
        </div>
        <div style={{ background:'#fff3e0', border:'1px solid #ffcc80', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#E65100' }}>PENDING ⏳</p>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#E65100' }}>₹{fmt(totalPending)}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#EF6C00' }}>Yayla hava</p>
        </div>
        <div style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#1565C0' }}>APPROVED</p>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#1565C0' }}>{approvedCount}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#1565C0' }}>{disbursedCount} disbursed</p>
        </div>
      </div>

      <div style={{ background: '#fff3e0', border: '1px solid #ffe082', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#7c5e00' }}>🔒 Confidential — do not share with unauthorized persons.</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Search name or student ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, ...inputStyle }} />
        <button onClick={onRefresh} style={btnStyle('#f3e5f5', themeColor, '#ce93d8')}>🔄 Refresh</button>
      </div>
      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon="🌐" msg="No credentials found" /> : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1.2fr 1.5fr 1.2fr 1fr 0.7fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
            {['Student','Category','Username','Mobile','Password','App No.','Status',''].map(h => <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</span>)}
          </div>
          {filtered.map((adm, idx) => {
            const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
            const cc = CATEGORY_COLORS[(adm.category || 'other').toLowerCase()] || CATEGORY_COLORS.other;
            return (
              <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1.2fr 1.5fr 1.2fr 1fr 0.7fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                <div><p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{adm.applicantName}</p><p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.studentId || '—'}</p></div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: cc.bg, color: cc.color, padding: '2px 6px', borderRadius: 6 }}>{adm.category || '—'}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTUsername ? '#1565C0' : '#aaa' }}>{adm.mahaDBTUsername || '—'}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTMobile || adm.phone ? '#2E7D32' : '#aaa' }}>{adm.mahaDBTMobile || adm.phone || '—'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTPassword ? '#555' : '#aaa' }}>{adm.mahaDBTPassword ? (showPass[adm._id] ? adm.mahaDBTPassword : '••••••') : '—'}</span>
                  {adm.mahaDBTPassword && <button onClick={() => setShowPass(p => ({ ...p, [adm._id]: !p[adm._id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}>{showPass[adm._id] ? '🙈' : '👁️'}</button>}
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
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════ */
const LoadingState = () => <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>;
const EmptyState = ({ icon, msg }) => <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{msg}</h3></div>;
const MsgBanner = ({ msg }) => <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>;
const FormField = ({ label, color, children }) => <div className="form-group" style={{ marginBottom: 12 }}><label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: color || '#555', marginBottom: 5 }}>{label}</label>{children}</div>;

/* ── Style helpers ── */
const inputStyle = { padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 };
const fieldStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, boxSizing: 'border-box' };
const btnStyle = (bg, color, border) => ({ padding: '9px 14px', background: bg, color, border: `1px solid ${border}`, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' });
const pageBtn = (disabled) => ({ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: disabled ? '#ccc' : '#333', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13 });

export default ScholarshipSectionDashboard;
