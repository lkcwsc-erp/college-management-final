import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Achievements.css';

const CAT_CONFIG = {
  academic:  { label: 'Academic',  color: '#1565C0', bg: '#e3f2fd' },
  sports:    { label: 'Sports',    color: '#2E7D32', bg: '#e8f5e9' },
  cultural:  { label: 'Cultural',  color: '#7B1FA2', bg: '#f3e5f5' },
  award:     { label: 'Award',     color: '#E65100', bg: '#fff3e0' },
  other:     { label: 'Other',     color: '#555',    bg: '#f5f5f5' },
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    API.get('/achievements')
      .then(res => setAchievements(res.data.achievements || []))
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);

  return (
    <div>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg,#7B1FA2,#4a0072)', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: 8 }}>🏆 Our Achievements</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>Celebrating excellence in academics, sports, and beyond</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '30px auto', padding: '0 20px 60px' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['all', 'academic', 'sports', 'cultural', 'award', 'other'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 20px', borderRadius: 20, border: `2px solid ${filter === f ? '#7B1FA2' : '#ddd'}`, background: filter === f ? '#7B1FA2' : '#fff', color: filter === f ? '#fff' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
              {f === 'all' ? '🌟 All' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
            <h3>No achievements posted yet</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(a => {
              const cfg = CAT_CONFIG[a.category] || CAT_CONFIG.other;
              return (
                <div key={a._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                  {a.photo && (
                    <img src={a.photo} alt={a.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 28 }}>{a.icon || '🏆'}</span>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>{cfg.label}</span>
                      {a.year && <span style={{ fontSize: 11, color: '#888' }}>{a.year}</span>}
                    </div>
                    <h3 style={{ color: '#1a1a2e', fontSize: 16, margin: '0 0 8px' }}>{a.title}</h3>
                    <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{a.description}</p>
                  </div>
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

export default Achievements;
