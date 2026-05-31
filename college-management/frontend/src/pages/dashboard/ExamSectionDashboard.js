import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ─── Shared read-only student viewer ─────────────────────────────────────────
const StudentViewer = ({ themeColor = '#1565C0', readOnly = true }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [selected, setSelected]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = admissions.filter(a => {
    const my = yearFilter === 'all' || a.admissionYear === yearFilter;
    const q  = search.toLowerCase();
    const mq = !q || a.applicantName?.toLowerCase().includes(q) ||
               a.studentId?.toLowerCase().includes(q) ||
               a.email?.toLowerCase().includes(q) ||
               a.prnNumber?.toLowerCase().includes(q);
    return my && mq;
  });

  const years = [...new Set(admissions.map(a => a.admissionYear).filter(Boolean))].sort();

  return (
    <div>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)}
            style={{ background: '#e3f2fd', color: themeColor, border: `1px solid ${themeColor}44`, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
            ← Back to List
          </button>
          <h3 style={{ color: themeColor, marginBottom: 16 }}>👩‍🎓 {selected.applicantName}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: '👤 Personal', fields: [
                ['Name', selected.applicantName], ['Father', selected.fatherName], ['Mother', selected.motherName],
                ['DOB', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                ['Gender', selected.gender], ['Category', (selected.category||'—').toUpperCase()],
                ['Caste', selected.caste], ['Religion', selected.religion],
                ['Mobile', selected.phone], ['Email', selected.email], ['Address', selected.address],
              ]},
              { title: '🎓 Academic', fields: [
                ['Student ID', selected.studentId], ['PRN Number', selected.prnNumber],
                ['ABC / APAR ID', selected.aparIdNumber], ['Aadhar No.', selected.aadharNumber],
                ['Course', selected.courseType], ['Subject', selected.preferredSubject],
                ['Year', selected.admissionYear], ['Admission Date', selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—'],
                ['SSC %', selected.sscPercentage ? `${selected.sscPercentage}%` : '—'],
                ['HSC %', selected.hscPercentage ? `${selected.hscPercentage}%` : '—'],
                ['Family Income', selected.familyIncome ? `₹${selected.familyIncome}` : '—'],
              ]},
            ].map(section => (
              <div key={section.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                <h4 style={{ color: themeColor, marginBottom: 14, fontSize: 14 }}>{section.title}</h4>
                {section.fields.map(([l, v]) => v && v !== '—' && (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                    <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
                    <span style={{ color: '#222', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="🔍 Search by name, ID, PRN or email..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetch}
              style={{ padding: '9px 16px', background: '#e3f2fd', color: themeColor, border: `1px solid ${themeColor}44`, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              🔄 Refresh
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#e3f2fd', color: themeColor, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Total: {admissions.length}</div>
            <div style={{ background: '#f5f5f5', color: '#555', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Showing: {filtered.length}</div>
          </div>
          {loading ? (
            <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👩‍🎓</div><h3>No students found</h3></div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1fr 0.7fr', background: themeColor, padding: '13px 16px', gap: 8 }}>
                {['Student', 'Course / Year', 'Student ID', 'PRN Number', 'Category', 'View'].map(h => (
                  <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                ))}
              </div>
              {filtered.map((adm, idx) => (
                <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1fr 0.7fr', padding: '11px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, margin: 0 }}>{adm.courseType || '—'}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{adm.admissionYear}</p>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: themeColor, fontWeight: 600 }}>{adm.studentId || '—'}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.prnNumber ? '#2E7D32' : '#E65100', fontWeight: 600 }}>{adm.prnNumber || '⚠️ Missing'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>{adm.category || '—'}</span>
                  <button onClick={() => setSelected(adm)}
                    style={{ background: '#e3f2fd', color: themeColor, border: `1px solid ${themeColor}44`, borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    👁️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Result Upload Tab ────────────────────────────────────────────────────────
const ResultUploadTab = () => {
  const [step, setStep]             = useState(1); // 1=find student, 2=enter marks
  const [emailSearch, setEmailSearch] = useState('');
  const [foundAdm, setFoundAdm]     = useState(null);
  const [searching, setSearching]   = useState(false);
  const [searchErr, setSearchErr]   = useState('');
  const [semester, setSemester]     = useState('');
  const [year, setYear]             = useState(new Date().getFullYear().toString());
  const [subjects, setSubjects]     = useState([{ name: '', maxMarks: 100, obtainedMarks: '' }]);
  const [uploading, setUploading]   = useState(false);
  const [msg, setMsg]               = useState('');

  const findStudent = async () => {
    if (!emailSearch.trim()) return;
    setSearching(true); setSearchErr(''); setFoundAdm(null);
    try {
      const res = await API.get('/admissions/staff-view/all');
      const found = (res.data.admissions || []).find(a => a.email?.toLowerCase() === emailSearch.toLowerCase().trim());
      if (!found) { setSearchErr('No approved student found with this email.'); }
      else { setFoundAdm(found); setStep(2); }
    } catch { setSearchErr('Error searching. Try again.'); }
    finally { setSearching(false); }
  };

  const addSubject = () => setSubjects(prev => [...prev, { name: '', maxMarks: 100, obtainedMarks: '' }]);
  const removeSubject = (i) => setSubjects(prev => prev.filter((_, idx) => idx !== i));
  const updateSubject = (i, field, val) => setSubjects(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const handleUpload = async () => {
    if (!semester || !year) { setMsg('❌ Select semester and year.'); return; }
    const invalid = subjects.some(s => !s.name.trim() || s.obtainedMarks === '' || isNaN(Number(s.obtainedMarks)));
    if (invalid) { setMsg('❌ Fill all subject names and marks.'); return; }
    setUploading(true);
    try {
      await API.post('/results/upload-by-email', {
        studentEmail: foundAdm.email,
        semester: Number(semester),
        year: Number(year),
        courseType: foundAdm.courseType,
        subjects: subjects.map(s => ({ name: s.name.trim(), maxMarks: Number(s.maxMarks), obtainedMarks: Number(s.obtainedMarks) })),
      });
      setMsg('✅ Result uploaded successfully!');
      setStep(1); setEmailSearch(''); setFoundAdm(null); setSemester(''); setYear(new Date().getFullYear().toString());
      setSubjects([{ name: '', maxMarks: 100, obtainedMarks: '' }]);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Upload failed')); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <h2 style={{ color: '#f57c00', marginBottom: 4 }}>📊 Upload / Update Result</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Enter student email to find them, then enter subject-wise marks.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      {/* Step 1 — find student */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20 }}>
        <h4 style={{ color: '#f57c00', marginBottom: 14 }}>Step 1 — Find Student by Email</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="email" placeholder="student@email.com" value={emailSearch} onChange={e => setEmailSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && findStudent()}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 9, border: '2px solid #f57c00', fontSize: 14, outline: 'none' }} />
          <button onClick={findStudent} disabled={searching}
            style={{ background: '#f57c00', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1 }}>
            {searching ? '⏳...' : '🔍 Find'}
          </button>
        </div>
        {searchErr && <p style={{ color: '#C62828', fontSize: 13, marginTop: 8 }}>{searchErr}</p>}
        {foundAdm && (
          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', marginTop: 12, fontSize: 13 }}>
            ✅ Found: <strong>{foundAdm.applicantName}</strong> — {foundAdm.courseType} · {foundAdm.admissionYear} · ID: {foundAdm.studentId || '—'}
          </div>
        )}
      </div>

      {/* Step 2 — enter marks */}
      {step === 2 && foundAdm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
          <h4 style={{ color: '#f57c00', marginBottom: 14 }}>Step 2 — Enter Marks</h4>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#f57c00', marginBottom: 5 }}>Semester *</label>
              <select value={semester} onChange={e => setSemester(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #f57c00', fontSize: 14 }}>
                <option value="">Select</option>
                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#f57c00', marginBottom: 5 }}>Year *</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2030"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #f57c00', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          <h4 style={{ color: '#333', marginBottom: 12, fontSize: 14 }}>📚 Subject-wise Marks</h4>
          <div style={{ background: '#f8faff', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.4fr', gap: 8, marginBottom: 8 }}>
              {['Subject Name', 'Max Marks', 'Obtained', ''].map(h => (
                <span key={h} style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>{h}</span>
              ))}
            </div>
            {subjects.map((sub, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.4fr', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input type="text" placeholder={`Subject ${i+1} name`} value={sub.name} onChange={e => updateSubject(i, 'name', e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #ddd', fontSize: 13 }} />
                <input type="number" value={sub.maxMarks} onChange={e => updateSubject(i, 'maxMarks', e.target.value)} min="1"
                  style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #ddd', fontSize: 13 }} />
                <input type="number" value={sub.obtainedMarks} onChange={e => updateSubject(i, 'obtainedMarks', e.target.value)} min="0" max={sub.maxMarks}
                  style={{ padding: '8px 10px', borderRadius: 7, border: `2px solid ${Number(sub.obtainedMarks) < sub.maxMarks * 0.35 && sub.obtainedMarks !== '' ? '#C62828' : '#ddd'}`, fontSize: 13, fontWeight: 700 }} />
                <button onClick={() => removeSubject(i)} disabled={subjects.length === 1}
                  style={{ background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: subjects.length === 1 ? 'not-allowed' : 'pointer', opacity: subjects.length === 1 ? 0.4 : 1, fontSize: 14 }}>
                  🗑️
                </button>
              </div>
            ))}
            <button onClick={addSubject}
              style={{ marginTop: 6, background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ➕ Add Subject
            </button>
          </div>

          {/* Live calculation */}
          {subjects.some(s => s.obtainedMarks !== '') && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13 }}>
              {(() => {
                const total = subjects.reduce((s, sub) => s + (Number(sub.maxMarks) || 0), 0);
                const obtained = subjects.reduce((s, sub) => s + (Number(sub.obtainedMarks) || 0), 0);
                const pct = total > 0 ? Math.round((obtained / total) * 100 * 10) / 10 : 0;
                const atkt = subjects.filter(s => s.obtainedMarks !== '' && Number(s.obtainedMarks) < Number(s.maxMarks) * 0.35);
                const status = atkt.length === subjects.length ? 'FAIL' : atkt.length > 0 ? 'ATKT' : pct >= 75 ? 'DISTINCTION' : 'PASS';
                const statusColor = { FAIL: '#C62828', ATKT: '#E65100', DISTINCTION: '#1b5e20', PASS: '#2E7D32' }[status];
                return (
                  <>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span>Total: <strong>{obtained}/{total}</strong></span>
                      <span>Percentage: <strong>{pct}%</strong></span>
                      <span style={{ fontWeight: 800, color: statusColor }}>Result: {status}</span>
                    </div>
                    {atkt.length > 0 && <div style={{ marginTop: 6, color: '#C62828', fontSize: 12 }}>ATKT/Fail: {atkt.map(s => s.name || 'Subject').join(', ')}</div>}
                  </>
                );
              })()}
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading}
            style={{ background: uploading ? '#aaa' : '#f57c00', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? '⏳ Uploading...' : '📤 Upload Result'}
          </button>
          <button onClick={() => { setStep(1); setFoundAdm(null); setMsg(''); }}
            style={{ marginLeft: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main ExamSectionDashboard ────────────────────────────────────────────────
const ExamSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'home',          label: '🏠 Dashboard' },
    { id: 'upload_result', label: '📊 Upload Result' },
    { id: 'students',      label: '👩‍🎓 View Students' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">📝</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Examination Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>📝 Examination Section</h2>
          <div className="user-info"><span>👋 {user?.name}</span></div>
        </div>
        <div className="dashboard-content">

          {activeTab === 'home' && (
            <div>
              <div style={{ background: '#fff3e0', padding: 20, borderRadius: 12, marginBottom: 20, borderLeft: '5px solid #f57c00' }}>
                <h3 style={{ color: '#f57c00', marginBottom: 6 }}>📝 Welcome, {user?.name}!</h3>
                <p style={{ color: '#555' }}>Upload student results, view enrolled students, and manage exam forms.</p>
              </div>
              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('upload_result')}>
                  <div className="dash-card-icon">📊</div><div><h3>Upload</h3><p>Results</p></div>
                </div>
                <div className="dash-card green" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('students')}>
                  <div className="dash-card-icon">👩‍🎓</div><div><h3>View</h3><p>Students</p></div>
                </div>
              </div>
              <h3 style={{ margin: '24px 0 14px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                {[
                  { label: '📊 Upload Result', sub: 'Enter subject-wise marks for students', tab: 'upload_result' },
                  { label: '👩‍🎓 View Students', sub: 'Browse all enrolled students', tab: 'students' },
                ].map((item, i) => (
                  <div key={i} className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab(item.tab)}>
                    <h4>{item.label}</h4><p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload_result' && <ResultUploadTab />}
          {activeTab === 'students'      && (
            <div>
              <h2 style={{ color: '#f57c00', marginBottom: 4 }}>👩‍🎓 View Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Read-only view of all enrolled students.</p>
              <StudentViewer themeColor="#f57c00" />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ExamSectionDashboard;
