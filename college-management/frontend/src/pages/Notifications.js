import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Notifications.css';

const TYPE_CONFIG = {
  general:   { label: 'General',   color: '#1565C0', bg: '#e3f2fd' },
  exam:      { label: 'Exam',      color: '#E65100', bg: '#fff3e0' },
  admission: { label: 'Admission', color: '#2E7D32', bg: '#e8f5e9' },
  event:     { label: 'Event',     color: '#7B1FA2', bg: '#f3e5f5' },
  holiday:   { label: 'Holiday',   color: '#C62828', bg: '#ffebee' },
};

const Notifications = () => {
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    API.get('/notices')
      .then(res => setNotices(res.data.notices || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = notices.filter(n => {
    const mf = filter === 'all' || n.category === filter;
    const ms = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  return (
    <div>
      <Navbar />
      <div className="page-header" style={{ background: 'linear-gradient(135deg,#1565C0,#0d47a1)', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: 8 }}>📢 Notifications & Notices</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>Stay updated with the latest announcements from the college</p>
      </div>

      <div style={{ maxWidth: 900, margin: '30px auto', padding: '0 20px 60px' }}>
        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="🔍 Search notices..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'general', 'exam', 'admission', 'event', 'holiday'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '8px 16px', borderRadius: 20, border: `2px solid ${filter === f ? '#1565C0' : '#ddd'}`, background: filter === f ? '#1565C0' : '#fff', color: filter === f ? '#fff' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f === 'all' ? '🌐 All' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
            <h3>No notices found</h3>
            <p>Check back later for new announcements.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.category] || TYPE_CONFIG.general;
              const isNew = (new Date() - new Date(n.createdAt)) < 7 * 24 * 60 * 60 * 1000;
              return (
                <div key={n._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 22, borderLeft: `5px solid ${cfg.color}`, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 style={{ color: '#1a1a2e', fontSize: 16, margin: 0 }}>{n.title}</h3>
                      {isNew && <span style={{ background: '#C62828', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>NEW</span>}
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#aaa', flexShrink: 0 }}>
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{n.content}</p>
                  {n.attachment && (
                    <img src={n.attachment} alt="attachment" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginTop: 12, objectFit: 'contain' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;
