import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// ── Default fee structure (persisted in localStorage) ──────────────────────
const DEFAULT_FEES = {
  BONAFIDE:  { label: '📋 Bonafide Certificate',       price: 30 },
  ID_CARD:   { label: '🪪 ID Card',                    price: 100 },
  MARKSHEET: { label: '📄 Marksheet',                  price: 0 },
  MIGRATION: { label: '📜 Migration Certificate',      price: 0 },
  TC:        { label: '🎓 Transfer Certificate (TC)',  price: 0 },
};

const loadFees = () => {
  try {
    const stored = localStorage.getItem('lkcwsc_fee_structure');
    if (stored) return { ...DEFAULT_FEES, ...JSON.parse(stored) };
  } catch (_) {}
  return { ...DEFAULT_FEES };
};

const saveFees = (fees) => {
  localStorage.setItem('lkcwsc_fee_structure', JSON.stringify(fees));
};

// ── Receipt printer helper ──────────────────────────────────────────────────
const printReceipt = (receiptData) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fee Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .receipt { max-width: 400px; margin: auto; border: 2px solid #1565C0; border-radius: 10px; padding: 24px; }
        .header { text-align: center; border-bottom: 2px dashed #1565C0; padding-bottom: 14px; margin-bottom: 14px; }
        .college-name { font-size: 18px; font-weight: bold; color: #1565C0; }
        .sub-title { font-size: 12px; color: #555; margin-top: 4px; }
        .receipt-title { font-size: 15px; font-weight: bold; color: #E65100; margin-top: 10px; letter-spacing: 1px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 13px; }
        .label { color: #555; }
        .value { font-weight: 600; color: #222; }
        .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
        .amount-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; font-weight: bold; color: #1565C0; }
        .footer { text-align: center; font-size: 11px; color: #888; margin-top: 18px; border-top: 1px solid #eee; padding-top: 10px; }
        .receipt-no { font-size: 11px; color: #888; }
        .paid-stamp { text-align: center; margin: 14px 0; }
        .paid-stamp span { border: 3px solid #28a745; color: #28a745; font-size: 22px; font-weight: bold; padding: 4px 18px; border-radius: 6px; letter-spacing: 3px; transform: rotate(-10deg); display: inline-block; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="college-name">Late Kalpana Chawla Mahila College</div>
          <div class="sub-title">Senior Science & Arts College, Gangakhed</div>
          <div class="receipt-title">🧾 OFFICIAL FEE RECEIPT</div>
          <div class="receipt-no">Receipt No: ${receiptData.receiptNo}</div>
        </div>

        <div class="row"><span class="label">Date:</span><span class="value">${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span></div>
        <div class="row"><span class="label">Student Name:</span><span class="value">${receiptData.studentName}</span></div>
        <div class="row"><span class="label">Email:</span><span class="value">${receiptData.studentEmail}</span></div>
        <div class="row"><span class="label">Branch:</span><span class="value">${receiptData.branch || 'N/A'}</span></div>
        <div class="row"><span class="label">Year:</span><span class="value">${receiptData.admissionYear || 'N/A'}</span></div>
        <div class="row"><span class="label">Roll No:</span><span class="value">${receiptData.rollNumber || 'N/A'}</span></div>
        <div class="divider"></div>
        <div class="row"><span class="label">Document:</span><span class="value">${receiptData.documentLabel}</span></div>
        <div class="row"><span class="label">Payment Mode:</span><span class="value">${receiptData.paymentMode === 'online' ? '🌐 Online (UPI)' : '💵 Cash'}</span></div>
        ${receiptData.transactionId ? `<div class="row"><span class="label">Transaction ID:</span><span class="value">${receiptData.transactionId}</span></div>` : ''}
        <div class="divider"></div>
        <div class="amount-row"><span>Amount Paid:</span><span>₹ ${receiptData.amount}/-</span></div>
        <div class="paid-stamp"><span>PAID</span></div>
        <div class="footer">
          Issued by: ${receiptData.issuedBy}<br/>
          This is a computer-generated receipt.
        </div>
      </div>
     <scrip${'t'}>window.onload = () => window.print();</scrip${'t'}>
    </body>
    </html>
  `;
  const win = window.open('', '_blank', 'width=500,height=700');
  win.document.write(receiptHTML);
  win.document.close();
};

// ── Main Component ──────────────────────────────────────────────────────────
const AccountsSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [docRequests, setDocRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(''); // 'reject' | 'collect_fees'
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fee structure state
  const [feeStructure, setFeeStructure] = useState(loadFees());
  const [editingFees, setEditingFees] = useState(false);
  const [feeEdits, setFeeEdits] = useState({});

  // Collect fees modal state
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'online'
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = () => {
    API.get('/document-requests/accounts/all')
      .then(res => setDocRequests(res.data.requests || []))
      .catch(() => {});
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType('');
    setNotes('');
    setPaymentMode('cash');
    setTransactionId('');
  };

  // ── Reject request ─────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedReq) return;
    if (!notes.trim()) { showMsg('❌ Please provide rejection reason'); return; }
    setLoading(true);
    try {
      const res = await API.put(`/document-requests/accounts/reject/${selectedReq._id}`, { reason: notes });
      showMsg('✅ ' + res.data.message);
      closeModal();
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally { setLoading(false); }
  };

  // ── Collect Fees: Generate Receipt ────────────────────────────────────
  const handleGenerateReceipt = async () => {
    if (paymentMode === 'online' && !transactionId.trim()) {
      showMsg('❌ Please enter the Transaction ID');
      return;
    }
    setLoading(true);
    try {
      // Mark as approved in backend
      await API.put(`/document-requests/accounts/approve/${selectedReq._id}`, {
        notes: `Fees collected. Mode: ${paymentMode}${transactionId ? '. TxnID: ' + transactionId : ''}`
      });

      // Build receipt
      const docType = selectedReq.documentType;
      const amount = feeStructure[docType]?.price ?? 0;
      const receiptNo = 'LKRC' + Date.now().toString().slice(-8);

      printReceipt({
        receiptNo,
        studentName: selectedReq.studentName,
        studentEmail: selectedReq.studentEmail,
        branch: selectedReq.branch,
        admissionYear: selectedReq.admissionYear,
        rollNumber: selectedReq.rollNumber,
        documentLabel: feeStructure[docType]?.label || selectedReq.documentTypeLabel,
        paymentMode,
        transactionId,
        amount,
        issuedBy: user?.name || 'Accounts Staff',
      });

      showMsg('✅ Receipt generated & request approved!');
      closeModal();
      fetchRequests();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed to process'));
    } finally { setLoading(false); }
  };

  // ── Fee Structure editing ──────────────────────────────────────────────
  const startEditFees = () => {
    const edits = {};
    Object.entries(feeStructure).forEach(([k, v]) => { edits[k] = v.price; });
    setFeeEdits(edits);
    setEditingFees(true);
  };

  const saveFeeEdits = () => {
    const updated = { ...feeStructure };
    Object.entries(feeEdits).forEach(([k, v]) => {
      updated[k] = { ...updated[k], price: Number(v) || 0 };
    });
    setFeeStructure(updated);
    saveFees(updated);
    setEditingFees(false);
    showMsg('✅ Fee structure saved successfully!');
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending_accounts': return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Review' };
      case 'rejected_by_accounts': return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
      case 'approved_by_accounts':
      case 'pending_principal':
      case 'pending_generation': return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved & Forwarded' };
      case 'completed': return { bg: '#e3f2fd', color: '#1565C0', label: '✅ Completed' };
      default: return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const pendingRequests = docRequests.filter(r => r.status === 'pending_accounts');
  const processedRequests = docRequests.filter(r => r.status !== 'pending_accounts');

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">💰</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Accounts Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Dashboard</button>
          <button className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
            📄 Document Requests {pendingRequests.length > 0 && (
              <span style={{background:'#dc3545',color:'white',borderRadius:'10px',padding:'2px 8px',fontSize:'11px',marginLeft:'6px'}}>{pendingRequests.length}</span>
            )}
          </button>
          <button className={activeTab === 'fee_structure' ? 'active' : ''} onClick={() => setActiveTab('fee_structure')}>💼 Fee Structure</button>
          <button>💵 Fees Collection</button>
          <button>🧾 Generate Receipts</button>
          <button>📊 Outstanding Dues</button>
          <button>💳 Payment History</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
        </div>

        {message && (
          <div style={{
            margin: '20px', padding: '14px 18px', borderRadius: '10px',
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2E7D32' : '#C62828', fontWeight: '500'
          }}>{message}</div>
        )}

        <div className="dashboard-content">

          {/* ── HOME TAB ─────────────────────────────────────── */}
          {activeTab === 'home' && (
            <div>
              <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #2E7D32' }}>
                <h3 style={{ color: '#2E7D32', marginBottom: '8px' }}>💰 Welcome to Accounts Section!</h3>
                <p>Manage fees collection, approve document requests, generate receipts, track payments.</p>
              </div>
              <div className="dash-cards">
                <div className="dash-card orange">
                  <div className="dash-card-icon">⏳</div>
                  <div><h3>{pendingRequests.length}</h3><p>Pending Document Requests</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div><h3>{processedRequests.length}</h3><p>Processed Requests</p></div>
                </div>
                <div className="dash-card blue">
                  <div className="dash-card-icon">📊</div>
                  <div><h3>{docRequests.length}</h3><p>Total Requests</p></div>
                </div>
              </div>
              {pendingRequests.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', marginTop: '20px', border: '2px solid #ffb74d' }}>
                  <h3 style={{ color: '#E65100', marginBottom: '10px' }}>⚠️ {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}!</h3>
                  <p style={{ color: '#555', marginBottom: '14px' }}>Students are waiting for review. Please process them now.</p>
                  <button onClick={() => setActiveTab('documents')} style={{ background: '#E65100', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    📄 Review Requests Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── FEE STRUCTURE TAB ─────────────────────────────── */}
          {activeTab === 'fee_structure' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: '#1565C0', marginBottom: '4px' }}>💼 Fee Structure</h2>
                  <p style={{ color: '#666', fontSize: '14px' }}>Set the fee amount for each document type that students can request.</p>
                </div>
                {!editingFees && (
                  <button onClick={startEditFees} style={{ background: '#1565C0', color: 'white', padding: '10px 22px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    ✏️ Edit Fees
                  </button>
                )}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#1565C0', padding: '14px 20px' }}>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Document Type</span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '14px', textAlign: 'right' }}>Fee Amount (₹)</span>
                </div>

                {Object.entries(feeStructure).map(([key, val], idx) => (
                  <div key={key} style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px',
                    padding: '16px 20px', alignItems: 'center',
                    borderBottom: '1px solid #f0f4f8',
                    background: idx % 2 === 0 ? '#fafbff' : 'white'
                  }}>
                    <span style={{ fontSize: '15px', color: '#222', fontWeight: '500' }}>{val.label}</span>
                    {editingFees ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#555', fontWeight: '600' }}>₹</span>
                        <input
                          type="number"
                          min="0"
                          value={feeEdits[key] ?? val.price}
                          onChange={e => setFeeEdits(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '90px', padding: '7px 10px', borderRadius: '7px', border: '2px solid #1565C0', fontSize: '15px', fontWeight: '600', textAlign: 'right', outline: 'none' }}
                        />
                      </div>
                    ) : (
                      <span style={{ textAlign: 'right', fontWeight: '700', fontSize: '16px', color: val.price > 0 ? '#1565C0' : '#aaa' }}>
                        {val.price > 0 ? `₹ ${val.price}` : '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {editingFees && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button onClick={saveFeeEdits} style={{ background: '#28a745', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    💾 Save Fee Structure
                  </button>
                  <button onClick={() => setEditingFees(false)} style={{ background: '#eee', color: '#333', padding: '12px 22px', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}

              <div style={{ marginTop: '20px', background: '#fff8e1', padding: '14px 18px', borderRadius: '10px', border: '1px solid #ffe082', fontSize: '13px', color: '#7c5e00' }}>
                💡 <strong>Note:</strong> Documents with ₹0 fee will show a <em>Collect Fees</em> button but amount will be ₹0. You can always update fees anytime.
              </div>
            </div>
          )}

{/* ── DOCUMENT REQUESTS TAB ─────────────────────────── */}
          {activeTab === 'documents' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: '8px' }}>📄 Document Requests</h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Collect fees and issue receipts, or reject with reason.
              </p>

              {/* PENDING */}
              <h3 style={{ color: '#E65100', marginBottom: '14px' }}>⏳ Pending Requests ({pendingRequests.length})</h3>

              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>All Caught Up!</h3>
                  <p>No pending document requests right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  {pendingRequests.map(req => {
                    const fee = feeStructure[req.documentType];
                    return (
                      <div key={req._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '2px solid #fbbf24', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h4 style={{ color: '#1565C0', marginBottom: '6px', fontSize: '18px' }}>
                              {req.documentTypeLabel || req.documentType}
                              {fee && fee.price > 0 && (
                                <span style={{ marginLeft: '10px', background: '#e8f5e9', color: '#2E7D32', fontSize: '13px', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                                  ₹ {fee.price}
                                </span>
                              )}
                            </h4>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                              Requested: {new Date(req.createdAt).toLocaleString()}
                              {req.urgency === 'urgent' && <span style={{ marginLeft: '10px', color: '#E65100', fontWeight: '600' }}>⚡ Urgent</span>}
                            </p>
                          </div>
                          <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: '#fff3e0', color: '#E65100' }}>⏳ Pending</span>
                        </div>

                        {/* Student Details */}
                        <div style={{ background: '#f0f9ff', padding: '14px 18px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #bae6fd', fontSize: '13px' }}>
                          <p style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>👤 Student Details:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <span><strong>Name:</strong> {req.studentName}</span>
                            <span><strong>Email:</strong> {req.studentEmail}</span>
                            <span><strong>Phone:</strong> {req.studentPhone || 'N/A'}</span>
                            <span><strong>Branch:</strong> {req.branch || 'N/A'}</span>
                            <span><strong>Year:</strong> {req.admissionYear || 'N/A'}</span>
                            <span><strong>Roll No:</strong> {req.rollNumber || 'N/A'}</span>
                          </div>
                        </div>

                        {req.reason && <p style={{ fontSize: '14px', color: '#555', marginBottom: '14px' }}><strong>Reason:</strong> {req.reason}</p>}

                        {req.documentType === 'TC' && (
                          <div style={{ background: '#fef3c7', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#92400e' }}>
                            ⚠️ <strong>TC Workflow:</strong> After fee collection, request will go to Principal for final approval.
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                          <button
                            onClick={() => { setSelectedReq(req); setActionType('collect_fees'); setPaymentMode('cash'); setTransactionId(''); }}
                            style={{ background: '#1565C0', color: 'white', padding: '10px 22px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            💰 Collect Fees {fee && fee.price > 0 ? `(₹${fee.price})` : '(₹0)'}
                          </button>
                          <button
                            onClick={() => { setSelectedReq(req); setActionType('reject'); setNotes(''); }}
                            style={{ background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PROCESSED */}
              <h3 style={{ color: '#1565C0', marginBottom: '14px', marginTop: '40px' }}>📋 Processed Requests ({processedRequests.length})</h3>
              {processedRequests.length === 0 ? (
                <p style={{ color: '#888' }}>No processed requests yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {processedRequests.map(req => {
                    const statusStyle = getStatusStyle(req.status);
                    return (
                      <div key={req._id} style={{ background: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '4px' }}>{req.documentTypeLabel} — {req.studentName}</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>{req.studentEmail} • {req.branch} • {req.admissionYear}</p>
                            {req.accountsApprovedDate && (
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Processed: {new Date(req.accountsApprovedDate).toLocaleDateString()} by {req.accountsApprovedBy}
                              </p>
                            )}
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                        </div>
                        {req.accountsNotes && (
                          <p style={{ fontSize: '13px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}><strong>Notes:</strong> {req.accountsNotes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── COLLECT FEES MODAL ───────────────────────────────────── */}
      {selectedReq && actionType === 'collect_fees' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}
          onClick={closeModal}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '30px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            <h2 style={{ color: '#1565C0', marginBottom: '6px' }}>💰 Collect Fees</h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Process fee payment and generate receipt for the student.</p>

            {/* Summary Card */}
            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bae6fd', fontSize: '13px' }}>
              <p style={{ fontWeight: '700', color: '#0c4a6e', marginBottom: '10px', fontSize: '14px' }}>📋 Request Summary</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                <span><strong>Student:</strong> {selectedReq.studentName}</span>
                <span><strong>Email:</strong> {selectedReq.studentEmail}</span>
                <span><strong>Branch:</strong> {selectedReq.branch || 'N/A'}</span>
                <span><strong>Year:</strong> {selectedReq.admissionYear || 'N/A'}</span>
                <span><strong>Roll No:</strong> {selectedReq.rollNumber || 'N/A'}</span>
                <span><strong>Document:</strong> {feeStructure[selectedReq.documentType]?.label || selectedReq.documentTypeLabel}</span>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#1565C0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontWeight: '600' }}>Amount to Collect:</span>
                <span style={{ color: '#ffd700', fontWeight: '800', fontSize: '20px' }}>₹ {feeStructure[selectedReq.documentType]?.price ?? 0}/-</span>
              </div>
            </div>

            {/* Payment Mode */}
            <p style={{ fontWeight: '600', color: '#333', marginBottom: '10px' }}>Select Payment Mode:</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => { setPaymentMode('cash'); setTransactionId(''); }}
                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${paymentMode === 'cash' ? '#28a745' : '#ddd'}`, background: paymentMode === 'cash' ? '#e8f5e9' : 'white', color: paymentMode === 'cash' ? '#155724' : '#555', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                💵 Cash
              </button>
              <button
                onClick={() => setPaymentMode('online')}
                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${paymentMode === 'online' ? '#1565C0' : '#ddd'}`, background: paymentMode === 'online' ? '#e8f0fe' : 'white', color: paymentMode === 'online' ? '#1565C0' : '#555', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                🌐 Online (UPI)
              </button>
            </div>

            {/* Online: QR info + Transaction ID */}
            {paymentMode === 'online' && (
              <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #c7d7f9' }}>
                <p style={{ fontWeight: '600', color: '#1565C0', marginBottom: '8px', fontSize: '14px' }}>🏦 Online Payment Instructions</p>
                <p style={{ fontSize: '13px', color: '#444', marginBottom: '12px' }}>
                  Ask the student to scan the college UPI QR code and pay <strong>₹ {feeStructure[selectedReq.documentType]?.price ?? 0}/-</strong> at the accounts counter.
                </p>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #dde3f5', textAlign: 'center', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>College UPI ID</p>
                  <p style={{ fontWeight: '700', color: '#1565C0', fontSize: '15px' }}>lkcwsc@upi</p>
                  <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>(Student must pay in person at the counter)</p>
                </div>
                <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '6px', fontSize: '13px' }}>
                  Enter Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #1565C0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            )}

            {/* Cash confirmation */}
            {paymentMode === 'cash' && (
              <div style={{ background: '#f0fff4', padding: '14px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #b2dfdb', fontSize: '14px', color: '#2e7d32' }}>
                ✅ Cash payment selected. Collect <strong>₹ {feeStructure[selectedReq.documentType]?.price ?? 0}/-</strong> from the student, then generate the receipt below.
              </div>
            )}

            {/* Generate Receipt Button */}
            <button
              onClick={handleGenerateReceipt}
              disabled={loading || (paymentMode === 'online' && !transactionId.trim())}
              style={{ width: '100%', background: loading ? '#aaa' : '#1565C0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: (paymentMode === 'online' && !transactionId.trim()) ? 0.5 : 1, transition: 'all 0.15s' }}
            >
              {loading ? '⏳ Processing...' : '🖨️ Generate Receipt & Approve'}
            </button>

            <button onClick={closeModal} style={{ width: '100%', marginTop: '10px', background: '#f3f4f6', color: '#555', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ─────────────────────────────────────────── */}
      {selectedReq && actionType === 'reject' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}
          onClick={closeModal}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#dc3545', marginBottom: '14px' }}>❌ Reject Request</h2>
            <div style={{ background: '#f8faff', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              <p><strong>Student:</strong> {selectedReq.studentName}</p>
              <p><strong>Document:</strong> {selectedReq.documentTypeLabel}</p>
              <p><strong>Email:</strong> {selectedReq.studentEmail}</p>
            </div>
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                rows="3"
                placeholder="Why are you rejecting this request?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleReject} disabled={loading}
                style={{ background: '#dc3545', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Processing...' : '❌ Confirm Reject'}
              </button>
              <button onClick={closeModal}
                style={{ background: '#eee', color: '#333', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountsSectionDashboard;
