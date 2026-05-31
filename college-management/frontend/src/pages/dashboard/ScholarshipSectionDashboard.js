import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const STATUS_CONFIG = {
  not_filled: { label: '📝 Not Filled',  bg: '#fff3e0', color: '#E65100' },
  filled:     { label: '📋 Form Filled', bg: '#e3f2fd', color: '#1565C0' },
  approved:   { label: '✅ Approved',    bg: '#e8f5e9', color: '#2E7D32' },
  rejected:   { label: '❌ Rejected',    bg: '#ffebee', color: '#C62828' },
  disbursed:  { label: '💰 Disbursed',   bg: '#f3e5f5', color: '#7B1FA2' },
};

const CATEGORY_COLORS = {
  sc:    { bg: '#e3f2fd', color: '#1565C0' },
  st:    { bg: '#e8f5e9', color: '#2E7D32' },
  obc:   { bg: '#fff3e0', color: '#E65100' },
  sbc:   { bg: '#f3e5f5', color: '#7B1FA2' },
  nt:    { bg: '#fce4ec', color: '#880E4F' },
  ebc:   { bg: '#e0f2f1', color: '#00695C' },
  open:  { bg: '#f5f5f5', color: '#555' },
  other: { bg: '#f5f5f5', color: '#555' },
};

