import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

// ─── Fee Report ───────────────────────────────────────────────────────────────
const FeeReport = ({ themeColor }) => {
  const [receipts, setReceipts]     = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [search, setSearch]         = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        API.get('/admissions/receipts/all'),
        API.get('/admissions/staff-view/all'),
      ]);
      setReceipts(rRes.data.receipts || []);
      setAdmissions(aRes.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const filtered = receipts.filter(r => {
    const d = new Date(r.paidAt);
    const my = yearFilter === 'all' || d.getFullYear().toString() === yearFilter;
    const mm = monthFilter === 'all' || d.getMonth().toString() === monthFilter;
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentId?.toLowerCase().includes(q) || r.receiptNo?.toLowerCase().includes(q);
    return my && mm && mq;
  });

  const totalCollected = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const cashTotal      = filtered.filter(r => r.paymentMode !== 'online').reduce((s, r) => s + (r.amount || 0), 0);
  const onlineTotal    = filtered.filter(r => r.paymentMode === 'online').reduce((s, r) => s + (r.amount || 0), 0);

  // Fee type breakdown
  const feeBreakdown = filtered.reduce((acc, r) => {
    const key = r.feeTypeLabel || r.feeType || 'Other';
    acc[key] = (acc[key] || 0) + (r.amount || 0);
    return acc;
  }, {});

  // Monthly breakdown
  const monthlyBreakdown = filtered.reduce((acc, r) => {
    const d = new Date(r.paidAt);
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    acc[key] = (acc[key] || 0) + (r.amount || 0);
    return acc;
  }, {});

  // Unpaid students
  const unpaidStudents = admissions.filter(a => !a.feesPaid);

  const years = [...new Set(receipts.map(r => new Date(r.paidAt).getFullYear()))].sort((a,b) => b-a);

  const exportCSV = () => {
    const headers = ['Receipt No','Date','Student Name','Student ID','Fee Type','Amount','Mode','Collected By'];
    const rows = filtered.map(r => [r.receiptNo||'',r.paidAt?new Date(r.paidAt).toLocaleDateString('en-IN'):'',r.studentName||'',r.studentId||'',r.feeTypeLabel||r.feeType||'',r.amount||0,r.paymentMode||'',r.collectedBy||'']);
    const csv = [headers,...rows].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='fee_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{textAlign:'center',padding:40,color:'#888'}}>⏳ Loading fee data...</div>;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: '💰 Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, bg: '#e8f5e9', color: '#2E7D32' },
          { label: '💵 Cash', value: `₹${cashTotal.toLocaleString('en-IN')}`, bg: '#e8f5e9', color: '#1b5e20' },
          { label: '🌐 Online/UPI', value: `₹${onlineTotal.toLocaleString('en-IN')}`, bg: '#e3f2fd', color: '#1565C0' },
          { label: '🧾 Receipts', value: filtered.length, bg: '#f3e5f5', color: '#7B1FA2' },
          { label: '⚠️ Fees Pending', value: unpaidStudents.length, bg: '#fff3e0', color: '#E65100' },
        ].map((c,i) => (
          <div key={i} style={{ background: c.bg, borderRadius: 12, padding: '16px 18px', border: `1px solid ${c.color}22` }}>
            <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Fee type breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
          <h4 style={{ color: themeColor, marginBottom: 14 }}>📊 Fee Type Breakdown</h4>
          {Object.entries(feeBreakdown).sort((a,b) => b[1]-a[1]).map(([type, amt], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
              <span style={{ color: '#555' }}>{type}</span>
              <span style={{ fontWeight: 700, color: '#2E7D32' }}>₹{amt.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {Object.keys(feeBreakdown).length === 0 && <p style={{color:'#aaa',fontSize:13}}>No data</p>}
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
          <h4 style={{ color: themeColor, marginBottom: 14 }}>📅 Monthly Breakdown</h4>
          {Object.entries(monthlyBreakdown).sort((a,b) => new Date(b[0]) - new Date(a[0])).slice(0,8).map(([month, amt], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
              <span style={{ color: '#555' }}>{month}</span>
              <span style={{ fontWeight: 700, color: '#1565C0' }}>₹{amt.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {Object.keys(monthlyBreakdown).length === 0 && <p style={{color:'#aaa',fontSize:13}}>No data</p>}
        </div>
      </div>

      {/* Filters + table */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }} />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Months</option>
          {months.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <button onClick={fetchData} style={{ padding: '9px 14px', background: '#f0f4ff', color: themeColor, border: `1px solid ${themeColor}44`, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🔄</button>
        <button onClick={exportCSV} style={{ padding: '9px 16px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📥 Export</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:40,color:'#aaa'}}>No receipts found for selected filters.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.3fr 1.2fr 1fr 1fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
            {['Receipt No','Student','Fee Type','Amount','Mode','Date'].map(h => <span key={h} style={{color:'#fff',fontWeight:700,fontSize:12}}>{h}</span>)}
          </div>
          {filtered.slice(0,100).map((r, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.3fr 1.2fr 1fr 1fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx%2===0?'#fafbff':'#fff' }}>
              <span style={{fontSize:11,fontFamily:'monospace',color:themeColor,fontWeight:700}}>{r.receiptNo||'—'}</span>
              <div>
                <p style={{fontWeight:600,fontSize:13,margin:0}}>{r.studentName}</p>
                <p style={{fontSize:10,color:'#888',margin:0}}>{r.studentId||''}</p>
              </div>
              <span style={{fontSize:12}}>{r.feeTypeLabel||r.feeType||'—'}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#2E7D32'}}>₹{(r.amount||0).toLocaleString('en-IN')}</span>
              <span style={{fontSize:11,background:r.paymentMode==='online'?'#e3f2fd':'#e8f5e9',color:r.paymentMode==='online'?'#1565C0':'#2E7D32',padding:'2px 8px',borderRadius:10,fontWeight:600}}>{r.paymentMode==='online'?'🌐':'💵'} {r.paymentMode==='online'?'Online':'Cash'}</span>
              <span style={{fontSize:11,color:'#888'}}>{r.paidAt?new Date(r.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}):'—'}</span>
            </div>
          ))}
          {filtered.length > 100 && <div style={{padding:'10px 16px',fontSize:12,color:'#888',textAlign:'center',background:'#f8faff'}}>Showing 100 of {filtered.length}. Export CSV for full data.</div>}
          <div style={{padding:'12px 16px',background:'#f8faff',borderTop:'2px solid #e0e7ef',display:'flex',justifyContent:'flex-end',gap:20}}>
            <span style={{fontSize:13,fontWeight:700,color:'#2E7D32'}}>Total: ₹{totalCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Scholarship Report ───────────────────────────────────────────────────────
const ScholarshipReport = ({ themeColor }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [catFilter, setCatFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]         = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/staff-view/all');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const STATUS_LABELS = {
    not_filled: '📝 Not Filled',
    filled:     '📋 Filled',
    approved:   '✅ Approved',
    rejected:   '❌ Rejected',
    disbursed:  '💰 Disbursed',
  };

  const STATUS_COLORS = {
    not_filled: ['#fff3e0','#E65100'],
    filled:     ['#e3f2fd','#1565C0'],
    approved:   ['#e8f5e9','#2E7D32'],
    rejected:   ['#ffebee','#C62828'],
    disbursed:  ['#f3e5f5','#7B1FA2'],
  };

  const cats = [...new Set(admissions.map(a => (a.category||'other').toLowerCase()))].sort();

  const filtered = admissions.filter(a => {
    const mc = catFilter === 'all' || (a.category||'other').toLowerCase() === catFilter;
    const ms = statusFilter === 'all' || a.scholarshipStatus === statusFilter;
    const q  = search.toLowerCase();
    const mq = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    return mc && ms && mq;
  });

  // Category stats
  const catStats = admissions.reduce((acc, a) => {
    const c = (a.category||'other').toLowerCase();
    if (!acc[c]) acc[c] = { total:0, filled:0, approved:0, disbursed:0, not_filled:0, rejected:0 };
    acc[c].total++;
    acc[c][a.scholarshipStatus||'not_filled']++;
    return acc;
  }, {});

  // Status overview
  const statusStats = admissions.reduce((acc, a) => {
    const s = a.scholarshipStatus || 'not_filled';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const exportCSV = () => {
    const headers = ['Student Name','Student ID','Email','Category','Caste','Course','Year','PRN','Scholarship Status','MahaDBT App No','Notes'];
    const rows = filtered.map(a => [a.applicantName||'',a.studentId||'',a.email||'',a.category||'',a.caste||'',a.courseType||'',a.admissionYear||'',a.prnNumber||'',a.scholarshipStatus||'not_filled',a.mahaDBTAppNo||'',a.scholarshipNote||'']);
    const csv = [headers,...rows].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='scholarship_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{textAlign:'center',padding:40,color:'#888'}}>⏳ Loading scholarship data...</div>;

  return (
    <div>
      {/* Status overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = statusStats[key] || 0;
          const pct = admissions.length > 0 ? Math.round((count/admissions.length)*100) : 0;
          const [bg, color] = STATUS_COLORS[key];
          return (
            <div key={key} style={{ background: bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${color}22` }}>
              <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{pct}% of total</div>
            </div>
          );
        })}
      </div>

      {/* Category breakdown table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 24 }}>
        <h4 style={{ color: themeColor, marginBottom: 14 }}>📊 Category-wise Scholarship Status</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: themeColor }}>
                {['Category','Total','Not Filled','Filled','Approved','Rejected','Disbursed'].map(h => (
                  <th key={h} style={{ color: '#fff', padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(catStats).sort((a,b) => b[1].total - a[1].total).map(([cat, stats], i) => (
                <tr key={cat} style={{ background: i%2===0?'#fafbff':'#fff' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, textTransform: 'uppercase', color: '#333' }}>{cat}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1565C0' }}>{stats.total}</td>
                  <td style={{ padding: '9px 12px', color: '#E65100', fontWeight: 600 }}>{stats.not_filled||0}</td>
                  <td style={{ padding: '9px 12px', color: '#1565C0', fontWeight: 600 }}>{stats.filled||0}</td>
                  <td style={{ padding: '9px 12px', color: '#2E7D32', fontWeight: 600 }}>{stats.approved||0}</td>
                  <td style={{ padding: '9px 12px', color: '#C62828', fontWeight: 600 }}>{stats.rejected||0}</td>
                  <td style={{ padding: '9px 12px', color: '#7B1FA2', fontWeight: 600 }}>{stats.disbursed||0}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ background: '#e8eaf6', borderTop: '2px solid #9fa8da' }}>
                <td style={{ padding: '9px 12px', fontWeight: 800, color: '#1a237e' }}>TOTAL</td>
                <td style={{ padding: '9px 12px', fontWeight: 800, color: '#1a237e' }}>{admissions.length}</td>
                {['not_filled','filled','approved','rejected','disbursed'].map(s => (
                  <td key={s} style={{ padding: '9px 12px', fontWeight: 700, color: '#333' }}>{statusStats[s]||0}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Name, ID, email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Categories</option>
          {cats.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13 }}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={fetch} style={{ padding: '9px 14px', background: '#f0f4ff', color: themeColor, border: `1px solid ${themeColor}44`, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🔄</button>
        <button onClick={exportCSV} style={{ padding: '9px 16px', background: '#7B1FA2', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📥 Export</button>
      </div>

      {/* Student list */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1.2fr 1fr 1.5fr', background: themeColor, padding: '12px 16px', gap: 8 }}>
          {['Student','Category','Course/Year','Student ID','PRN','Scholarship Status'].map(h => <span key={h} style={{color:'#fff',fontWeight:700,fontSize:12}}>{h}</span>)}
        </div>
        {filtered.length === 0 ? (
          <div style={{padding:30,textAlign:'center',color:'#aaa',fontSize:13}}>No students found.</div>
        ) : filtered.map((a, idx) => {
          const [bg, color] = STATUS_COLORS[a.scholarshipStatus||'not_filled'];
          return (
            <div key={a._id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1.2fr 1fr 1.5fr', padding: '10px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx%2===0?'#fafbff':'#fff' }}>
              <div>
                <p style={{fontWeight:600,fontSize:13,margin:0}}>{a.applicantName}</p>
                <p style={{fontSize:10,color:'#888',margin:0}}>{a.email}</p>
              </div>
              <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',color:'#555'}}>{a.category||'—'}</span>
              <div>
                <p style={{fontSize:11,margin:0}}>{a.courseType||'—'}</p>
                <p style={{fontSize:10,color:'#888',margin:0}}>{a.admissionYear}</p>
              </div>
              <span style={{fontSize:11,fontFamily:'monospace',color:'#1565C0',fontWeight:600}}>{a.studentId||'—'}</span>
              <span style={{fontSize:11,fontFamily:'monospace',color:a.prnNumber?'#2E7D32':'#E65100',fontWeight:600}}>{a.prnNumber||'⚠️—'}</span>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:12,background:bg,color}}>{STATUS_LABELS[a.scholarshipStatus||'not_filled']}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main AdminReports Component ──────────────────────────────────────────────
const AdminReports = ({ themeColor = '#1565C0' }) => {
  const [reportTab, setReportTab] = useState('fee');

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>📊 College Reports</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Fee collection reports and scholarship status reports.</p>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#f0f4f8', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { id: 'fee',         label: '💰 Fee Report' },
          { id: 'scholarship', label: '🏅 Scholarship Report' },
        ].map(t => (
          <button key={t.id} onClick={() => setReportTab(t.id)}
            style={{ padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: reportTab === t.id ? themeColor : 'transparent', color: reportTab === t.id ? '#fff' : '#555', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {reportTab === 'fee'         && <FeeReport         themeColor={themeColor} />}
      {reportTab === 'scholarship' && <ScholarshipReport themeColor={themeColor} />}
    </div>
  );
};

export default AdminReports;
