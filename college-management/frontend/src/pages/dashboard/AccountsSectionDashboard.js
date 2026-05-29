import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLLEGE_NAME = 'Late Kalpana Chawla Mahila College';
const COLLEGE_SUBTITLE = 'Senior Science & Arts College, Gangakhed';
const COLLEGE_UPI = 'lkcwsc@upi';

const DEFAULT_DOC_FEES = {
  BONAFIDE:  { label: '📋 Bonafide Certificate',      price: 30 },
  ID_CARD:   { label: '🪪 ID Card',                   price: 100 },
  MARKSHEET: { label: '📄 Marksheet',                 price: 50 },
  MIGRATION: { label: '📜 Migration Certificate',     price: 200 },
  TC:        { label: '🎓 Transfer Certificate (TC)', price: 150 },
};

const FEE_TYPES = [
  { key: 'admission',    label: '🎓 Admission Fee' },
  { key: 'exam',         label: '📝 Exam Fee' },
  { key: 'tc',           label: '📄 TC Fee' },
  { key: 'bonafide',     label: '📋 Bonafide Fee' },
  { key: 'degree',       label: '🏅 Degree Fee' },
  { key: 'migration',    label: '📜 Migration Fee' },
  { key: 'development',  label: '🏗️ Development Fee' },
  { key: 'library',      label: '📚 Library Fee' },
  { key: 'penalty',      label: '⚠️ Penalty' },
  { key: 'dues',         label: '💸 Dues / Arrears' },
  { key: 'other',        label: '➕ Other Fee' },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const loadDocFees = () => {
  try {
    const s = localStorage.getItem('lkcwsc_doc_fees');
    if (s) return { ...DEFAULT_DOC_FEES, ...JSON.parse(s) };
  } catch (_) {}
  return { ...DEFAULT_DOC_FEES };
};
const saveDocFees = (fees) => localStorage.setItem('lkcwsc_doc_fees', JSON.stringify(fees));

// ─── Receipt printer ──────────────────────────────────────────────────────────
const printReceipt = (data) => {
  const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:30px;display:flex;justify-content:center}
    .receipt{background:white;max-width:420px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12)}
    .header{background:linear-gradient(135deg,#0D47A1,#1565C0);color:white;padding:24px;text-align:center}
    .header h2{font-size:16px;font-weight:700;margin-bottom:4px}
    .header p{font-size:11px;opacity:0.8;margin-bottom:10px}
    .badge{display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:1px}
    .receipt-no{font-size:11px;opacity:0.7;margin-top:8px}
    .body{padding:20px}
    .row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
    .row:last-child{border-bottom:none}
    .label{color:#888;font-weight:500}
    .value{color:#222;font-weight:600;text-align:right;max-width:60%}
    .divider{border-top:2px dashed #e0e0e0;margin:14px 0}
    .amount-box{background:#e8f5e9;border-radius:8px;padding:14px;text-align:center;margin:14px 0}
    .amount-box .amt{font-size:28px;font-weight:800;color:#1b5e20}
    .amount-box .label2{font-size:11px;color:#555;margin-top:2px}
    .paid-stamp{text-align:center;margin:16px 0}
    .paid-stamp span{display:inline-block;border:3px solid #2E7D32;color:#2E7D32;font-size:20px;font-weight:800;padding:5px 20px;border-radius:6px;transform:rotate(-8deg);letter-spacing:4px}
    .footer{background:#f8faff;padding:14px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee}
    @media print{body{background:white;padding:0}.receipt{box-shadow:none}}
  </style></head>
  <body><div class="receipt">
    <div class="header">
      <h2>${COLLEGE_NAME}</h2>
      <p>${COLLEGE_SUBTITLE}</p>
      <span class="badge">🧾 OFFICIAL FEE RECEIPT</span>
      <div class="receipt-no">Receipt No: ${data.receiptNo}</div>
    </div>
    <div class="body">
      <div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div>
      <div class="row"><span class="label">Student Name</span><span class="value">${data.studentName}</span></div>
      ${data.studentId ? `<div class="row"><span class="label">Student ID</span><span class="value">${data.studentId}</span></div>` : ''}
      ${data.rollNumber ? `<div class="row"><span class="label">Roll No</span><span class="value">${data.rollNumber}</span></div>` : ''}
      ${data.branch ? `<div class="row"><span class="label">Course</span><span class="value">${data.branch}</span></div>` : ''}
      ${data.year ? `<div class="row"><span class="label">Year</span><span class="value">${data.year}</span></div>` : ''}
      <div class="divider"></div>
      <div class="row"><span class="label">Fee Type</span><span class="value">${data.feeLabel}</span></div>
      <div class="row"><span class="label">Payment Mode</span><span class="value">${data.paymentMode === 'online' ? '🌐 Online / UPI' : '💵 Cash'}</span></div>
      ${data.transactionId ? `<div class="row"><span class="label">Txn ID / UTR</span><span class="value">${data.transactionId}</span></div>` : ''}
      <div class="divider"></div>
      <div class="amount-box">
        <div class="amt">₹ ${data.amount}/-</div>
        <div class="label2">Amount Paid</div>
      </div>
      <div class="paid-stamp"><span>PAID</span></div>
    </div>
    <div class="footer">
      Collected by: <strong>${data.collectedBy}</strong><br/>
      This is a computer-generated receipt. No signature required.
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print();}</scri${'pt'}>
  </body></html>`;
  const w = window.open('', '_blank', 'width=500,height=750');
  w.document.write(html);
  w.document.close();
};

const genReceiptNo = () => 'REC' + Date.now().toString().slice(-9);

// ─── Status helpers ───────────────────────────────────────────────────────────
const docStatusStyle = (status) => {
  const map = {
    pending_accounts:     { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Review' },
    rejected_by_accounts: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' },
    pending_principal:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Forwarded to Principal' },
    pending_generation:   { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved → Student Section' },
    completed:            { bg: '#e3f2fd', color: '#1565C0', label: '🏁 Completed' },
  };
  return map[status] || { bg: '#f5f5f5', color: '#666', label: status };
};

// ─── Small reusable Field ─────────────────────────────────────────────────────
const F = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
    <span style={{ color: '#888', fontWeight: 600 }}>{label}</span>
    <span style={{ color: '#222', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AccountsSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home');

  // ── Global message ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: '' }); // type: 'success'|'error'
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // ── Document requests ──────────────────────────────────────────────────────
  const [docRequests, setDocRequests]     = useState([]);
  const [docLoading, setDocLoading]       = useState(false);
  const [docSearch, setDocSearch]         = useState('');
  const [docFilter, setDocFilter]         = useState('pending_accounts');
  const [selectedDoc, setSelectedDoc]     = useState(null);
  const [docAction, setDocAction]         = useState(''); // 'collect' | 'reject'
  const [docNotes, setDocNotes]           = useState('');
  const [docLoading2, setDocLoading2]     = useState(false);
  const [payMode, setPayMode]             = useState('cash');
  const [txnId, setTxnId]                = useState('');
  const [docFees, setDocFees]             = useState(loadDocFees());
  const [editDocFees, setEditDocFees]     = useState(false);
  const [docFeeEdits, setDocFeeEdits]     = useState({});

  // ── Admission fees ─────────────────────────────────────────────────────────
  const [admissions, setAdmissions]         = useState([]);
  const [admLoading, setAdmLoading]         = useState(false);
  const [admSearch, setAdmSearch]           = useState('');
  const [admFilter, setAdmFilter]           = useState('all'); // 'all'|'paid'|'unpaid'
  const [selectedAdm, setSelectedAdm]       = useState(null);
  const [admPayMode, setAdmPayMode]         = useState('cash');
  const [admTxnId, setAdmTxnId]             = useState('');
  const [admFeeAmt, setAdmFeeAmt]           = useState('');
  const [admFeeType, setAdmFeeType]         = useState('admission');
  const [admLoading2, setAdmLoading2]       = useState(false);

  // ── Yearly fee structure ───────────────────────────────────────────────────
  const [yearlyFees, setYearlyFees]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_yearly_fees') || 'null') || {}; } catch { return {}; }
  });
  const [editYearlyFee, setEditYearlyFee]   = useState(null); // { course, year }
  const [yearlyFeeVal, setYearlyFeeVal]     = useState('');

  // ── College expenses ───────────────────────────────────────────────────────
  const [expenses, setExpenses]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_expenses') || '[]'); } catch { return []; }
  });
  const [expForm, setExpForm]               = useState({ description: '', amount: '', date: '', category: 'other', paidTo: '' });
  const [expMsg, setExpMsg]                 = useState('');

  // ── Payment history (from localStorage) ──────────────────────────────────
  const [payHistory, setPayHistory]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('lkcwsc_pay_history') || '[]'); } catch { return []; }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Data fetchers
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDocRequests = useCallback(async () => {
    setDocLoading(true);
    try {
      const res = await API.get('/document-requests/accounts/all');
      setDocRequests(res.data.requests || []);
    } catch { /* silent */ }
    finally { setDocLoading(false); }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    setAdmLoading(true);
    try {
      const res = await API.get('/admissions/accounts-section/all');
      setAdmissions(res.data.admissions || []);
    } catch { /* silent */ }
    finally { setAdmLoading(false); }
  }, []);

  useEffect(() => {
    fetchDocRequests();
    fetchAdmissions();
  }, [fetchDocRequests, fetchAdmissions]);

  const handleLogout = () => { logout(); navigate('/'); };

  // ─────────────────────────────────────────────────────────────────────────
  // Document request actions
  // ─────────────────────────────────────────────────────────────────────────
  const closeDocModal = () => {
    setSelectedDoc(null); setDocAction(''); setDocNotes('');
    setPayMode('cash'); setTxnId('');
  };

  const handleDocReject = async () => {
    if (!docNotes.trim()) { showToast('Please enter rejection reason.', 'error'); return; }
    setDocLoading2(true);
    try {
      await API.put(`/document-requests/accounts/reject/${selectedDoc._id}`, { reason: docNotes });
      showToast('Request rejected.');
      closeDocModal(); fetchDocRequests();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setDocLoading2(false); }
  };

  const handleDocCollect = async () => {
    if (payMode === 'online' && !txnId.trim()) {
      showToast('Please enter Transaction ID for online payment.', 'error'); return;
    }
    setDocLoading2(true);
    try {
      await API.put(`/document-requests/accounts/approve/${selectedDoc._id}`, {
        notes: `Fees collected. Mode: ${payMode}${txnId ? '. TxnID: ' + txnId : ''}`
      });
      const fee = docFees[selectedDoc.documentType]?.price ?? 0;
      const rNo = genReceiptNo();

      // Save to history
      const entry = {
        id: rNo, date: new Date().toISOString(),
        studentName: selectedDoc.studentName,
        studentEmail: selectedDoc.studentEmail,
        branch: selectedDoc.branch, year: selectedDoc.admissionYear,
        feeLabel: docFees[selectedDoc.documentType]?.label || selectedDoc.documentTypeLabel,
        amount: fee, paymentMode: payMode, transactionId: txnId,
        collectedBy: user?.name || 'Accounts Staff',
        type: 'document',
      };
      const hist = [entry, ...payHistory].slice(0, 200);
      setPayHistory(hist);
      localStorage.setItem('lkcwsc_pay_history', JSON.stringify(hist));

      printReceipt({ ...entry, receiptNo: rNo });
      showToast('Receipt generated & request approved!');
      closeDocModal(); fetchDocRequests();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setDocLoading2(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Admission fee collection
  // ─────────────────────────────────────────────────────────────────────────
  const handleAdmFeeCollect = async () => {
    if (!admFeeAmt || isNaN(Number(admFeeAmt)) || Number(admFeeAmt) <= 0) {
      showToast('Enter a valid fee amount.', 'error'); return;
    }
    if (admPayMode === 'online' && !admTxnId.trim()) {
      showToast('Enter Transaction ID for online payment.', 'error'); return;
    }
    setAdmLoading2(true);
    const rNo = genReceiptNo();
    const feeType = FEE_TYPES.find(f => f.key === admFeeType);
    try {
      await API.put(`/admissions/mark-fees-paid/${selectedAdm._id}`, {
        fees: Number(admFeeAmt),
        paymentMode: admPayMode,
        transactionId: admTxnId,
        receiptNo: rNo,
        collectedBy: user?.name || 'Accounts Staff',
      });

      const entry = {
        id: rNo, date: new Date().toISOString(),
        studentName: selectedAdm.applicantName,
        studentEmail: selectedAdm.email,
        studentId: selectedAdm.studentId,
        branch: selectedAdm.courseType,
        year: selectedAdm.admissionYear,
        feeLabel: feeType?.label || 'Fee',
        amount: Number(admFeeAmt),
        paymentMode: admPayMode,
        transactionId: admTxnId,
        collectedBy: user?.name || 'Accounts Staff',
        type: 'admission',
      };
      const hist = [entry, ...payHistory].slice(0, 200);
      setPayHistory(hist);
      localStorage.setItem('lkcwsc_pay_history', JSON.stringify(hist));

      printReceipt({ ...entry, receiptNo: rNo });
      showToast('Admission fee collected & receipt generated!');
      setSelectedAdm(null); setAdmFeeAmt(''); setAdmTxnId(''); setAdmPayMode('cash');
      fetchAdmissions();
    } catch (e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setAdmLoading2(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Expense tracker
  // ─────────────────────────────────────────────────────────────────────────
  const saveExpense = () => {
    if (!expForm.description.trim() || !expForm.amount || !expForm.date) {
      setExpMsg('❌ Fill all required fields.'); return;
    }
    const entry = { ...expForm, id: Date.now(), amount: Number(expForm.amount) };
    const updated = [entry, ...expenses];
    setExpenses(updated);
    localStorage.setItem('lkcwsc_expenses', JSON.stringify(updated));
    setExpForm({ description: '', amount: '', date: '', category: 'other', paidTo: '' });
    setExpMsg('✅ Expense recorded!');
    setTimeout(() => setExpMsg(''), 3000);
  };
  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('lkcwsc_expenses', JSON.stringify(updated));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Derived numbers
  // ─────────────────────────────────────────────────────────────────────────
  const pendingDocCount  = docRequests.filter(r => r.status === 'pending_accounts').length;
  const paidAdmCount     = admissions.filter(a => a.feesPaid).length;
  const unpaidAdmCount   = admissions.filter(a => !a.feesPaid).length;
  const totalCollected   = payHistory.reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpenses    = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const filteredDocs = docRequests.filter(r => {
    const matchFilter = docFilter === 'all' || r.status === docFilter;
    const q = docSearch.toLowerCase();
    const matchSearch = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const filteredAdm = admissions.filter(a => {
    const matchFilter = admFilter === 'all' || (admFilter === 'paid' ? a.feesPaid : !a.feesPaid);
    const q = admSearch.toLowerCase();
    const matchSearch = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Sidebar tabs
  // ─────────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'home',       label: '🏠 Dashboard' },
    { id: 'doc_req',    label: '📄 Document Requests', badge: pendingDocCount },
    { id: 'adm_fees',   label: '🎓 Admission Fees', badge: unpaidAdmCount },
    { id: 'fee_struct', label: '💼 Fee Structure' },
    { id: 'expenses',   label: '🏗️ College Expenses' },
    { id: 'history',    label: '🧾 Payment History' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">💰</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Accounts Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
              {t.label}
              {t.badge > 0 && (
                <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div style={{ margin: '12px 24px 0', padding: '12px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14,
            background: toast.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: toast.type === 'error' ? '#C62828' : '#2E7D32' }}>
            {toast.msg}
          </div>
        )}

        <div className="dashboard-content">

          {/* ════════════════════════ HOME ════════════════════════ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#e8f5e9,#f0fff4)', padding: 20, borderRadius: 12, marginBottom: 20, borderLeft: '5px solid #2E7D32' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: 6 }}>💰 Welcome, {user?.name}!</h3>
                <p style={{ color: '#555' }}>Manage fee collection, document requests, expenses, and receipts.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card orange" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('doc_req')}>
                  <div className="dash-card-icon">📄</div>
                  <div><h3>{pendingDocCount}</h3><p>Pending Doc Requests</p></div>
                </div>
                <div className="dash-card red" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('adm_fees')}>
                  <div className="dash-card-icon">💸</div>
                  <div><h3>{unpaidAdmCount}</h3><p>Unpaid Admissions</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div><h3>{paidAdmCount}</h3><p>Fees Collected</p></div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">💰</div>
                  <div><h3>₹{totalCollected.toLocaleString('en-IN')}</h3><p>Total Collected (Session)</p></div>
                </div>
              </div>

              {pendingDocCount > 0 && (
                <div style={{ background: '#fff3e0', border: '2px solid #ffb74d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ color: '#E65100', marginBottom: 8 }}>⚠️ {pendingDocCount} Document Request{pendingDocCount > 1 ? 's' : ''} Awaiting!</h3>
                  <p style={{ color: '#555', marginBottom: 14 }}>Students are waiting. Collect fees and generate receipts.</p>
                  <button onClick={() => setActiveTab('doc_req')}
                    style={{ background: '#E65100', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    📄 Review Now →
                  </button>
                </div>
              )}

              <h3 style={{ margin: '24px 0 14px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                {[
                  { label: '📄 Document Requests', sub: 'Collect fees, approve/reject', tab: 'doc_req', tag: 'Active' },
                  { label: '🎓 Admission Fees', sub: 'Collect admission & other fees', tab: 'adm_fees', tag: 'Important' },
                  { label: '💼 Fee Structure', sub: 'Edit document fee amounts', tab: 'fee_struct', tag: 'Settings' },
                  { label: '🏗️ Expenses', sub: 'Record college expenditures', tab: 'expenses', tag: 'Tracking' },
                  { label: '🧾 Payment History', sub: 'View all collected receipts', tab: 'history', tag: 'Records' },
                ].map((item, i) => (
                  <div key={i} className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab(item.tab)}>
                    <span className="notice-tag">{item.tag}</span>
                    <h4>{item.label}</h4>
                    <p>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════ DOCUMENT REQUESTS ════════════════════════ */}
          {activeTab === 'doc_req' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📄 Document Requests</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect fees, generate receipts, approve or reject student requests.</p>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name or email..." value={docSearch} onChange={e => setDocSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={docFilter} onChange={e => setDocFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Requests</option>
                  <option value="pending_accounts">⏳ Pending</option>
                  <option value="pending_generation">✅ Approved</option>
                  <option value="pending_principal">🔄 At Principal</option>
                  <option value="completed">🏁 Completed</option>
                  <option value="rejected_by_accounts">❌ Rejected</option>
                </select>
                <button onClick={fetchDocRequests}
                  style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              {/* Counts row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total', count: docRequests.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Pending', count: pendingDocCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Approved', count: docRequests.filter(r => ['pending_generation','pending_principal','completed'].includes(r.status)).length, color: '#2E7D32', bg: '#e8f5e9' },
                  { label: 'Rejected', count: docRequests.filter(r => r.status === 'rejected_by_accounts').length, color: '#C62828', bg: '#ffebee' },
                ].map((pill, i) => (
                  <div key={i} style={{ background: pill.bg, color: pill.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
                    {pill.label}: {pill.count}
                  </div>
                ))}
              </div>

              {docLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              ) : filteredDocs.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No requests found</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredDocs.map(req => {
                    const ss = docStatusStyle(req.status);
                    const fee = docFees[req.documentType]?.price ?? 0;
                    const isPending = req.status === 'pending_accounts';
                    return (
                      <div key={req._id} style={{ background: '#fff', border: `1px solid ${isPending ? '#fbbf24' : '#e0e0e0'}`, borderRadius: 12, padding: 18, borderLeft: `4px solid ${ss.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <h4 style={{ color: '#1565C0', fontSize: 16, margin: 0 }}>{req.documentTypeLabel || req.documentType}</h4>
                              {fee > 0 && <span style={{ background: '#e8f5e9', color: '#2E7D32', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>₹{fee}</span>}
                              {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>⚡ Urgent</span>}
                            </div>
                            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                          </div>
                          <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color }}>{ss.label}</span>
                        </div>

                        <div style={{ background: '#f8faff', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <span><strong>Name:</strong> {req.studentName}</span>
                          <span><strong>Email:</strong> {req.studentEmail}</span>
                          <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                          <span><strong>Year:</strong> {req.admissionYear || 'N/A'}</span>
                          {req.rollNumber && <span><strong>Roll No:</strong> {req.rollNumber}</span>}
                          {req.studentPhone && <span><strong>Phone:</strong> {req.studentPhone}</span>}
                        </div>

                        {req.reason && <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}><strong>Reason:</strong> {req.reason}</p>}
                        {req.documentType === 'TC' && isPending && (
                          <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: 13, color: '#92400e' }}>
                            ⚠️ TC will go to Principal for final approval after fee collection.
                          </div>
                        )}

                        {isPending && (
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={() => { setSelectedDoc(req); setDocAction('collect'); setPayMode('cash'); setTxnId(''); }}
                              style={{ background: '#1565C0', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                              💰 Collect Fee {fee > 0 ? `(₹${fee})` : '(₹0)'}
                            </button>
                            <button onClick={() => { setSelectedDoc(req); setDocAction('reject'); setDocNotes(''); }}
                              style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                              ❌ Reject
                            </button>
                          </div>
                        )}

                        {req.accountsNotes && !isPending && (
                          <p style={{ fontSize: 12, color: '#777', marginTop: 8, fontStyle: 'italic' }}>Notes: {req.accountsNotes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ ADMISSION FEES ════════════════════════ */}
          {activeTab === 'adm_fees' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 Admission Fee Collection</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Collect admission fees, exam fees, and other dues from enrolled students.</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Search by name, student ID or email..." value={admSearch} onChange={e => setAdmSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
                <select value={admFilter} onChange={e => setAdmFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
                  <option value="all">All Students</option>
                  <option value="unpaid">💸 Fees Pending</option>
                  <option value="paid">✅ Fees Paid</option>
                </select>
                <button onClick={fetchAdmissions}
                  style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Students', count: admissions.length, color: '#1565C0', bg: '#e3f2fd' },
                  { label: 'Fees Pending', count: unpaidAdmCount, color: '#E65100', bg: '#fff3e0' },
                  { label: 'Fees Paid', count: paidAdmCount, color: '#2E7D32', bg: '#e8f5e9' },
                ].map((p, i) => (
                  <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
                    {p.label}: {p.count}
                  </div>
                ))}
              </div>

              {admLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading admissions...</h3></div>
              ) : filteredAdm.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No students found</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 0.8fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
                    {['Student', 'Course / Year', 'Student ID', 'Fees', 'Status', 'Action'].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {filteredAdm.map((adm, idx) => (
                    <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.email}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#333', margin: 0 }}>{adm.courseType || 'N/A'}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.admissionYear || '—'}</p>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{adm.studentId || '—'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: adm.fees > 0 ? '#1b5e20' : '#aaa' }}>
                        {adm.fees > 0 ? `₹${adm.fees}` : '—'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, textAlign: 'center',
                        background: adm.feesPaid ? '#e8f5e9' : '#fff3e0',
                        color: adm.feesPaid ? '#2E7D32' : '#E65100' }}>
                        {adm.feesPaid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                      <button onClick={() => { setSelectedAdm(adm); setAdmFeeAmt(''); setAdmTxnId(''); setAdmPayMode('cash'); setAdmFeeType('admission'); }}
                        style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        💰 Collect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ FEE STRUCTURE ════════════════════════ */}
          {activeTab === 'fee_struct' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: 4 }}>💼 Document Fee Structure</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>Set the fee charged for each document type a student can request.</p>
                </div>
                {!editDocFees ? (
                  <button onClick={() => { setDocFeeEdits(Object.fromEntries(Object.entries(docFees).map(([k, v]) => [k, v.price]))); setEditDocFees(true); }}
                    style={{ background: '#1565C0', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    ✏️ Edit Fees
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => {
                      const updated = { ...docFees };
                      Object.entries(docFeeEdits).forEach(([k, v]) => { updated[k] = { ...updated[k], price: Number(v) || 0 }; });
                      setDocFees(updated); saveDocFees(updated); setEditDocFees(false);
                      showToast('Fee structure saved!');
                    }} style={{ background: '#2E7D32', color: '#fff', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      💾 Save
                    </button>
                    <button onClick={() => setEditDocFees(false)}
                      style={{ background: '#eee', color: '#333', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#1565C0', padding: '14px 20px' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Document Type</span>
                  <span style={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>Fee (₹)</span>
                </div>
                {Object.entries(docFees).map(([key, val], idx) => (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                    <span style={{ fontSize: 15, color: '#222', fontWeight: 500 }}>{val.label}</span>
                    {editDocFees ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#555', fontWeight: 600 }}>₹</span>
                        <input type="number" min="0" value={docFeeEdits[key] ?? val.price}
                          onChange={e => setDocFeeEdits(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: 90, padding: '7px 10px', borderRadius: 7, border: '2px solid #1565C0', fontSize: 15, fontWeight: 600, textAlign: 'right', outline: 'none' }} />
                      </div>
                    ) : (
                      <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: val.price > 0 ? '#1565C0' : '#aaa' }}>
                        {val.price > 0 ? `₹ ${val.price}` : '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, background: '#fff8e1', padding: '12px 16px', borderRadius: 10, border: '1px solid #ffe082', fontSize: 13, color: '#7c5e00' }}>
                💡 Changes apply immediately when a student submits a new document request.
              </div>
            </div>
          )}

          {/* ════════════════════════ EXPENSES ════════════════════════ */}
          {activeTab === 'expenses' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🏗️ College Expense Tracker</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Record and monitor college expenditures.</p>

              {/* Add Expense Form */}
              <div className="form-card" style={{ marginBottom: 28 }}>
                <h3>➕ Record New Expense</h3>
                {expMsg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: expMsg.includes('✅') ? '#e8f5e9' : '#ffebee', color: expMsg.includes('✅') ? '#2E7D32' : '#C62828' }}>{expMsg}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label>Description *</label>
                    <input type="text" placeholder="e.g. Stationery purchase" value={expForm.description}
                      onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" min="0" placeholder="e.g. 500" value={expForm.amount}
                      onChange={e => setExpForm({ ...expForm, amount: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={expForm.date}
                      onChange={e => setExpForm({ ...expForm, date: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                      <option value="infrastructure">🏗️ Infrastructure</option>
                      <option value="stationery">📝 Stationery</option>
                      <option value="electricity">💡 Electricity / Utilities</option>
                      <option value="salary">👤 Salary / Wages</option>
                      <option value="events">🎉 Events / Functions</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Paid To / Vendor</label>
                    <input type="text" placeholder="e.g. Sharma Stationery Store" value={expForm.paidTo}
                      onChange={e => setExpForm({ ...expForm, paidTo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                </div>
                <button onClick={saveExpense}
                  style={{ marginTop: 16, background: '#1565C0', color: '#fff', padding: '11px 28px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  💾 Save Expense
                </button>
              </div>

              {/* Expense Summary */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ background: '#e3f2fd', color: '#1565C0', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>
                  Total Expenses: ₹{totalExpenses.toLocaleString('en-IN')}
                </div>
                <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>
                  Records: {expenses.length}
                </div>
              </div>

              {/* Expense List */}
              {expenses.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🏗️</div><h3>No expenses recorded yet</h3></div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 0.8fr 0.5fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
                    {['Description', 'Category', 'Date', 'Paid To', 'Amount', ''].map(h => (
                      <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
                    ))}
                  </div>
                  {expenses.map((exp, idx) => (
                    <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 0.8fr 0.5fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                      <span style={{ fontSize: 13, color: '#222', fontWeight: 500 }}>{exp.description}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.category}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.date}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{exp.paidTo || '—'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#C62828' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                      <button onClick={() => deleteExpense(exp.id)}
                        style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ PAYMENT HISTORY ════════════════════════ */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🧾 Payment History</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>All receipts generated in this session.</p>
                </div>
                <div style={{ background: '#e8f5e9', color: '#1b5e20', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 15 }}>
                  Total: ₹{totalCollected.toLocaleString('en-IN')}
                </div>
              </div>

              {payHistory.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🧾</div><h3>No receipts yet</h3><p>Receipts will appear here once you collect fees.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {payHistory.map((p, idx) => (
                    <div key={p.id} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderLeft: '4px solid #2E7D32' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h4 style={{ margin: 0, color: '#1565C0', fontSize: 14 }}>{p.studentName}</h4>
                          <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1565C0', padding: '2px 8px', borderRadius: 10 }}>{p.type === 'admission' ? '🎓 Admission' : '📄 Document'}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{p.feeLabel} • {p.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'} • {new Date(p.date).toLocaleDateString('en-IN')}</p>
                        <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>Receipt: {p.id}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                        <button onClick={() => printReceipt({ ...p, receiptNo: p.id })}
                          style={{ marginTop: 6, background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          🖨️ Reprint
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ════════════ COLLECT DOC FEE MODAL ════════════ */}
      {selectedDoc && docAction === 'collect' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDocModal}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>💰 Collect Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Verify payment, then generate an official receipt.</p>

            {/* Summary */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13 }}>
              <F label="Student" value={selectedDoc.studentName} />
              <F label="Document" value={docFees[selectedDoc.documentType]?.label || selectedDoc.documentTypeLabel} />
              <F label="Branch" value={selectedDoc.branch} />
              <F label="Year" value={selectedDoc.admissionYear} />
              <div style={{ marginTop: 12, background: '#1565C0', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Amount to Collect</span>
                <span style={{ color: '#ffd700', fontWeight: 800, fontSize: 22 }}>₹ {docFees[selectedDoc.documentType]?.price ?? 0}/-</span>
              </div>
            </div>

            {/* Payment mode */}
            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10 }}>Payment Mode</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {['cash', 'online'].map(m => (
                <button key={m} onClick={() => { setPayMode(m); if (m === 'cash') setTxnId(''); }}
                  style={{ flex: 1, padding: 14, borderRadius: 10, border: `2px solid ${payMode === m ? (m === 'cash' ? '#2E7D32' : '#1565C0') : '#ddd'}`,
                    background: payMode === m ? (m === 'cash' ? '#e8f5e9' : '#e8f0fe') : '#fff',
                    color: payMode === m ? (m === 'cash' ? '#1b5e20' : '#1565C0') : '#555',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {m === 'cash' ? '💵 Cash' : '🌐 Online / UPI'}
                </button>
              ))}
            </div>

            {payMode === 'online' && (
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d7f9', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 600, color: '#1565C0', marginBottom: 8 }}>College UPI: <strong>{COLLEGE_UPI}</strong></p>
                <p style={{ fontSize: 13, color: '#444', marginBottom: 12 }}>Ask student to pay ₹{docFees[selectedDoc.documentType]?.price ?? 0} and provide the UTR / Transaction ID:</p>
                <input type="text" placeholder="Transaction ID / UTR No." value={txnId} onChange={e => setTxnId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            {payMode === 'cash' && (
              <div style={{ background: '#f0fff4', border: '1px solid #b2dfdb', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 14, color: '#2e7d32' }}>
                ✅ Collect <strong>₹{docFees[selectedDoc.documentType]?.price ?? 0}/-</strong> cash from the student, then generate the receipt.
              </div>
            )}

            <button onClick={handleDocCollect} disabled={docLoading2 || (payMode === 'online' && !txnId.trim())}
              style={{ width: '100%', background: docLoading2 ? '#aaa' : '#1565C0', color: '#fff', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: docLoading2 ? 'not-allowed' : 'pointer', opacity: (payMode === 'online' && !txnId.trim()) ? 0.5 : 1 }}>
              {docLoading2 ? '⏳ Processing...' : '🖨️ Generate Receipt & Approve'}
            </button>
            <button onClick={closeDocModal} style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ════════════ REJECT DOC MODAL ════════════ */}
      {selectedDoc && docAction === 'reject' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDocModal}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 30, maxWidth: 480, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#C62828', marginBottom: 14 }}>❌ Reject Request</h2>
            <div style={{ background: '#f8faff', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <F label="Student" value={selectedDoc.studentName} />
              <F label="Document" value={selectedDoc.documentTypeLabel} />
            </div>
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea rows="3" placeholder="Explain why this request is being rejected..." value={docNotes} onChange={e => setDocNotes(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleDocReject} disabled={docLoading2}
                style={{ background: '#C62828', color: '#fff', padding: '12px 28px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: docLoading2 ? 'not-allowed' : 'pointer', opacity: docLoading2 ? 0.6 : 1 }}>
                {docLoading2 ? '⏳...' : '❌ Confirm Reject'}
              </button>
              <button onClick={closeDocModal} style={{ background: '#eee', color: '#333', padding: '12px 22px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ ADMISSION FEE MODAL ════════════ */}
      {selectedAdm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelectedAdm(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>🎓 Collect Admission Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Select fee type, enter amount, and generate receipt.</p>

            {/* Student info */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13 }}>
              <F label="Name" value={selectedAdm.applicantName} />
              <F label="Student ID" value={selectedAdm.studentId} />
              <F label="Course" value={selectedAdm.courseType} />
              <F label="Year" value={selectedAdm.admissionYear} />
              <F label="Email" value={selectedAdm.email} />
              {selectedAdm.feesPaid && <div style={{ marginTop: 10, background: '#e8f5e9', padding: '6px 12px', borderRadius: 8, color: '#2E7D32', fontWeight: 600, fontSize: 12 }}>✅ Previous fee of ₹{selectedAdm.fees} already recorded</div>}
            </div>

            {/* Fee type */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Fee Type *</label>
              <select value={admFeeType} onChange={e => setAdmFeeType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                {FEE_TYPES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Amount (₹) *</label>
              <input type="number" min="1" placeholder="Enter amount to collect" value={admFeeAmt} onChange={e => setAdmFeeAmt(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 16, fontWeight: 700, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Payment mode */}
            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10, fontSize: 13 }}>Payment Mode</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {['cash', 'online'].map(m => (
                <button key={m} onClick={() => { setAdmPayMode(m); if (m === 'cash') setAdmTxnId(''); }}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: `2px solid ${admPayMode === m ? (m === 'cash' ? '#2E7D32' : '#1565C0') : '#ddd'}`,
                    background: admPayMode === m ? (m === 'cash' ? '#e8f5e9' : '#e8f0fe') : '#fff',
                    color: admPayMode === m ? (m === 'cash' ? '#1b5e20' : '#1565C0') : '#555',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {m === 'cash' ? '💵 Cash' : '🌐 Online / UPI'}
                </button>
              ))}
            </div>

            {admPayMode === 'online' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>Transaction ID / UTR *</label>
                <input type="text" placeholder="e.g. 403123456789" value={admTxnId} onChange={e => setAdmTxnId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            <button onClick={handleAdmFeeCollect} disabled={admLoading2 || !admFeeAmt || (admPayMode === 'online' && !admTxnId.trim())}
              style={{ width: '100%', background: admLoading2 ? '#aaa' : '#1565C0', color: '#fff', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: admLoading2 ? 'not-allowed' : 'pointer',
                opacity: (!admFeeAmt || (admPayMode === 'online' && !admTxnId.trim())) ? 0.5 : 1 }}>
              {admLoading2 ? '⏳ Processing...' : '🖨️ Generate Receipt'}
            </button>
            <button onClick={() => setSelectedAdm(null)} style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountsSectionDashboard;
