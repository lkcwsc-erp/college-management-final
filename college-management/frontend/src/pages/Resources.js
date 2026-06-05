import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Resources.css';

const ELIBS = [
  { name: 'NDLI – National Digital Library of India', url: 'https://ndl.iitkgp.ac.in/', desc: 'Free access to millions of e-books, journals and educational resources.', icon: '📚' },
  { name: 'SNDT University Digital Library', url: 'https://www.sndt.ac.in/library', desc: 'Resources from SNDT Women\'s University, Mumbai.', icon: '🏛️' },
  { name: 'Shodhganga – Research Repository', url: 'https://shodhganga.inflibnet.ac.in/', desc: 'Indian theses and dissertations repository by INFLIBNET.', icon: '🔬' },
  { name: 'e-PG Pathshala', url: 'https://epgp.inflibnet.ac.in/', desc: 'UGC e-content for postgraduate courses – Arts, Science, Commerce.', icon: '🎓' },
  { name: 'SWAYAM – Free Online Courses', url: 'https://swayam.gov.in/', desc: 'Government of India\'s free online learning platform.', icon: '💡' },
  { name: 'Internet Archive', url: 'https://archive.org/', desc: 'Millions of free books, movies, music and web pages.', icon: '🌐' },
];

const RESOURCES = [
  { title: 'Study Materials', desc: 'Notes, PDFs and subject materials for all semesters.', icon: '📄' },
  { title: 'Syllabus', desc: 'Semester-wise syllabus as per SNDT Women\'s University.', icon: '📋' },
  { title: 'College Library', desc: 'Books, journals and reference materials available in our library.', icon: '📖' },
  { title: 'Digital Learning', desc: 'Online resources and e-learning materials for students.', icon: '💻' },
  { title: 'Question Papers', desc: 'Previous year question papers for exam preparation.', icon: '📝' },
  { title: 'NSS & Activities', desc: 'National Service Scheme materials and cultural activity resources.', icon: '🌱' },
];

const Resources = () => {
  const [activeTab, setActiveTab] = useState('resources');

  return (
    <div>
      <Navbar />
      <div className="page-header">
        <h1>Academic Resources</h1>
        <p>Learning materials, digital library and study support for students</p>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '2px solid #e0e7ef', display: 'flex', justifyContent: 'center', gap: 0 }}>
        {[{ id: 'resources', label: '📚 Resources' }, { id: 'elibrary', label: '🌐 E-Library' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '14px 36px', border: 'none', background: 'none', fontSize: 15, fontWeight: activeTab === t.id ? 700 : 400, color: activeTab === t.id ? '#1565C0' : '#555', borderBottom: activeTab === t.id ? '3px solid #1565C0' : '3px solid transparent', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <section className="resources-section container" style={{ padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'resources' && (
          <div className="resources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {RESOURCES.map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ color: '#1565C0', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#555', fontSize: 14 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'elibrary' && (
          <div>
            <h2 style={{ color: '#1565C0', marginBottom: 6 }}>🌐 E-Library & Online Resources</h2>
            <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Free digital libraries and online learning platforms for students.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {ELIBS.map((lib, i) => (
                <a key={i} href={lib.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(21,101,192,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.05)'}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{lib.icon}</div>
                  <h3 style={{ color: '#1565C0', marginBottom: 6, fontSize: 15 }}>{lib.name}</h3>
                  <p style={{ color: '#555', fontSize: 13, marginBottom: 10 }}>{lib.desc}</p>
                  <span style={{ color: '#1565C0', fontSize: 12, fontWeight: 600 }}>Visit →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Resources;
