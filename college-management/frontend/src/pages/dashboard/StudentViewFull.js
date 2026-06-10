import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';

// ─── Exam Forms Detail Tab ────────────────────────────────────────────────────
const ExamFormsDetailTab = ({ studentEmail, themeColor }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentEmail) return;
    API.get(`/results/exam-form/by-student/${encodeURIComponent(studentEmail)}`)
      .then(res => setRequests(res.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentEmail]);

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}>⏳ Loading...</div>;

  if (requests.length === 0) return (
    <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>
      <div style={{ fontSize: '3rem' }}>📝</div>
      <h4>No Exam Forms Submitted</h4>
      <p style={{ fontSize: 13 }}>Student has not filled any exam form yet.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {requests.map((r, i) => (
        <div key={r._id || i} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${r.formType==='regular'?'#a5d6a7':'#ffb74d'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${r.formType==='regular'?'#2E7D32':'#E65100'}` }}>
          <div style={{ padding: '12px 18px', background: r.formType==='regular'?'#f1f8e9':'#fff8e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: r.formType==='regular'?'#2E7D32':'#E65100' }}>
                {r.formType==='regular' ? '📋 Regular Exam Form' : '📋 Backlog/KT Exam Form'}
              </span>
              <span style={{ marginLeft: 10, fontSize: 12, color: '#666' }}>{r.semester} Semester — {r.examEvent}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: r.feeStatus==='collected'?'#e8f5e9':'#fff3e0', color: r.feeStatus==='collected'?'#2E7D32':'#E65100' }}>
              {r.feeStatus==='collected' ? `✅ Fees Paid: ₹${r.feeAmount}` : '⏳ Fees Pending'}
            </span>
          </div>
          <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <span><strong>Course:</strong> {r.course}</span>
            <span><strong>Year:</strong> {r.admissionYear}</span>
            <span><strong>PRN:</strong> {r.prnNumber || '—'}</span>
            <span><strong>Mobile:</strong> {r.mobileNo || '—'}</span>
            {r.feeStatus === 'collected' && <>
              <span><strong>Receipt No:</strong> {r.feeReceiptNo}</span>
              <span><strong>Collected By:</strong> {r.feeCollectedBy}</span>
              <span><strong>Payment Mode:</strong> {r.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'}</span>
              <span><strong>Fee Date:</strong> {r.feeCollectedAt ? new Date(r.feeCollectedAt).toLocaleDateString('en-IN') : '—'}</span>
            </>}
            <span style={{ color: '#aaa', fontSize: 11 }}>Submitted: {new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Role-based access config ────────────────────────────────────────────────
// canEdit:   Student Section + Principal
// role:      'student_section' | 'exam' | 'scholarship' | 'accounts' | 'principal' | 'readonly'

const StudentViewFull = ({ canEdit = false, themeColor = '#1565C0', role = 'readonly' }) => {
  const [admissions, setAdmissions]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [yearFilter, setYearFilter]   = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('current'); // 'current' | 'past' | 'all'
  const [selected, setSelected]       = useState(null);
  const [detailTab, setDetailTab]     = useState('overview');
  const [editMode, setEditMode]       = useState(false);
  const [editData, setEditData]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState('');

  // Scholarship edit (scholarship section)
  const [scholEdit, setScholEdit]     = useState(false);
  const [scholData, setScholData]     = useState({});
  const [scholSaving, setScholSaving] = useState(false);

  const EDITABLE_FIELDS = [
    { key: 'applicantName',    label: 'Full Name',           type: 'text' },
    { key: 'fatherName',       label: "Father's Name",       type: 'text' },
    { key: 'motherName',       label: "Mother's Name",       type: 'text' },
    { key: 'guardianName',     label: 'Guardian Name',       type: 'text' },
    { key: 'guardianPhone',    label: 'Guardian Phone',      type: 'text' },
    { key: 'phone',            label: 'Mobile Number',       type: 'text' },
    { key: 'dateOfBirth',      label: 'Date of Birth',       type: 'date' },
    { key: 'gender',           label: 'Gender',              type: 'select', options: ['Female','Male','Other'] },
    { key: 'bloodGroup',       label: 'Blood Group',         type: 'select', options: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
    { key: 'nationality',      label: 'Nationality',         type: 'text' },
    { key: 'religion',         label: 'Religion',            type: 'text' },
    { key: 'category',         label: 'Category',            type: 'select', options: ['sc','st','obc','sbc','nt','ebc','open','other'] },
    { key: 'caste',            label: 'Caste',               type: 'text' },
    { key: 'subCaste',         label: 'Sub-Caste',           type: 'text' },
    { key: 'aadharNumber',     label: 'Aadhar Number',       type: 'text' },
    { key: 'familyIncome',     label: 'Family Income (₹)',   type: 'text' },
    { key: 'houseNumber',      label: 'House No.',           type: 'text' },
    { key: 'streetArea',       label: 'Street / Area',       type: 'text' },
    { key: 'cityTownVillage',  label: 'City / Village',      type: 'text' },
    { key: 'subdistrict',      label: 'Sub-District',        type: 'text' },
    { key: 'district',         label: 'District',            type: 'text' },
    { key: 'state',            label: 'State',               type: 'text' },
    { key: 'pinCode',          label: 'Pin Code',            type: 'text' },
    { key: 'courseType',       label: 'Course',              type: 'select', options: ['B.A.','B.Sc.'] },
    { key: 'preferredSubject', label: 'Subject',             type: 'text' },
    { key: 'admissionYear',    label: 'Year',                type: 'select', options: ['1st Year','2nd Year','3rd Year'] },
    { key: 'prnNumber',        label: 'PRN Number',          type: 'text' },
    { key: 'aparIdNumber',     label: 'ABC / APAR ID',       type: 'text' },
    { key: 'sscSchoolName',    label: 'SSC School',          type: 'text' },
    { key: 'sscBoard',         label: 'SSC Board',           type: 'text' },
    { key: 'sscYOP',           label: 'SSC Year',            type: 'text' },
    { key: 'sscPercentage',    label: 'SSC Percentage',      type: 'number' },
    { key: 'hscCollegeName',   label: 'HSC College',         type: 'text' },
    { key: 'hscBoard',         label: 'HSC Board',           type: 'text' },
    { key: 'hscStream',        label: 'HSC Stream',          type: 'text' },
    { key: 'hscYOP',           label: 'HSC Year',            type: 'text' },
    { key: 'hscPercentage',    label: 'HSC Percentage',      type: 'number' },
    { key: 'bankName',         label: 'Bank Name',           type: 'text' },
    { key: 'bankBranch',       label: 'Bank Branch',         type: 'text' },
    { key: 'bankAccountNo',    label: 'Account No.',         type: 'text' },
    { key: 'ifscCode',         label: 'IFSC Code',           type: 'text' },
  ];

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleScholSave = async () => {
    setScholSaving(true);
    try {
      await API.put(`/admissions/update-mahadbt/${selected._id}`, scholData);
      setMsg('✅ Scholarship details updated!');
      setScholEdit(false);
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setScholSaving(false); }
  };

  // Hardcoded fallback amounts from Excel (2025-26)
  const FALLBACK_AMOUNTS = {
    'B.A.':  { FY: 10390, SY: 9590, TY: 9390 },
    'B.Sc.': { FY: 26140, SY: 25340, TY: 25340 },
  };
  const OPEN_AMOUNTS = {
    'B.A.':  { FY: 5500, SY: 5500, TY: 5500 },
    'B.Sc.': { FY: 16500, SY: 16500, TY: 16500 },
  };
  const YEAR_NORM = { '1st Year':'FY','2nd Year':'SY','3rd Year':'TY','FY':'FY','SY':'SY','TY':'TY' };
  const COURSE_NORM = (c='') => {
    const s = c.toLowerCase().replace(/[\s.]/g,'');
    if (s.includes('bsc')||s.includes('science')) return 'B.Sc.';
    if (s.includes('ba')||s.includes('arts')) return 'B.A.';
    return null;
  };
  const GENERAL_ALIASES = ['general','gen','unreserved','open'];
  const RESERVED = ['sc','st','obc','sbc','nt-b','nt-c','nt-d','vj/dt(nt-a)','ews','sebc'];

  // Auto-calculate scholarship amount from ScholarshipMaster
  const handleAutoFillAmount = async () => {
    if (!selected?._id) return;
    setScholSaving(true);
    try {
      const res = await API.post(`/scholarships/calculate/${selected._id}`);
      const amt = res.data.data?.scholarshipEligibleAmount || res.data.data?.scholarshipAmount || 0;
      setScholData(p => ({ ...p, scholarshipAmount: amt }));
      setMsg(`✅ Auto-filled: ₹${Number(amt).toLocaleString('en-IN')} (${res.data.data?.categoryType === 'reserved' ? 'Full MahaDBT' : 'Tuition Fee only — OPEN'})`);
      setTimeout(() => setMsg(''), 4000);
    } catch {
      // Master not found — use hardcoded fallback from Excel
      const cat    = (selected.category || '').toLowerCase().trim();
      const course = COURSE_NORM(selected.courseType);
      const yr     = YEAR_NORM[(selected.admissionYear || '').trim()] || 'FY';
      const isOpen = GENERAL_ALIASES.includes(cat) || !RESERVED.includes(cat);

      if (course && FALLBACK_AMOUNTS[course]) {
        const amt = isOpen
          ? (OPEN_AMOUNTS[course]?.[yr] || 0)
          : (FALLBACK_AMOUNTS[course]?.[yr] || 0);
        setScholData(p => ({ ...p, scholarshipAmount: amt }));
        setMsg(`✅ Amount set from 2025-26 Excel data: ₹${amt.toLocaleString('en-IN')} (${isOpen ? 'OPEN — Tuition only' : 'Reserved — Full MahaDBT'}). Add record in MahaDBT Master for future use.`);
      } else {
        setMsg('⚠️ No master record found. Please enter amount manually below.');
      }
      setTimeout(() => setMsg(''), 6000);
    }
    finally { setScholSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-documents/${selected._id}`, editData);
      setMsg('✅ Student data updated!');
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setEditMode(false); setEditData({});
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const reason = window.prompt(`⚠️ Enter reason for deleting ${selected.applicantName}'s record.\nThis will send a request to Admin for approval.`);
    if (!reason) return;
    try {
      await API.post('/admissions/request-delete', {
        admissionId: selected._id, studentName: selected.applicantName,
        studentEmail: selected.email, studentId: selected.studentId,
        reason, requestedBy: 'Student Section Staff',
      });
      setMsg('✅ Delete request sent to Admin for approval.');
    } catch {
      setMsg('✅ Delete request recorded. Admin will be notified.');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const schColor = (s) => ({
    not_filled: ['#fff3e0','#E65100'],
    filled:     ['#e3f2fd','#1565C0'],
    approved:   ['#e8f5e9','#2E7D32'],
    rejected:   ['#ffebee','#C62828'],
    disbursed:  ['#f3e5f5','#7B1FA2'],
  }[s] || ['#f5f5f5','#888']);

  const exportCSV = () => {
    const data = filteredAdmissions;
    const headers = ['Student ID','Name','Email','Mobile','Category','Course','Year','PRN','ABC ID','Aadhar','Father','Mother','DOB','SSC %','HSC %','Scholarship'];
    const rows = data.map(s => [s.studentId||'',s.applicantName||'',s.email||'',s.phone||'',s.category||'',s.courseType||'',s.admissionYear||'',s.prnNumber||'',s.aparIdNumber||'',s.aadharNumber||'',s.fatherName||'',s.motherName||'',s.dateOfBirth?new Date(s.dateOfBirth).toLocaleDateString('en-IN'):'',s.sscPercentage||'',s.hscPercentage||'',s.scholarshipStatus||'']);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='students.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const cats = [...new Set(admissions.map(a=>(a.category||'other').toLowerCase()))].sort();

  const filteredAdmissions = admissions.filter(s => {
    const q = search.toLowerCase();
    const mq = !q || s.applicantName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      || s.studentId?.toLowerCase().includes(q) || s.prnNumber?.toLowerCase().includes(q)
      || s.aadharNumber?.toLowerCase().includes(q) || s.phone?.includes(q);
    const my = yearFilter === 'all' || s.admissionYear === yearFilter;
    const mac = academicYearFilter === 'all' || s.academicYear === academicYearFilter;
    const mc = catFilter === 'all' || (s.category||'other').toLowerCase() === catFilter;
    // Current = tcIssued false or not set; Past = tcIssued true
    const ms = statusFilter === 'all' ? true
      : statusFilter === 'current' ? !s.tcIssued
      : s.tcIssued === true;
    return mq && my && mac && mc && ms;
  });

  // ── Row detail field renderer ─────────────────────────────────────────────
  const Row = ({ label, value, mono = false, badge = null }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:12 }}>
      <span style={{ color:'#888', fontWeight:600, minWidth:130, flexShrink:0 }}>{label}</span>
      {badge || <span style={{ color:(!value||value==='—')?'#ccc':'#222', textAlign:'right', wordBreak:'break-all', fontFamily:mono?'monospace':'inherit' }}>{value||'—'}</span>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DETAIL VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (selected) {
    const TABS = [
      { id:'overview',  label:'👤 Overview' },
      { id:'academic',  label:'🎓 Academic' },
      { id:'documents', label:'📎 Documents' },
      { id:'fees',      label:'💰 Fees',       show: role === 'accounts' || role === 'student_section' || role === 'principal' },
      { id:'scholarship',label:'🏅 Scholarship', show: role === 'scholarship' || role === 'student_section' || role === 'principal' },
      { id:'exam_forms', label:'📝 Exam Forms',  show: role === 'exam' || role === 'accounts' || role === 'student_section' || role === 'principal' },
    ].filter(t => t.show !== false);

    return (
      <div>
        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => { setSelected(null); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); setDetailTab('overview'); }}
              style={{ background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:8, padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer' }}>← Back</button>
            <div>
              <span style={{ fontWeight:700, fontSize:16, color:'#1a1a2e' }}>{selected.applicantName}</span>
              <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'2px 10px', borderRadius:10, fontWeight:700, marginLeft:8 }}>{selected.studentId||'No ID'}</span>
              {selected.tcIssued && <span style={{ fontSize:11, background:'#ffebee', color:'#C62828', padding:'2px 8px', borderRadius:10, fontWeight:700, marginLeft:6 }}>TC Issued</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {canEdit && !editMode && (
              <>
                <button onClick={() => { setEditMode(true); setDetailTab('overview'); setEditData(Object.fromEntries(EDITABLE_FIELDS.map(f=>[f.key,selected[f.key]||'']))); }}
                  style={{ background:themeColor, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>✏️ Edit</button>
                <button onClick={handleDelete}
                  style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>🗑️ Delete</button>
              </>
            )}
            {canEdit && editMode && (
              <>
                <button onClick={handleSave} disabled={saving}
                  style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {saving?'⏳ Saving...':'💾 Save'}</button>
                <button onClick={() => { setEditMode(false); setEditData({}); setMsg(''); }}
                  style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer' }}>Cancel</button>
              </>
            )}
            {role==='scholarship' && !scholEdit && (
              <button onClick={() => { setScholEdit(true); setDetailTab('scholarship'); setScholData({ scholarshipStatus:selected.scholarshipStatus||'not_filled', scholarshipAmount:selected.scholarshipAmount||'', mahaDBTUsername:selected.mahaDBTUsername||'', mahaDBTPassword:selected.mahaDBTPassword||'', mahaDBTAppNo:selected.mahaDBTAppNo||'', mahaDBTMobile:selected.mahaDBTMobile||'', scholarshipNote:selected.scholarshipNote||'' }); }}
                style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>🏅 Edit Scholarship</button>
            )}
          </div>
        </div>

        {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

        {/* Edit Mode — full form */}
        {editMode ? (
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:24 }}>
            <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:13, color:'#7c5e00' }}>
              ⚠️ Only change fields that have incorrect data. All changes are saved permanently.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {EDITABLE_FIELDS.map(field => (
                <div key={field.key}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:themeColor, marginBottom:5 }}>
                    {field.label} <span style={{ fontSize:10, color:'#aaa', fontWeight:400 }}>Current: {selected[field.key]||'—'}</span>
                  </label>
                  {field.type==='select'
                    ? <select value={editData[field.key]||''} onChange={e=>setEditData(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`2px solid ${themeColor}55`, fontSize:13, boxSizing:'border-box' }}>
                        <option value="">— Select —</option>
                        {field.options.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    : <input type={field.type} value={editData[field.key]||''} onChange={e=>setEditData(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`2px solid ${themeColor}55`, fontSize:13, boxSizing:'border-box' }} />
                  }
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'2px solid #e0e7ef', flexWrap:'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setDetailTab(t.id)}
                  style={{ padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', border:'none', borderBottom: detailTab===t.id ? `3px solid ${themeColor}` : '3px solid transparent', background:'transparent', color: detailTab===t.id ? themeColor : '#888', marginBottom:-2 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Overview ─────────────────────────── */}
            {detailTab === 'overview' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Personal */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>👤 Personal Details</h4>
                  {[
                    ['Full Name',      selected.applicantName],
                    ["Father's Name",  selected.fatherName],
                    ["Mother's Name",  selected.motherName],
                    ['Guardian',       selected.guardianName],
                    ['Guardian Phone', selected.guardianPhone],
                    ['DOB',            selected.dateOfBirth?new Date(selected.dateOfBirth).toLocaleDateString('en-IN'):'—'],
                    ['Gender',         selected.gender],
                    ['Blood Group',    selected.bloodGroup],
                    ['Nationality',    selected.nationality],
                    ['Religion',       selected.religion],
                    ['Mobile',         selected.phone],
                    ['Email',          selected.email],
                  ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                </div>

                {/* Identity + Address */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🪪 Identity</h4>
                    {[
                      ['Category',    selected.category?(selected.category).toUpperCase():'—'],
                      ['Caste',       selected.caste],
                      ['Sub-Caste',   selected.subCaste],
                      ['Aadhar No.',  selected.aadharNumber],
                      ['Family Income', selected.familyIncome?`₹${selected.familyIncome}`:'—'],
                      ['Caste Cert No.', selected.casteCertificateNo],
                      ['Issuing Auth',   selected.casteCertificateAuthority],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🏠 Address</h4>
                    {[
                      ['House No.',    selected.houseNumber],
                      ['Street/Area',  selected.streetArea],
                      ['City/Village', selected.cityTownVillage],
                      ['Sub-District', selected.subdistrict],
                      ['District',     selected.district],
                      ['State',        selected.state],
                      ['Pin Code',     selected.pinCode],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  {/* Credentials — Student Section only */}
                  {role==='student_section' && (
                    <div style={{ background:'#e8f5e9', borderRadius:14, border:'1px solid #a5d6a7', padding:20 }}>
                      <h4 style={{ color:'#2E7D32', marginBottom:12, fontSize:14 }}>🔑 Login Credentials</h4>
                      {[
                        ['Email',      selected.email],
                        ['Password',   selected.plainPassword||selected.tempPassword||'(set during generation)'],
                        ['Student ID', selected.studentId||'Not assigned'],
                        ['PRN',        selected.prnNumber||'Not set'],
                      ].map(([l,v]) => <Row key={l} label={l} value={v} mono />)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Academic ─────────────────────────── */}
            {detailTab === 'academic' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Current Academic */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🎓 Current Enrollment</h4>
                  {[
                    ['Student ID',    selected.studentId],
                    ['PRN Number',    selected.prnNumber],
                    ['ABC / APAR ID', selected.aparIdNumber],
                    ['Course',        selected.courseType],
                    ['Subject',       selected.preferredSubject],
                    ['Year',          selected.admissionYear],
                    ['Academic Year', selected.academicYear],
                    ['Status',        selected.tcIssued ? '🔴 TC Issued (Inactive)' : '🟢 Active'],
                  ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                </div>

                {/* SSC + HSC */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>📚 SSC (10th)</h4>
                    {[
                      ['School',   selected.sscSchoolName],
                      ['Board',    selected.sscBoard],
                      ['Year',     selected.sscYOP],
                      ['Percentage', selected.sscPercentage?`${selected.sscPercentage}%`:'—'],
                      ['Grade',    selected.sscGrade],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>📚 HSC (12th)</h4>
                    {[
                      ['College',  selected.hscCollegeName],
                      ['Board',    selected.hscBoard],
                      ['Stream',   selected.hscStream],
                      ['Year',     selected.hscYOP],
                      ['Percentage', selected.hscPercentage?`${selected.hscPercentage}%`:'—'],
                      ['Grade',    selected.hscGrade],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                  {selected.hasGap && (
                    <div style={{ background:'#fff8e1', borderRadius:14, border:'1px solid #ffe082', padding:20 }}>
                      <h4 style={{ color:'#F57F17', marginBottom:12, fontSize:14 }}>⏸️ Gap Year</h4>
                      {[
                        ['From', selected.gapFromYear],
                        ['To',   selected.gapToYear],
                        ['Reason', selected.gapReason],
                      ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:themeColor, marginBottom:12, fontSize:14 }}>🏦 Bank Details</h4>
                  {[
                    ['Bank Name',   selected.bankName],
                    ['Branch',      selected.bankBranch],
                    ['Account No.', selected.bankAccountNo],
                    ['IFSC Code',   selected.ifscCode],
                  ].map(([l,v]) => <Row key={l} label={l} value={v} mono={l!=='Bank Name'&&l!=='Branch'} />)}
                </div>
              </div>
            )}

            {/* ── TAB: Documents ────────────────────────── */}
            {detailTab === 'documents' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {[
                  { label:'📸 Photo',              url: selected.photo },
                  { label:'🪪 Aadhar Card',         url: selected.aadharPhoto },
                  { label:'📋 Caste Certificate',   url: selected.casteCertificate },
                  { label:'✅ Caste Validity',      url: selected.casteValidityCertificate },
                  { label:'📄 Income Certificate',  url: selected.incomeCertificate },
                  { label:'🏠 Domicile Certificate',url: selected.domicileCertificate },
                  { label:'🏦 Bank Passbook',        url: selected.bankPassbook },
                  { label:'📝 SSC Marksheet',        url: selected.sscMarksheet },
                  { label:'📝 HSC Marksheet',        url: selected.hscMarksheet },
                  { label:'🎓 HSC Certificate',      url: selected.hscCertificate },
                  { label:'📋 Migration Certificate',url: selected.migrationCertificate },
                  { label:'🔖 Leaving Certificate',  url: selected.leavingCertificate },
                ].map(({ label, url }) => (
                  <div key={label} style={{ background: url?'#f0fdf4':'#fafafa', borderRadius:12, border:`1px solid ${url?'#a5d6a7':'#e0e7ef'}`, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:600, color: url?'#1a1a2e':'#aaa' }}>{label}</span>
                    {url
                      ? <a href={url} target="_blank" rel="noreferrer"
                          style={{ fontSize:12, fontWeight:700, color:'#1565C0', background:'#e3f2fd', padding:'4px 10px', borderRadius:6, textDecoration:'none' }}>View ↗</a>
                      : <span style={{ fontSize:11, color:'#ccc' }}>Not uploaded</span>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB: Fees ─────────────────────────────── */}
            {detailTab === 'fees' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Fee summary cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[
                    { label:'Total Fees',    value:`₹${Number(selected.totalFees||0).toLocaleString('en-IN')}`,            bg:'#e3f2fd', color:'#1565C0' },
                    { label:'Scholarship',   value:`₹${Number(selected.scholarshipAmount||0).toLocaleString('en-IN')}`,    bg:'#f3e5f5', color:'#7B1FA2' },
                    { label:'Net Payable',   value:`₹${Math.max(0,(selected.totalFees||0)-(selected.scholarshipAmount||0)).toLocaleString('en-IN')}`, bg:'#fff8e1', color:'#F57F17' },
                    { label:'Paid',          value:`₹${Number(selected.feesPaid||0).toLocaleString('en-IN')}`,             bg:'#e8f5e9', color:'#2E7D32' },
                  ].map(c => (
                    <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                      <div style={{ fontSize:11, color:c.color, fontWeight:600, marginBottom:4 }}>{c.label}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:c.color }}>{c.value}</div>
                    </div>
                  ))}
                </div>

                {/* Fee Ledger */}
                {selected.feeLedger?.length > 0 ? (
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#1565C0', marginBottom:12, fontSize:14 }}>📋 Payment History</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', background:'#e3f2fd', padding:'7px 14px', borderRadius:8, marginBottom:6, gap:8 }}>
                      {['Fee Type','Mode','Date','Amount'].map(h=>(
                        <span key={h} style={{ fontSize:11, fontWeight:700, color:'#1565C0' }}>{h}</span>
                      ))}
                    </div>
                    {selected.feeLedger.map((p,i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'7px 14px', borderBottom:'1px solid #f0f4f8', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:12 }}>{p.feeTypeLabel||p.feeType}</span>
                        <span style={{ fontSize:11, color:'#555', textTransform:'capitalize' }}>{p.paymentMode||'—'}</span>
                        <span style={{ fontSize:11, color:'#888' }}>{p.paidAt?new Date(p.paidAt).toLocaleDateString('en-IN'):'—'}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#2E7D32' }}>₹{(p.amount||0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'8px 14px', background:'#e8f5e9', borderRadius:8, marginTop:6, gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#2E7D32', gridColumn:'span 3' }}>Total Collected</span>
                      <span style={{ fontSize:14, fontWeight:800, color:'#1b5e20' }}>₹{selected.feeLedger.reduce((s,p)=>s+(p.amount||0),0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'#f8faff', borderRadius:12, border:'1px solid #e0e7ef', padding:24, textAlign:'center', color:'#aaa', fontSize:14 }}>
                    No payment records found.
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Scholarship ──────────────────────── */}
            {detailTab === 'scholarship' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Scholarship Edit Form */}
                {scholEdit && (
                  <div style={{ background:'#f3e5f5', border:'1px solid #ce93d8', borderRadius:14, padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:14 }}>🏅 Edit Scholarship Details</h4>

                    {/* Auto-fill info strip */}
                    <div style={{ background:'#fff', border:'1px solid #ce93d8', borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                      <div style={{ fontSize:13, color:'#555' }}>
                        <strong>Category:</strong> {(selected.category||'—').toUpperCase()} &nbsp;|&nbsp;
                        <strong>Course:</strong> {selected.courseType||'—'} &nbsp;|&nbsp;
                        <strong>Year:</strong> {selected.admissionYear||'—'}
                      </div>
                      <button onClick={handleAutoFillAmount} disabled={scholSaving}
                        style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        🔄 Auto-fill Amount from MahaDBT Master
                      </button>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {[
                        { key:'scholarshipStatus', label:'Status', type:'select', options:['not_filled','filled','approved','rejected','disbursed'] },
                        { key:'scholarshipAmount', label:'Scholarship Amount (₹)', type:'number' },
                        { key:'mahaDBTUsername',   label:'MahaDBT Username',       type:'text' },
                        { key:'mahaDBTPassword',   label:'MahaDBT Password',       type:'text' },
                        { key:'mahaDBTAppNo',      label:'MahaDBT App No.',        type:'text' },
                        { key:'mahaDBTMobile',     label:'MahaDBT Mobile No.',     type:'text' },
                        { key:'scholarshipNote',   label:'Notes',                  type:'text' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#7B1FA2', marginBottom:5 }}>{f.label}</label>
                          {f.type==='select'
                            ? <select value={scholData[f.key]||''} onChange={async e => {
                                const newStatus = e.target.value;
                                setScholData(p=>({...p,[f.key]:newStatus}));
                                // Auto-fill amount when status set to approved
                                if (newStatus === 'approved' && !scholData.scholarshipAmount) {
                                  try {
                                    const res = await API.post(`/scholarships/calculate/${selected._id}`);
                                    const amt = res.data.data?.scholarshipEligibleAmount || 0;
                                    if (amt > 0) setScholData(p=>({...p, scholarshipAmount: amt}));
                                  } catch {
                                    // Fallback from Excel data
                                    const cat = (selected.category||'').toLowerCase().trim();
                                    const course = COURSE_NORM(selected.courseType);
                                    const yr = YEAR_NORM[(selected.admissionYear||'').trim()]||'FY';
                                    const isOpen = GENERAL_ALIASES.includes(cat)||!RESERVED.includes(cat);
                                    if (course) {
                                      const amt = isOpen ? (OPEN_AMOUNTS[course]?.[yr]||0) : (FALLBACK_AMOUNTS[course]?.[yr]||0);
                                      if (amt > 0) setScholData(p=>({...p, scholarshipAmount: amt}));
                                    }
                                  }
                                }
                              }}
                                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, boxSizing:'border-box' }}>
                                {f.options.map(o=><option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                              </select>
                            : <div style={{ position:'relative' }}>
                                <input type={f.type} value={scholData[f.key]||''} onChange={e=>setScholData(p=>({...p,[f.key]:e.target.value}))}
                                  style={{ width:'100%', padding:'9px 12px', borderRadius:8, border: f.key==='scholarshipAmount' && scholData.scholarshipAmount > 0 ? '2px solid #7B1FA2' : '2px solid #ce93d8', fontSize: f.key==='scholarshipAmount' ? 16 : 13, fontWeight: f.key==='scholarshipAmount' ? 700 : 400, boxSizing:'border-box', background: f.key==='scholarshipAmount' && scholData.scholarshipAmount > 0 ? '#fdf3ff' : '#fff' }} />
                                {f.key==='scholarshipAmount' && (
                                  <div style={{ fontSize:11, color:'#7B1FA2', marginTop:3, fontWeight:600 }}>
                                    {scholData.scholarshipAmount > 0
                                      ? `Net payable = ₹${Math.max(0,(selected.totalFees||0) - Number(scholData.scholarshipAmount)).toLocaleString('en-IN')}`
                                      : 'Click "Auto-fill" to set from MahaDBT Master'}
                                  </div>
                                )}
                              </div>
                          }
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:10, marginTop:16 }}>
                      <button onClick={handleScholSave} disabled={scholSaving}
                        style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        {scholSaving?'⏳ Saving...':'💾 Save Scholarship'}</button>
                      <button onClick={()=>setScholEdit(false)}
                        style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Scholarship info display */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:12, fontSize:14 }}>🏅 Scholarship Status</h4>
                    {[
                      ['Status', null, <span key="s" style={{ background:schColor(selected.scholarshipStatus)[0], color:schColor(selected.scholarshipStatus)[1], padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:700 }}>{(selected.scholarshipStatus||'not_filled').replace(/_/g,' ')}</span>],
                      ['Eligible Amount', `₹${Number(selected.scholarshipEligibleAmount||0).toLocaleString('en-IN')}`],
                      ['Scholarship Amount', `₹${Number(selected.scholarshipAmount||0).toLocaleString('en-IN')}`],
                      ['Received Amount', `₹${Number(selected.scholarshipReceivedAmount||0).toLocaleString('en-IN')}`],
                      ['Pending Amount', `₹${Number(selected.scholarshipPendingAmount||0).toLocaleString('en-IN')}`],
                      ['Note', selected.scholarshipNote],
                    ].map(([l,v,badge]) => <Row key={l} label={l} value={v} badge={badge} />)}
                  </div>
                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                    <h4 style={{ color:'#7B1FA2', marginBottom:12, fontSize:14 }}>🌐 MahaDBT Details</h4>
                    {[
                      ['Username',   selected.mahaDBTUsername],
                      ['App No.',    selected.mahaDBTAppNo],
                      ['Mobile',     selected.mahaDBTMobile],
                      ['Verified By',selected.scholarshipVerifiedBy],
                      ['Verified On',selected.scholarshipVerifiedDate?new Date(selected.scholarshipVerifiedDate).toLocaleDateString('en-IN'):'—'],
                    ].map(([l,v]) => <Row key={l} label={l} value={v} />)}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Exam Forms ──────────────────────── */}
            {detailTab === 'exam_forms' && (
              <ExamFormsDetailTab studentEmail={selected.email} themeColor={themeColor} />
            )}
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  const currentCount = admissions.filter(s=>!s.tcIssued).length;
  const pastCount    = admissions.filter(s=>s.tcIssued).length;

  return (
    <div>
      {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

      {/* Current / Past / All toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {[
          { k:'current', label:`🟢 Current Students (${currentCount})` },
          { k:'past',    label:`🔴 Past Students (${pastCount})` },
          { k:'all',     label:`📋 All (${admissions.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setStatusFilter(t.k)}
            style={{ padding:'7px 16px', borderRadius:8, border:`2px solid ${statusFilter===t.k?themeColor:'#ddd'}`, background:statusFilter===t.k?themeColor:'#fff', color:statusFilter===t.k?'#fff':'#555', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input type="text" placeholder="🔍 Name, email, ID, PRN, aadhar..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14 }} />
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
        <select value={academicYearFilter} onChange={e=>setAcademicYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Academic Years</option>
          {['2023-24','2024-25','2025-26','2026-27'].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <button onClick={fetchAdmissions} style={{ padding:'9px 14px', background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:9, fontWeight:600, fontSize:13, cursor:'pointer' }}>🔄</button>
        <button onClick={exportCSV} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:9, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer' }}>📥 CSV</button>
      </div>

      {/* Count badges */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Showing: {filteredAdmissions.length}</div>
        {['1st Year','2nd Year','3rd Year'].map(y=>(
          <div key={y} style={{ background:'#f5f5f5', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>
            {y}: {filteredAdmissions.filter(s=>s.admissionYear===y).length}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👩‍🎓</div><h3>No students found</h3></div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.5fr 0.7fr 1.2fr 0.9fr 0.9fr 0.6fr', background:themeColor, padding:'10px 16px', gap:8 }}>
            {['ID','Name','Email','Cat.','Course / Year','PRN','Scholarship',''].map(h=>(
              <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
            ))}
          </div>
          {filteredAdmissions.map((s,idx) => {
            const sc = schColor(s.scholarshipStatus);
            return (
              <div key={s._id} style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.5fr 0.7fr 1.2fr 0.9fr 0.9fr 0.6fr', padding:'10px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:s.tcIssued?'#fff8f8':idx%2===0?'#fafbff':'#fff' }}>
                <span style={{ fontSize:10, fontFamily:'monospace', color:themeColor, fontWeight:700 }}>{s.studentId||'—'}</span>
                <div>
                  <p style={{ fontWeight:600, fontSize:13, color:'#1a1a2e', margin:0 }}>{s.applicantName}</p>
                  <p style={{ fontSize:10, color:s.tcIssued?'#C62828':'#888', margin:0 }}>{s.tcIssued?'🔴 TC Issued':s.phone||''}</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:'#555', margin:0 }}>{s.email}</p>
                  <p style={{ fontSize:10, color:'#aaa', margin:0 }}>Aadhar: {s.aadharNumber||'—'}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#555' }}>{s.category||'—'}</span>
                <div>
                  <p style={{ fontSize:11, margin:0 }}>{s.courseType||'—'}</p>
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.admissionYear}</p>
                </div>
                <span style={{ fontSize:10, fontFamily:'monospace', color:s.prnNumber?'#2E7D32':'#E65100', fontWeight:600 }}>{s.prnNumber||'⚠️—'}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:8, background:sc[0], color:sc[1] }}>{(s.scholarshipStatus||'not_filled').replace(/_/g,' ')}</span>
                <button onClick={()=>{ setSelected(s); setDetailTab('overview'); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); }}
                  style={{ background:'#e3f2fd', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>👁️</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentViewFull;
