import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

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

  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter2, setYearFilter2]   = useState('');
  const [allAdmissions, setAllAdmissions] = useState([]);
  const [showList, setShowList] = useState(false);

  const findStudent = async () => {
    if (!emailSearch.trim() && !courseFilter && !yearFilter2) return;
    setSearching(true); setSearchErr(''); setFoundAdm(null); setShowList(false);
    try {
      const res = await API.get('/admissions/staff-view/all');
      const all = res.data.admissions || [];
      if (emailSearch.trim()) {
        const found = all.find(a => a.email?.toLowerCase() === emailSearch.toLowerCase().trim());
        if (!found) { setSearchErr('No student found with this email.'); }
        else { setFoundAdm(found); setStep(2); }
      } else {
        // Filter by course + year
        const filtered = all.filter(a => {
          const mc = !courseFilter || (a.courseType||'').toLowerCase().includes(courseFilter.toLowerCase());
          const my = !yearFilter2 || a.admissionYear === yearFilter2;
          return mc && my;
        });
        if (filtered.length === 0) { setSearchErr('No students found.'); }
        else { setAllAdmissions(filtered); setShowList(true); }
      }
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
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input type="email" placeholder="Search by email..." value={emailSearch} onChange={e => { setEmailSearch(e.target.value); if(e.target.value) { setCourseFilter(''); setYearFilter2(''); } }}
            onKeyDown={e => e.key === 'Enter' && findStudent()}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 9, border: '2px solid #f57c00', fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>OR filter by:</span>
          <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setEmailSearch(''); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="">All Courses</option>
            <option value="B.A.">B.A.</option>
            <option value="B.Sc.">B.Sc.</option>
          </select>
          <select value={yearFilter2} onChange={e => { setYearFilter2(e.target.value); setEmailSearch(''); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
          </select>
          <button onClick={findStudent} disabled={searching}
            style={{ background: '#f57c00', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1 }}>
            {searching ? '⏳...' : '🔍 Search'}
          </button>
        </div>
        {/* Show student list when filtered by course/year */}
        {showList && allAdmissions.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ffe0b2', borderRadius: 8, marginTop: 8 }}>
            {allAdmissions.map(a => (
              <div key={a._id} onClick={() => { setFoundAdm(a); setStep(2); setShowList(false); }}
                style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', fontSize: 13, background: '#fff' }}
                onMouseEnter={e => e.target.style.background='#fff3e0'} onMouseLeave={e => e.target.style.background='#fff'}>
                <strong>{a.applicantName}</strong> — {a.courseType} · {a.admissionYear} · {a.email}
              </div>
            ))}
          </div>
        )}
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

// ─── Exam Doc Tab (TC Verification + Marksheet) ──────────────────────────────
const ExamDocTab = ({ type, title, desc, color }) => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [notes, setNotes]         = useState('');
  const [resultStatus, setResultStatus] = useState('pass');
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get('/document-requests/exam/all');
      setRequests((res.data.requests || []).filter(r => r.documentType === type));
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async () => {
    setSaving(true);
    try {
      await API.put(`/document-requests/exam/approve/${selected._id}`, {
        notes, resultStatus: type === 'TC' ? resultStatus : undefined
      });
      setMsg(type === 'TC'
        ? '✅ Result verified! TC forwarded to Principal.'
        : '✅ Marksheet issued to student!');
      setSelected(null); setNotes('');
      setTimeout(() => setMsg(''), 3000);
      fetch();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { setMsg('❌ Enter rejection reason.'); return; }
    setSaving(true);
    try {
      await API.put(`/document-requests/exam/reject/${selected._id}`, { reason: notes });
      setMsg('✅ Request rejected.');
      setSelected(null); setNotes('');
      setTimeout(() => setMsg(''), 3000);
      fetch();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const statusStyle = (s) => ({
    pending_exam:     { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Review' },
    rejected_by_exam: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    pending_principal:{ bg: '#e8f5e9', color: '#2E7D32', label: '✅ Sent to Principal' },
    pending_generation:{ bg: '#e3f2fd', color: '#1565C0', label: '✅ Sent to Student Section' },
    completed:        { bg: '#f3e5f5', color: '#7B1FA2', label: '🏁 Completed' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  const pending = requests.filter(r => r.status === 'pending_exam').length;

  return (
    <div>
      <h2 style={{ color, marginBottom: 4 }}>{title}</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>{desc}</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Pending: {pending}</div>
        <div style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Total: {requests.length}</div>
        <button onClick={fetch} style={{ padding: '5px 14px', background: '#e3f2fd', color, border: `1px solid ${color}44`, borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🔄 Refresh</button>
      </div>

      {/* Action Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color, marginBottom: 14 }}>
              {type === 'TC' ? '📄 Verify Result for TC' : '📋 Process Marksheet Request'}
            </h3>
            <div style={{ background: '#f8faff', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
              {[
                ['Student', selected.studentName],
                ['Email', selected.studentEmail],
                ['Branch', selected.branch || '—'],
                ['Year', selected.admissionYear || '—'],
                ['Reason', selected.reason || '—'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#888', fontWeight: 600 }}>{l}</span>
                  <span style={{ color: '#222' }}>{v}</span>
                </div>
              ))}
              {selected.accountsNotes && <div style={{ marginTop: 8, fontSize: 12, color: '#777', fontStyle: 'italic' }}>Accounts: {selected.accountsNotes}</div>}
            </div>

            {type === 'TC' && (
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontWeight: 700, color, marginBottom: 6, fontSize: 13 }}>Student Result Status *</label>
                <select value={resultStatus} onChange={e => setResultStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `2px solid ${color}55`, fontSize: 14 }}>
                  <option value="pass">✅ Pass — All subjects cleared</option>
                  <option value="atkt">⚠️ ATKT — Some subjects pending</option>
                  <option value="fail">❌ Fail — All subjects failed</option>
                </select>
                <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>This will be visible to Principal for decision.</p>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Notes (optional)</label>
              <textarea rows="2" placeholder="Add any notes..." value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {msg && <div style={{ padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: '#ffebee', color: '#C62828' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleApprove} disabled={saving}
                style={{ flex: 1, background: saving ? '#aaa' : color, color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳...' : type === 'TC' ? '✅ Verify & Forward to Principal' : '✅ Issue Marksheet to Student'}
              </button>
              <button onClick={handleReject} disabled={saving}
                style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '12px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                ❌ Reject
              </button>
            </div>
            <button onClick={() => { setSelected(null); setNotes(''); setMsg(''); }}
              style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', border: 'none', borderRadius: 8, padding: 10, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{type === 'TC' ? '📄' : '📋'}</div>
          <h3>No {type === 'TC' ? 'TC' : 'Marksheet'} Requests</h3>
          <p>{type === 'TC' ? 'TC requests after Accounts fee verification will appear here.' : 'Student marksheet requests will appear here.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(req => {
            const ss = statusStyle(req.status);
            const isPending = req.status === 'pending_exam';
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e7ef'}`, borderRadius: 12, padding: 18, borderLeft: `4px solid ${ss.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <h4 style={{ color, fontSize: 15, margin: 0 }}>{req.studentName}</h4>
                    <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>{req.studentEmail} · {req.branch || '—'} · {req.admissionYear || '—'}</p>
                    {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>⚡ Urgent</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                {req.reason && <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}><strong>Reason:</strong> {req.reason}</p>}
                {req.accountsNotes && <p style={{ fontSize: 12, color: '#777', marginBottom: 8, fontStyle: 'italic' }}>Accounts Note: {req.accountsNotes}</p>}
                {req.examResultStatus && <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}><strong>Result Status:</strong> {req.examResultStatus}</p>}
                {isPending && (
                  <button onClick={() => { setSelected(req); setNotes(''); setMsg(''); setResultStatus('pass'); }}
                    style={{ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {type === 'TC' ? '🔍 Verify Result' : '📋 Process Request'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ─── Exam Doc Tab (TC Verification + Marksheet) ──────────────────────────────
const AttendanceTab = () => {
  const [view, setView]             = useState('mark');  // 'mark' | 'report'
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject]       = useState('');
  const [session, setSession]       = useState('full_day');
  const [attendance, setAttendance] = useState({});  // { email: 'present'|'absent'|'late' }
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  // Report state
  const [rptSubject, setRptSubject]   = useState('');
  const [rptFrom, setRptFrom]         = useState('');
  const [rptTo, setRptTo]             = useState('');
  const [rptRecords, setRptRecords]   = useState([]);
  const [rptLoading, setRptLoading]   = useState(false);
  const [subjects, setSubjects]       = useState([]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/attendance/students');
      setStudents(res.data.students || []);
    } catch { }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/attendance/subjects');
      setSubjects(res.data.subjects || []);
    } catch { }
  };

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  // Load existing attendance when date+subject changes
  useEffect(() => {
    if (!date || !subject) return;
    API.get(`/attendance/by-date?date=${date}&subject=${encodeURIComponent(subject)}`)
      .then(res => {
        const map = {};
        (res.data.records || []).forEach(r => { map[r.studentEmail] = r.status; });
        setAttendance(map);
      }).catch(() => {});
  }, [date, subject]);

  const filteredStudents = students.filter(s =>
    yearFilter === 'all' || s.admissionYear === yearFilter
  );

  const markAll = (status) => {
    const map = {};
    filteredStudents.forEach(s => { map[s.email] = status; });
    setAttendance(prev => ({ ...prev, ...map }));
  };

  const handleSave = async () => {
    if (!subject.trim()) { setMsg('❌ Enter subject name.'); return; }
    if (!date) { setMsg('❌ Select date.'); return; }
    const records = filteredStudents.map(s => ({
      studentEmail: s.email,
      studentName:  s.applicantName,
      studentId:    s.studentId || '',
      courseType:   s.courseType || '',
      admissionYear: s.admissionYear || '',
      status:       attendance[s.email] || 'absent',
    }));
    setSaving(true);
    try {
      await API.post('/attendance/bulk', { date, subject, session, records });
      setMsg(`✅ Attendance saved for ${records.length} students!`);
      fetchSubjects();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const fetchReport = async () => {
    setRptLoading(true);
    try {
      const params = new URLSearchParams();
      if (rptSubject) params.append('subject', rptSubject);
      if (rptFrom)    params.append('fromDate', rptFrom);
      if (rptTo)      params.append('toDate', rptTo);
      const res = await API.get(`/attendance/report?${params}`);
      setRptRecords(res.data.records || []);
    } catch { }
    finally { setRptLoading(false); }
  };

  const presentCount = filteredStudents.filter(s => attendance[s.email] === 'present').length;
  const absentCount  = filteredStudents.filter(s => attendance[s.email] === 'absent' || !attendance[s.email]).length;
  const lateCount    = filteredStudents.filter(s => attendance[s.email] === 'late').length;

  // Report summary
  const rptSummary = rptRecords.reduce((acc, r) => {
    if (!acc[r.studentEmail]) acc[r.studentEmail] = { name: r.studentName, id: r.studentId, total: 0, present: 0, absent: 0, late: 0 };
    acc[r.studentEmail].total++;
    acc[r.studentEmail][r.status]++;
    return acc;
  }, {});

  const exportRptCSV = () => {
    const headers = ['Student Name','Student ID','Total Days','Present','Absent','Late','Attendance %'];
    const rows = Object.values(rptSummary).map(s => [s.name, s.id, s.total, s.present, s.absent, s.late, s.total > 0 ? Math.round((s.present/s.total)*100)+'%' : '0%']);
    const csv = [headers,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='attendance_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ color: '#f57c00', marginBottom: 4 }}>📋 Attendance Tracker</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Mark daily attendance and view reports.</p>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#f0f4f8', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'mark', label: '✏️ Mark Attendance' }, { id: 'report', label: '📊 View Report' }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{ padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: view === t.id ? '#f57c00' : 'transparent', color: view === t.id ? '#fff' : '#555' }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      {/* ── MARK ATTENDANCE ── */}
      {view === 'mark' && (
        <div>
          {/* Controls */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#f57c00', marginBottom: 5 }}>📅 Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ffe0b2', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#f57c00', marginBottom: 5 }}>📚 Subject *</label>
                <input type="text" list="subjects-list" placeholder="e.g. Physics, Math..." value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '2px solid #ffe0b2', fontSize: 14, boxSizing: 'border-box' }} />
                <datalist id="subjects-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#f57c00', marginBottom: 5 }}>🕐 Session</label>
                <select value={session} onChange={e => setSession(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="full_day">Full Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>📊 Year Filter</label>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                </select>
              </div>
            </div>

            {/* Quick mark + stats */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Mark All:</span>
              <button onClick={() => markAll('present')} style={{ background: '#e8f5e9', color: '#2E7D32', border: '1px solid #a5d6a7', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✅ All Present</button>
              <button onClick={() => markAll('absent')}  style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>❌ All Absent</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <span style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>✅ {presentCount}</span>
                <span style={{ background: '#ffebee', color: '#C62828', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>❌ {absentCount}</span>
                {lateCount > 0 && <span style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>⏰ {lateCount}</span>}
              </div>
            </div>
          </div>

          {/* Student list */}
          {loading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
          : filteredStudents.length === 0 ? <div className="empty-state"><div className="empty-icon">👩‍🎓</div><h3>No students found</h3></div>
          : (
            <div>
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', background: '#f57c00', padding: '12px 16px', gap: 8 }}>
                  {['Student','Course / Year','Student ID','Attendance'].map(h => <span key={h} style={{color:'#fff',fontWeight:700,fontSize:13}}>{h}</span>)}
                </div>
                {filteredStudents.map((s, idx) => {
                  const status = attendance[s.email] || 'absent';
                  return (
                    <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx%2===0?'#fafbff':'#fff' }}>
                      <div>
                        <p style={{fontWeight:600,fontSize:13,margin:0}}>{s.applicantName}</p>
                        <p style={{fontSize:11,color:'#888',margin:0}}>{s.email}</p>
                      </div>
                      <div>
                        <p style={{fontSize:12,margin:0}}>{s.courseType||'—'}</p>
                        <p style={{fontSize:11,color:'#888',margin:0}}>{s.admissionYear}</p>
                      </div>
                      <span style={{fontSize:12,fontFamily:'monospace',color:'#1565C0',fontWeight:600}}>{s.studentId||'—'}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['present','absent','late'].map(st => (
                          <button key={st} onClick={() => setAttendance(prev => ({ ...prev, [s.email]: st }))}
                            style={{
                              padding: '5px 10px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              background: status === st ? (st==='present'?'#2E7D32':st==='absent'?'#C62828':'#E65100') : '#f0f0f0',
                              color: status === st ? '#fff' : '#888',
                            }}>
                            {st==='present'?'✅':st==='absent'?'❌':'⏰'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleSave} disabled={saving || !subject.trim()}
                style={{ background: saving||!subject.trim() ? '#aaa' : '#f57c00', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: saving||!subject.trim() ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : `💾 Save Attendance (${filteredStudents.length} students)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── REPORT ── */}
      {view === 'report' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20 }}>
            <h4 style={{ color: '#f57c00', marginBottom: 14 }}>🔍 Filter Report</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>Subject</label>
                <input type="text" list="subjects-list2" placeholder="All subjects" value={rptSubject} onChange={e => setRptSubject(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
                <datalist id="subjects-list2">{subjects.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>From Date</label>
                <input type="date" value={rptFrom} onChange={e => setRptFrom(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>To Date</label>
                <input type="date" value={rptTo} onChange={e => setRptTo(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={fetchReport} disabled={rptLoading}
                style={{ background: '#f57c00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: rptLoading ? 'not-allowed' : 'pointer', opacity: rptLoading ? 0.7 : 1 }}>
                {rptLoading ? '⏳...' : '📊 Generate Report'}
              </button>
              {rptRecords.length > 0 && (
                <button onClick={exportRptCSV}
                  style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  📥 Export CSV
                </button>
              )}
            </div>
          </div>

          {rptRecords.length > 0 && (
            <div>
              {/* Summary table */}
              <h4 style={{ color: '#f57c00', marginBottom: 12 }}>📊 Student-wise Summary</h4>
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: '#f57c00', padding: '12px 16px', gap: 8 }}>
                  {['Student','Total Days','Present','Absent','Late','Attendance %'].map(h => <span key={h} style={{color:'#fff',fontWeight:700,fontSize:12}}>{h}</span>)}
                </div>
                {Object.values(rptSummary).sort((a,b) => b.present/b.total - a.present/a.total).map((s, idx) => {
                  const pct = s.total > 0 ? Math.round((s.present/s.total)*100) : 0;
                  const pctColor = pct >= 75 ? '#2E7D32' : pct >= 60 ? '#E65100' : '#C62828';
                  return (
                    <div key={s.id||idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx%2===0?'#fafbff':'#fff' }}>
                      <div>
                        <p style={{fontWeight:600,fontSize:13,margin:0}}>{s.name}</p>
                        <p style={{fontSize:10,color:'#888',margin:0}}>{s.id||''}</p>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,textAlign:'center'}}>{s.total}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#2E7D32',textAlign:'center'}}>{s.present}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#C62828',textAlign:'center'}}>{s.absent}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#E65100',textAlign:'center'}}>{s.late}</span>
                      <span style={{fontSize:13,fontWeight:800,color:pctColor}}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed records */}
              <h4 style={{ color: '#f57c00', marginBottom: 12 }}>📅 Detailed Records ({rptRecords.length})</h4>
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr', background: '#f57c00', padding: '12px 16px', gap: 8 }}>
                  {['Date','Student','Subject','Session','Status'].map(h => <span key={h} style={{color:'#fff',fontWeight:700,fontSize:12}}>{h}</span>)}
                </div>
                {rptRecords.slice(0,100).map((r, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx%2===0?'#fafbff':'#fff' }}>
                    <span style={{fontSize:12,color:'#555'}}>{r.date}</span>
                    <div><p style={{fontWeight:600,fontSize:12,margin:0}}>{r.studentName}</p><p style={{fontSize:10,color:'#aaa',margin:0}}>{r.studentId||''}</p></div>
                    <span style={{fontSize:12}}>{r.subject}</span>
                    <span style={{fontSize:11,color:'#888'}}>{r.session}</span>
                    <span style={{fontSize:12,fontWeight:700,padding:'2px 8px',borderRadius:10,background:r.status==='present'?'#e8f5e9':r.status==='absent'?'#ffebee':'#fff3e0',color:r.status==='present'?'#2E7D32':r.status==='absent'?'#C62828':'#E65100'}}>
                      {r.status==='present'?'✅ Present':r.status==='absent'?'❌ Absent':'⏰ Late'}
                    </span>
                  </div>
                ))}
                {rptRecords.length > 100 && <div style={{padding:'10px',textAlign:'center',fontSize:12,color:'#888'}}>Showing 100 of {rptRecords.length}. Export CSV for full data.</div>}
              </div>
            </div>
          )}

          {rptRecords.length === 0 && !rptLoading && (
            <div className="empty-state"><div className="empty-icon">📋</div><h3>No records yet</h3><p>Click "Generate Report" to view attendance data.</p></div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Exam Data Tab ────────────────────────────────────────────────────────────
const ExamDataTab = () => {
  const [admissions, setAdmissions] = useState([]);
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [yearF, setYearF]           = useState('all');
  const [selected, setSelected]     = useState(null);
  const [selResults, setSelResults] = useState([]);
  const [editResult, setEditResult] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/admissions/staff-view/all'),
      API.get('/results/all-results'),
    ]).then(([aRes, rRes]) => {
      setAdmissions(aRes.data.admissions || []);
      setResults(rRes.data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getStudentResults = (email) => results.filter(r => r.studentEmail === email);

  const statusColor = (res) => ({
    DISTINCTION: '#1b5e20', PASS: '#2E7D32', ATKT: '#E65100', FAIL: '#C62828'
  }[res] || '#888');

  const filtered = admissions.filter(s => {
    const q = search.toLowerCase();
    const mq = !q || s.applicantName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q);
    const my = yearF === 'all' || s.admissionYear === yearF;
    return mq && my;
  });

  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setSelResults([]); setMsg(''); }}
          style={{ background:'#f0f4ff', color:'#f57c00', border:'1px solid #f57c00', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:20 }}>← Back</button>
        <h3 style={{ color:'#f57c00', marginBottom:4 }}>{selected.applicantName}</h3>
        <p style={{ fontSize:13, color:'#666', marginBottom:16 }}>{selected.courseType} · {selected.admissionYear} · {selected.email}</p>
        {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

        {selResults.length === 0 ? (
          <div style={{ background:'#f8faff', borderRadius:12, padding:30, textAlign:'center', color:'#888' }}>No exam results found for this student.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {selResults.map((r, i) => (
              <div key={r._id||i} style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:14, color:'#f57c00' }}>Semester {r.semester}</span>
                    <span style={{ fontSize:12, color:'#888', marginLeft:10 }}>{r.year} · {r.courseType}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:800, padding:'3px 12px', borderRadius:20, background:`${statusColor(r.result)}22`, color:statusColor(r.result) }}>{r.result}</span>
                    <span style={{ fontSize:13, fontWeight:700 }}>{r.percentage}%</span>
                    <button onClick={() => setEditResult(r)}
                      style={{ background:'#fff3e0', color:'#f57c00', border:'1px solid #f57c00', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>✏️ Update</button>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
                  {(r.subjects||[]).map((s,j) => {
                    const pct = s.maxMarks > 0 ? Math.round((s.obtainedMarks/s.maxMarks)*100) : 0;
                    const fail = pct < 35;
                    return (
                      <div key={j} style={{ background: fail?'#ffebee':'#f8faff', borderRadius:8, padding:'8px 12px', border:`1px solid ${fail?'#ef9a9a':'#e0e7ef'}` }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#333', marginBottom:2 }}>{s.name}</div>
                        <div style={{ fontSize:13, fontWeight:800, color:fail?'#C62828':'#1565C0' }}>{s.obtainedMarks} / {s.maxMarks}</div>
                        <div style={{ fontSize:10, color: fail?'#C62828':'#888' }}>{pct}% {fail?'❌ FAIL':'✅'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit result modal */}
        {editResult && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setEditResult(null)}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:500, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.2)' }} onClick={e=>e.stopPropagation()}>
              <h3 style={{ color:'#f57c00', marginBottom:16 }}>✏️ Update Result — Semester {editResult.semester}</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:16 }}>
                {(editResult.subjects||[]).map((s,j) => (
                  <div key={j} style={{ background:'#f8faff', borderRadius:8, padding:'10px 12px' }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:4 }}>{s.name} (max: {s.maxMarks})</label>
                    <input type="number" min="0" max={s.maxMarks}
                      defaultValue={s.obtainedMarks}
                      onChange={e => { s.obtainedMarks = Number(e.target.value); }}
                      style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'2px solid #f57c00', fontSize:14, boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>
              <button onClick={async () => {
                setSaving(true);
                try {
                  await API.put(`/results/${editResult._id}`, { subjects: editResult.subjects });
                  setMsg('✅ Result updated!');
                  setEditResult(null);
                  const rRes = await API.get('/results/all-results');
                  const allR = rRes.data.results || [];
                  setResults(allR);
                  setSelResults(allR.filter(r => r.studentEmail === selected.email));
                  setTimeout(() => setMsg(''), 3000);
                } catch (e) { setMsg('❌ ' + (e.response?.data?.message||'Failed')); }
                finally { setSaving(false); }
              }} disabled={saving}
                style={{ background:'#f57c00', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                {saving?'⏳ Saving...':'💾 Save Changes'}
              </button>
              <button onClick={()=>setEditResult(null)} style={{ marginLeft:10, background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:14, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color:'#f57c00', marginBottom:4 }}>📊 Student Exam Data</h2>
      <p style={{ color:'#666', marginBottom:20, fontSize:14 }}>View and update student exam results. Click on a student to see all their exams.</p>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input type="text" placeholder="🔍 Search student..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14 }} />
        <select value={yearF} onChange={e=>setYearF(e.target.value)}
          style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
      </div>

      {loading ? <div style={{textAlign:'center',padding:20,fontSize:'2rem'}}>⏳</div>
      : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 0.6fr', background:'#f57c00', padding:'10px 14px', gap:8 }}>
            {['Student','Course/Year','Exams','Last Result',''].map(h=><span key={h} style={{color:'#fff',fontWeight:700,fontSize:12}}>{h}</span>)}
          </div>
          {filtered.map((s, idx) => {
            const sResults = getStudentResults(s.email);
            const last = sResults[0];
            return (
              <div key={s._id} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 0.6fr', padding:'10px 14px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                <div>
                  <p style={{ fontWeight:600, fontSize:13, margin:0 }}>{s.applicantName}</p>
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.email}</p>
                </div>
                <span style={{ fontSize:12 }}>{s.courseType} · {s.admissionYear}</span>
                <span style={{ fontSize:13, fontWeight:700, color: sResults.length>0?'#1565C0':'#aaa' }}>{sResults.length} exam{sResults.length!==1?'s':''}</span>
                <span style={{ fontSize:12, fontWeight:700, color: last?statusColor(last.result):'#aaa' }}>
                  {last ? `Sem ${last.semester} — ${last.result}` : '—'}
                </span>
                <button onClick={() => { setSelected(s); setSelResults(getStudentResults(s.email)); }}
                  style={{ background:'#fff3e0', color:'#f57c00', border:'1px solid #f57c00', borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>👁️</button>
              </div>
            );
          })}
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
const [examSettings, setExamSettings] = useState({ regularEnabled: false, backlogEnabled: false, regularCourse: '', regularSemester: '', regularExamEvent: '', backlogCourse: '', backlogSemester: '', backlogExamEvent: '', lastUpdatedBy: '', lastUpdatedAt: null });
  const [openFormModal, setOpenFormModal] = useState(null);
  const [formDraft, setFormDraft] = useState({ course: '', semester: '', examEvent: '' });
  const [settingMsg, setSettingMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    API.get('/results/exam-settings')
      .then(res => setExamSettings(res.data.settings || {}))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

 const handleOpenFormClick = (type) => {
    setOpenFormModal(type);
    setFormDraft({ course: '', semester: '', examEvent: '' });
  };

  const submitOpenForm = async () => {
    if (!formDraft.course || !formDraft.semester || !formDraft.examEvent) {
      alert('Please select Course, Semester, and Exam Event.');
      return;
    }
    setSavingSettings(true);
    try {
      const isRegular = openFormModal === 'regular';
      const payload = {
        regularEnabled:   isRegular ? true : examSettings.regularEnabled,
        backlogEnabled:   !isRegular ? true : examSettings.backlogEnabled,
        regularCourse:    isRegular ? formDraft.course    : examSettings.regularCourse,
        regularSemester:  isRegular ? formDraft.semester  : examSettings.regularSemester,
        regularExamEvent: isRegular ? formDraft.examEvent : examSettings.regularExamEvent,
        backlogCourse:    !isRegular ? formDraft.course    : examSettings.backlogCourse,
        backlogSemester:  !isRegular ? formDraft.semester  : examSettings.backlogSemester,
        backlogExamEvent: !isRegular ? formDraft.examEvent : examSettings.backlogExamEvent,
      };
      const res = await API.put('/results/exam-settings', payload);
      setExamSettings(res.data.settings || payload);
      setSettingMsg(`✅ ${isRegular ? 'Regular' : 'Backlog'} exam form OPENED for students!`);
      setTimeout(() => setSettingMsg(''), 4000);
      setOpenFormModal(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      const status = e?.response?.status || 'no status';
      setSettingMsg(`❌ Failed to update settings. [${status}] ${msg}`);
    }
    finally { setSavingSettings(false); }
  };

  const closeExamForm = async (type) => {
    setSavingSettings(true);
    try {
      const payload = { ...examSettings, [type]: false };
      const res = await API.put('/results/exam-settings', payload);
      setExamSettings(res.data.settings || payload);
      setSettingMsg(`✅ ${type === 'regularEnabled' ? 'Regular' : 'Backlog'} exam form CLOSED.`);
      setTimeout(() => setSettingMsg(''), 4000);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      const status = e?.response?.status || 'no status';
      setSettingMsg(`❌ Failed to update. [${status}] ${msg}`);
    }
    finally { setSavingSettings(false); }
  };

  const tabs = [
    { id: 'home',          label: '🏠 Dashboard' },
    { id: 'exam_toggle',   label: '🔛 Exam Form Toggle' },
    { id: 'upload_result', label: '📊 Upload Result' },
    { id: 'tc_verify',     label: '📄 TC Verification' },
    { id: 'marksheet',     label: '📋 Marksheet Requests' },
    { id: 'students',      label: '👩‍🎓 View Students' },
    { id: 'exam_data',     label: '📊 Student Exam Data' },
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
                <p style={{ color: '#555' }}>Manage exam forms, upload results, verify TC requests, and process marksheets.</p>
              </div>

              {/* Exam form status cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: examSettings.regularEnabled ? 'linear-gradient(135deg,#e8f5e9,#f0fff4)' : '#f5f5f5', border: `2px solid ${examSettings.regularEnabled ? '#2E7D32' : '#e0e0e0'}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: examSettings.regularEnabled ? '#2E7D32' : '#888', margin: '0 0 4px' }}>📋 Regular Exam Form</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{examSettings.regularEnabled ? '✅ Open for students' : '🔒 Closed'}</p>
                    </div>
                    <div style={{ fontSize: 28 }}>{examSettings.regularEnabled ? '🟢' : '🔴'}</div>
                  </div>
                </div>
                <div style={{ background: examSettings.backlogEnabled ? 'linear-gradient(135deg,#fff3e0,#fffbf0)' : '#f5f5f5', border: `2px solid ${examSettings.backlogEnabled ? '#E65100' : '#e0e0e0'}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: examSettings.backlogEnabled ? '#E65100' : '#888', margin: '0 0 4px' }}>📋 Backlog / KT Form</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{examSettings.backlogEnabled ? '✅ Open for students' : '🔒 Closed'}</p>
                    </div>
                    <div style={{ fontSize: 28 }}>{examSettings.backlogEnabled ? '🟢' : '🔴'}</div>
                  </div>
                </div>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('exam_toggle')}>
                  <div className="dash-card-icon">🔛</div><div><h3>Toggle</h3><p>Exam Forms</p></div>
                </div>
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('upload_result')}>
                  <div className="dash-card-icon">📊</div><div><h3>Upload</h3><p>Results</p></div>
                </div>
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tc_verify')}>
                  <div className="dash-card-icon">📄</div><div><h3>TC</h3><p>Verification</p></div>
                </div>
                <div className="dash-card green" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('students')}>
                  <div className="dash-card-icon">👩‍🎓</div><div><h3>View</h3><p>Students</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ══ EXAM FORM TOGGLE ══ */}
          {activeTab === 'exam_toggle' && (
            <div>
              <h2 style={{ color: '#f57c00', marginBottom: 4 }}>🔛 Exam Form Toggle</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Enable or disable exam forms for students. Students can only fill forms when you open them.</p>

              {settingMsg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: settingMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: settingMsg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{settingMsg}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Regular Exam */}
                <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${examSettings.regularEnabled ? '#2E7D32' : '#e0e0e0'}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ background: examSettings.regularEnabled ? 'linear-gradient(135deg,#1b5e20,#2E7D32)' : '#9e9e9e', padding: '20px 24px' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 16 }}>📋 Regular Examination Form</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>
                      {examSettings.regularEnabled ? '✅ Currently OPEN — Students can fill this form' : '🔒 Currently CLOSED — Students cannot fill this form'}
                    </p>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div style={{ fontSize: 40 }}>{examSettings.regularEnabled ? '🟢' : '🔴'}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: examSettings.regularEnabled ? '#2E7D32' : '#C62828' }}>
                          {examSettings.regularEnabled ? 'OPEN' : 'CLOSED'}
                        </p>
                        {examSettings.lastUpdatedBy && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Last updated by: {examSettings.lastUpdatedBy}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                     <button onClick={() => handleOpenFormClick('regular')} disabled={savingSettings || examSettings.regularEnabled}
                        style={{ flex: 1, background: examSettings.regularEnabled ? '#eee' : '#2E7D32', color: examSettings.regularEnabled ? '#aaa' : '#fff', border: 'none', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: examSettings.regularEnabled ? 'not-allowed' : 'pointer' }}>
                        🟢 Open Form
                      </button>
                     <button onClick={() => closeExamForm('regularEnabled')} disabled={savingSettings || !examSettings.regularEnabled}
                        style={{ flex: 1, background: !examSettings.regularEnabled ? '#eee' : '#C62828', color: !examSettings.regularEnabled ? '#aaa' : '#fff', border: 'none', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: !examSettings.regularEnabled ? 'not-allowed' : 'pointer' }}>
                        🔴 Close Form
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backlog Exam */}
                <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${examSettings.backlogEnabled ? '#E65100' : '#e0e0e0'}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ background: examSettings.backlogEnabled ? 'linear-gradient(135deg,#bf360c,#E65100)' : '#9e9e9e', padding: '20px 24px' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 16 }}>📋 Backlog / KT Examination Form</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>
                      {examSettings.backlogEnabled ? '✅ Currently OPEN — Students can fill KT form' : '🔒 Currently CLOSED — Students cannot fill KT form'}
                    </p>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div style={{ fontSize: 40 }}>{examSettings.backlogEnabled ? '🟢' : '🔴'}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: examSettings.backlogEnabled ? '#E65100' : '#C62828' }}>
                          {examSettings.backlogEnabled ? 'OPEN' : 'CLOSED'}
                        </p>
                        {examSettings.lastUpdatedBy && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Last updated by: {examSettings.lastUpdatedBy}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                     <button onClick={() => handleOpenFormClick('backlog')} disabled={savingSettings || examSettings.backlogEnabled}
                        style={{ flex: 1, background: examSettings.backlogEnabled ? '#eee' : '#E65100', color: examSettings.backlogEnabled ? '#aaa' : '#fff', border: 'none', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: examSettings.backlogEnabled ? 'not-allowed' : 'pointer' }}>
                        🟢 Open Form
                      </button>
                    <button onClick={() => closeExamForm('backlogEnabled')} disabled={savingSettings || !examSettings.backlogEnabled}
                        style={{ flex: 1, background: !examSettings.backlogEnabled ? '#eee' : '#C62828', color: !examSettings.backlogEnabled ? '#aaa' : '#fff', border: 'none', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: !examSettings.backlogEnabled ? 'not-allowed' : 'pointer' }}>
                        🔴 Close Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#7c5e00' }}>
                ⚠️ <strong>Important:</strong> When you open a form, all students can immediately see and fill it in their dashboard.
                When you close it, the form becomes locked and students cannot submit. Use this at the start and end of exam season.
              </div>
            </div>
          )}

{openFormModal && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ background:'#fff', borderRadius:16, padding:32, minWidth:340, maxWidth:420, boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}>
                <h3 style={{ marginBottom:4, color: openFormModal==='regular' ? '#1b5e20' : '#bf360c' }}>
                  {openFormModal==='regular' ? '📋 Open Regular Exam Form' : '📋 Open Backlog/KT Exam Form'}
                </h3>
                <p style={{ color:'#666', fontSize:13, marginBottom:20 }}>Select details before opening the form for students.</p>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Course *</label>
                <select value={formDraft.course} onChange={e => setFormDraft(p=>({...p, course:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:16, fontSize:14 }}>
                  <option value=''>-- Select Course --</option>
                  <option value='BA'>BA</option>
                  <option value='BSc'>BSc</option>
                </select>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Semester *</label>
                <select value={formDraft.semester} onChange={e => setFormDraft(p=>({...p, semester:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:16, fontSize:14 }}>
                  <option value=''>-- Select Semester --</option>
                  {['1st','2nd','3rd','4th','5th','6th'].map(s=><option key={s} value={s}>{s} Semester</option>)}
                </select>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Exam Event *</label>
                <input type='text' placeholder='e.g. April-May 2026' value={formDraft.examEvent}
                  onChange={e => setFormDraft(p=>({...p, examEvent:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:22, fontSize:14 }} />

                <div style={{ display:'flex', gap:12 }}>
                  <button onClick={() => setOpenFormModal(null)}
                    style={{ flex:1, padding:'11px', borderRadius:9, border:'1.5px solid #ddd', background:'#f5f5f5', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                    Cancel
                  </button>
                  <button onClick={submitOpenForm} disabled={savingSettings}
                    style={{ flex:2, padding:'11px', borderRadius:9, border:'none', background: openFormModal==='regular'?'#2E7D32':'#E65100', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                    {savingSettings ? 'Opening...' : '✅ Open Form for Students'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipts'       && <PaymentReceiptsTab themeColor="#f57c00" />}
          {activeTab === 'attendance'    && <AttendanceTab />}
          {activeTab === 'upload_result' && <ResultUploadTab />}
          {activeTab === 'tc_verify'     && <ExamDocTab type="TC" title="📄 TC Verification" desc="Verify student result status before TC is sent to Principal." color="#1565C0" />}
          {activeTab === 'marksheet'     && <ExamDocTab type="MARKSHEET" title="📋 Marksheet Requests" desc="Process marksheet requests from students." color="#f57c00" />}
          {activeTab === 'exam_data' && <ExamDataTab />}

          {activeTab === 'students'      && (
            <div>
              <h2 style={{ color: '#f57c00', marginBottom: 4 }}>👩‍🎓 View Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Read-only view of all enrolled students.</p>
              <StudentViewFull canEdit={false} themeColor="#f57c00" role="exam" />
            </div>
          )}

        </div>
      </main>
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

export default ExamSectionDashboard;