const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPass, setShowPass] = useState({});

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/scholarship-section/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-mahadbt/${selected._id}`, editData);
      setMsg('✅ MahaDBT data saved!');
      const res = await API.get('/admissions/scholarship-section/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setEditMode(false);
      setEditData({});
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const total        = admissions.length;
  const filled       = admissions.filter(a => a.scholarshipStatus !== 'not_filled').length;
  const notFilled    = admissions.filter(a => a.scholarshipStatus === 'not_filled').length;
  const disbursed    = admissions.filter(a => a.scholarshipStatus === 'disbursed').length;

  const catStats = admissions.reduce((acc, a) => {
    const c = (a.category || 'other').toLowerCase();
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const filtered = admissions.filter(a => {
    const mc = catFilter === 'all' || (a.category || 'other').toLowerCase() === catFilter;
    const ms = statusFilter === 'all' || a.scholarshipStatus === statusFilter;
    const q  = search.toLowerCase();
    const mq = !q || a.applicantName?.toLowerCase().includes(q) ||
               a.email?.toLowerCase().includes(q) ||
               a.studentId?.toLowerCase().includes(q) ||
               a.prnNumber?.toLowerCase().includes(q);
    return mc && ms && mq;
  });

  const tabs = [
    { id: 'home',      label: '🏠 Dashboard' },
    { id: 'students',  label: '👩‍🎓 Students', badge: notFilled },
    { id: 'mahadbt',   label: '🌐 MahaDBT Credentials' },
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
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
              {t.label}
              {t.badge > 0 && <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{t.badge}</span>}
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

        {msg && <div style={{ margin: '12px 24px 0', padding: '12px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

        <div className="dashboard-content">

          {/* ══ HOME ══ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#f3e5f5,#fce4ec)', padding: 20, borderRadius: 12, marginBottom: 20, borderLeft: '5px solid #7B1FA2' }}>
                <h3 style={{ color: '#6A1B9A', marginBottom: 6 }}>🏅 Welcome, {user?.name}!</h3>
                <p style={{ color: '#555' }}>Track scholarship form status, manage MahaDBT credentials, and view student data by category.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue"><div className="dash-card-icon">👩‍🎓</div><div><h3>{total}</h3><p>Total Students</p></div></div>
                <div className="dash-card orange"><div className="dash-card-icon">📝</div><div><h3>{notFilled}</h3><p>Form Not Filled</p></div></div>
                <div className="dash-card green"><div className="dash-card-icon">📋</div><div><h3>{filled}</h3><p>Form Filled</p></div></div>
                <div className="dash-card" style={{ background: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="dash-card-icon">💰</div><div><h3>{disbursed}</h3><p>Disbursed</p></div>
                </div>
              </div>

              {/* Category breakdown */}
              <h3 style={{ margin: '24px 0 14px', color: '#333' }}>📊 Students by Category</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {Object.entries(catStats).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
                  const cc = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
                  const catFilled = admissions.filter(a => (a.category||'other').toLowerCase() === cat && a.scholarshipStatus !== 'not_filled').length;
                  return (
                    <div key={cat} style={{ background: cc.bg, border: `1px solid ${cc.color}33`, borderRadius: 12, padding: '12px 18px', minWidth: 140 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cc.color, textTransform: 'uppercase', marginBottom: 4 }}>{cat}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: cc.color }}>{count}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Filled: {catFilled} / {count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Status breakdown */}
              <h3 style={{ margin: '0 0 14px', color: '#333' }}>📋 Scholarship Status Overview</h3>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg], idx) => {
                  const count = admissions.filter(a => a.scholarshipStatus === key).length;
                  const pct = total > 0 ? Math.round((count/total)*100) : 0;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: idx < 4 ? '1px solid #f0f4f8' : 'none', gap: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color, minWidth: 130 }}>{cfg.label}</span>
                      <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 10, height: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 10, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color, minWidth: 60, textAlign: 'right' }}>{count} <span style={{ fontSize: 11, color: '#aaa' }}>({pct}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ STUDENTS TAB ══ */}
          {activeTab === 'students' && (
            <div>
              <h2 style={{ color: '#6A1B9A', marginBottom: 4 }}>👩‍🎓 Student Scholarship Status</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>View all students, their category, and scholarship form status.</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name, ID, PRN or email..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Categories</option>
                  {Object.keys(catStats).sort().map(c => <option key={c} value={c}>{c.toUpperCase()} ({catStats[c]})</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button onClick={fetchAdmissions}
                  style={{ padding: '9px 16px', background: '#f3e5f5', color: '#7B1FA2', border: '1px solid #ce93d8', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ background: '#e3f2fd', color: '#1565C0', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Showing: {filtered.length}</div>
                <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Not Filled: {filtered.filter(a => a.scholarshipStatus === 'not_filled').length}</div>
              </div>

              {loading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No students found</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 0.8fr', background: '#7B1FA2', padding: '13px 16px', gap: 8 }}>
                    {['Student', 'Category', 'Course/Year', 'Student ID', 'Scholarship Status', 'Action'].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {filtered.map((adm, idx) => {
                    const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
                    const cc = CATEGORY_COLORS[(adm.category||'other').toLowerCase()] || CATEGORY_COLORS.other;
                    return (
                      <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                          <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: cc.bg, color: cc.color, textTransform: 'uppercase' }}>
                          {adm.category || '—'}
                        </span>
                        <div>
                          <p style={{ fontSize: 12, margin: 0 }}>{adm.courseType || '—'}</p>
                          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.admissionYear}</p>
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{adm.studentId || '—'}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: sc.bg, color: sc.color }}>{sc.label}</span>
                        <button onClick={() => { setSelected(adm); setEditMode(false); setEditData({}); setMsg(''); setActiveTab('detail'); }}
                          style={{ background: '#f3e5f5', color: '#7B1FA2', border: '1px solid #ce93d8', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          👁️ View
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ STUDENT DETAIL ══ */}
          {activeTab === 'detail' && selected && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button onClick={() => setActiveTab('students')}
                  style={{ background: '#f3e5f5', color: '#7B1FA2', border: '1px solid #ce93d8', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <h2 style={{ color: '#6A1B9A', margin: 0 }}>👩‍🎓 {selected.applicantName}</h2>
              </div>

              {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

              {/* Student info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Personal */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                  <h4 style={{ color: '#7B1FA2', marginBottom: 14, fontSize: 14 }}>👤 Personal Details</h4>
                  {[
                    ['Name', selected.applicantName],
                    ['Father\'s Name', selected.fatherName],
                    ['Mother\'s Name', selected.motherName],
                    ['Date of Birth', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                    ['Gender', selected.gender],
                    ['Category', (selected.category || '—').toUpperCase()],
                    ['Caste', selected.caste],
                    ['Sub-Caste', selected.subCaste],
                    ['Religion', selected.religion],
                    ['Family Income', selected.familyIncome ? `₹${selected.familyIncome}` : '—'],
                  ].map(([l, v]) => v && v !== '—' && (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                      <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
                      <span style={{ color: '#222' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Academic */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                  <h4 style={{ color: '#1565C0', marginBottom: 14, fontSize: 14 }}>🎓 Academic Details</h4>
                  {[
                    ['Student ID', selected.studentId],
                    ['PRN Number', selected.prnNumber],
                    ['ABC / APAR ID', selected.aparIdNumber],
                    ['Aadhar Number', selected.aadharNumber],
                    ['Course', selected.courseType],
                    ['Subject', selected.preferredSubject],
                    ['Year', selected.admissionYear],
                    ['SSC %', selected.sscPercentage ? `${selected.sscPercentage}%` : '—'],
                    ['HSC %', selected.hscPercentage ? `${selected.hscPercentage}%` : '—'],
                    ['Address', selected.address],
                    ['Mobile', selected.phone],
                    ['Email', selected.email],
                  ].map(([l, v]) => v && v !== '—' && (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                      <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
                      <span style={{ color: '#222', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents uploaded */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 16 }}>
                <h4 style={{ color: '#2E7D32', marginBottom: 14, fontSize: 14 }}>📂 Documents on File</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
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
                    <div key={l} style={{ background: url ? '#e8f5e9' : '#fafafa', border: `1px solid ${url ? '#a5d6a7' : '#e0e0e0'}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{url ? '✅' : '❌'}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: url ? '#2E7D32' : '#aaa', margin: 0 }}>{l}</p>
                        {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#1565C0' }}>View</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarship status */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ce93d8', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ color: '#7B1FA2', margin: 0, fontSize: 14 }}>🏅 Scholarship & MahaDBT</h4>
                  {!editMode ? (
                    <button onClick={() => { setEditMode(true); setEditData({ scholarshipStatus: selected.scholarshipStatus, scholarshipNote: selected.scholarshipNote || '', mahaDBTUsername: selected.mahaDBTUsername || '', mahaDBTPassword: selected.mahaDBTPassword || '', mahaDBTAppNo: selected.mahaDBTAppNo || '' }); }}
                      style={{ background: '#7B1FA2', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ✏️ Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleSave} disabled={saving}
                        style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? '⏳...' : '💾 Save'}
                      </button>
                      <button onClick={() => { setEditMode(false); setEditData({}); }}
                        style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                </div>

                {!editMode ? (
                  <div style={{ fontSize: 13 }}>
                    {[
                      ['Scholarship Status', STATUS_CONFIG[selected.scholarshipStatus]?.label || '—'],
                      ['MahaDBT Username', selected.mahaDBTUsername || '—'],
                      ['MahaDBT Password', selected.mahaDBTPassword ? '••••••' : '—'],
                      ['Application No.', selected.mahaDBTAppNo || '—'],
                      ['Notes', selected.scholarshipNote || '—'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8' }}>
                        <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
                        <span style={{ color: '#222' }}>{l === 'MahaDBT Password' && selected.mahaDBTPassword ? (showPass[selected._id] ? selected.mahaDBTPassword : '••••••') : v}
                          {l === 'MahaDBT Password' && selected.mahaDBTPassword && (
                            <button onClick={() => setShowPass(p => ({ ...p, [selected._id]: !p[selected._id] }))}
                              style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                              {showPass[selected._id] ? '🙈' : '👁️'}
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#7B1FA2', marginBottom: 5 }}>Scholarship Status</label>
                      <select value={editData.scholarshipStatus} onChange={e => setEditData(p => ({ ...p, scholarshipStatus: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14 }}>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#7B1FA2', marginBottom: 5 }}>MahaDBT Application No.</label>
                      <input type="text" placeholder="Application number" value={editData.mahaDBTAppNo} onChange={e => setEditData(p => ({ ...p, mahaDBTAppNo: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#7B1FA2', marginBottom: 5 }}>MahaDBT Username</label>
                      <input type="text" placeholder="Portal username" value={editData.mahaDBTUsername} onChange={e => setEditData(p => ({ ...p, mahaDBTUsername: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#7B1FA2', marginBottom: 5 }}>MahaDBT Password</label>
                      <input type="text" placeholder="Portal password" value={editData.mahaDBTPassword} onChange={e => setEditData(p => ({ ...p, mahaDBTPassword: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#7B1FA2', marginBottom: 5 }}>Notes</label>
                      <textarea rows="2" placeholder="Any notes about scholarship status..." value={editData.scholarshipNote} onChange={e => setEditData(p => ({ ...p, scholarshipNote: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ce93d8', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ MAHADBT CREDENTIALS TAB ══ */}
          {activeTab === 'mahadbt' && (
            <div>
              <h2 style={{ color: '#6A1B9A', marginBottom: 4 }}>🌐 MahaDBT Portal Credentials</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>All students' MahaDBT usernames, passwords and application numbers in one place.</p>

              <div style={{ background: '#fff3e0', border: '1px solid #ffe082', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#7c5e00' }}>
                🔒 This data is confidential. Do not share with unauthorized persons.
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input type="text" placeholder="🔍 Search by name or student ID..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <button onClick={fetchAdmissions}
                  style={{ padding: '9px 16px', background: '#f3e5f5', color: '#7B1FA2', border: '1px solid #ce93d8', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1.2fr 1fr', background: '#7B1FA2', padding: '13px 16px', gap: 8 }}>
                    {['Student', 'Category', 'MahaDBT Username', 'MahaDBT Password', 'App No.', 'Status'].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {admissions.filter(a => !search || a.applicantName?.toLowerCase().includes(search.toLowerCase()) || a.studentId?.toLowerCase().includes(search.toLowerCase())).map((adm, idx) => {
                    const sc = STATUS_CONFIG[adm.scholarshipStatus] || STATUS_CONFIG.not_filled;
                    return (
                      <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1.2fr 1fr', padding: '11px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{adm.applicantName}</p>
                          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.studentId || '—'}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: (CATEGORY_COLORS[(adm.category||'other').toLowerCase()] || CATEGORY_COLORS.other).color }}>
                          {adm.category || '—'}
                        </span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.mahaDBTUsername ? '#1565C0' : '#aaa' }}>
                          {adm.mahaDBTUsername || '—'}
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ScholarshipSectionDashboard;
