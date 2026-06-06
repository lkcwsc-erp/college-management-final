// ============================================================
//  ExpenseTracker.jsx
//  Drop-in replacement for the  {activeTab === 'expenses'}
//  block inside AccountsSectionDashboard.js
//
//  Props received from parent:
//    user        – logged-in user object  { name, _id, … }
//    showToast   – (msg, type?) => void
//    API         – axios instance with base URL set
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'academic_resources',    label: '📚 Academic Resources' },
  { value: 'library',               label: '📖 Library Expenses' },
  { value: 'laboratory',            label: '🔬 Laboratory Expenses' },
  { value: 'office_administration', label: '🗂️ Office Administration' },
  { value: 'internet_communication',label: '📡 Internet & Communication' },
  { value: 'website_erp',           label: '💻 Website & ERP Maintenance' },
  { value: 'faculty_development',   label: '👩‍🏫 Faculty Development' },
  { value: 'student_activities',    label: '🎭 Student Activities' },
  { value: 'scholarships_welfare',  label: '🎓 Scholarships & Student Welfare' },
  { value: 'building_development',  label: '🏗️ Building Development' },
  { value: 'electrical_maintenance',label: '⚡ Electrical Maintenance' },
  { value: 'water_sanitation',      label: '💧 Water & Sanitation' },
  { value: 'university_govt_fees',  label: '🏛️ University / Government Fees' },
  { value: 'it_software',           label: '🖥️ IT & Software' },
  { value: 'vehicle_travel',        label: '🚗 Vehicle & Travel' },
  { value: 'infrastructure',        label: '🏢 Infrastructure' },
  { value: 'stationery',            label: '📝 Stationery' },
  { value: 'electricity',           label: '💡 Electricity / Utilities' },
  { value: 'salary',                label: '👤 Salary / Wages' },
  { value: 'events',                label: '🎉 Events / Functions' },
  { value: 'maintenance',           label: '🔧 Maintenance' },
  { value: 'other',                 label: '📦 Other' },
];

const PAYMENT_MODES = [
  { value: 'cash',          label: '💵 Cash' },
  { value: 'upi',           label: '📱 UPI' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer' },
  { value: 'cheque',        label: '📄 Cheque' },
  { value: 'online',        label: '🌐 Online Payment' },
];

const CURRENT_AY = (() => {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  return month >= 6
    ? `${year}-${String(year + 1).slice(2)}`
    : `${year - 1}-${String(year).slice(2)}`;
})();

const ACADEMIC_YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i + (new Date().getMonth() >= 5 ? 0 : -1);
  return `${y}-${String(y + 1).slice(2)}`;
});

const BLANK_FORM = {
  description:  '',
  amount:       '',
  date:         new Date().toISOString().split('T')[0],
  category:     'other',
  paidTo:       '',
  paymentMode:  'cash',
  academicYear: CURRENT_AY,
  remarks:      '',
};

// ─── Utility ─────────────────────────────────────────────────────────────────

