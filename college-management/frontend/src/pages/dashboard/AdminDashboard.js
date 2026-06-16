import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import AdminReports from '../../components/AdminReports';
import StudentViewFull from './StudentViewFull';

// ─── Admin Delete Requests Tab ───────────────────────────────────────────────
const AdminDeleteRequestsTab = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  const fetch = () => {
    setLoading(true);
    API.get('/admissions/pending-deletes')
      .then(res => setPending(res.data.pending || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/admissions/admin-delete/${id}`);
      setMsg(`✅ ${name} deleted.`);
      fetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/admissions/update-documents/${id}`, { deleteRequested: false, deleteReason: '', deleteRequestedBy: '', deleteRequestedAt: null });
      setMsg('✅ Delete request rejected.');
      fetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ Failed'); }
  };

  return (
    <div>
      <h2 style={{ color: '#C62828', marginBottom: 4 }}>🗑️ Delete Requests</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student Section staff has requested deletion of these records. Review and approve/reject.</p>
      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14, background: msg.startsWith('✅')?'#e8f5e9':'#ffebee', color: msg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight: 500 }}>{msg}</div>}
      {loading ? <div style={{textAlign:'center',padding:20,fontSize:'2rem'}}>⏳</div>
      : pending.length === 0 ? (
        <div style={{ background:'#f8faff', borderRadius:12, padding:30, textAlign:'center', color:'#888' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>✅</div>
          <p>No pending delete requests.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {pending.map((p,i) => (
            <div key={p._id||i} style={{ background:'#fff', borderRadius:12, border:'2px solid #ef9a9a', padding:18, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:10 }}>
                <div>
                  <h4 style={{ color:'#C62828', fontSize:15, margin:'0 0 4px' }}>{p.applicantName}</h4>
                  <p style={{ fontSize:12, color:'#555', margin:'0 0 2px' }}>{p.email} · ID: {p.studentId||'—'}</p>
                  <p style={{ fontSize:12, color:'#777', margin:'0 0 2px' }}><b>Reason:</b> {p.deleteReason||'Not specified'}</p>
                  <p style={{ fontSize:11, color:'#aaa', margin:0 }}>
                    Requested by: {p.deleteRequestedBy} · {p.deleteRequestedAt ? new Date(p.deleteRequestedAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleApprove(p._id, p.applicantName)}
                    style={{ background:'#C62828', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    ✅ Approve Delete
                  </button>
                  <button onClick={() => handleReject(p._id)}
                    style={{ background:'#e8f5e9', color:'#2E7D32', border:'1px solid #a5d6a7', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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

// ── Admin Messaging Component ─────────────────────────────────────────────────
const AdminMessagingTab = ({ user, showMessage }) => {
  const [admissions, setAdmissions] = React.useState([]);
  const [staff, setStaff]           = React.useState([]);
  const [loading, setLoading]       = React.useState(false);
  const [subject, setSubject]       = React.useState('');
  const [message, setMessage]       = React.useState('');
  const [target, setTarget]         = React.useState('all_students'); // all_students | all_staff | specific
  const [selected, setSelected]     = React.useState([]); // specific emails
  const [sending, setSending]       = React.useState(false);
  const [msg, setMsg]               = React.useState('');
  const [search, setSearch]         = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/admissions/staff-view/all').catch(() => ({ data: { admissions: [] } })),
      API.get('/auth/staff').catch(() => ({ data: { staff: [] } })),
    ]).then(([admRes, staffRes]) => {
      setAdmissions(admRes.data.admissions || []);
      setStaff(staffRes.data.staff || []);
    }).finally(() => setLoading(false));
  }, []);

  const getRecipients = () => {
    if (target === 'all_students') return admissions.map(a => ({ email: a.email, name: a.applicantName }));
    if (target === 'all_staff')    return staff.map(s => ({ email: s.email, name: s.name }));
    return selected.map(email => {
      const adm = admissions.find(a => a.email === email);
      const st  = staff.find(s => s.email === email);
      return { email, name: adm?.applicantName || st?.name || email };
    });
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) { setMsg('❌ Subject and message are required.'); return; }
    const recipients = getRecipients();
    if (recipients.length === 0) { setMsg('❌ No recipients selected.'); return; }
    if (!window.confirm(`Send message to ${recipients.length} recipient(s)?`)) return;

    setSending(true);
    try {
      const res = await API.post('/auth/send-message', { recipients, subject, message });

      // Persist staff-directed messages as dashboard notices so they appear in
      // the staff dashboards' Messages box (e.g. Accounts Section).
      if (target === 'all_staff' || target === 'staff_student' || target === 'specific') {
        await API.post('/notices', {
          title: subject,
          content: message,
          targetAudience: target === 'all_staff' ? 'staff' : 'staff_student',
          specificRecipients: target === 'specific' ? recipients.map(r => r.email) : [],
          category: 'general',
          isHighlighted: true,
          isActive: true,
        });
      }

      setMsg(`✅ Sent to ${res.data.sent} recipient(s).${res.data.failed > 0 ? ` ${res.data.failed} failed.` : ''}`);
      setSubject(''); setMessage(''); setSelected([]);
      setTimeout(() => setMsg(''), 5000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to send')); }
    finally { setSending(false); }
  };

  const allPeople = [
    ...admissions.map(a => ({ email: a.email, name: a.applicantName, type: 'student', course: a.courseType, year: a.admissionYear })),
    ...staff.map(s => ({ email: s.email, name: s.name, type: 'staff', role: s.role })),
  ].filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()));

  const recipients = getRecipients();

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>✉️ Send Message</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Send email messages to students and staff directly from the portal.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left — compose */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 24 }}>
          <h4 style={{ color: '#1565C0', marginBottom: 16 }}>📝 Compose Message</h4>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Send To</label>
            <select value={target} onChange={e => { setTarget(e.target.value); setSelected([]); }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="all_students">👩‍🎓 All Students ({admissions.length})</option>
              <option value="all_staff">👨‍💼 All Staff ({staff.length})</option>
              <option value="specific">🎯 Specific People</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Subject *</label>
            <input type="text" placeholder="e.g. Exam Schedule Notice" value={subject} onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Message *</label>
            <textarea rows="6" placeholder="Type your message here..." value={message} onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#1565C0' }}>
            📨 Will be sent to: <strong>{recipients.length} recipient(s)</strong>
            {target === 'all_students' && ` — All ${admissions.length} students`}
            {target === 'all_staff' && ` — All ${staff.length} staff members`}
          </div>

          <button onClick={handleSend} disabled={sending || !subject || !message || recipients.length === 0}
            style={{ width: '100%', background: sending ? '#aaa' : '#1565C0', color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: (!subject || !message || recipients.length === 0) ? 0.6 : 1 }}>
            {sending ? '⏳ Sending...' : `✉️ Send to ${recipients.length} Recipient(s)`}
          </button>
        </div>

        {/* Right — select specific */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 24 }}>
          <h4 style={{ color: '#1565C0', marginBottom: 14 }}>
            {target === 'specific' ? '🎯 Select Recipients' : '👥 Preview Recipients'}
          </h4>

          <input type="text" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          {loading ? <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>⏳ Loading...</div> : (
            <div style={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #f0f4f8', borderRadius: 8 }}>
              {allPeople.slice(0, 50).map((p, i) => {
                const isSelected = target === 'specific' ? selected.includes(p.email) :
                  (target === 'all_students' ? p.type === 'student' : p.type === 'staff');
                return (
                  <div key={i} onClick={() => {
                    if (target !== 'specific') return;
                    setSelected(prev => prev.includes(p.email) ? prev.filter(e => e !== p.email) : [...prev, p.email]);
                  }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid #f0f4f8', cursor: target === 'specific' ? 'pointer' : 'default', background: isSelected ? '#e8f5e9' : '#fff' }}>
                    <span style={{ fontSize: 14 }}>{isSelected ? '✅' : (target === 'specific' ? '⬜' : '•')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: '#1a1a2e' }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{p.email} · {p.type === 'student' ? `${p.course} ${p.year}` : p.role}</p>
                    </div>
                    <span style={{ fontSize: 10, background: p.type === 'student' ? '#e3f2fd' : '#e8f5e9', color: p.type === 'student' ? '#1565C0' : '#2E7D32', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
                      {p.type}
                    </span>
                  </div>
                );
              })}
              {allPeople.length > 50 && <div style={{ padding: '8px 12px', fontSize: 12, color: '#888', textAlign: 'center' }}>Showing 50 of {allPeople.length}. Search to filter.</div>}
            </div>
          )}

          {target === 'specific' && selected.length > 0 && (
            <div style={{ marginTop: 10, background: '#e8f5e9', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>
              ✅ {selected.length} recipient(s) selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ─── Admin Achievements Tab ──────────────────────────────────────────────────
const ACHIEVEMENT_ICONS = ['🏆','🎖️','🌟','🔬','🎭','⚽','🤝','💡','📚','🎓','🏅','🥇','🎗️','🏛️','🔭','🎨','🏋️','🧪','💻','📜'];
const ACHIEVEMENT_CATEGORIES = [
  { value: 'academic',  label: '📚 Academic' },
  { value: 'sports',    label: '⚽ Sports' },
  { value: 'cultural',  label: '🎭 Cultural' },
  { value: 'research',  label: '🔬 Research' },
  { value: 'social',    label: '🤝 Social / NSS' },
  { value: 'award',     label: '🏅 Award' },
  { value: 'other',     label: '📦 Other' },
];
const BLANK_ACH = { icon: '🏆', title: '', description: '', category: 'academic', year: '', order: 0, isActive: true };

const AdminAchievementsTab = ({ showMessage }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [form, setForm]                 = useState(BLANK_ACH);
  const [editingId, setEditingId]       = useState(null);
  const [saving, setSaving]             = useState(false);
  const [showForm, setShowForm]         = useState(false);
const fetchAll = useCallback(() => {
  setLoading(true);
  API.get('/achievements/all')
    .then(res => setAchievements(res.data.achievements || []))
    .catch(() => showMessage('❌ Failed to load achievements'))
    .finally(() => setLoading(false));
}, [showMessage]);

useEffect(() => {
  fetchAll();
}, [fetchAll]);

  const handleSave = async () => {
    if (!form.title.trim())       return showMessage('❌ Title is required');
    if (!form.description.trim()) return showMessage('❌ Description is required');
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/achievements/${editingId}`, form);
        showMessage('✅ Achievement updated!');
      } else {
        await API.post('/achievements', form);
        showMessage('✅ Achievement added!');
      }
      setForm(BLANK_ACH); setEditingId(null); setShowForm(false); fetchAll();
    } catch (e) {
      showMessage('❌ ' + (e.response?.data?.message || 'Failed to save'));
    } finally { setSaving(false); }
  };

  const handleEdit = (a) => {
    setForm({ icon: a.icon, title: a.title, description: a.description, category: a.category, year: a.year || '', order: a.order || 0, isActive: a.isActive });
    setEditingId(a._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await API.delete(`/achievements/${id}`);
      showMessage('🗑️ Achievement deleted'); fetchAll();
    } catch (e) { showMessage('❌ Failed to delete'); }
  };

  const handleToggle = async (a) => {
    try {
      await API.put(`/achievements/${a._id}`, { ...a, isActive: !a.isActive });
      showMessage(`${!a.isActive ? '✅ Shown' : '🙈 Hidden'} on website`); fetchAll();
    } catch (e) { showMessage('❌ Failed to update'); }
  };

  const S = {
    card:   { background:'#fff', borderRadius:12, border:'1px solid #e0e7ef', marginBottom:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.05)' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#f5f8ff', borderBottom:'1px solid #e0e7ef', flexWrap:'wrap', gap:8 },
    body:   { padding:'12px 16px' },
    label:  { display:'block', fontWeight:600, fontSize:13, color:'#374151', marginBottom:5 },
    input:  { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, boxSizing:'border-box' },
    select: { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, background:'#fff', boxSizing:'border-box' },
    btn:    (bg, color='#fff') => ({ background:bg, color, border:'none', borderRadius:7, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }),
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h3 style={{ margin:0, color:'#1565C0' }}>🏆 Achievements ({achievements.length})</h3>
        <button style={S.btn('#1565C0')} onClick={() => { setForm(BLANK_ACH); setEditingId(null); setShowForm(!showForm); }}>
          {showForm ? '✖ Close Form' : '➕ Add Achievement'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...S.card, border:'2px solid #1565C0', marginBottom:24 }}>
          <div style={{ ...S.header, background:'#e3f2fd' }}>
            <strong style={{ color:'#1565C0' }}>{editingId ? '✏️ Edit Achievement' : '➕ New Achievement'}</strong>
          </div>
          <div style={S.body}>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Icon</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                {ACHIEVEMENT_ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm({...form, icon: ic})}
                    style={{ fontSize:22, background: form.icon===ic ? '#e3f2fd' : 'transparent', border: form.icon===ic ? '2px solid #1565C0' : '2px solid transparent', borderRadius:8, padding:'4px 8px', cursor:'pointer' }}>
                    {ic}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:28 }}>Selected: {form.icon}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:14, marginBottom:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={S.label}>Title *</label>
                <input style={S.input} type="text" placeholder="e.g. University Rank Holders"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label style={S.label}>Category</label>
                <select style={S.select} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {ACHIEVEMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Year (optional)</label>
                <input style={S.input} type="text" placeholder="e.g. 2024-25"
                  value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
              </div>
              <div>
                <label style={S.label}>Display Order</label>
                <input style={S.input} type="number" min="0"
                  value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:22 }}>
                <input type="checkbox" id="achIsActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  style={{ width:18, height:18, cursor:'pointer' }} />
                <label htmlFor="achIsActive" style={{ fontWeight:600, fontSize:13, cursor:'pointer' }}>Show on website</label>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={S.label}>Description *</label>
                <textarea style={{ ...S.input, minHeight:80, resize:'vertical' }}
                  placeholder="Describe the achievement..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button style={S.btn('#2E7D32')} onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : (editingId ? '💾 Update' : '💾 Save')}
              </button>
              <button style={S.btn('#e0e7ef','#374151')} onClick={() => { setShowForm(false); setEditingId(null); setForm(BLANK_ACH); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#888' }}>⏳ Loading...</div>
      ) : achievements.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#888' }}>
          <div style={{ fontSize:40 }}>🏆</div>
          <h3>No achievements yet. Click "Add Achievement" to add one.</h3>
        </div>
      ) : (
        achievements.map(a => (
          <div key={a._id} style={{ ...S.card, opacity: a.isActive ? 1 : 0.6 }}>
            <div style={S.header}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:26 }}>{a.icon}</span>
                <div>
                  <strong style={{ fontSize:14 }}>{a.title}</strong>
                  {a.year && <span style={{ fontSize:11, color:'#1565C0', marginLeft:8 }}>📅 {a.year}</span>}
                  <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                    {ACHIEVEMENT_CATEGORIES.find(c=>c.value===a.category)?.label || a.category} · Order: {a.order}
                  </div>
                </div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background: a.isActive?'#e8f5e9':'#ffebee', color: a.isActive?'#2E7D32':'#C62828' }}>
                {a.isActive ? '✅ Visible' : '🙈 Hidden'}
              </span>
            </div>
            <div style={S.body}>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 12px' }}>{a.description}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button style={S.btn('#1565C0')} onClick={() => handleEdit(a)}>✏️ Edit</button>
                <button style={S.btn(a.isActive?'#455a64':'#2E7D32')} onClick={() => handleToggle(a)}>
                  {a.isActive ? '🙈 Hide' : '👁️ Show'}
                </button>
                <button style={S.btn('#ffebee','#C62828')} onClick={() => handleDelete(a._id)}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};


const ContactMessagesTab = ({ contacts, setContacts, showMessage }) => {
  const [editingId, setEditingId]   = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');

  const refreshContacts = () => {
    API.get('/contact').then(res => setContacts(res.data.contacts || [])).catch(() => {});
  };

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/contact/${id}/read`);
      refreshContacts();
    } catch (e) { showMessage('❌ Failed to mark as read'); }
  };

  const handleSaveReply = async (id) => {
    if (!replyText.trim()) { showMessage('❌ Reply cannot be empty'); return; }
    setSaving(true);
    try {
      await API.put(`/contact/${id}/reply`, { adminReply: replyText });
      showMessage('✅ Reply saved successfully!');
      setEditingId(null);
      setReplyText('');
      refreshContacts();
    } catch (e) {
      showMessage('❌ Failed to save reply');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await API.delete(`/contact/${id}`);
      showMessage('🗑️ Message deleted');
      refreshContacts();
    } catch (e) { showMessage('❌ Failed to delete'); }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'unread'  ? !c.isRead :
      filter === 'replied' ? !!c.adminReply :
      true;
    return matchSearch && matchFilter;
  });

  const S = {
    card:      { background:'#fff', borderRadius:12, border:'1px solid #e0e7ef', marginBottom:14, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.05)' },
    header:    { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'#f5f8ff', borderBottom:'1px solid #e0e7ef', flexWrap:'wrap', gap:8 },
    body:      { padding:'14px 18px' },
    badge:     (read) => ({ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background: read ? '#e8f5e9' : '#fff3e0', color: read ? '#2E7D32' : '#E65100' }),
    replBadge: { padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:'#e3f2fd', color:'#1565C0' },
    btn:       (bg, color='#fff') => ({ background:bg, color, border:'none', borderRadius:7, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }),
    input:     { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, boxSizing:'border-box' },
    textarea:  { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #1565C0', fontSize:13, minHeight:90, resize:'vertical', boxSizing:'border-box' },
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <h3 style={{ margin:0, color:'#1565C0' }}>📬 Contact Messages ({contacts.length})</h3>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['all','unread','replied'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...S.btn(filter===f ? '#1565C0' : '#e3f2fd', filter===f ? '#fff' : '#1565C0'), textTransform:'capitalize' }}>
              {f === 'all' ? `All (${contacts.length})` : f === 'unread' ? `Unread (${contacts.filter(c=>!c.isRead).length})` : `Replied (${contacts.filter(c=>!!c.adminReply).length})`}
            </button>
          ))}
        </div>
      </div>

      <input style={{ ...S.input, marginBottom:16 }}
        type="text" placeholder="🔍 Search by name, email, subject..."
        value={search} onChange={e => setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#888' }}>
          <div style={{ fontSize:40 }}>📭</div>
          <h3>No messages found</h3>
        </div>
      ) : (
        filtered.map(c => (
          <div key={c._id} style={S.card}>
            <div style={S.header}>
              <div>
                <strong style={{ fontSize:15 }}>{c.name}</strong>
                <span style={{ color:'#666', fontSize:13, marginLeft:8 }}>— {c.subject}</span>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                <span style={S.badge(c.isRead)}>{c.isRead ? '✅ Read' : '🔔 New'}</span>
                {c.adminReply && <span style={S.replBadge}>💬 Replied</span>}
                <small style={{ color:'#999', fontSize:11 }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</small>
              </div>
            </div>
            <div style={S.body}>
              <div style={{ fontSize:12, color:'#666', marginBottom:10 }}>
                📧 {c.email}
                {c.phone && <span style={{ marginLeft:12 }}>📞 {c.phone}</span>}
              </div>
              <div style={{ background:'#f9fafb', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#333', marginBottom:12, borderLeft:'3px solid #1565C0' }}>
                {c.message}
              </div>
              {c.adminReply && editingId !== c._id && (
                <div style={{ background:'#e8f5e9', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#2E7D32', marginBottom:12, borderLeft:'3px solid #2E7D32' }}>
                  <strong>Admin Reply:</strong> {c.adminReply}
                  {c.repliedAt && <div style={{ fontSize:11, color:'#888', marginTop:4 }}>Replied on {new Date(c.repliedAt).toLocaleString('en-IN')}</div>}
                </div>
              )}
              {editingId === c._id && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>
                    ✏️ {c.adminReply ? 'Edit Reply' : 'Write Reply'}
                  </label>
                  <textarea style={S.textarea}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply here..." />
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button style={S.btn('#2E7D32')} onClick={() => handleSaveReply(c._id)} disabled={saving}>
                      {saving ? '⏳ Saving...' : '💾 Save Reply'}
                    </button>
                    <button style={S.btn('#e0e7ef','#374151')} onClick={() => { setEditingId(null); setReplyText(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button style={S.btn('#1565C0')}
                  onClick={() => { setEditingId(c._id); setReplyText(c.adminReply || ''); }}>
                  {c.adminReply ? '✏️ Edit Reply' : '💬 Reply'}
                </button>
                {!c.isRead && (
                  <button style={S.btn('#455a64')} onClick={() => handleMarkRead(c._id)}>
                    👁️ Mark as Read
                  </button>
                )}
                <button style={S.btn('#ffebee','#C62828')} onClick={() => handleDelete(c._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [message, setMessage] = useState('');
  const [staff, setStaff] = useState([]);
  const [editStaff, setEditStaff] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [staffForm, setStaffForm] = useState({
    name: '', username: '', email: '', password: '', phone: '', role: 'staff_student', photo: ''
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: '', code: '', type: 'BA', duration: '3 Years', fees: '', eligibility: '', description: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', designation: '', department: '', qualification: '', experience: '', email: '', phone: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', targetAudience: 'all' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', venue: '', category: 'academic' });
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'campus', image: null });
  const [editGalleryId, setEditGalleryId] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState(null);

  useEffect(() => {
    API.get('/notices').then(res => setNotices(res.data.notices || []));
    API.get('/courses').then(res => setCourses(res.data.courses || []));
    API.get('/faculty').then(res => setFaculty(res.data.faculty || []));
    API.get('/events').then(res => setEvents(res.data.events || []));
    API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    API.get('/students').then(res => setStudents(res.data.students || [])).catch(() => {});
    API.get('/contact').then(res => setContacts(res.data.contacts || [])).catch(() => {});
    API.get('/auth/staff').then(res => setStaff(res.data.staff || [])).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/courses', courseForm);
      showMessage('Course added successfully!');
      setCourseForm({ name: '', code: '', type: 'BA', duration: '3 Years', fees: '', eligibility: '', description: '' });
      API.get('/courses').then(res => setCourses(res.data.courses || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/faculty', facultyForm);
      showMessage('Faculty added successfully!');
      setFacultyForm({ name: '', designation: '', department: '', qualification: '', experience: '', email: '', phone: '' });
      API.get('/faculty').then(res => setFaculty(res.data.faculty || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/notices', noticeForm);
      showMessage('Notice posted successfully!');
      setNoticeForm({ title: '', content: '', category: 'general', targetAudience: 'all' });
      API.get('/notices').then(res => setNotices(res.data.notices || []));
    } catch (err) { showMessage('Failed to post notice.'); }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', eventForm);
      showMessage('Event added successfully!');
      setEventForm({ title: '', description: '', date: '', venue: '', category: 'academic' });
      API.get('/events').then(res => setEvents(res.data.events || []));
    } catch (err) { showMessage('Failed to add event.'); }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (staffForm.password.length < 6) { showMessage('Password must be at least 6 characters'); return; }
    try {
      await API.post('/auth/create-staff', staffForm);
      showMessage('✅ Staff created successfully!');
      setShowCredentials({ name: staffForm.name, username: staffForm.username, email: staffForm.email, password: staffForm.password, role: staffForm.role });
      setStaffForm({ name: '', username: '', email: '', password: '', phone: '', role: 'staff_student' });
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const deleteStaff = async (id) => {
    if (window.confirm('Delete this staff? They will not be able to login anymore.')) {
      try {
        await API.delete(`/auth/staff/${id}`);
        showMessage('Staff deleted successfully!');
        API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
      } catch (err) { showMessage('Failed to delete staff'); }
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/auth/staff/${editStaff._id}`, { 
        name: editStaff.name, 
        username: editStaff.username, 
        email: editStaff.email, 
        phone: editStaff.phone,
        role: editStaff.role,
        photo: editStaff.photo || '',
      });
      showMessage('✅ Staff updated successfully!');
      setEditStaff(null);
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) { showMessage('❌ Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setGalleryForm({ ...galleryForm, image: file }); setGalleryPreview(URL.createObjectURL(file)); }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', galleryForm.title);
      data.append('description', galleryForm.description);
      data.append('category', galleryForm.category);
      if (galleryForm.image) data.append('image', galleryForm.image);
      if (editGalleryId) {
        await API.put(`/gallery/${editGalleryId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('Image updated successfully!');
      } else {
        await API.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('Image uploaded successfully!');
      }
      setGalleryForm({ title: '', description: '', category: 'campus', image: null });
      setEditGalleryId(null); setGalleryPreview(null);
      API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleEditGallery = (item) => {
    setEditGalleryId(item._id);
    setGalleryForm({ title: item.title, description: item.description || '', category: item.category, image: null });
    setGalleryPreview(`http://localhost:5000/uploads/${item.image}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setEditGalleryId(null); setGalleryForm({ title: '', description: '', category: 'campus', image: null }); setGalleryPreview(null); };

  const deleteCourse  = async (id) => { if (window.confirm('Delete this course?'))  { await API.delete(`/courses/${id}`);  API.get('/courses').then(res => setCourses(res.data.courses || [])); } };
  const deleteFaculty = async (id) => { if (window.confirm('Delete this faculty?')) { await API.delete(`/faculty/${id}`);  API.get('/faculty').then(res => setFaculty(res.data.faculty || [])); } };
  const deleteNotice  = async (id) => { if (window.confirm('Delete this notice?'))  { await API.delete(`/notices/${id}`);  API.get('/notices').then(res => setNotices(res.data.notices || [])); } };
  const deleteGallery = async (id) => { if (window.confirm('Delete this image?'))   { await API.delete(`/gallery/${id}`);  showMessage('Image deleted!'); API.get('/gallery').then(res => setGallery(res.data.gallery || [])); } };

  const tabs = [
    { id: 'home',     label: '🏠 Dashboard' },
    { id: 'students', label: '👩‍🎓 Students' },
    { id: 'courses',  label: '📚 Courses' },
    { id: 'faculty',  label: '👩‍🏫 Faculty' },
    { id: 'staff',    label: '👨‍💼 Staff Login' },
    { id: 'gallery',  label: '🖼️ Gallery' },
    { id: 'notices',  label: '📢 Notices' },
    { id: 'events',   label: '🗓️ Events' },
    { id: 'contacts',  label: '📬 Messages' },
    { id: 'messaging',      label: '✉️ Send Message' },
    { id: 'delete_requests', label: '🗑️ Delete Requests' },
    { id: 'reports',   label: '📊 Reports' },
    { id: 'receipts',  label: '🧾 Payment Receipts' },
    { id: 'tc_requests',   label: '🎓 TC Requests' },
    { id: 'doc_requests',  label: '📋 Document Requests' },
    { id: 'fee_approval',  label: '💼 Fee Structure Approval' },
    { id: 'doc_fee_approval', label: '💰 Doc Fee Approvals' },
    { id: 'achievements', label: '🏆 Achievements' },
  ];

  const roleLabel = (role) => ({
    staff_principal:  '👨‍🏫 Principal',
    staff_student:    '👩‍🎓 Student Section',
    staff_accounts:   '💰 Accounts',
    staff_exam:       '📝 Examination',
    staff_scholarship:'🎓 Scholarship',
  }[role] || role);

  const roleColors = {
    staff_principal:   { bg: '#fee2e2', color: '#991b1b' },
    staff_student:     { bg: '#dbeafe', color: '#1e40af' },
    staff_accounts:    { bg: '#dcfce7', color: '#15803d' },
    staff_exam:        { bg: '#fef3c7', color: '#92400e' },
    staff_scholarship: { bg: '#f3e8ff', color: '#7e22ce' },
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Admin Portal</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info" style={{display:'flex',alignItems:'center',gap:10}}>
            {user?.photo
              ? <img src={user.photo} alt="" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid #e0e7ef'}} />
              : <div style={{width:36,height:36,borderRadius:'50%',background:'#1565C0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#fff'}}>👤</div>}
            <span>👋 {user?.name} (Admin)</span>
          </div>
        </div>

        {message && <div className="dash-message">{message}</div>}

        <div className="dashboard-content">

          {/* ══ HOME ══ */}
          {activeTab === 'home' && (
            <div>
              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">👩‍🎓</div>
                  <div><h3>{students.length}</h3><p>Total Students</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">👩‍🏫</div>
                  <div><h3>{faculty.length}</h3><p>Faculty Members</p></div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">📚</div>
                  <div><h3>{courses.length}</h3><p>Courses</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">📬</div>
                  <div><h3>{contacts.length}</h3><p>Messages</p></div>
                </div>
              </div>
              <div className="recent-section">
                <h3>Recent Notices</h3>
                {notices.slice(0, 5).map(notice => (
                  <div className="notice-row" key={notice._id}>
                    <span className="notice-dot"></span>
                    <div>
                      <p className="notice-title">{notice.title}</p>
                      <p className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Admin has read-only access. Edit and Delete is restricted to Student Section Staff and Principal.</p>
              <StudentViewFull canEdit={false} themeColor="#1565C0" role="readonly" />
            </div>
          )}

          {/* ══ COURSES ══ */}
          {activeTab === 'courses' && (
            <div>
              <div className="form-card">
                <h3>Add New Course</h3>
                <form onSubmit={handleCourseSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Course Name</label>
                      <input type="text" placeholder="e.g. Bachelor of Arts" value={courseForm.name}
                        onChange={e => setCourseForm({...courseForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Course Code</label>
                      <input type="text" placeholder="e.g. BA001" value={courseForm.code}
                        onChange={e => setCourseForm({...courseForm, code: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Type</label>
                      <select value={courseForm.type} onChange={e => setCourseForm({...courseForm, type: e.target.value})}>
                        <option value="BA">BA</option><option value="BSc">BSc</option>
                        <option value="BCom">BCom</option><option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fees (₹/year)</label>
                      <input type="number" placeholder="Annual fees" value={courseForm.fees}
                        onChange={e => setCourseForm({...courseForm, fees: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Eligibility</label>
                    <input type="text" placeholder="e.g. 10+2 pass" value={courseForm.eligibility}
                      onChange={e => setCourseForm({...courseForm, eligibility: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Course description" value={courseForm.description}
                      onChange={e => setCourseForm({...courseForm, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Course</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Courses ({courses.length})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Code</th><th>Type</th><th>Fees</th><th>Duration</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td><td>{c.code}</td><td>{c.type}</td>
                        <td>₹{c.fees}</td><td>{c.duration}</td>
                        <td><button className="btn-delete" onClick={() => deleteCourse(c._id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ FACULTY ══ */}
          {activeTab === 'faculty' && (
            <div>
              <div className="form-card">
                <h3>Add New Faculty</h3>
                <form onSubmit={handleFacultySubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" placeholder="Faculty name" value={facultyForm.name}
                        onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input type="text" placeholder="e.g. Professor" value={facultyForm.designation}
                        onChange={e => setFacultyForm({...facultyForm, designation: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" placeholder="e.g. Science" value={facultyForm.department}
                        onChange={e => setFacultyForm({...facultyForm, department: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Qualification</label>
                      <input type="text" placeholder="e.g. M.Sc, Ph.D" value={facultyForm.qualification}
                        onChange={e => setFacultyForm({...facultyForm, qualification: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" placeholder="Faculty email" value={facultyForm.email}
                        onChange={e => setFacultyForm({...facultyForm, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" placeholder="Phone number" value={facultyForm.phone}
                        onChange={e => setFacultyForm({...facultyForm, phone: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Faculty</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Faculty ({faculty.length})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Designation</th><th>Department</th><th>Email</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {faculty.map(f => (
                      <tr key={f._id}>
                        <td>{f.name}</td><td>{f.designation}</td>
                        <td>{f.department}</td><td>{f.email}</td>
                        <td><button className="btn-delete" onClick={() => deleteFaculty(f._id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ STAFF LOGIN ══ */}
          {activeTab === 'staff' && (
            <div>
              {showCredentials && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,padding:'20px'}} onClick={() => setShowCredentials(null)}>
                  <div style={{background:'white',borderRadius:'12px',padding:'30px',maxWidth:'500px',width:'100%'}} onClick={e => e.stopPropagation()}>
                    <div style={{textAlign:'center',marginBottom:'20px'}}>
                      <div style={{fontSize:'48px'}}>✅</div>
                      <h2 style={{color:'#28a745',margin:'10px 0'}}>Staff Created!</h2>
                      <p style={{color:'#666'}}>Share these credentials with the staff member</p>
                    </div>
                    <div style={{background:'#f0f9ff',padding:'20px',borderRadius:'8px',border:'2px solid #bae6fd',marginBottom:'20px'}}>
                      <p style={{margin:'8px 0'}}><strong>👤 Name:</strong> {showCredentials.name}</p>
                      <p style={{margin:'8px 0'}}><strong>🪪 Username:</strong> {showCredentials.username}</p>
                      <p style={{margin:'8px 0'}}><strong>📧 Email:</strong> {showCredentials.email}</p>
                      <p style={{margin:'8px 0'}}><strong>🔑 Password:</strong> <code style={{background:'white',padding:'4px 10px',borderRadius:'4px',fontFamily:'monospace'}}>{showCredentials.password}</code></p>
                      <p style={{margin:'8px 0'}}><strong>👔 Role:</strong> {roleLabel(showCredentials.role)}</p>
                    </div>
                    <div style={{background:'#fff3cd',padding:'12px',borderRadius:'8px',fontSize:'13px',color:'#856404',marginBottom:'16px'}}>
                      ⚠️ Save these credentials! Password cannot be viewed again after closing.
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCredentials(null)} style={{width:'100%'}}>Got It! Close</button>
                  </div>
                </div>
              )}

              {editStaff && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,padding:'20px'}} onClick={() => setEditStaff(null)}>
                  <div style={{background:'white',borderRadius:'12px',padding:'30px',maxWidth:'480px',width:'100%'}} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                      <h2 style={{color:'#1565C0'}}>✏️ Edit Staff</h2>
                      <button onClick={() => setEditStaff(null)} style={{background:'#eee',border:'none',borderRadius:'50%',width:'36px',height:'36px',cursor:'pointer',fontSize:'18px'}}>✕</button>
                    </div>
                    <form onSubmit={handleEditStaffSubmit}>
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" value={editStaff.name} onChange={e => setEditStaff({...editStaff, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={editStaff.username || ''} onChange={e => setEditStaff({...editStaff, username: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={editStaff.email} onChange={e => setEditStaff({...editStaff, email: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={editStaff.phone || ''} maxLength="10"
                          onChange={e => { const v = e.target.value; if (/^\d{0,10}$/.test(v)) setEditStaff({...editStaff, phone: v}); }} />
                      </div>
                      <div className="form-group">
                        <label>Role *</label>
                        <select value={editStaff.role || ''} onChange={e => setEditStaff({...editStaff, role: e.target.value})}
                          style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'14px'}}>
                          <option value="staff_student">👩‍🎓 Student Section</option>
                          <option value="staff_accounts">💰 Accounts Section</option>
                          <option value="staff_exam">📝 Exam Section</option>
                          <option value="staff_scholarship">🏅 Scholarship Section</option>
                          <option value="staff_principal">🎓 Principal</option>
                          <option value="admin">⚙️ Admin</option>
                        </select>
                      </div>
                      <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                        <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditStaff(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="form-card">
                <h3>👥 Create Staff Login</h3>
                <p style={{color:'#666',fontSize:'14px',marginBottom:'20px'}}>Create login credentials for staff members. Choose their section role.</p>
                <form onSubmit={handleStaffSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" placeholder="e.g. Rahul Sharma" value={staffForm.name}
                        onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Username *</label>
                      <input type="text" placeholder="e.g. rahul_sharma" value={staffForm.username}
                        onChange={e => setStaffForm({...staffForm, username: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" placeholder="staff@lkcwsc.edu.in" value={staffForm.email}
                        onChange={e => setStaffForm({...staffForm, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Password * (min 6 characters)</label>
                      <input type="text" placeholder="e.g. Staff@1234" value={staffForm.password}
                        onChange={e => setStaffForm({...staffForm, password: e.target.value})} minLength="6" required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" placeholder="9876543210" value={staffForm.phone} maxLength="10"
                        onChange={e => { const v = e.target.value; if (/^\d{0,10}$/.test(v)) setStaffForm({...staffForm, phone: v}); }} />
                    </div>
                    <div className="form-group">
                      <label>📷 Staff Photo (optional)</label>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        {/* Photo preview circle */}
                        <div style={{width:64,height:64,borderRadius:'50%',border:'2px solid #e0e7ef',overflow:'hidden',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {staffForm.photo
                            ? <img src={staffForm.photo} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
                            : <span style={{fontSize:28}}>🧑‍💼</span>}
                        </div>
                        <div style={{flex:1}}>
                          <input type="file" accept="image/*"
                            onChange={async e => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setPhotoUploading(true);
                              try {
                                const fd = new FormData();
                                fd.append('photo', file);
                                const res = await API.post('/auth/upload-photo', fd, { headers:{'Content-Type':'multipart/form-data'} });
                                if (res.data.success) setStaffForm(p => ({...p, photo: res.data.url}));
                              } catch { alert('Photo upload failed'); }
                              finally { setPhotoUploading(false); }
                            }}
                            style={{width:'100%',padding:'7px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'13px'}} />
                          {photoUploading && <p style={{fontSize:12,color:'#1565C0',margin:'4px 0 0'}}>⏳ Uploading...</p>}
                          {staffForm.photo && !photoUploading && <p style={{fontSize:12,color:'#2E7D32',margin:'4px 0 0'}}>✅ Photo uploaded</p>}
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Staff Section Role *</label>
                      <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} required>
                        <option value="staff_principal">👨‍🏫 Principal</option>
                        <option value="staff_student">👩‍🎓 Student Section</option>
                        <option value="staff_accounts">💰 Accounts Section</option>
                        <option value="staff_exam">📝 Examination Section</option>
                        <option value="staff_scholarship">🎓 Scholarship Section</option>
                      </select>
                      <small style={{color:'#666',marginTop:'6px',display:'block'}}>💡 Staff will be redirected to their section dashboard after login</small>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{padding:'12px 32px'}}>➕ Create Staff Login</button>
                </form>
              </div>

              <h3 style={{margin:'30px 0 16px'}}>👥 All Staff Members ({staff.length})</h3>
              {staff.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👨‍💼</div>
                  <h3>No Staff Yet</h3>
                  <p>Create staff members to manage ERP sections.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Photo</th><th>Name</th><th>Username</th><th>Email & Password</th><th>Phone</th><th>Role</th><th>Created</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s._id}>
                          <td style={{textAlign:'center'}}>
                            <div style={{width:40,height:40,borderRadius:'50%',overflow:'hidden',background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontSize:20}}>
                              {s.photo ? <img src={s.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '🧑‍💼'}
                            </div>
                          </td>
                          <td>{s.name}</td>
                          <td><code style={{background:'#f1f5f9',padding:'2px 8px',borderRadius:'4px',fontSize:'13px'}}>{s.username || '-'}</code></td>
                          <td>
                            <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>📧 {s.email}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                              <code style={{background:'#f1f5f9',padding:'2px 10px',borderRadius:'4px',fontFamily:'monospace',fontSize:'13px',minWidth:'100px',letterSpacing: visiblePasswords[s._id] ? 'normal' : '3px'}}>
                                {visiblePasswords[s._id] ? (s.plainPassword || s.password || '(not stored)') : '••••••••'}
                              </code>
                              <button onClick={() => setVisiblePasswords(prev => ({...prev, [s._id]: !prev[s._id]}))}
                                style={{background:'none',border:'1px solid #ddd',borderRadius:'6px',cursor:'pointer',padding:'3px 7px',fontSize:'15px',lineHeight:1}}>
                                {visiblePasswords[s._id] ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </td>
                          <td>{s.phone || '-'}</td>
                          <td>
                            <span className="notice-tag" style={{ background: (roleColors[s.role] || {bg:'#e5e7eb'}).bg, color: (roleColors[s.role] || {color:'#374151'}).color }}>
                              {roleLabel(s.role)}
                            </span>
                          </td>
                          <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{display:'flex',gap:'6px'}}>
                              <button className="btn btn-primary" style={{padding:'5px 12px',fontSize:'13px',background:'#1565C0'}} onClick={() => setEditStaff({...s})}>✏️ Edit</button>
                              <button className="btn-delete" onClick={() => deleteStaff(s._id)}>🗑️ Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ GALLERY ══ */}
          {activeTab === 'gallery' && (
            <div>
              <div className="form-card">
                <h3>{editGalleryId ? '✏️ Edit Image' : '➕ Add New Image'}</h3>
                <form onSubmit={handleGallerySubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Image Title *</label>
                      <input type="text" placeholder="Enter image title" value={galleryForm.title}
                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                        <option value="campus">Campus</option><option value="events">Events</option>
                        <option value="sports">Sports</option><option value="cultural">Cultural</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Tell us about this photo..." value={galleryForm.description}
                      onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}></textarea>
                  </div>
                  <div className="form-group">
                    <label>{editGalleryId ? 'Replace Image (optional)' : 'Upload Image *'}</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} required={!editGalleryId} />
                    {galleryPreview && (
                      <img src={galleryPreview} alt="Preview"
                        style={{width:'200px',height:'150px',objectFit:'cover',marginTop:'10px',borderRadius:'8px',border:'2px solid #ddd'}} />
                    )}
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button type="submit" className="btn btn-primary">{editGalleryId ? 'Update Image' : 'Upload Image'}</button>
                    {editGalleryId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
                  </div>
                </form>
              </div>
              <h3 style={{margin:'30px 0 16px'}}>All Gallery Images ({gallery.length})</h3>
              {gallery.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🖼️</div><h3>No Images Yet</h3><p>Upload your first image to get started.</p></div>
              ) : (
                <div className="events-grid">
                  {gallery.map(item => (
                    <div className="event-card" key={item._id}>
                      <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.title}
                        style={{width:'100%',height:'180px',objectFit:'cover',borderRadius:'8px',marginBottom:'12px'}} />
                      <span className="notice-tag">{item.category}</span>
                      <h4>{item.title}</h4>
                      <p style={{color:'#666',fontSize:'13px'}}>{item.description}</p>
                      <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                        <button className="btn btn-primary" style={{padding:'6px 14px',fontSize:'13px'}} onClick={() => handleEditGallery(item)}>✏️ Edit</button>
                        <button className="btn-delete" onClick={() => deleteGallery(item._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ NOTICES ══ */}
          {activeTab === 'notices' && (
            <div>
              <div className="form-card">
                <h3>Post New Notice</h3>
                <form onSubmit={handleNoticeSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" placeholder="Notice title" value={noticeForm.title}
                      onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} required />
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Category</label>
                      <select value={noticeForm.category} onChange={e => setNoticeForm({...noticeForm, category: e.target.value})}>
                        <option value="general">General</option><option value="exam">Exam</option>
                        <option value="admission">Admission</option><option value="event">Event</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Target</label>
                      <select value={noticeForm.targetAudience} onChange={e => setNoticeForm({...noticeForm, targetAudience: e.target.value})}>
                        <option value="all">All</option><option value="student">Students</option><option value="staff">Staff</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea rows="4" placeholder="Notice content..." value={noticeForm.content}
                      onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Post Notice</button>
                </form>
              </div>
              <h3 style={{margin:'30px 0 16px'}}>All Notices ({notices.length})</h3>
              {notices.map(n => (
                <div className="notice-full-card" key={n._id}>
                  <div className="notice-full-header">
                    <h4>{n.title}</h4>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <span className="notice-tag">{n.category}</span>
                      <button className="btn-delete" onClick={() => deleteNotice(n._id)}>Delete</button>
                    </div>
                  </div>
                  <p>{n.content}</p>
                  <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}

          {/* ══ EVENTS ══ */}
          {activeTab === 'events' && (
            <div>
              <div className="form-card">
                <h3>Add New Event</h3>
                <form onSubmit={handleEventSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Event Title</label>
                      <input type="text" placeholder="Event name" value={eventForm.title}
                        onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" value={eventForm.date}
                        onChange={e => setEventForm({...eventForm, date: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Venue</label>
                      <input type="text" placeholder="Event venue" value={eventForm.venue}
                        onChange={e => setEventForm({...eventForm, venue: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})}>
                        <option value="academic">Academic</option><option value="cultural">Cultural</option>
                        <option value="sports">Sports</option><option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Event description" value={eventForm.description}
                      onChange={e => setEventForm({...eventForm, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Event</button>
                </form>
              </div>
              <h3 style={{margin:'30px 0 16px'}}>All Events ({events.length})</h3>
              <div className="events-grid">
                {events.map(ev => (
                  <div className="event-card" key={ev._id}>
                    <span className="notice-tag">{ev.category}</span>
                    <h4>{ev.title}</h4>
                    <p>📅 {new Date(ev.date).toLocaleDateString()}</p>
                    <p>📍 {ev.venue}</p>
                    <p style={{color:'#666',fontSize:'14px',marginTop:'8px'}}>{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CONTACTS ══ */}
          {activeTab === 'contacts' && (
            <ContactMessagesTab
              contacts={contacts}
              setContacts={setContacts}
              showMessage={showMessage}
            />
          )}

          {/* ══ MESSAGING ══ */}
          {activeTab === 'reports'   && <AdminReports themeColor="#1565C0" />}
          {activeTab === 'receipts'  && <PaymentReceiptsTab themeColor="#1565C0" />}
          {activeTab === 'messaging' && <AdminMessagingTab user={user} showMessage={showMessage} />}

          {/* Delete Requests */}
          {activeTab === 'delete_requests' && <AdminDeleteRequestsTab />}

          {/* TC Requests */}
          {activeTab === 'tc_requests' && <AdminTCRequestsTab showMessage={showMessage} />}

          {/* Document Requests */}
          {activeTab === 'doc_requests' && <AdminDocRequestsTab showMessage={showMessage} />}

          {/* Fee Structure Approval */}
          {activeTab === 'fee_approval' && <AdminFeeApprovalTab showMessage={showMessage} kind="structure" />}

          {/* Doc Fee Approvals */}
          {activeTab === 'doc_fee_approval' && <AdminFeeApprovalTab showMessage={showMessage} kind="document" />}

          {/* Achievements */}
          {activeTab === 'achievements' && <AdminAchievementsTab showMessage={showMessage} />}

        </div>
      </main>
    </div>
  );
};


// ─── Admin Document Requests Tab ─────────────────────────────────────────────
const DOC_CFG_ADMIN = {
  TC:                 { label: 'Transfer Certificate',           icon: '🎓', color: '#1565C0', bg: '#e3f2fd', fee: 0 },
  BONAFIDE:           { label: 'Bonafide Certificate',           icon: '📋', color: '#7B1FA2', bg: '#f3e5f5', fee: 200 },
  ID_CARD:            { label: 'ID Card',                        icon: '🪪', color: '#2E7D32', bg: '#e8f5e9', fee: 0 },
  MARKSHEET:          { label: 'Marksheet',                      icon: '📄', color: '#E65100', bg: '#fff3e0', fee: 0 },
  MIGRATION:          { label: 'Migration Certificate',          icon: '📜', color: '#795548', bg: '#efebe9', fee: 200 },
  PROVISIONAL_DEGREE: { label: 'Provisional Degree Certificate', icon: '📜', color: '#0277BD', bg: '#e1f5fe', fee: 100 },
  DEGREE:             { label: 'Degree Certificate',             icon: '🎓', color: '#1B5E20', bg: '#E8F5E9', fee: 100 },
};

const AdminDocRequestsTab = ({ showMessage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState('pending_admin');
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');

  const fetchRequests = useCallback(() => {
    setLoading(true);
    API.get('/document-requests/admin/all')
      .then(res => setRequests(res.data.requests || []))
      .catch(() => showMessage('❌ Failed to load'))
      .finally(() => setLoading(false));
  }, [showMessage]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (req) => {
    setSaving(req._id);
    try {
      await API.put(`/document-requests/admin/approve/${req._id}`, { notes: 'Approved by Admin' });
      showMessage('✅ Approved — forwarded to Principal');
      fetchRequests();
    } catch (e) { showMessage('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(''); }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) return;
    setSaving(rejectModal._id);
    try {
      await API.put(`/document-requests/admin/reject/${rejectModal._id}`, { reason: rejectNote });
      showMessage('✅ Request rejected');
      setRejectModal(null); setRejectNote('');
      fetchRequests();
    } catch (e) { showMessage('❌ Failed'); }
    finally { setSaving(''); }
  };

  const ss = (s) => ({
    pending_student_section: { bg: '#e3f2fd', color: '#1565C0', label: '⏳ At Student Section' },
    pending_admin:           { bg: '#fff3e0', color: '#E65100', label: '🔄 Pending Admin Review' },
    rejected_by_admin:       { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Admin' },
    pending_principal:       { bg: '#f3e5f5', color: '#7B1FA2', label: '🔄 At Principal' },
    rejected_by_principal:   { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
    pending_generation:      { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Issue' },
    completed:               { bg: '#e3f2fd', color: '#1565C0', label: '🏁 Issued' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  const filtered = requests.filter(r => {
    const mf = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    return mf && (!q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q));
  });

  const pendingCount = requests.filter(r => r.status === 'pending_admin').length;

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📋 Document Requests</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        Review and approve student document requests for: Bonafide (₹200), Provisional Degree (₹100), Degree (₹100), Migration (₹200).
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Pending Review', count: pendingCount, color: '#E65100', bg: '#fff3e0' },
          { label: 'Total', count: requests.length, color: '#1565C0', bg: '#e3f2fd' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="pending_admin">⏳ Pending Review</option>
          <option value="all">All</option>
          <option value="pending_principal">🔄 At Principal</option>
          <option value="completed">🏁 Issued</option>
        </select>
        <button onClick={fetchRequests} style={{ padding: '9px 14px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, cursor: 'pointer' }}>🔄</button>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 26, maxWidth: 440, width: '100%' }}>
            <h3 style={{ color: '#C62828', marginBottom: 12 }}>❌ Reject Request</h3>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>{rejectModal.studentName} — {DOC_CFG_ADMIN[rejectModal.documentType]?.label}</p>
            <textarea rows="3" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason..."
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={handleReject} disabled={!rejectNote.trim() || saving === rejectModal._id}
                style={{ background: '#C62828', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                {saving === rejectModal._id ? '⏳...' : '❌ Confirm'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                style={{ background: '#eee', color: '#333', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
      : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: '#f8faff', borderRadius: 12 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
          <p>No document requests found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const cfg = DOC_CFG_ADMIN[req.documentType] || { label: req.documentType, icon: '📄', color: '#555', bg: '#f5f5f5' };
            const st  = ss(req.status);
            const isPending = req.status === 'pending_admin';
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e7ef'}`, borderRadius: 12, padding: 18, borderLeft: `5px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <div>
                      <h4 style={{ color: cfg.color, fontSize: 15, margin: 0 }}>{cfg.label}</h4>
                      {cfg.fee > 0 && <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>Fee: ₹{cfg.fee}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  <span><strong>Student:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch || '—'}</span>
                  <span><strong>Year:</strong> {req.admissionYear || '—'}</span>
                  {req.reason && <span style={{ gridColumn: '1/-1' }}><strong>Reason:</strong> {req.reason}</span>}
                </div>
                {isPending && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleApprove(req)} disabled={saving === req._id}
                      style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {saving === req._id ? '⏳...' : '✅ Approve → Principal'}
                    </button>
                    <button onClick={() => { setRejectModal(req); setRejectNote(''); }}
                      style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ❌ Reject
                    </button>
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


// ─── Admin Fee Structure Approval Tab ────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const DETAILED_FEES_ADMIN = {
  'B.Sc.': ['bsc_s1','bsc_s2','bsc_s3','bsc_s4','bsc_s5','bsc_s6','bsc_s7','bsc_s8','bsc_s9','bsc_s10','bsc_s11','bsc_s12','bsc_s13','bsc_s14','bsc_s15','bsc_s16','bsc_s17','bsc_s18','bsc_c1','bsc_c2','bsc_c3','bsc_c4','bsc_c5','bsc_c6','bsc_c7','bsc_c8','bsc_c9','bsc_c10','bsc_c11','bsc_c12','bsc_c13','bsc_c14','bsc_c15','bsc_c16','bsc_c17','bsc_c18','bsc_c19'],
  'B.A.': ['ba_s1','ba_s2','ba_s3','ba_s4','ba_s5','ba_s6','ba_s7','ba_s8','ba_s9','ba_s10','ba_s11','ba_s12','ba_s13','ba_s14','ba_s15','ba_s16','ba_s17','ba_s18','ba_c1','ba_c2','ba_c3','ba_c4','ba_c5','ba_c6','ba_c7','ba_c8','ba_c9','ba_c10','ba_c11','ba_c12','ba_c13','ba_c14','ba_c15','ba_c16','ba_c17','ba_c18','ba_c19'],
};

const AdminFeeApprovalTab = ({ showMessage, kind }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending'); // 'pending' | 'all'

  const SEM_LABELS = ['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'];

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/fee-structure-approvals');
      setApprovals(res.data.approvals || []);
    } catch {
      showMessage?.('❌ Failed to load fee approvals');
    } finally { setLoading(false); }
  }, [showMessage]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'approve'
        ? `/fee-structure-approvals/${id}/admin-approve`
        : `/fee-structure-approvals/${id}/admin-reject`;
      await API.put(endpoint, { note: action === 'approve' ? 'Approved by Admin' : '', reason: action === 'reject' ? 'Rejected by Admin' : '' });
      showMessage?.(action === 'approve' ? '✅ Fee edit approved & applied!' : '❌ Fee edit rejected.');
      fetchApprovals();
    } catch (e) {
      showMessage?.('❌ ' + (e.response?.data?.message || 'Action failed'));
    }
  };

  // Document fee requests vs regular fee-structure edits share one backend;
  // separate them by courseKey so each shows in its own tab.
  const scoped = approvals.filter(a =>
    kind === 'document' ? a.courseKey === 'DOC'
      : kind === 'structure' ? a.courseKey !== 'DOC'
      : true
  );
  // Admin only acts on items the Principal already approved (pending_admin)
  const pending = scoped.filter(a => a.status === 'pending_admin');
  const shown   = filter === 'pending' ? pending : scoped;

  const statusBadge = (s) => {
    const map = {
      pending_principal: { bg:'#fff3e0', color:'#E65100', label:'⏳ Waiting on Principal' },
      pending_admin:     { bg:'#e3f2fd', color:'#1565C0', label:'⏳ Pending Your Approval' },
      approved:          { bg:'#e8f5e9', color:'#2E7D32', label:'✅ Approved (Applied)' },
      rejected_by_principal: { bg:'#ffebee', color:'#C62828', label:'❌ Rejected by Principal' },
      rejected_by_admin:     { bg:'#ffebee', color:'#C62828', label:'❌ Rejected by Admin' },
    };
    const c = map[s] || { bg:'#f5f5f5', color:'#555', label: s };
    return <span style={{ fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20, background:c.bg, color:c.color }}>{c.label}</span>;
  };

  const renderCard = (a) => {
    const isPending = a.status === 'pending_admin';
    return (
      <div key={a._id} style={{ background:'#fff', borderRadius:12, border:`1px solid ${isPending ? '#90caf9' : '#e0e7ef'}`, padding:18, borderLeft:`5px solid ${isPending ? '#1565C0' : a.status==='approved' ? '#2E7D32' : '#C62828'}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:12 }}>
          <div>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#333' }}>{a.itemName}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#1565C0', background:'#e3f2fd', padding:'2px 10px', borderRadius:10 }}>{a.courseKey}</span>
              {a.itemSection && <span style={{ fontSize:11, color:'#888' }}>{a.itemSection}</span>}
              {a.isNewItem && <span style={{ fontSize:11, fontWeight:700, background:'#e8f5e9', color:'#2E7D32', padding:'2px 8px', borderRadius:8 }}>New Item</span>}
            </div>
            <div style={{ fontSize:11, color:'#aaa' }}>
              Submitted by {a.submittedBy || '—'} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}
              {a.principalApprovedAt && <> · Principal approved {new Date(a.principalApprovedAt).toLocaleDateString('en-IN')}</>}
            </div>
          </div>
          {statusBadge(a.status)}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:14 }}>
          {a.courseKey === 'DOC' ? (
            <>
              <div style={{ background:'#f5f5f5', borderRadius:8, padding:'10px 14px' }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#888' }}>CURRENT FEE</p>
                <span style={{ fontSize:13, color:'#888' }}>{a.isNewItem ? '— (new document)' : `₹${(a.oldAmounts?.[0]||0).toLocaleString('en-IN')}`}</span>
              </div>
              <div style={{ background:'#e8f5e9', borderRadius:8, padding:'10px 14px' }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#2E7D32' }}>REQUESTED</p>
                <span style={{ fontSize:13, fontWeight:700, color: a.newAmounts?.[0]===-1 ? '#C62828' : '#2E7D32' }}>
                  {a.newAmounts?.[0] === -1 ? '🗑️ Delete this document type' : `₹${(a.newAmounts?.[0]||0).toLocaleString('en-IN')}`}
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ background:'#f5f5f5', borderRadius:8, padding:'10px 14px' }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#888' }}>OLD AMOUNTS</p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {SEM_LABELS.map((sl, i) => (
                    <span key={i} style={{ fontSize:12, color:'#888' }}>{sl}: ₹{(a.oldAmounts?.[i]||0).toLocaleString('en-IN')}</span>
                  ))}
                </div>
              </div>
              <div style={{ background:'#e8f5e9', borderRadius:8, padding:'10px 14px' }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#2E7D32' }}>NEW AMOUNTS</p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {SEM_LABELS.map((sl, i) => (
                    <span key={i} style={{ fontSize:12, fontWeight:700, color:'#2E7D32' }}>{sl}: ₹{(a.newAmounts?.[i]||0).toLocaleString('en-IN')}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {isPending && (
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => handleAction(a._id, 'approve')}
              style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              ✅ Approve (Final)
            </button>
            <button onClick={() => handleAction(a._id, 'reject')}
              style={{ background:'#ffebee', color:'#C62828', border:'1px solid #ef9a9a', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:'#1565C0', marginBottom:4 }}>{kind === 'document' ? '💰 Doc Fee Approvals' : '💼 Fee Structure Approval'}</h2>
          <p style={{ color:'#666', fontSize:14, margin:0 }}>{kind === 'document' ? 'Final approval for document fee add / edit / delete already approved by the Principal.' : 'Final approval for fee edits already approved by the Principal. Approving applies the new amounts.'}</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, margin:'14px 0 20px', flexWrap:'wrap' }}>
        {[
          { key:'pending', label:`⏳ Pending Your Approval (${pending.length})`, color:'#1565C0', bg:'#e3f2fd' },
          { key:'all',     label:`📋 All (${scoped.length})`,                  color:'#555',    bg:'#f5f5f5' },
        ].map(t => (
          <div key={t.key} onClick={() => setFilter(t.key)}
            style={{ background:t.bg, color:t.color, borderRadius:20, padding:'6px 16px', fontSize:13, fontWeight:600, cursor:'pointer',
              border: filter===t.key ? `2px solid ${t.color}` : '2px solid transparent' }}>
            {t.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>⏳ Loading...</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign:'center', padding:50, color:'#888', background:'#f8faff', borderRadius:14 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:10 }}>💼</div>
          <h3>No fee edits {filter === 'pending' ? 'pending your approval' : 'found'}</h3>
          <p style={{ fontSize:14 }}>Edits approved by the Principal will appear here for final approval.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {shown.map(renderCard)}
        </div>
      )}
    </div>
  );
};


// ─── Admin TC Requests Tab ────────────────────────────────────────────────────
const AdminTCRequestsTab = ({ showMessage }) => {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading]   = React.useState(false);
  const [filter, setFilter]     = React.useState('all');

  const fetchRequests = React.useCallback(() => {
    setLoading(true);
    API.get('/document-requests/principal/all')
      .then(res => setRequests((res.data.requests || []).filter(r => r.documentType === 'TC')))
      .catch(() => showMessage('❌ Failed to load'))
      .finally(() => setLoading(false));
  }, [showMessage]);

  React.useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const statusStyle = (s) => ({
    pending_accounts:      { bg: '#fff3e0', color: '#E65100', label: '⏳ At Accounts' },
    pending_exam:          { bg: '#e3f2fd', color: '#1565C0', label: '🔍 At Exam Section' },
    pending_principal:     { bg: '#f3e5f5', color: '#7B1FA2', label: '🔄 At Principal' },
    rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Issue' },
    completed:             { bg: '#e3f2fd', color: '#1565C0', label: '🏁 Issued' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pending = requests.filter(r => r.status === 'pending_principal').length;

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 TC Requests</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>All Transfer Certificate requests — track status from student to issuance.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: requests.length, color: '#1565C0', bg: '#e3f2fd' },
          { label: 'At Principal', count: pending, color: '#7B1FA2', bg: '#f3e5f5' },
          { label: 'Issued', count: requests.filter(r=>r.status==='completed').length, color: '#2E7D32', bg: '#e8f5e9' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['all', 'pending_principal', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `2px solid ${filter===f?'#1565C0':'#ddd'}`, background: filter===f?'#1565C0':'#fff', color: filter===f?'#fff':'#555', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              {f==='all'?'All':f==='pending_principal'?'At Principal':'Issued'}
            </button>
          ))}
          <button onClick={fetchRequests} style={{ padding: '5px 12px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🔄</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
      : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: '#f8faff', borderRadius: 12 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎓</div>
          <p>No TC requests found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const ss = statusStyle(req.status);
            return (
              <div key={req._id} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: 18, borderLeft: '5px solid #1565C0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <h4 style={{ color: '#1565C0', fontSize: 15, margin: 0 }}>🎓 Transfer Certificate</h4>
                    <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <span><strong>Student:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch || '—'}</span>
                  <span><strong>Year:</strong> {req.admissionYear || '—'}</span>
                  {req.reason && <span style={{ gridColumn: '1/-1' }}><strong>Reason:</strong> {req.reason}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default AdminDashboard;
