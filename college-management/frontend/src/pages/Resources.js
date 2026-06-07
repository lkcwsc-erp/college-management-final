import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Resources.css';

const TYPE_CONFIG = {
  study_material:  { label: 'Study Material',  icon: '📄', color: '#1565C0', bg: '#e3f2fd' },
  syllabus:        { label: 'Syllabus',         icon: '📋', color: '#2E7D32', bg: '#e8f5e9' },
  question_paper:  { label: 'Question Papers', icon: '📝', color: '#E65100', bg: '#fff3e0' },
  elibrary:        { label: 'E-Library',        icon: '🌐', color: '#7B1FA2', bg: '#f3e5f5' },
  other:           { label: 'Other',            icon: '📁', color: '#555',    bg: '#f5f5f5' },
};

const ELIBS = [
  { name: 'NDLI – National Digital Library of India', url: 'https://ndl.iitkgp.ac.in/', desc: 'Free access to millions of e-books, journals and educational resources.', icon: '📚' },
  { name: 'SNDT University Digital Library', url: 'https://www.sndt.ac.in/library', desc: "Resources from SNDT Women's University, Mumbai.", icon: '🏛️' },
  { name: 'Shodhganga – Research Repository', url: 'https://shodhganga.inflibnet.ac.in/', desc: 'Indian theses and dissertations repository by INFLIBNET.', icon: '🔬' },
  { name: 'e-PG Pathshala', url: 'https://epgp.inflibnet.ac.in/', desc: 'UGC e-content for postgraduate courses – Arts, Science, Commerce.', icon: '🎓' },
  { name: 'SWAYAM – Free Online Courses', url: 'https://swayam.gov.in/', desc: "Government of India's free online learning platform.", icon: '💡' },
  { name: 'Internet Archive', url: 'https://archive.org/', desc: 'Millions of free books, movies, music and web pages.', icon: '🌐' },
];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('college');
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    API.get('/resources')
      .then(res => setResources(res.data.resources || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => filter === 'all' || r.type === filter);

  return (
    <div>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#0d47a1)', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: 8 }}>📚 Academic Resources</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>Study materials, syllabus, question papers and digital library resources</p>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '2px solid #e0e7ef', display: 'flex', justifyContent: 'center', gap: 0 }}>
        {[{ id: 'college', label: '🏫 College Resources' }, { id: 'elibrary', label: '🌐 E-Library' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '14px 36px', border: 'none', background: 'none', fontSize: 15, fontWeight: activeTab === t.id ? 700 : 400, color: activeTab === t.id ? '#1565C0' : '#555', borderBottom: activeTab === t.id ? '3px solid #1565C0' : '3px solid transparent', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '30px auto', padding: '0 20px 60px' }}>

        {/* ── College Resources from Principal ── */}
        {activeTab === 'college' && (
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {['all', ...Object.keys(TYPE_CONFIG)].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '7px 16px', borderRadius: 20, border: `2px solid ${filter === f ? '#1565C0' : '#ddd'}`, background: filter === f ? '#1565C0' : '#fff', color: filter === f ? '#fff' : '#555', fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {f === 'all' ? '📚 All' : `${TYPE_CONFIG[f]?.icon} ${TYPE_CONFIG[f]?.label}`}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, fontSize: '2rem' }}>⏳</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                <h3>No resources posted yet</h3>
                <p>The Principal will post study materials, syllabus and other resources here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filtered.map(r => {
                  const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.other;
                  return (
                    <div key={r._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>{r.icon || cfg.icon}</span>
                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>{cfg.label}</span>
                      </div>
                      <h3 style={{ color: '#1a1a2e', fontSize: 15, margin: '0 0 6px' }}>{r.title}</h3>
                      {r.description && <p style={{ color: '#555', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>{r.description}</p>}
                      {r.course && <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>📖 {r.course} {r.year && `· ${r.year}`}</p>}
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-block', marginTop: 8, background: cfg.color, color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          🔗 Open Resource
                        </a>
                      )}
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-block', marginTop: 8, background: '#2E7D32', color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          📥 Download
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── E-Library ── */}
        {activeTab === 'elibrary' && (
          <div>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>🌐 E-Library & Online Resources</h2>
            <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Free digital libraries and online learning platforms for students.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {ELIBS.map((lib, i) => (
                <a key={i} href={lib.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)', textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{lib.icon}</div>
                  <h3 style={{ color: '#1565C0', marginBottom: 6, fontSize: 15 }}>{lib.name}</h3>
                  <p style={{ color: '#555', fontSize: 13, marginBottom: 10 }}>{lib.desc}</p>
                  <span style={{ color: '#1565C0', fontSize: 12, fontWeight: 600 }}>Visit →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Resources;
