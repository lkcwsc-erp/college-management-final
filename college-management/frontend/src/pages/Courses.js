import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Courses.css';

const BA_SUBJECTS = [
  'B.A. (Marathi)', 'B.A. (Hindi)', 'B.A. (English – Compulsory)',
  'B.A. (History)', 'B.A. (Political Science)', 'B.A. (Sociology)',
  'B.A. (Geography)', 'B.A. (Economics – with Sub-subject)',
];

const BSC_SUBJECTS = [
  'B.Sc. (Physics)', 'B.Sc. (Chemistry)', 'B.Sc. (Botany)',
  'B.Sc. (Zoology)', 'B.Sc. (Microbiology)', 'B.Sc. (Mathematics)',
];

const Courses = () => {
  const [active, setActive] = useState('both');

  return (
    <div>
      <Navbar />
      <div className="page-header">
        <h1>Our Courses</h1>
        <p>Undergraduate programs affiliated to SNDT Women's University, Mumbai</p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '24px 0 0', flexWrap: 'wrap' }}>
        {[{ id:'both', label:'📚 All Courses' },{ id:'ba', label:'📖 B.A.' },{ id:'bsc', label:'🔬 B.Sc.' }].map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{ padding: '10px 28px', borderRadius: 24, border: `2px solid ${active === t.id ? '#1565C0' : '#ddd'}`, background: active === t.id ? '#1565C0' : '#fff', color: active === t.id ? '#fff' : '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <section style={{ maxWidth: 1100, margin: '30px auto', padding: '0 20px 60px', display: 'grid', gridTemplateColumns: active === 'both' ? '1fr 1fr' : '1fr', gap: 24 }}>

        {/* B.A. Card */}
        {(active === 'both' || active === 'ba') && (
          <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #1565C0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(21,101,192,0.1)' }}>
            <div style={{ background: '#1565C0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>📖</span>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 20 }}>Bachelor of Arts</h2>
                <span style={{ background: '#FDD835', color: '#1a237e', fontWeight: 700, fontSize: 12, padding: '2px 10px', borderRadius: 10 }}>B.A.</span>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', marginBottom: 16 }}>
                <div><strong>Duration</strong></div><div>3 Years (6 Semesters)</div>
                <div><strong>Eligibility</strong></div><div>10+2 from any stream</div>
                <div><strong>Affiliation</strong></div><div>SNDT Women's University</div>
              </div>
              <h4 style={{ color: '#1565C0', marginBottom: 10, borderBottom: '2px solid #e3f2fd', paddingBottom: 6 }}>📋 Subjects Offered</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BA_SUBJECTS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: i%2===0?'#f8f9ff':'#fff', borderRadius: 8, fontSize: 14 }}>
                    <span style={{ color: '#1565C0', fontWeight: 700 }}>🔷</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* B.Sc. Card */}
        {(active === 'both' || active === 'bsc') && (
          <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #2E7D32', overflow: 'hidden', boxShadow: '0 4px 20px rgba(46,125,50,0.1)' }}>
            <div style={{ background: '#2E7D32', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>🔬</span>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 20 }}>Bachelor of Science</h2>
                <span style={{ background: '#FDD835', color: '#1a237e', fontWeight: 700, fontSize: 12, padding: '2px 10px', borderRadius: 10 }}>B.Sc.</span>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', marginBottom: 16 }}>
                <div><strong>Duration</strong></div><div>3 Years (6 Semesters)</div>
                <div><strong>Eligibility</strong></div><div>10+2 with Science (PCM/PCB)</div>
                <div><strong>Affiliation</strong></div><div>SNDT Women's University</div>
              </div>
              <h4 style={{ color: '#2E7D32', marginBottom: 10, borderBottom: '2px solid #e8f5e9', paddingBottom: 6 }}>📋 Subjects Offered</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BSC_SUBJECTS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: i%2===0?'#f1f8e9':'#fff', borderRadius: 8, fontSize: 14 }}>
                    <span style={{ color: '#2E7D32', fontWeight: 700 }}>🔬</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Courses;
