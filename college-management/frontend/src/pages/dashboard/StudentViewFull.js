import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';

// ─── Role-based access config ────────────────────────────────────────────────
// canEdit:   Student Section + Principal can edit/delete
// role:      controls which action buttons appear in detail view
// 'student'  → credentials visible
// 'exam'     → result/attendance actions
// 'scholarship' → scholarship status edit
// 'accounts' → fee ledger visible

const StudentViewFull = ({ canEdit = false, themeColor = '#1565C0', role = 'readonly' }) => {
  const [admissions, setAdmissions]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [yearFilter, setYearFilter]   = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [selected, setSelected]       = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [editData, setEditData]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [msg, setMsg]                 = useState('');

  // Scholarship edit (for staff_scholarship)
  const [scholEdit, setScholEdit]     = useState(false);
  const [scholData, setScholData]     = useState({});
  const [scholSaving, setScholSaving] = useState(false);

  const EDITABLE_FIELDS = [
    { key: 'applicantName',    label: 'Full Name',          type: 'text' },
    { key: 'fatherName',       label: "Father's Name",      type: 'text' },
    { key: 'motherName',       label: "Mother's Name",      type: 'text' },
    { key: 'phone',            label: 'Mobile Number',      type: 'text' },
    { key: 'address',          label: 'Address',            type: 'text' },
    { key: 'aadharNumber',     label: 'Aadhar Number',      type: 'text' },
    { key: 'aparIdNumber',     label: 'ABC / APAR ID',      type: 'text' },
    { key: 'prnNumber',        label: 'PRN Number',         type: 'text' },
    { key: 'courseType',       label: 'Course',             type: 'text' },
    { key: 'preferredSubject', label: 'Subject',            type: 'text' },
    { key: 'admissionYear',    label: 'Year',               type: 'select', options: ['1st Year','2nd Year','3rd Year'] },
    { key: 'category',         label: 'Category',           type: 'select', options: ['sc','st','obc','sbc','nt','ebc','open','other'] },
    { key: 'caste',            label: 'Caste',              type: 'text' },
    { key: 'religion',         label: 'Religion',           type: 'text' },
    { key: 'familyIncome',     label: 'Family Income (₹)',  type: 'text' },
    { key: 'sscPercentage',    label: 'SSC Percentage',     type: 'number' },
    { key: 'hscPercentage',    label: 'HSC Percentage',     type: 'number' },
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

  // ── Scholarship save ──────────────────────────────────────────────────────
  const handleScholSave = async () => {
    setScholSaving(true);
    try {
      await API.put(`/admissions/update-mahadbt/${selected._id}`, scholData);
      setMsg('✅ Scholarship details updated!');
      setScholEdit(false);
      await fetchAdmissions();
      const res = await API.get('/admissions/staff-view/all');
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setScholSaving(false); }
  };

  // ── Student Section edit save ─────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-documents/${selected._id}`, editData);
      setMsg('✅ Student data updated!');
      await fetchAdmissions();
      const res = await API.get('/admissions/staff-view/all');
      const updated = (res.data.admissions || []).find(a => a._id === selected._id);
      if (updated) setSelected(updated);
      setEditMode(false); setEditData({});
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`⚠️ Delete ${selected.applicantName}'s record? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await API.delete(`/admissions/${selected._id}`);
      setMsg('✅ Student record deleted.');
      setSelected(null);
      fetchAdmissions();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setDeleting(false); }
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
    const headers = ['Student ID','Name','Email','Mobile','Category','Caste','Course','Subject','Year','PRN','ABC ID','Aadhar','Father','Mother','DOB','Address','Family Income','SSC %','HSC %','Scholarship'];
    const rows = data.map(s => [s.studentId||'',s.applicantName||'',s.email||'',s.phone||'',s.category||'',s.caste||'',s.courseType||'',s.preferredSubject||'',s.admissionYear||'',s.prnNumber||'',s.aparIdNumber||'',s.aadharNumber||'',s.fatherName||'',s.motherName||'',s.dateOfBirth?new Date(s.dateOfBirth).toLocaleDateString('en-IN'):'',s.address||'',s.familyIncome||'',s.sscPercentage||'',s.hscPercentage||'',s.scholarshipStatus||'']);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='students.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const cats = [...new Set(admissions.map(a=>(a.category||'other').toLowerCase()))].sort();
  const filteredAdmissions = admissions.filter(s => {
    const q=search.toLowerCase();
    const mq=!q||s.applicantName?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q)||s.studentId?.toLowerCase().includes(q)||s.prnNumber?.toLowerCase().includes(q)||s.aadharNumber?.toLowerCase().includes(q)||s.phone?.includes(q);
    const my=yearFilter==='all'||s.admissionYear===yearFilter;
    const mc=catFilter==='all'||(s.category||'other').toLowerCase()===catFilter;
    return mq&&my&&mc;
  });

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────
  if (selected) {
    const sc = schColor(selected.scholarshipStatus);
    return (
      <div>
        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => { setSelected(null); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); }}
              style={{ background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>← Back</button>
            <h3 style={{ color:themeColor, margin:0 }}>👩‍🎓 {selected.applicantName}</h3>
            <span style={{ fontSize:11, background:'#e3f2fd', color:'#1565C0', padding:'2px 10px', borderRadius:10, fontWeight:700 }}>{selected.studentId||'No ID'}</span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {canEdit && !editMode && (
              <>
                <button onClick={() => { setEditMode(true); setEditData(Object.fromEntries(EDITABLE_FIELDS.map(f=>[f.key,selected[f.key]||'']))); }}
                  style={{ background:themeColor, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>✏️ Edit</button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {deleting?'⏳...':'🗑️ Delete'}</button>
              </>
            )}
            {canEdit && editMode && (
              <>
                <button onClick={handleSave} disabled={saving}
                  style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {saving?'⏳ Saving...':'💾 Save Changes'}</button>
                <button onClick={() => { setEditMode(false); setEditData({}); setMsg(''); }}
                  style={{ background:'#eee', color:'#333', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
              </>
            )}
            {role==='scholarship' && !scholEdit && (
              <button onClick={() => { setScholEdit(true); setScholData({ scholarshipStatus:selected.scholarshipStatus||'not_filled', scholarshipAmount:selected.scholarshipAmount||'', mahaDBTUsername:selected.mahaDBTUsername||'', mahaDBTPassword:selected.mahaDBTPassword||'', mahaDBTAppNo:selected.mahaDBTAppNo||'', scholarshipNote:selected.scholarshipNote||'' }); }}
                style={{ background:'#7B1FA2', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>🏅 Edit Scholarship</button>
            )}
          </div>
        </div>

        {msg && <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:14, fontWeight:500, fontSize:14, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}

        {/* Scholarship edit panel */}
        {scholEdit && (
          <div style={{ background:'#f3e5f5', border:'1px solid #ce93d8', borderRadius:14, padding:20, marginBottom:20 }}>
            <h4 style={{ color:'#7B1FA2', marginBottom:14 }}>🏅 Edit Scholarship Details</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { key:'scholarshipStatus', label:'Status', type:'select', options:['not_filled','filled','approved','rejected','disbursed'] },
                { key:'scholarshipAmount', label:'Scholarship Amount (₹)', type:'number' },
                { key:'mahaDBTUsername',   label:'MahaDBT Username',        type:'text' },
                { key:'mahaDBTPassword',   label:'MahaDBT Password',        type:'text' },
                { key:'mahaDBTAppNo',      label:'MahaDBT App No.',         type:'text' },
                { key:'scholarshipNote',   label:'Notes',                   type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#7B1FA2', marginBottom:5 }}>{f.label}</label>
                  {f.type==='select'
                    ? <select value={scholData[f.key]||''} onChange={e=>setScholData(p=>({...p,[f.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, boxSizing:'border-box' }}>
                        {f.options.map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                      </select>
                    : <input type={f.type} value={scholData[f.key]||''} onChange={e=>setScholData(p=>({...p,[f.key]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'2px solid #ce93d8', fontSize:13, boxSizing:'border-box' }} />
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

        {/* Edit mode */}
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
          /* Read view */
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Personal Details */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:themeColor, marginBottom:14, fontSize:14 }}>👤 Personal Details</h4>
              {[
                ['Full Name',      selected.applicantName],
                ["Father's Name",  selected.fatherName],
                ["Mother's Name",  selected.motherName],
                ['DOB',            selected.dateOfBirth?new Date(selected.dateOfBirth).toLocaleDateString('en-IN'):'—'],
                ['Gender',         selected.gender],
                ['Religion',       selected.religion],
                ['Category',       (selected.category||'—').toUpperCase()],
                ['Caste',          selected.caste],
                ['Mobile',         selected.phone],
                ['Email',          selected.email],
                ['Aadhar',         selected.aadharNumber],
                ['Address',        selected.address],
                ['Family Income',  selected.familyIncome?`₹${selected.familyIncome}`:'—'],
              ].filter(([,v])=>v&&v!=='—').map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                  <span style={{ color:'#888', fontWeight:600, minWidth:120 }}>{l}</span>
                  <span style={{ color:'#222', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Academic Details */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                <h4 style={{ color:themeColor, marginBottom:14, fontSize:14 }}>🎓 Academic Details</h4>
                {[
                  ['Student ID',   selected.studentId],
                  ['PRN Number',   selected.prnNumber],
                  ['ABC / APAR ID',selected.aparIdNumber],
                  ['Course',       selected.courseType],
                  ['Subject',      selected.preferredSubject],
                  ['Year',         selected.admissionYear],
                  ['SSC %',        selected.sscPercentage?`${selected.sscPercentage}%`:'—'],
                  ['HSC %',        selected.hscPercentage?`${selected.hscPercentage}%`:'—'],
                ].filter(([,v])=>v&&v!=='—').map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                    <span style={{ color:'#888', fontWeight:600, minWidth:120 }}>{l}</span>
                    <span style={{ color:'#222', textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Scholarship details */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                <h4 style={{ color:'#7B1FA2', marginBottom:14, fontSize:14 }}>🏅 Scholarship</h4>
                {[
                  ['Status',          <span style={{ background:sc[0], color:sc[1], padding:'2px 10px', borderRadius:10, fontSize:12, fontWeight:700 }}>{(selected.scholarshipStatus||'not_filled').replace('_',' ')}</span>],
                  ['Amount',          selected.scholarshipAmount>0?`₹${Number(selected.scholarshipAmount).toLocaleString('en-IN')}`:'—'],
                  ['MahaDBT Username',selected.mahaDBTUsername],
                  ['MahaDBT App No.', selected.mahaDBTAppNo],
                ].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                    <span style={{ color:'#888', fontWeight:600, minWidth:120 }}>{l}</span>
                    <span style={{ color:'#222', textAlign:'right' }}>{v||'—'}</span>
                  </div>
                ))}
              </div>

              {/* Credentials — only for Student Section staff */}
              {role==='student_section' && (
                <div style={{ background:'#e8f5e9', borderRadius:14, border:'1px solid #a5d6a7', padding:20 }}>
                  <h4 style={{ color:'#2E7D32', marginBottom:14, fontSize:14 }}>🔑 Login Credentials</h4>
                  {[
                    ['Email (Username)', selected.email],
                    ['Password',         selected.plainPassword || selected.tempPassword || '(set during generation)'],
                    ['Student ID',       selected.studentId || 'Not assigned yet'],
                    ['PRN (if set)',      selected.prnNumber || 'Not set yet'],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #c8e6c9', fontSize:13 }}>
                      <span style={{ color:'#555', fontWeight:600, minWidth:140 }}>{l}</span>
                      <span style={{ color:'#1b5e20', fontWeight:700, fontFamily:'monospace', background: l==='Password'?'#fff3e0':'transparent', padding: l==='Password'?'2px 8px':'0', borderRadius: l==='Password'?6:0 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10, background:'#fff', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#888' }}>
                    💡 Student logs in with their email and password above.
                  </div>
                </div>
              )}

              {/* Fee ledger — for Accounts */}
              {role==='accounts' && selected.feeLedger?.length > 0 && (
                <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
                  <h4 style={{ color:'#1565C0', marginBottom:14, fontSize:14 }}>💰 Fee Payments</h4>
                  {selected.feeLedger.map((p,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f4f8', fontSize:12 }}>
                      <span style={{ color:'#555' }}>{p.feeTypeLabel||p.feeType} {p.paidAt?`— ${new Date(p.paidAt).toLocaleDateString('en-IN')}`:''}</span>
                      <span style={{ fontWeight:700, color:'#2E7D32' }}>₹{(p.amount||0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      {msg && <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:14, fontWeight:500, fontSize:14, background:msg.startsWith('✅')?'#e8f5e9':'#ffebee', color:msg.startsWith('✅')?'#2E7D32':'#C62828' }}>{msg}</div>}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input type="text" placeholder="🔍 Name, email, ID, PRN, aadhar..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:9, border:'1px solid #ddd', fontSize:14 }} />
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid #ddd', fontSize:13 }}>
          <option value="all">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <button onClick={fetchAdmissions} style={{ padding:'9px 14px', background:'#f0f4ff', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:9, fontWeight:600, fontSize:13, cursor:'pointer' }}>🔄</button>
        <button onClick={exportCSV} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:9, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer' }}>📥 CSV</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Total: {admissions.length}</div>
        <div style={{ background:'#f5f5f5', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Showing: {filteredAdmissions.length}</div>
        {['1st Year','2nd Year','3rd Year'].map(y=>(
          <div key={y} style={{ background:'#f5f5f5', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>
            {y}: {admissions.filter(s=>s.admissionYear===y).length}
          </div>
        ))}
        {canEdit && <div style={{ background:'#e8f5e9', color:'#2E7D32', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>✏️ Edit & Delete Enabled</div>}
        {role==='student_section' && <div style={{ background:'#e8f5e9', color:'#2E7D32', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>🔑 Credentials Visible</div>}
        {role==='scholarship' && <div style={{ background:'#f3e5f5', color:'#7B1FA2', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>🏅 Scholarship Edit Enabled</div>}
      </div>

      {loading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
      : filteredAdmissions.length===0 ? <div className="empty-state"><div className="empty-icon">👩‍🎓</div><h3>No students found</h3></div>
      : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.8fr 0.7fr 1.1fr 0.9fr 0.9fr 0.6fr', background:themeColor, padding:'12px 16px', gap:8 }}>
            {['ID','Name','Email','Cat.','Course / Year','PRN','Scholarship',''].map(h=>(
              <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
            ))}
          </div>
          {filteredAdmissions.map((s,idx)=>{
            const sc=schColor(s.scholarshipStatus);
            return (
              <div key={s._id} style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr 1.8fr 0.7fr 1.1fr 0.9fr 0.9fr 0.6fr', padding:'10px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background:idx%2===0?'#fafbff':'#fff' }}>
                <span style={{ fontSize:10, fontFamily:'monospace', color:themeColor, fontWeight:700 }}>{s.studentId||'—'}</span>
                <div>
                  <p style={{ fontWeight:600, fontSize:13, color:'#1a1a2e', margin:0 }}>{s.applicantName}</p>
                  <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.phone||''}</p>
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
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:8, background:sc[0], color:sc[1] }}>{(s.scholarshipStatus||'not_filled').replace('_',' ')}</span>
                <button onClick={()=>{ setSelected(s); setEditMode(false); setEditData({}); setScholEdit(false); setMsg(''); }}
                  style={{ background:'#e3f2fd', color:themeColor, border:`1px solid ${themeColor}44`, borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>👁️</button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop:12, background:'#f8faff', border:'1px solid #e0e7ef', borderRadius:10, padding:'10px 16px', fontSize:12, color:'#666' }}>
        {role==='student_section' && '🔑 Student Section: Edit, Delete & Credentials visible'}
        {role==='scholarship' && '🏅 Scholarship Section: Scholarship status & MahaDBT edit enabled'}
        {role==='accounts' && '💰 Accounts Section: Fee ledger visible in student detail'}
        {role==='exam' && '📝 Exam Section: Read-only student view'}
        {role==='principal' && '✏️ Principal: Edit & Delete enabled'}
        {role==='readonly' && '🔒 Read-only view'}
      </div>
    </div>
  );
};

export default StudentViewFull;
