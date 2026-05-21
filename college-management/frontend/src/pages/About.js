import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './About.css';

const About = () => {
  const [aboutData, setAboutData] = useState({
    history: '',
    historyPhoto: '',
    vision: '',
    visionPhoto: '',
    mission: '',
    missionPhoto: '',
    achievements: '',
    achievementsPhoto: '',
    principalName: '',
    principalMessage: '',
    principalPhoto: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/about')
      .then(res => {
        // Fallback in case API structural response varies slightly
        setAboutData(res.data.about || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 1. Moved the cards array up here so it is in scope for the entire component
  const cards = [
    {
      icon: '🏛️',
      title: 'Our History',
      text: aboutData.history,
      photo: aboutData.historyPhoto
    },
    {
      icon: '🎯',
      title: 'Our Vision',
      text: aboutData.vision || 'To be a centre of excellence in women’s higher education that empowers every girl and woman of the Marathwada region...',
      photo: aboutData.visionPhoto
    },
    {
      icon: '🚀',
      title: 'Our Mission',
      text: aboutData.mission || 'Provide accessible higher education, develop skilled and independent women, foster ethical values...',
      photo: aboutData.missionPhoto
    }
  ];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <section className="about-hero">
        <div className="hero-overlay">
          <h1 className="hero-title">About Us</h1>
          <p className="hero-subtitle">Learn about our history, vision, mission and values</p>
          <div className="hero-buttons">
            <Link to="/parent-org">
              <button className="parent-org-btn">About Our Parent Organisation</button>
            </Link>
            <Link to="/gallery">
              <button className="explore-btn">Explore Campus</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section container">
        <div className="about-grid">
          {cards.map((card, i) => (
            <div className="about-info-card glass-card" key={i}>
              <div className="about-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              {card.photo && (
                <img
                  src={card.photo}
                  alt={card.title}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '12px'
                  }}
                />
              )}
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <h2>20+</h2>
          <p>Years of Excellence</p>
        </div>
        <div className="stat-card">
          <h2>5000+</h2>
          <p>Students</p>
        </div>
        <div className="stat-card">
          <h2>100+</h2>
          <p>Faculty Members</p>
        </div>
        <div className="stat-card">
          <h2>50+</h2>
          <p>Awards</p>
        </div>
      </section>

      <section className="principal-section">
        <div className="container">
          <h2 className="section-title text-center">Principal's Message</h2>
          <div className="principal-card">
            <div className="principal-avatar">
              {aboutData.principalPhoto ? (
                <img
                  src={aboutData.principalPhoto}
                  alt="Principal"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                <span style={{ fontSize: '4rem' }}>👩‍💼</span>
              )}
            </div>
            <div className="principal-message">
              <h3>From the Desk of the Principal</h3>
              {/* 2. Changed hardcoded text to draw dynamically from API state */}
              <p>
                {aboutData.principalMessage || "Welcome to our institution..."}
              </p>
              <br />
              <p className="principal-name">
                — {aboutData.principalName || 'Principal'}
              </p>
              <p style={{ fontSize: '13px', color: '#666' }}>
                Late Kalpana Chawla Mahila Senior Science & Arts College, Gangakhed
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section container">
        <h2 className="section-title text-center">Our Core Values</h2>
        <div className="values-grid">
          {[
            'Women Empowerment',
            'Accessibility',
            'Excellence & Quality',
            'Inclusivity & Dignity',
            'Social Justice',
            'Human Values',
            'Nation-Building',
            'Continuous Improvement'
          ].map((value, i) => (
            <div className="value-badge" key={i}>{value}</div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
