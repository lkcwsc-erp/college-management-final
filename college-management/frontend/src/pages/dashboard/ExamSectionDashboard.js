import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import StudentViewFull from './StudentViewFull';

// ─── Result Upload Tab ────────────────────────────────────────────────────────
const ResultUploadTab = () => {
  const [step, setStep]             = useState(1); // 1=find student, 2=enter marks
  const [idSearch, setIdSearch] = useState('');
  const [foundAdm, setFoundAdm]     = useState(null);
  const [searching, setSearching]   = useState(false);
  const [searchErr, setSearchErr]   = useState('');
  const [academicYear, setAcademicYear] = useState('');  // 1 / 2 / 3
  const [status, setStatus]             = useState('');  // pass / fail / atkt / rr
  const [percentage, setPercentage]     = useState('');
  const [uploading, setUploading]   = useState(false);
  const [msg, setMsg]               = useState('');

  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter2, setYearFilter2]   = useState('');
  const [allAdmissions, setAllAdmissions] = useState([]);
  const [showList, setShowList] = useState(false);

  const [existingResults, setExistingResults] = useState([]); // selected student ke purane results

  // student select hone par uske saare results la lo
  const loadExisting = async (email) => {
    try {
      const r = await API.get(`/results/by-email/${encodeURIComponent(email)}`);
      setExistingResults(r.data.results || []);
    } catch { setExistingResults([]); }
  };

  // diye gaye academic year (1/2/3) ka pehle se uploaded annual result (agar ho)
  const findExistingForYear = (yr) => {
    if (!yr) return null;
    const n = Number(yr);
    const label = n === 1 ? '1st Year' : n === 2 ? '2nd Year' : n === 3 ? '3rd Year' : '';
    return existingResults.find(r =>
      (!r.subjects || r.subjects.length === 0) &&
      (Number(r.semester) === n || (r.academicYear && r.academicYear === label))
    ) || null;
  };

  // student select hone par form reset + existing results load
  const pickStudent = (a) => {
    setFoundAdm(a); setStep(2); setShowList(false);
    setAcademicYear(''); setStatus(''); setPercentage(''); setMsg('');
    loadExisting(a.email);
  };

  // year select karte waqt: agar us year ka result pehle se hai to edit mode (pre-fill)
  const onYearChange = (yr) => {
    setAcademicYear(yr); setMsg('');
    const ex = findExistingForYear(yr);
    if (ex) {
      setStatus(ex.result || '');
      setPercentage(ex.percentage != null ? String(ex.percentage) : '');
    } else {
      setStatus(''); setPercentage('');
    }
  };

  const findStudent = async () => {
    if (!idSearch.trim() && !courseFilter && !yearFilter2) return;
    setSearching(true); setSearchErr(''); setFoundAdm(null); setShowList(false);
    try {
      const res = await API.get('/admissions/staff-view/all');
      const all = res.data.admissions || [];
      if (idSearch.trim()) {
        const q = idSearch.toLowerCase().trim();
        const found = all.find(a =>
          (a.prnNumber && a.prnNumber.toLowerCase() === q) ||
          (a.studentId && a.studentId.toLowerCase() === q)
        );
        if (!found) { setSearchErr('No student found with this PRN / Student ID.'); }
        else { pickStudent(found); }
      } else {
        // Filter by course + year
        const normYear = (y) => {
          const v = (y || '').toLowerCase();
          if (v.includes('1st') || v.includes('first')) return '1';
          if (v.includes('2nd') || v.includes('second')) return '2';
          if (v.includes('3rd') || v.includes('third')) return '3';
          return v;
        };
        const filtered = all.filter(a => {
          const mc = !courseFilter || (a.courseType || '').toLowerCase() === courseFilter.toLowerCase();
          const my = !yearFilter2 || normYear(a.admissionYear) === normYear(yearFilter2);
          return mc && my;
        });
        if (filtered.length === 0) { setSearchErr('No students found.'); }
        else { setAllAdmissions(filtered); setShowList(true); }
      }
    } catch { setSearchErr('Error searching. Try again.'); }
    finally { setSearching(false); }
  };

  const handleUpload = async () => {
    if (!academicYear) { setMsg('❌ Year select karein.'); return; }
    if (!status)       { setMsg('❌ Result (Pass / Fail / AT-KT / RR) select karein.'); return; }
    if (percentage === '' || isNaN(Number(percentage)) || Number(percentage) < 0 || Number(percentage) > 100) {
      setMsg('❌ Valid percentage (0–100) daalein.'); return;
    }
    const wasUpdate = !!findExistingForYear(academicYear);
    setUploading(true);
    try {
      await API.post('/results/upload-by-email', {
        studentEmail: foundAdm.email,
        academicYear,                  // '1' | '2' | '3'
        status,                        // 'pass' | 'fail' | 'atkt' | 'rr'
        percentage: Number(percentage),
        courseType: foundAdm.courseType,
      });
      setMsg(wasUpdate ? '✅ Result updated successfully!' : '✅ Result uploaded successfully!');
      // student loaded rakhe, existing results refresh karo, year selection clear
      await loadExisting(foundAdm.email);
      setAcademicYear(''); setStatus(''); setPercentage('');
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Upload failed')); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <h2 style={{ color: '#f57c00', marginBottom: 4 }}>📊 Upload / Update Result</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Enter student PRN or Student ID to find them, then select year, result status and percentage. Or filter by course & year to see all students.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      {/* Step 1 — find student */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20 }}>
        <h4 style={{ color: '#f57c00', marginBottom: 14 }}>Step 1 — Find Student by PRN / Student ID</h4>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input type="text" placeholder="Search by PRN or Student ID..." value={idSearch} onChange={e => { setIdSearch(e.target.value); if(e.target.value) { setCourseFilter(''); setYearFilter2(''); } }}
            onKeyDown={e => e.key === 'Enter' && findStudent()}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 9, border: '2px solid #f57c00', fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>OR filter by:</span>
          <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setIdSearch(''); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="">All Courses</option>
            <option value="BA">B.A.</option>
            <option value="BSc">B.Sc.</option>
          </select>
          <select value={yearFilter2} onChange={e => { setYearFilter2(e.target.value); setIdSearch(''); }}
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
              <div key={a._id} onClick={() => pickStudent(a)}
                style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', fontSize: 13, background: '#fff' }}
                onMouseEnter={e => e.target.style.background='#fff3e0'} onMouseLeave={e => e.target.style.background='#fff'}>
                <strong>{a.applicantName}</strong> — {a.courseType} · {a.admissionYear} · PRN: {a.prnNumber || '—'} · ID: {a.studentId || '—'}
              </div>
            ))}
          </div>
        )}
        {searchErr && <p style={{ color: '#C62828', fontSize: 13, marginTop: 8 }}>{searchErr}</p>}
        {foundAdm && (
          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', marginTop: 12, fontSize: 13 }}>
            ✅ Found: <strong>{foundAdm.applicantName}</strong> — {foundAdm.courseType} · {foundAdm.admissionYear} · PRN: {foundAdm.prnNumber || '—'} · ID: {foundAdm.studentId || '—'}
          </div>
        )}
      </div>

      {/* Step 2 — upload result */}
      {step === 2 && foundAdm && (() => {
        const existingForYear = findExistingForYear(academicYear);
        const uploadedYears = existingResults
          .filter(r => !r.subjects || r.subjects.length === 0)
          .map(r => r.academicYear || (Number(r.semester) === 1 ? '1st Year' : Number(r.semester) === 2 ? '2nd Year' : Number(r.semester) === 3 ? '3rd Year' : ''))
          .filter(Boolean);
        const yearLabel = academicYear === '1' ? '1st Year' : academicYear === '2' ? '2nd Year' : academicYear === '3' ? '3rd Year' : '';
        return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
          <h4 style={{ color: '#f57c00', marginBottom: 6 }}>Step 2 — {existingForYear ? 'Edit Result' : 'Upload Result'}</h4>
          {uploadedYears.length > 0 && (
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>
              Already uploaded: <strong style={{ color:'#2E7D32' }}>{uploadedYears.join(', ')}</strong>
            </p>
          )}

          {existingForYear && (
            <div style={{ background:'#fff3e0', border:'1px solid #ffcc80', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#E65100' }}>
              ⚠️ This student's <strong>{yearLabel}</strong> result is already uploaded. You can only <strong>edit</strong> it — no duplicate will be created.
            </div>
          )}

          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Year */}
            <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#f57c00', marginBottom: 5 }}>Year *</label>
              <select value={academicYear} onChange={e => onYearChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #f57c00', fontSize: 14, boxSizing: 'border-box' }}>
                <option value="">Select Year</option>
                <option value="1">1st Year{uploadedYears.includes('1st Year') ? ' ✓ uploaded' : ''}</option>
                <option value="2">2nd Year{uploadedYears.includes('2nd Year') ? ' ✓ uploaded' : ''}</option>
                <option value="3">3rd Year{uploadedYears.includes('3rd Year') ? ' ✓ uploaded' : ''}</option>
              </select>
            </div>
            {/* Result status */}
            <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#f57c00', marginBottom: 5 }}>Result *</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #f57c00', fontSize: 14, boxSizing: 'border-box' }}>
                <option value="">Select Result</option>
                <option value="pass">✅ Pass</option>
                <option value="fail">❌ Fail</option>
                <option value="atkt">⚠️ AT-KT</option>
                <option value="rr">🔁 RR</option>
              </select>
            </div>
            {/* Percentage */}
            <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#f57c00', marginBottom: 5 }}>Percentage (%) *</label>
              <input type="number" value={percentage} onChange={e => setPercentage(e.target.value)}
                min="0" max="100" step="0.01" placeholder="e.g. 72.5"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #f57c00', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          <button onClick={handleUpload} disabled={uploading}
            style={{ background: uploading ? '#aaa' : (existingForYear ? '#2E7D32' : '#f57c00'), color: '#fff', border: 'none', borderRadius: 9, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? '⏳ Saving...' : (existingForYear ? '💾 Update Result' : '📤 Upload Result')}
          </button>
          <button onClick={() => { setStep(1); setFoundAdm(null); setMsg(''); setExistingResults([]); }}
            style={{ marginLeft: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
        );
      })()}
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
                ['PRN', selected.prnNumber || '—'],
                ['Student ID', selected.studentId || '—'],
                ['Email', selected.studentEmail],
                ['Course', selected.branch || '—'],
                ['Admission Year', selected.admissionYear || '—'],
                ['Academic Year', selected.academicYear || '—'],
                ...(type === 'MARKSHEET' ? [
                  ['Semester', selected.marksheetSemester || '—'],
                  ['Exam Session', selected.marksheetSession === 'mar_apr' ? 'March / April' : selected.marksheetSession === 'nov_dec' ? 'Nov / December' : (selected.marksheetSession || '—')],
                  ['Exam Year', selected.marksheetYear || '—'],
                ] : []),
                ...(type === 'TC' ? [
                  ['Last Semester', selected.lastExamSem || '—'],
                  ['Exam Session', selected.lastExamSession === 'mar_apr' ? 'March / April' : selected.lastExamSession === 'nov_dec' ? 'November / December' : (selected.lastExamSession || '—')],
                  ['Exam Year', selected.lastExamYear || '—'],
                  ['Result', selected.lastExamResult || '—'],
                  ...(selected.lastExamPercent ? [['Percentage', selected.lastExamPercent]] : []),
                  ...(selected.lastExamCollege ? [['Last College', selected.lastExamCollege]] : []),
                ] : []),
                ['Urgency', selected.urgency === 'urgent' ? '⚡ Urgent' : 'Normal'],
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

  const getStudentResults = (email) => {
    const e = (email || '').toLowerCase();
    return results.filter(r => (r.studentEmail || '').toLowerCase() === e);
  };

  const statusColor = (res) => ({
    DISTINCTION: '#1b5e20', PASS: '#2E7D32', ATKT: '#E65100', FAIL: '#C62828', RR: '#6A1B9A'
  }[String(res || '').toUpperCase()] || '#888');

  // subject-wise (purana) -> "Semester X"; annual (naya) -> "1st/2nd/3rd Year"
  const periodLabel = (r) => {
    if (r.subjects && r.subjects.length) return `Semester ${r.semester}`;
    if (r.academicYear) return r.academicYear;
    return r.semester === 1 ? '1st Year' : r.semester === 2 ? '2nd Year' : r.semester === 3 ? '3rd Year' : `Year ${r.semester}`;
  };

  const filtered = admissions.filter(s => {
    const q = search.toLowerCase();
    const mq = !q || s.applicantName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q) || s.prnNumber?.toLowerCase().includes(q);
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
                    <span style={{ fontWeight:700, fontSize:14, color:'#f57c00' }}>{periodLabel(r)}</span>
                    <span style={{ fontSize:12, color:'#888', marginLeft:10 }}>{r.year} · {r.courseType}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:800, padding:'3px 12px', borderRadius:20, background:`${statusColor(r.result)}22`, color:statusColor(r.result) }}>{String(r.result || '').toUpperCase()}</span>
                    <span style={{ fontSize:13, fontWeight:700 }}>{r.percentage}%</span>
                    <button onClick={() => setEditResult(r)}
                      style={{ background:'#fff3e0', color:'#f57c00', border:'1px solid #f57c00', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>✏️ Update</button>
                  </div>
                </div>
                {r.subjects && r.subjects.length > 0 && (
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
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit result modal */}
        {editResult && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setEditResult(null)}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:500, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.2)' }} onClick={e=>e.stopPropagation()}>
              <h3 style={{ color:'#f57c00', marginBottom:16 }}>✏️ Update Result — {periodLabel(editResult)}</h3>
              {editResult.subjects && editResult.subjects.length > 0 ? (
                <>
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
                      setSelResults(allR.filter(r => (r.studentEmail || '').toLowerCase() === (selected.email || '').toLowerCase()));
                      setTimeout(() => setMsg(''), 3000);
                    } catch (e) { setMsg('❌ ' + (e.response?.data?.message||'Failed')); }
                    finally { setSaving(false); }
                  }} disabled={saving}
                    style={{ background:'#f57c00', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {saving?'⏳ Saving...':'💾 Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:160 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Result *</label>
                      <select defaultValue={editResult.result} onChange={e => { editResult.result = e.target.value; }}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #f57c00', fontSize:14, boxSizing:'border-box' }}>
                        <option value="pass">✅ Pass</option>
                        <option value="fail">❌ Fail</option>
                        <option value="atkt">⚠️ AT-KT</option>
                        <option value="rr">🔁 RR</option>
                      </select>
                    </div>
                    <div style={{ flex:1, minWidth:160 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 }}>Percentage (%) *</label>
                      <input type="number" min="0" max="100" step="0.01" defaultValue={editResult.percentage}
                        onChange={e => { editResult.percentage = e.target.value; }}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #f57c00', fontSize:14, boxSizing:'border-box' }} />
                    </div>
                  </div>
                  <button onClick={async () => {
                    const pctNum = Number(editResult.percentage);
                    if (isNaN(pctNum) || pctNum < 0 || pctNum > 100) { setMsg('❌ Valid percentage (0–100) daalein.'); return; }
                    setSaving(true);
                    try {
                      await API.put(`/results/${editResult._id}`, { result: editResult.result, percentage: pctNum });
                      setMsg('✅ Result updated!');
                      setEditResult(null);
                      const rRes = await API.get('/results/all-results');
                      const allR = rRes.data.results || [];
                      setResults(allR);
                      setSelResults(allR.filter(r => (r.studentEmail || '').toLowerCase() === (selected.email || '').toLowerCase()));
                      setTimeout(() => setMsg(''), 3000);
                    } catch (e) { setMsg('❌ ' + (e.response?.data?.message||'Failed')); }
                    finally { setSaving(false); }
                  }} disabled={saving}
                    style={{ background:'#f57c00', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {saving?'⏳ Saving...':'💾 Save Changes'}
                  </button>
                </>
              )}
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
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>PRN: {s.prnNumber || '—'} · ID: {s.studentId || '—'}</p>
                </div>
                <span style={{ fontSize:12 }}>{s.courseType} · {s.admissionYear}</span>
                <span style={{ fontSize:13, fontWeight:700, color: sResults.length>0?'#1565C0':'#aaa' }}>{sResults.length} exam{sResults.length!==1?'s':''}</span>
                <span style={{ fontSize:12, fontWeight:700, color: last?statusColor(last.result):'#aaa' }}>
                  {last ? `${periodLabel(last)} — ${String(last.result || '').toUpperCase()}` : '—'}
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


// ─── Exam Form Submissions Tab ────────────────────────────────────────────────
// Examination Section: jo exam forms publish kiye gaye hai unki list dikhati hai.
// Kisi form pe click karne par — jis jis student ne wo form fill karke fees pay
// ki hai — unka data (name, PRN, student ID, course, year, sem, mobile, fee) aata hai.
const PublishedFormSubmissionsTab = () => {
  const [forms, setForms]       = useState([]);   // published exam forms
  const [requests, setRequests] = useState([]);   // saare exam-form requests
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);  // jis form pe click kiya
  const [search, setSearch]     = useState('');
  const [manageMode, setManageMode] = useState(false); // edit/delete mode
  const [deleting, setDeleting]     = useState(false);

  // course ko format-tolerant banata hai (BA / B.A. / Bachelor of Arts -> 'ba')
  const normCourse = (c) => {
    const s = String(c || '').toLowerCase();
    if (s.includes('b.sc') || s.includes('bsc') || s.includes('science')) return 'bsc';
    if (s.includes('b.a')  || s.includes('ba')  || s.includes('arts'))    return 'ba';
    return s.replace(/[^a-z0-9]/g, '');
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      API.get('/results/exam-form/published?includeInactive=true'),
      API.get('/results/exam-form/all'),
    ]).then(([pRes, rRes]) => {
      setForms(pRes.data.published || []);
      setRequests(rRes.data.requests || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ek published form se match karne wale (form fill kiye hue) requests
  const matchRequests = (f) => requests.filter(r =>
    r.formType === f.formType &&
    r.semester === f.semester &&
    r.examEvent === f.examEvent &&
    normCourse(r.course) === normCourse(f.course)
  );

  // sirf wo students jinhone fees pay kar di hai (feeStatus = collected)
  const paidRequests = (f) => matchRequests(f).filter(r => r.feeStatus === 'collected');

  // ── Form groups: published forms + submissions dono se bante hai ─────────────
  // Isse unpublish karne ke baad bhi (jab tak submissions hai) form list me rehta
  // hai — koi record gayab nahi hota.
  const groupKey = (f) => `${f.formType}||${normCourse(f.course)}||${f.semester}||${f.examEvent}`;
  const buildGroups = () => {
    const map = new Map();
    forms.forEach(f => {
      map.set(groupKey(f), {
        formType: f.formType, course: f.course, semester: f.semester,
        examEvent: f.examEvent, admissionYear: f.admissionYear, published: f.active !== false,
      });
    });
    requests.forEach(r => {
      const k = groupKey(r);
      if (!map.has(k)) {
        map.set(k, {
          formType: r.formType, course: r.course, semester: r.semester,
          examEvent: r.examEvent, admissionYear: r.admissionYear, published: false,
        });
      }
    });
    return Array.from(map.values());
  };
  const formGroups = buildGroups();

  // ek poore form ka record (submissions + published entry) delete karta hai
  const deleteForm = async (g) => {
    const total = matchRequests(g).length;
    const paid  = paidRequests(g).length;
    if (!window.confirm(
      `⚠️ Delete this exam form record?\n\n${g.course} · ${g.semester} Sem · ${g.formType === 'regular' ? 'Regular' : 'Backlog'}\n${g.examEvent}\n\n${total} submission(s) (${paid} paid) PERMANENTLY delete ho jayenge. Ye wapas nahi aayega.\n\nContinue?`
    )) return;
    setDeleting(true);
    try {
      await API.delete('/results/exam-form/group', {
        data: { formType: g.formType, course: g.course, semester: g.semester, examEvent: g.examEvent },
      });
      if (selected && groupKey(selected) === groupKey(g)) setSelected(null);
      loadData();
    } catch (e) {
      alert('❌ ' + (e.response?.data?.message || 'Delete failed.'));
    } finally { setDeleting(false); }
  };

  // ── selected form ke paid students ka record Excel (.xlsx) me download karta hai ─
  const exportXLSX = async (f) => {
    const rows = paidRequests(f);
    if (!rows.length) { alert('Is form me abhi koi paid student record nahi hai.'); return; }
    const data = rows.map((r, i) => ({
      'Sr No'       : i + 1,
      'Student Name': r.studentName || '',
      'Email'       : r.studentEmail || '',
      'PRN'         : r.prnNumber || '',
      'Student ID'  : r.studentId || '',
      'Course'      : r.course || '',
      'Year'        : r.admissionYear || '',
      'Semester'    : r.semester || '',
      'Form Type'   : r.formType === 'regular' ? 'Regular' : 'Backlog/KT',
      'Exam Event'  : r.examEvent || '',
      'Mobile No'   : r.mobileNo || '',
      'Exam Fee'    : Number(r.feeAmount) || 0,
      'Receipt No'  : r.feeReceiptNo || '',
    }));
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch:6 }, { wch:24 }, { wch:26 }, { wch:16 }, { wch:14 }, { wch:10 },
      { wch:8 }, { wch:9 }, { wch:12 }, { wch:22 }, { wch:14 }, { wch:10 }, { wch:16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    const safe = (s) => String(s || '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
    const fname = `ExamForm_${safe(f.course)}_Sem${safe(f.semester)}_${safe(f.formType)}_${safe(f.examEvent)}.xlsx`;
    XLSX.writeFile(wb, fname);
  };

  // ── Detail view: ek form pe click karne ke baad ──────────────────────────────
  if (selected) {
    const paidAll = paidRequests(selected);
    const q = search.trim().toLowerCase();
    const paid = paidAll.filter(r =>
      !q ||
      r.studentName?.toLowerCase().includes(q) ||
      r.prnNumber?.toLowerCase().includes(q)   ||
      r.studentId?.toLowerCase().includes(q)   ||
      r.mobileNo?.toLowerCase().includes(q)
    );
    const totalCollected = paidAll.reduce((sum, r) => sum + (Number(r.feeAmount) || 0), 0);
    const cols = ['#', 'Student Name', 'PRN', 'Student ID', 'Course', 'Year', 'Sem', 'Mobile No', 'Exam Fee', 'Receipt'];
    const gridCols = '40px 1.6fr 1.1fr 1.1fr 0.7fr 0.9fr 0.6fr 1fr 0.9fr 1.1fr';

    return (
      <div>
        <button onClick={() => { setSelected(null); setSearch(''); }}
          style={{ background:'#fff3e0', color:'#f57c00', border:'1px solid #f57c00', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:18 }}>← Back to Forms</button>

        <div style={{ background:'linear-gradient(135deg,#fff3e0,#fffbf5)', border:`2px solid ${selected.formType==='regular'?'#2E7D32':'#E65100'}`, borderRadius:14, padding:'16px 20px', marginBottom:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <span style={{ fontSize:12, fontWeight:800, padding:'3px 12px', borderRadius:20, color:'#fff', background:selected.formType==='regular'?'#2E7D32':'#E65100' }}>
                {selected.formType==='regular' ? '📋 REGULAR' : '📋 BACKLOG / KT'}
              </span>
              <h3 style={{ color:'#f57c00', margin:'10px 0 2px' }}>{selected.course} · {selected.semester} Semester</h3>
              <p style={{ fontSize:13, color:'#666', margin:0 }}>{selected.admissionYear || '—'} · {selected.examEvent}</p>
            </div>
            <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:24, textAlign:'center' }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, color:'#1565C0' }}>{paidAll.length}</div>
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>PAID STUDENTS</div>
                </div>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, color:'#2E7D32' }}>₹{totalCollected.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>TOTAL COLLECTED</div>
                </div>
              </div>
              <button onClick={() => exportXLSX(selected)} disabled={paidAll.length === 0} title="Download student records as Excel"
                style={{ display:'flex', alignItems:'center', gap:8, background: paidAll.length === 0 ? '#c8e6c9' : 'linear-gradient(135deg,#2E7D32,#43A047)', color:'#fff', border:'none', borderRadius:9, padding:'10px 18px', fontSize:13, fontWeight:700, cursor: paidAll.length === 0 ? 'not-allowed' : 'pointer', boxShadow:'0 2px 8px rgba(46,125,50,.25)', whiteSpace:'nowrap' }}>
                ⬇️ Download Excel
              </button>
            </div>
          </div>
        </div>

        <input type="text" placeholder="🔍 Search by name / PRN / ID / mobile..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:420, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14, marginBottom:14, boxSizing:'border-box' }} />

        {paidAll.length === 0 ? (
          <div style={{ background:'#f8faff', borderRadius:12, padding:40, textAlign:'center', color:'#888' }}>
            🔍 Abhi tak kisi student ne is form ki fees pay nahi ki hai.
          </div>
        ) : (
          <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{ minWidth:980 }}>
              <div style={{ display:'grid', gridTemplateColumns:gridCols, background:'#f57c00', padding:'11px 14px', gap:8 }}>
                {cols.map(h => <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>)}
              </div>
              {paid.map((r, idx) => (
                <div key={r._id || idx} style={{ display:'grid', gridTemplateColumns:gridCols, padding:'10px 14px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                  <span style={{ fontSize:12, color:'#888' }}>{idx+1}</span>
                  <div>
                    <p style={{ fontWeight:600, fontSize:13, margin:0 }}>{r.studentName || '—'}</p>
                    <p style={{ fontSize:10, color:'#888', margin:0 }}>{r.studentEmail || ''}</p>
                  </div>
                  <span style={{ fontSize:12 }}>{r.prnNumber || '—'}</span>
                  <span style={{ fontSize:12 }}>{r.studentId || '—'}</span>
                  <span style={{ fontSize:12 }}>{r.course || '—'}</span>
                  <span style={{ fontSize:12 }}>{r.admissionYear || '—'}</span>
                  <span style={{ fontSize:12 }}>{r.semester || '—'}</span>
                  <span style={{ fontSize:12 }}>{r.mobileNo || '—'}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32' }}>₹{(Number(r.feeAmount)||0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize:11, color:'#666' }}>{r.feeReceiptNo || '—'}</span>
                </div>
              ))}
              {paid.length === 0 && (
                <div style={{ padding:24, textAlign:'center', color:'#aaa', fontSize:13 }}>No match for "{search}".</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List view: saare forms (published + submissions) cards ke roop me ────────
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:6 }}>
        <div>
          <h2 style={{ color:'#f57c00', marginBottom:4 }}>📝 Exam Form Submissions</h2>
          <p style={{ color:'#666', margin:0, fontSize:14 }}>Exam forms ki list. Kisi form pe click karein — us form ko fill karke fees pay karne wale students ka pura data dikhega.</p>
        </div>
        {formGroups.length > 0 && (
          <button onClick={() => setManageMode(m => !m)}
            style={{ background: manageMode ? '#C62828' : '#fff3e0', color: manageMode ? '#fff' : '#f57c00', border:`1px solid ${manageMode ? '#C62828' : '#f57c00'}`, borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
            {manageMode ? '✓ Done' : '✏️ Edit / Delete'}
          </button>
        )}
      </div>
      {manageMode && (
        <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:9, padding:'10px 14px', margin:'14px 0', fontSize:13, color:'#8a6d00' }}>
          🗑️ Edit mode ON — jis form ko delete karna hai uske card pe "Delete" dabaayein. Records permanently delete honge.
        </div>
      )}

      {loading ? <div style={{ textAlign:'center', padding:30, fontSize:'2rem', marginTop:20 }}>⏳</div>
      : formGroups.length === 0 ? (
        <div style={{ background:'#f8faff', borderRadius:12, padding:40, textAlign:'center', color:'#888', marginTop:20 }}>
          Abhi tak koi exam form publish nahi hua hai. Pehle "📤 Publish Exam Form" se form publish karein.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16, marginTop:20 }}>
          {formGroups.map(f => {
            const filled = matchRequests(f).length;
            const paid   = paidRequests(f).length;
            const isReg  = f.formType === 'regular';
            return (
              <div key={groupKey(f)} onClick={() => { if (!manageMode) { setSelected(f); setSearch(''); } }}
                style={{ cursor: manageMode ? 'default' : 'pointer', background:'#fff', borderRadius:14, border:`2px solid ${isReg?'#2E7D32':'#E65100'}`, padding:18, boxShadow:'0 2px 10px rgba(0,0,0,.05)', transition:'transform .12s' }}
                onMouseEnter={e=>{ if(!manageMode) e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:800, padding:'3px 11px', borderRadius:20, color:'#fff', background:isReg?'#2E7D32':'#E65100' }}>
                    {isReg ? 'REGULAR' : 'BACKLOG / KT'}
                  </span>
                  {f.published
                    ? <span style={{ fontSize:22 }}>📋</span>
                    : <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'#eee', color:'#888' }}>UNPUBLISHED</span>}
                </div>
                <h3 style={{ color:'#333', margin:'0 0 4px', fontSize:17 }}>{f.course} · {f.semester} Sem</h3>
                <p style={{ fontSize:12, color:'#888', margin:'0 0 14px' }}>{f.admissionYear || '—'} · {f.examEvent}</p>
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ flex:1, background:'#eef4ff', borderRadius:9, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#1565C0' }}>{filled}</div>
                    <div style={{ fontSize:10, color:'#666', fontWeight:600 }}>FORM FILLED</div>
                  </div>
                  <div style={{ flex:1, background:'#e8f5e9', borderRadius:9, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#2E7D32' }}>{paid}</div>
                    <div style={{ fontSize:10, color:'#666', fontWeight:600 }}>FEES PAID</div>
                  </div>
                </div>
                {manageMode ? (
                  <button onClick={(e) => { e.stopPropagation(); deleteForm(f); }} disabled={deleting}
                    style={{ marginTop:12, width:'100%', background:'#C62828', color:'#fff', border:'none', borderRadius:8, padding:'9px 0', fontSize:13, fontWeight:700, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                    {deleting ? '⏳ Deleting...' : '🗑️ Delete this form'}
                  </button>
                ) : (
                  <div style={{ marginTop:12, fontSize:12, color:'#f57c00', fontWeight:600, textAlign:'right' }}>View paid students →</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// Which semesters belong to each academic year (used by Publish Exam Form).
// Year select karne par sirf us year ke 2 semester hi dikhenge.
const SEM_BY_YEAR = {
  '1st Year': ['1st', '2nd'],
  '2nd Year': ['3rd', '4th'],
  '3rd Year': ['5th', '6th'],
};

// ─── Main ExamSectionDashboard ────────────────────────────────────────────────
const ExamSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [publishedForms, setPublishedForms] = useState([]);
  const [openFormModal, setOpenFormModal] = useState(null);   // 'regular' | 'backlog' | null
  const [formDraft, setFormDraft] = useState({ course: '', year: '', semester: '', examEvent: '' });
  const [settingMsg, setSettingMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchPublished = () => {
    API.get('/results/exam-form/published')
      .then(res => setPublishedForms(res.data.published || []))
      .catch(() => {});
  };

  useEffect(() => { fetchPublished(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleOpenFormClick = (type) => {
    setOpenFormModal(type);
    setFormDraft({ course: '', year: '', semester: '', examEvent: '' });
  };

  // Publish a new exam form for students (course + year + semester + exam event)
  const submitOpenForm = async () => {
    if (!formDraft.course || !formDraft.year || !formDraft.semester || !formDraft.examEvent) {
      alert('Please select Course, Year, Semester, and Exam Event.');
      return;
    }
    setSavingSettings(true);
    try {
      await API.post('/results/exam-form/publish', {
        formType:      openFormModal,
        course:        formDraft.course,
        semester:      formDraft.semester,
        examEvent:     formDraft.examEvent,
        admissionYear: formDraft.year,   // form sirf isi year ke students ko jayega
      });
      fetchPublished();
      setSettingMsg(`✅ ${openFormModal === 'regular' ? 'Regular' : 'Backlog'} exam form published for ${formDraft.course} ${formDraft.year} students!`);
      setTimeout(() => setSettingMsg(''), 4000);
      setOpenFormModal(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      const status = e?.response?.status || 'no status';
      setSettingMsg(`❌ Failed to publish. [${status}] ${msg}`);
    }
    finally { setSavingSettings(false); }
  };

  // Unpublish (remove) an already-published exam form
  const unpublishForm = async (id) => {
    if (!window.confirm('Unpublish this exam form? Students will no longer see it.')) return;
    setSavingSettings(true);
    try {
      await API.delete(`/results/exam-form/published/${id}`);
      fetchPublished();
      setSettingMsg('✅ Exam form unpublished.');
      setTimeout(() => setSettingMsg(''), 4000);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      setSettingMsg(`❌ Failed to unpublish. ${msg}`);
    }
    finally { setSavingSettings(false); }
  };

  const regularPublished = publishedForms.filter(f => f.formType === 'regular');
  const backlogPublished = publishedForms.filter(f => f.formType === 'backlog');

  const tabs = [
    { id: 'home',          label: '🏠 Dashboard' },
    { id: 'publish',       label: '📤 Publish Exam Form' },
    { id: 'form_subs',     label: '📝 Exam Form Submissions' },
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
                <div style={{ background: regularPublished.length ? 'linear-gradient(135deg,#e8f5e9,#f0fff4)' : '#f5f5f5', border: `2px solid ${regularPublished.length ? '#2E7D32' : '#e0e0e0'}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: regularPublished.length ? '#2E7D32' : '#888', margin: '0 0 4px' }}>📋 Regular Exam Form</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{regularPublished.length ? `✅ ${regularPublished.length} form(s) published` : '🔒 None published'}</p>
                    </div>
                    <div style={{ fontSize: 28 }}>{regularPublished.length ? '🟢' : '🔴'}</div>
                  </div>
                </div>
                <div style={{ background: backlogPublished.length ? 'linear-gradient(135deg,#fff3e0,#fffbf0)' : '#f5f5f5', border: `2px solid ${backlogPublished.length ? '#E65100' : '#e0e0e0'}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: backlogPublished.length ? '#E65100' : '#888', margin: '0 0 4px' }}>📋 Backlog / KT Form</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{backlogPublished.length ? `✅ ${backlogPublished.length} form(s) published` : '🔒 None published'}</p>
                    </div>
                    <div style={{ fontSize: 28 }}>{backlogPublished.length ? '🟢' : '🔴'}</div>
                  </div>
                </div>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('publish')}>
                  <div className="dash-card-icon">📤</div><div><h3>Publish</h3><p>Exam Forms</p></div>
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

          {/* ══ PUBLISH EXAM FORM ══ */}
          {activeTab === 'publish' && (
            <div>
              <h2 style={{ color: '#f57c00', marginBottom: 4 }}>📤 Publish Exam Form</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Choose a form type, select Course, Year and Exam Event, then publish it. Only matching course &amp; year students will see it in their dashboard.</p>

              {settingMsg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: settingMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: settingMsg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{settingMsg}</div>}

              {/* Two publish options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2E7D32)', borderRadius: 16, padding: 24, color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.1)' }}>
                  <div style={{ fontSize: 38 }}>📋</div>
                  <h3 style={{ margin: '8px 0 4px', fontSize: 18 }}>Regular Exam Form</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginBottom: 18 }}>For students appearing in the current semester examination.</p>
                  <button onClick={() => handleOpenFormClick('regular')} disabled={savingSettings}
                    style={{ width: '100%', background: '#fff', color: '#2E7D32', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                    ➕ Publish Regular Form
                  </button>
                </div>

                <div style={{ background: 'linear-gradient(135deg,#bf360c,#E65100)', borderRadius: 16, padding: 24, color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.1)' }}>
                  <div style={{ fontSize: 38 }}>📋</div>
                  <h3 style={{ margin: '8px 0 4px', fontSize: 18 }}>Backlog Exam Form</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginBottom: 18 }}>For students having backlog / KT subjects from previous semesters.</p>
                  <button onClick={() => handleOpenFormClick('backlog')} disabled={savingSettings}
                    style={{ width: '100%', background: '#fff', color: '#E65100', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                    ➕ Publish Backlog Form
                  </button>
                </div>
              </div>

              {/* Currently published forms */}
              <h3 style={{ color: '#333', fontSize: 16, marginBottom: 12 }}>📌 Currently Published Forms</h3>
              {publishedForms.length === 0 ? (
                <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 12, padding: 28, textAlign: 'center', color: '#888' }}>
                  No exam forms published yet. Use the buttons above to publish a form.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {publishedForms.map(f => (
                    <div key={f._id} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${f.formType==='regular'?'#a5d6a7':'#ffb74d'}`, borderLeft: `5px solid ${f.formType==='regular'?'#2E7D32':'#E65100'}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: f.formType==='regular'?'#2E7D32':'#E65100', fontSize: 14 }}>
                          {f.formType==='regular' ? '📋 Regular' : '📋 Backlog'} Exam Form
                        </span>
                        <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                          <strong>{f.course}</strong> · {f.semester} Semester · {f.examEvent}
                          {f.admissionYear ? <span style={{ color: '#888' }}> · {f.admissionYear}</span> : null}
                        </div>
                      </div>
                      <button onClick={() => unpublishForm(f._id)} disabled={savingSettings}
                        style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ffcdd2', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        🗑️ Unpublish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

{openFormModal && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ background:'#fff', borderRadius:16, padding:32, minWidth:340, maxWidth:420, boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}>
                <h3 style={{ marginBottom:4, color: openFormModal==='regular' ? '#1b5e20' : '#bf360c' }}>
                  {openFormModal==='regular' ? '📤 Publish Regular Exam Form' : '📤 Publish Backlog/KT Exam Form'}
                </h3>
                <p style={{ color:'#666', fontSize:13, marginBottom:20 }}>Select Course, Year, Semester and Exam Event, then publish for students.</p>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Course *</label>
                <select value={formDraft.course} onChange={e => setFormDraft(p=>({...p, course:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:16, fontSize:14 }}>
                  <option value=''>-- Select Course --</option>
                  <option value='BA'>BA</option>
                  <option value='BSc'>BSc</option>
                </select>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Year *</label>
                <select value={formDraft.year} onChange={e => setFormDraft(p=>({...p, year:e.target.value, semester:''}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:16, fontSize:14 }}>
                  <option value=''>-- Select Year --</option>
                  <option value='1st Year'>1st Year</option>
                  <option value='2nd Year'>2nd Year</option>
                  <option value='3rd Year'>3rd Year</option>
                </select>

                <label style={{ fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>Semester *</label>
                <select value={formDraft.semester} onChange={e => setFormDraft(p=>({...p, semester:e.target.value}))}
                  disabled={!formDraft.year}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd', marginBottom:16, fontSize:14, background: formDraft.year ? '#fff' : '#f5f5f5' }}>
                  <option value=''>{formDraft.year ? '-- Select Semester --' : '-- Select Year first --'}</option>
                  {(SEM_BY_YEAR[formDraft.year] || []).map(s=><option key={s} value={s}>{s} Semester</option>)}
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
                    {savingSettings ? 'Publishing...' : '📤 Publish exam form for students'}
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
          {activeTab === 'form_subs' && <PublishedFormSubmissionsTab />}

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
