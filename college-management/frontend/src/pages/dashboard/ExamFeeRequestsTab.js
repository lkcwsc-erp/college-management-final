import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';

const COLLEGE_UPI = 'lkcwsc@upi';
const COURSES = ['BA', 'BSc'];
const FORM_TYPES = [
  { key: 'regular', label: '📋 Regular Exam Form Request', color: '#2E7D32', bg: '#f1f8e9' },
  { key: 'backlog', label: '📋 Backlog Exam Form Request', color: '#E65100', bg: '#fff8e1' },
];

// ─── Student Exam Form Requests (Accounts Section) ──────────────────────────────
// Shows all exam-form requests submitted by students, grouped by Course (BA / BSc)
// and then by type (Regular / Backlog). Accounts staff collect the exam fee here.
const ExamFeeRequestsTab = ({ themeColor = '#1565C0', onToast }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [activeCourse, setActiveCourse] = useState('BA');

  // collect-fee modal
  const [selected, setSelected] = useState(null);
  const [amount, setAmount]     = useState('');
  const [payMode, setPayMode]   = useState('cash');
  const [txnId, setTxnId]       = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    API.get('/results/exam-form/all')
      .then(res => setRequests(res.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const toast = (msg, type = 'success') => { if (onToast) onToast(msg, type); };

  const openCollect = (req) => {
    setSelected(req);
    setAmount('');
    setPayMode('cash');
    setTxnId('');
  };
  const closeModal = () => { setSelected(null); setSaving(false); };

  const handleCollect = async () => {
    if (!amount || Number(amount) <= 0) { toast('Enter a valid amount.', 'error'); return; }
    if (payMode === 'online' && !txnId.trim()) { toast('Enter transaction ID.', 'error'); return; }
    setSaving(true);
    try {
      const res = await API.put(`/results/exam-form/collect-fee/${selected._id}`, {
        amount: Number(amount),
        paymentMode: payMode,
        transactionId: txnId.trim(),
      });
      toast(`✅ Exam fee collected! Receipt: ${res.data.receiptNo}`);
      closeModal();
      fetchRequests();
    } catch (e) {
      toast('❌ ' + (e.response?.data?.message || 'Failed to collect fee.'), 'error');
      setSaving(false);
    }
  };

  // search filter (PRN or student unique id; also name/email)
  const q = search.trim().toLowerCase();
  const matchesSearch = (r) => !q
    || (r.prnNumber || '').toLowerCase().includes(q)
    || (r.studentId || '').toLowerCase().includes(q)
    || (r.studentName || '').toLowerCase().includes(q)
    || (r.studentEmail || '').toLowerCase().includes(q);

  const forCourseType = (course, formType) =>
    requests.filter(r =>
      (r.course || '').toUpperCase() === course.toUpperCase() &&
      r.formType === formType &&
      matchesSearch(r)
    );

  const RequestCard = ({ r }) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 16px', boxShadow: '0 1px 5px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{r.studentName}</div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>
            {r.semester} Semester · {r.examEvent}
          </div>
        </div>
        {r.feeStatus === 'collected' ? (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#e8f5e9', color: '#2E7D32' }}>
            ✅ Paid ₹{r.feeAmount}
          </span>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fff3e0', color: '#E65100' }}>
            ⏳ Fees Pending
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px', fontSize: 13, color: '#444', marginTop: 10 }}>
        <span><strong>PRN:</strong> {r.prnNumber || '—'}</span>
        <span><strong>Student ID:</strong> {r.studentId || '—'}</span>
        <span><strong>Course:</strong> {r.course || '—'}</span>
        <span><strong>Adm. Year:</strong> {r.admissionYear || '—'}</span>
        <span><strong>Semester:</strong> {r.semester || '—'}</span>
        <span><strong>Mobile:</strong> {r.mobileNo || '—'}</span>
      </div>

      {r.feeStatus === 'collected' ? (
        <div style={{ marginTop: 10, fontSize: 12, color: '#2E7D32', background: '#f1f8e9', borderRadius: 8, padding: '6px 12px' }}>
          Receipt: <strong>{r.feeReceiptNo}</strong> · {r.paymentMode === 'online' ? '🌐 Online' : '💵 Cash'} · Collected by {r.feeCollectedBy}
        </div>
      ) : (
        <button onClick={() => openCollect(r)}
          style={{ marginTop: 12, background: themeColor, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          💰 Collect Fees
        </button>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>📝 Student Exam Form Requests</h2>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>Collect exam form fees from students. Grouped by course and form type.</p>

      {/* Search bar */}
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="🔍 Search by PRN or Student Unique ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 460, padding: '11px 16px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Course tabs: BA / BSc */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {COURSES.map(c => (
          <button key={c} onClick={() => setActiveCourse(c)}
            style={{ padding: '9px 26px', borderRadius: 10, border: `2px solid ${activeCourse === c ? themeColor : '#e0e0e0'}`,
              background: activeCourse === c ? themeColor : '#fff', color: activeCourse === c ? '#fff' : '#555',
              fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading requests...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {FORM_TYPES.map(ft => {
            const list = forCourseType(activeCourse, ft.key);
            return (
              <div key={ft.key} style={{ background: ft.bg, borderRadius: 14, padding: 16, border: `1px solid ${ft.color}33` }}>
                <h3 style={{ color: ft.color, fontSize: 15, margin: '0 0 14px' }}>
                  {ft.label} <span style={{ fontSize: 13, color: '#888' }}>({list.length})</span>
                </h3>
                {list.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: '#999', fontSize: 13 }}>
                    No {ft.key} exam form requests for {activeCourse}.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.map(r => <RequestCard key={r._id} r={r} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Collect Fee Modal ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 30, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: themeColor, marginBottom: 6 }}>💰 Collect Exam Fee</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Enter the exam fee amount and generate a receipt.</p>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 13, color: '#334' }}>
              <div><strong>Student:</strong> {selected.studentName}</div>
              <div><strong>PRN:</strong> {selected.prnNumber || '—'} &nbsp; | &nbsp; <strong>ID:</strong> {selected.studentId || '—'}</div>
              <div><strong>Form:</strong> {selected.formType === 'regular' ? 'Regular' : 'Backlog'} · {selected.semester} Sem · {selected.examEvent}</div>
            </div>

            <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6 }}>Exam Fee Amount (₹) *</label>
            <input type="number" min="1" placeholder="e.g. 1000" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1.5px solid #ddd', fontSize: 15, marginBottom: 18, boxSizing: 'border-box', outline: 'none' }} />

            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10 }}>Payment Mode</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              {['cash', 'online'].map(m => (
                <button key={m} onClick={() => { setPayMode(m); if (m === 'cash') setTxnId(''); }}
                  style={{ flex: 1, padding: 13, borderRadius: 10, border: `2px solid ${payMode === m ? (m === 'cash' ? '#2E7D32' : themeColor) : '#ddd'}`,
                    background: payMode === m ? (m === 'cash' ? '#e8f5e9' : '#e8f0fe') : '#fff',
                    color: payMode === m ? (m === 'cash' ? '#1b5e20' : themeColor) : '#555',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {m === 'cash' ? '💵 Cash' : '🌐 Online / UPI'}
                </button>
              ))}
            </div>

            {payMode === 'online' && (
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d7f9', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <p style={{ fontWeight: 600, color: themeColor, marginBottom: 8 }}>College UPI: <strong>{COLLEGE_UPI}</strong></p>
                <input type="text" placeholder="Transaction ID / UTR No." value={txnId} onChange={e => setTxnId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `2px solid ${themeColor}`, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            <button onClick={handleCollect} disabled={saving}
              style={{ width: '100%', background: saving ? '#aaa' : themeColor, color: '#fff', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Processing...' : '🖨️ Collect Fee & Generate Receipt'}
            </button>
            <button onClick={closeModal} style={{ width: '100%', marginTop: 10, background: '#f3f4f6', color: '#555', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamFeeRequestsTab;
