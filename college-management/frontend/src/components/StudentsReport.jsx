import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const StudentsReport = ({ themeColor = '#2E7D32' }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auth/students');
      if (res.data.success) setAllStudents(res.data.students || []);
    } catch (err) { console.error('Failed to fetch students:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = allStudents.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || (s.aadharNumber || '').includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: themeColor, marginBottom: '4px' }}>👩‍🎓 Students Report</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Total registered students: <strong>{allStudents.length}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="🔍 Search by name, email or aadhaar..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '260px' }} />
          <button onClick={fetchStudents} style={{ padding: '9px 16px', background: '#f5f5f5', color: themeColor, border: '1px solid #ddd', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
      ) : allStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👩‍🎓</div>
          <h3>No Students Yet</h3>
          <p>Students will appear here once their accounts are created.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 2fr 1.4fr 1.2fr 0.9fr', background: themeColor, padding: '14px 16px', gap: '8px' }}>
            {['Name', 'Email', 'Aadhaar', 'Phone', 'Status'].map(h => (
              <span key={h} style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{h}</span>
            ))}
          </div>
          {filtered.map((s, idx) => (
            <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 2fr 1.4fr 1.2fr 0.9fr', padding: '12px 16px', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                  {s.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{s.name || 'N/A'}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#555', wordBreak: 'break-all' }}>{s.email || 'N/A'}</span>
              <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>{s.aadharNumber || '—'}</span>
              <span style={{ fontSize: '12px', color: '#555' }}>{s.phone || '—'}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px', background: s.isActive ? '#e8f5e9' : '#ffebee', color: s.isActive ? '#2E7D32' : '#C62828', textAlign: 'center' }}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsReport;
