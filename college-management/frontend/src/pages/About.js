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
        // Safe check for both API structures (res.data or res.data.about)
        if (res.data && res.data.about) {
          setAboutData(res.data.about);
        } else if (res.data) {
          setAboutData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Fetch Error: ", err);
        setLoading(false);
      });
  }, []);

  const cards = [
    {
      icon: '🏛️',
      title: 'Our History',
      text: aboutData.history || 'Loading history details...',
      photo: aboutData.historyPhoto
    },
    {
      icon: '🎯',
      title: 'Our Vision',
      text: aboutData.vision || 'To be a centre of excellence in women’s higher education that empowers every girl and woman of the Marathwada region to become enlightened, socially responsible leaders who contribute to nation-building through quality education.',
      photo: aboutData.visionPhoto
    },
    {
      icon: '🚀',
      title: 'Our Mission',
      text: aboutData.mission || 'Provide accessible higher education, develop skilled and independent women, foster ethical values, promote leadership and community engagement, and uphold academic excellence.',
      photo: aboutData.missionPhoto
    },
    {
       icon: '🌟',
       title: 'Our Core Values',
       text: 'Women Empowerment, Accessibility, Excellence & Quality, Inclusivity & Dignity, Social Justice, Human Values, Nation-Building Commitment and Continuous Improvement.',
      photo: ''
     }
  ];

  if (loading) {
    return (
      <div className="about-page-loading-wrapper">
        <Navbar />
        <div className="loading" style={{ padding: '100px', textAlignment: 'center', fontSize: '20px' }}>
          Loading College Profile...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="about-page-global-scope">
      <Navbar />

      <section className="about-hero">
        <div className="hero-overlay">
          <h1 className="hero-title">About Us</h1>
          <p className="hero-subtitle">Learn about our history, vision, mission and values</p>
          <div className="hero-buttons">
            <Link to="/parent-org">
              <button className="parent-org-btn">About Our Parent Organisation</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section container">
        <div className="about-grid">
          {cards.map((card, i) => (
            <div className="about-info-card" key={i}>
              <div className="about-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              {card.photo && (
                <img
                  src={card.photo}
                  alt={card.title}
                  className="card-photo-preview"
                />
              )}
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section container">
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
          <h2 className="section-title text-center" style={{ fontSize: '2rem', color: '#003366' }}>Principal's Message</h2>
          <div className="principal-card">
            <div className="principal-avatar">
              {aboutData.principalPhoto ? (
                <img
                  src={aboutData.principalPhoto}
                  alt="Principal"
                />
              ) : (
                <span style={{ fontSize: '4rem' }}>👩‍💼</span>
              )}
            </div>
            <div className="principal-message">
              <h3>From the Desk of the Principal</h3>
                 <p>
"At Late Kalpana Chawala Women’s Senior College, we believe education is not merely about acquiring knowledge but about shaping character, building confidence, and preparing young women to face the challenges of the modern world.

Our institution is committed to providing quality education in Arts and Science while creating an environment that encourages critical thinking, creativity, and lifelong learning.

Inspired by the vision of Kalpana Chawla, we encourage our students to dream big, work hard, and contribute positively to society and nation-building."
           </p>
           <br />
              <p className="principal-name">
                — {aboutData.principalName || 'Principal'}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Late Kalpana Chawla Mahila Senior Science & Arts College, Gangakhed
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section container">
        <h2 className="section-title text-center" style={{ fontSize: '2rem', color: '#003366', marginBottom: '10px' }}>Our Core Values</h2>
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