const fmt = n => Number(n || 0).toLocaleString('en-IN');
const catLabel  = v => CATEGORIES.find(c => c.value === v)?.label  || v;
const modeLabel = v => PAYMENT_MODES.find(m => m.value === v)?.label || v;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExpenseTracker({ user, showToast, API }) {
  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm]             = useState(BLANK_FORM);
  const [billFile, setBillFile]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const fileRef                     = useRef();

  // ── List / filter state ───────────────────────────────────────────────────
  const [expenses, setExpenses]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const LIMIT = 20;

  const [filters, setFilters] = useState({
    academicYear: CURRENT_AY,
    category:     '',
    paymentMode:  '',
    search:       '',
    startDate:    '',
    endDate:      '',
  });

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const [stats, setStats]           = useState(null);
  const [statsAY, setStatsAY]       = useState(CURRENT_AY);

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView]             = useState('list'); // 'list' | 'form' | 'dashboard'

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch expenses
  // ─────────────────────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (filters.academicYear) params.set('academicYear', filters.academicYear);
      if (filters.category)     params.set('category',     filters.category);
      if (filters.paymentMode)  params.set('paymentMode',  filters.paymentMode);
      if (filters.search)       params.set('search',       filters.search);
      if (filters.startDate)    params.set('startDate',    filters.startDate);
      if (filters.endDate)      params.set('endDate',      filters.endDate);

      const res = await API.get(`/expenses?${params}`);
      setExpenses(res.data.expenses || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to load expenses.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, API, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get(`/expenses/dashboard?academicYear=${statsAY}`);
      setStats(res.data.stats);
    } catch (_) {}
  }, [statsAY, API]);

  useEffect(() => { fetchExpenses(1); setPage(1); }, [fetchExpenses]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ─────────────────────────────────────────────────────────────────────────
  // Save (create / update)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.description.trim()) return showToast('Description is required.', 'error');
    if (!form.amount || Number(form.amount) <= 0) return showToast('Enter a valid amount.', 'error');
    if (!form.date)          return showToast('Date is required.', 'error');
    if (!form.academicYear)  return showToast('Academic Year is required.', 'error');

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (billFile) fd.append('bill', billFile);

      if (editingId) {
        await API.put(`/expenses/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('✅ Expense updated successfully!');
      } else {
        await API.post('/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('✅ Expense recorded successfully!');
      }

      setForm(BLANK_FORM);
      setBillFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setEditingId(null);
      setView('list');
      fetchExpenses(1);
      fetchStats();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save expense.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense record? This cannot be undone.')) return;
    try {
      await API.delete(`/expenses/${id}`);
      showToast('Expense deleted.');
      fetchExpenses(page);
      fetchStats();
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Edit
  // ─────────────────────────────────────────────────────────────────────────
  const handleEdit = (exp) => {
    setForm({
      description:  exp.description,
      amount:       exp.amount,
      date:         exp.date?.split('T')[0],
      category:     exp.category,
      paidTo:       exp.paidTo || '',
      paymentMode:  exp.paymentMode,
      academicYear: exp.academicYear,
      remarks:      exp.remarks || '',
    });
    setEditingId(exp._id);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Export Excel
  // ─────────────────────────────────────────────────────────────────────────
  const handleExcelExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear) params.set('academicYear', filters.academicYear);
      if (filters.category)     params.set('category',     filters.category);
      if (filters.startDate)    params.set('startDate',    filters.startDate);
      if (filters.endDate)      params.set('endDate',      filters.endDate);

      const res = await API.get(`/expenses/export?${params}`);
      const rows = res.data.rows || [];

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

      // Column widths
      ws['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 35 }, { wch: 22 },
        { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 12 },
        { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
      ];

      const ay = filters.academicYear || CURRENT_AY;
      XLSX.writeFile(wb, `Expense_Report_${ay}.xlsx`);
      showToast('✅ Excel exported successfully!');
    } catch (e) {
      showToast('Export failed.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Export PDF (browser print)
  // ─────────────────────────────────────────────────────────────────────────
  const handlePdfExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear) params.set('academicYear', filters.academicYear);
      if (filters.category)     params.set('category',     filters.category);
      if (filters.startDate)    params.set('startDate',    filters.startDate);
      if (filters.endDate)      params.set('endDate',      filters.endDate);

      const res  = await API.get(`/expenses/export?${params}`);
      const rows = res.data.rows || [];
      const totalAmt = res.data.totalAmount || 0;

      const tableRows = rows.map(r =>
        `<tr>
          <td>${r['Sr. No.']}</td><td>${r['Date']}</td>
          <td>${r['Description']}</td><td>${r['Category']}</td>
          <td>${r['Paid To']}</td><td>${r['Payment Mode']}</td>
          <td style="text-align:right">₹${Number(r['Amount (₹)']).toLocaleString('en-IN')}</td>
          <td>${r['Academic Year']}</td><td>${r['Remarks']}</td>
        </tr>`
      ).join('');

      const html = `
        <!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <title>Expense Report – ${filters.academicYear || CURRENT_AY}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
          h2 { color: #1565C0; text-align: center; }
          p.subtitle { text-align: center; color: #555; margin-top: -8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #1565C0; color: #fff; padding: 7px 6px; text-align: left; }
          td { border-bottom: 1px solid #e0e7ef; padding: 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f5f8ff; }
          tfoot td { font-weight: 700; background: #e3f2fd; }
        </style>
        </head><body>
        <h2>Late Kalpana Chawla Mahila College – Expense Report</h2>
        <p class="subtitle">Academic Year: ${filters.academicYear || CURRENT_AY}${filters.category ? ' | Category: ' + catLabel(filters.category) : ''}</p>
        <table>
          <thead><tr>
            <th>#</th><th>Date</th><th>Description</th><th>Category</th>
            <th>Paid To</th><th>Mode</th><th>Amount (₹)</th>
            <th>AY</th><th>Remarks</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
          <tfoot><tr>
            <td colspan="6" style="text-align:right">Total:</td>
            <td style="text-align:right">₹${totalAmt.toLocaleString('en-IN')}</td>
            <td colspan="2"></td>
          </tr></tfoot>
        </table>
        <p style="margin-top:24px;font-size:10px;color:#888">
          Generated on ${new Date().toLocaleString('en-IN')} | Printed by: ${user?.name || 'Accounts Staff'}
        </p>
        </body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } catch (e) {
      showToast('PDF export failed.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────────────────────────────────────
  const S = {
    card:    { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)', marginBottom:20 },
    label:   { display:'block', fontWeight:600, fontSize:13, color:'#374151', marginBottom:5 },
    input:   { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' },
    select:  { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, background:'#fff', boxSizing:'border-box' },
    btn:     (bg='#1565C0', color='#fff') => ({ background:bg, color, padding:'10px 22px', borderRadius:8, border:'none', fontWeight:600, fontSize:14, cursor:'pointer' }),
    tabBtn:  (active) => ({ padding:'8px 18px', borderRadius:8, border:'none', fontWeight:600, fontSize:13, cursor:'pointer', background:active?'#1565C0':'#e3f2fd', color:active?'#fff':'#1565C0' }),
    statCard:(bg, color) => ({ background:bg, color, borderRadius:12, padding:'16px 22px', flex:'1 1 200px', minWidth:180 }),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h2 style={{ color:'#1565C0', margin:0 }}>🏗️ College Expense Tracker</h2>
          <p style={{ color:'#666', fontSize:13, margin:'4px 0 0' }}>Record, monitor, and audit all college expenditures.</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button style={S.tabBtn(view==='dashboard')} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={S.tabBtn(view==='list')}      onClick={() => setView('list')}>📋 History</button>
          <button style={S.tabBtn(view==='form')}      onClick={() => { setForm(BLANK_FORM); setEditingId(null); setView('form'); }}>
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* ══════════════ DASHBOARD ══════════════ */}
      {view === 'dashboard' && (
        <div>
          {/* AY Selector */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <label style={{ fontWeight:600, color:'#374151' }}>Academic Year:</label>
            <select style={{ ...S.select, width:'auto', minWidth:140 }} value={statsAY} onChange={e => setStatsAY(e.target.value)}>
              {ACADEMIC_YEARS.map(ay => <option key={ay} value={ay}>{ay}</option>)}
            </select>
          </div>

          {/* Stat Cards */}
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
            <div style={S.statCard('#e3f2fd','#1565C0')}>
              <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>Total Today</div>
              <div style={{ fontSize:24, fontWeight:800 }}>₹{fmt(stats?.today)}</div>
            </div>
            <div style={S.statCard('#fff3e0','#E65100')}>
              <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>This Month</div>
              <div style={{ fontSize:24, fontWeight:800 }}>₹{fmt(stats?.thisMonth)}</div>
            </div>
            <div style={S.statCard('#e8f5e9','#2E7D32')}>
              <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>Academic Year {statsAY}</div>
              <div style={{ fontSize:24, fontWeight:800 }}>₹{fmt(stats?.academicYear)}</div>
            </div>
          </div>

          {/* Category-wise summary */}
          <div style={S.card}>
            <h3 style={{ color:'#1565C0', marginTop:0, marginBottom:16 }}>📊 Category-wise Summary – {statsAY}</h3>
            {(!stats?.categoryWise || stats.categoryWise.length === 0) ? (
              <p style={{ color:'#888', textAlign:'center' }}>No expenses recorded for this academic year.</p>
            ) : (
              <div>
                {stats.categoryWise.map(c => {
                  const pct = stats.academicYear > 0 ? Math.round((c.total / stats.academicYear) * 100) : 0;
                  return (
                    <div key={c._id} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:500 }}>{catLabel(c._id)}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#C62828' }}>₹{fmt(c.total)} &nbsp;<span style={{ color:'#888', fontWeight:400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ background:'#e0e7ef', borderRadius:99, height:8 }}>
                        <div style={{ width:`${pct}%`, background:'#1565C0', borderRadius:99, height:8, transition:'width .4s' }} />
                      </div>
                      <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{c.count} record{c.count !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ ADD / EDIT FORM ══════════════ */}
      {view === 'form' && (
        <div style={S.card}>
          <h3 style={{ color:'#1565C0', marginTop:0 }}>
            {editingId ? '✏️ Edit Expense' : '➕ Record New Expense'}
          </h3>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
            {/* Description */}
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={S.label}>Description *</label>
              <input style={S.input} type="text" placeholder="e.g. Purchase of lab chemicals"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Amount */}
            <div>
              <label style={S.label}>Amount (₹) *</label>
              <input style={S.input} type="number" min="0" placeholder="e.g. 5000"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>

            {/* Date */}
            <div>
              <label style={S.label}>Date *</label>
              <input style={S.input} type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            {/* Academic Year */}
            <div>
              <label style={S.label}>Academic Year *</label>
              <select style={S.select} value={form.academicYear}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}>
                {ACADEMIC_YEARS.map(ay => <option key={ay} value={ay}>{ay}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={S.label}>Category</label>
              <select style={S.select} value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label style={S.label}>Payment Mode</label>
              <select style={S.select} value={form.paymentMode}
                onChange={e => setForm({ ...form, paymentMode: e.target.value })}>
                {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Paid To */}
            <div>
              <label style={S.label}>Paid To / Vendor</label>
              <input style={S.input} type="text" placeholder="e.g. Sharma Stationery Store"
                value={form.paidTo} onChange={e => setForm({ ...form, paidTo: e.target.value })} />
            </div>

            {/* Bill Upload */}
            <div>
              <label style={S.label}>Bill / Invoice Upload <span style={{ fontWeight:400, color:'#888' }}>(PDF, JPG, PNG – max 200 KB)</span></label>
              <input ref={fileRef} style={{ ...S.input, padding:'6px 10px' }} type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f && f.size > 200 * 1024) {
                    showToast('File must be under 200 KB.', 'error');
                    e.target.value = '';
                    return;
                  }
                  setBillFile(f || null);
                }} />
              {billFile && <div style={{ fontSize:12, color:'#2E7D32', marginTop:4 }}>📎 {billFile.name}</div>}
            </div>

            {/* Remarks */}
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={S.label}>Remarks / Notes</label>
              <textarea style={{ ...S.input, minHeight:72, resize:'vertical' }}
                placeholder="Any additional notes about this expense..."
                value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button style={S.btn()} onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : (editingId ? '💾 Update Expense' : '💾 Save Expense')}
            </button>
            <button style={S.btn('#e0e7ef','#374151')} onClick={() => { setForm(BLANK_FORM); setEditingId(null); setView('list'); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ HISTORY / LIST ══════════════ */}
      {view === 'list' && (
        <div>
          {/* Filters */}
          <div style={S.card}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
              <div>
                <label style={S.label}>Academic Year</label>
                <select style={S.select} value={filters.academicYear}
                  onChange={e => setFilters({ ...filters, academicYear: e.target.value })}>
                  <option value="">All Years</option>
                  {ACADEMIC_YEARS.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Category</label>
                <select style={S.select} value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Payment Mode</label>
                <select style={S.select} value={filters.paymentMode}
                  onChange={e => setFilters({ ...filters, paymentMode: e.target.value })}>
                  <option value="">All Modes</option>
                  {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>From Date</label>
                <input style={S.input} type="date" value={filters.startDate}
                  onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div>
                <label style={S.label}>To Date</label>
                <input style={S.input} type="date" value={filters.endDate}
                  onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <div>
                <label style={S.label}>Search</label>
                <input style={S.input} type="text" placeholder="Description / vendor…"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>

            {/* Export buttons */}
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
              <button style={S.btn('#2E7D32')} onClick={handleExcelExport}>📥 Export Excel</button>
              <button style={S.btn('#C62828')} onClick={handlePdfExport}>🖨️ Export PDF</button>
              <button style={S.btn('#455a64')} onClick={() => setFilters({ academicYear:CURRENT_AY, category:'', paymentMode:'', search:'', startDate:'', endDate:'' })}>
                🔄 Reset Filters
              </button>
            </div>
          </div>

          {/* Summary strip */}
          <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ background:'#e3f2fd', color:'#1565C0', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:13 }}>
              Records: {total}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'#888' }}>⏳ Loading…</div>
          ) : expenses.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#888' }}>
              <div style={{ fontSize:40 }}>🏗️</div>
              <h3>No expenses found</h3>
              <p style={{ fontSize:13 }}>Try adjusting the filters or add a new expense.</p>
            </div>
          ) : (
            <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #e0e7ef', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1.5fr 1fr 1.2fr 1fr 1fr 0.7fr 0.6fr', background:'#1565C0', padding:'12px 16px', gap:8 }}>
                {['Description','Category','Date','Paid To','Mode','Amount','AY',''].map(h => (
                  <span key={h} style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</span>
                ))}
              </div>

              {expenses.map((exp, idx) => (
                <div key={exp._id} style={{ display:'grid', gridTemplateColumns:'1.8fr 1.5fr 1fr 1.2fr 1fr 1fr 0.7fr 0.6fr', padding:'11px 16px', gap:8, alignItems:'center', borderBottom:'1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                  <div>
                    <div style={{ fontSize:13, color:'#222', fontWeight:500 }}>{exp.description}</div>
                    {exp.remarks && <div style={{ fontSize:11, color:'#888', marginTop:2 }}>📝 {exp.remarks}</div>}
                    {exp.billUrl && (
                      <a href={exp.billUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#1565C0' }}>📎 View Bill</a>
                    )}
                  </div>
                  <span style={{ fontSize:12, color:'#555' }}>{catLabel(exp.category)}</span>
                  <span style={{ fontSize:12, color:'#555' }}>{new Date(exp.date).toLocaleDateString('en-IN')}</span>
                  <span style={{ fontSize:12, color:'#555' }}>{exp.paidTo || '—'}</span>
                  <span style={{ fontSize:12, color:'#555' }}>{modeLabel(exp.paymentMode)}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#C62828' }}>₹{fmt(exp.amount)}</span>
                  <span style={{ fontSize:11, color:'#555' }}>{exp.academicYear}</span>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={() => handleEdit(exp)}
                      title="Edit"
                      style={{ background:'#e3f2fd', color:'#1565C0', border:'none', borderRadius:6, padding:'4px 8px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(exp._id)}
                      title="Delete"
                      style={{ background:'#ffebee', color:'#C62828', border:'none', borderRadius:6, padding:'4px 8px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {/* Audit info tooltip at bottom */}
              {expenses.length > 0 && (
                <div style={{ padding:'10px 16px', fontSize:11, color:'#888', borderTop:'1px solid #f0f4f8', background:'#fafbff' }}>
                  💡 Hover a record to see audit info. Entered By and Created Date are stored with every record.
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
              <button disabled={page === 1} style={S.btn(page===1?'#e0e7ef':'#1565C0', page===1?'#aaa':'#fff')}
                onClick={() => { const p = page - 1; setPage(p); fetchExpenses(p); }}>← Prev</button>
              <span style={{ lineHeight:'40px', fontSize:13, color:'#555' }}>Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} style={S.btn(page>=Math.ceil(total/LIMIT)?'#e0e7ef':'#1565C0', page>=Math.ceil(total/LIMIT)?'#aaa':'#fff')}
                onClick={() => { const p = page + 1; setPage(p); fetchExpenses(p); }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
