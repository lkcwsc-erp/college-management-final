import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Achievements.css';

const achievements = [
  { icon: '🏆', title: 'University Rank Holders', desc: 'Our students have consistently secured top ranks in SRTMU University examinations across Science and Arts streams.' },
  { icon: '🎖️', title: 'NAAC Accreditation', desc: 'The college is accredited by the National Assessment and Accreditation Council (NAAC) for maintaining high academic standards.' },
  { icon: '🌟', title: 'Best College Award', desc: 'Recognised by the State Government of Maharashtra for outstanding contribution to women\'s education in rural areas.' },
  { icon: '🔬', title: 'Research Excellence', desc: 'Faculty members have published research papers in national and international journals, contributing to academic knowledge.' },
  { icon: '🎭', title: 'Cultural Excellence', desc: 'Students have won prizes at inter-collegiate and university-level cultural festivals, representing the college with pride.' },
  { icon: '⚽', title: 'Sports Achievements', desc: 'Our athletes have represented the university at state-level competitions and brought home medals in various sports.' },
  { icon: '🤝', title: 'NSS & Social Work', desc: 'NSS unit has been awarded Best Unit recognition for outstanding community service and social awareness campaigns.' },
  { icon: '💡', title: 'Innovation & Projects', desc: 'Students have participated in state-level project competitions and received recognition for innovative academic projects.' },
];

const Achievements = () => {
  return (
    <>
      <Navbar />
      <div className="achievements-page">

        {/* HERO */}
        <section className="achievements-hero">
          <div className="achievements-hero-content">
            <p className="achievements-hero-tag">Our Pride</p>
            <h1>Achievements</h1>
            <p className="achievements-hero-sub">
              Celebrating the milestones, awards, and accomplishments of our students, faculty, and institution.
            </p>
          </div>
        </section>

        {/* GRID */}
        <section className="achievements-section">
          <div className="achievements-inner">
            <div className="achievements-grid">
              {achievements.map((a, i) => (
                <div className="achievement-card" key={i}>
                  <div className="achievement-icon">{a.icon}</div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default Achievements;
