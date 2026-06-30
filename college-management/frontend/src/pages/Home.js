//Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section with Single Background Image */}
      <section className="hero" style={{
        backgroundImage: `linear-gradient(135deg, rgba(13, 27, 62, 0.88) 0%, rgba(21, 101, 192, 0.82) 100%), url('https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80')`
      }}>
        <div className="hero-content">
          {/* SNDT Logo + Badge in one line */}
         <div className="hero-affiliation">
          <img src="/sndt-logo.png" alt="SNDT Logo" className="affiliation-logo" style={{height:"60px",width:"60px",objectFit:"contain",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.5)"}} />
           <span className="hero-badge" style={{fontSize:"15px",fontWeight:700}}>✨ Affiliated to SNDT Women's University, Mumbai</span>
          </div>
          <p className="hero-vnss-line">
          <img src="/Sanshta_logo.jpeg" alt="VNSS Logo" style={{height:'40px', width:'40px', objectFit:'contain', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.5)', marginRight:'10px', verticalAlign:'middle'}} />
          <strong>Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</strong>
          </p>
         <h1>Late Kalpana Chawla Women's<br />
<span className="hero-highlight">Senior College</span>
</h1>
         <h2>Empowering Women Through Excellence in Education</h2>
          <p className="hero-location">Senior Science & Arts College, Gangakhed, Parbhani</p>
          <div className="hero-buttons">
            <Link to="/admissions" className="btn btn-hero-primary">Apply for Admission →</Link>
            <Link to="/about" className="btn btn-hero-primary">Discover More</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <strong>500+</strong>
              <span>Students</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <strong>30+</strong>
              <span>Faculty</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <strong>10+</strong>
              <span>Years</span>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiration Quote Section */}
      <section className="inspiration">
        <div className="container">
          <div className="inspiration-grid">
            <div className="inspiration-image">
              <img src="/kalpna-chawla.png" alt="Kalpana Chawla" />
              <div className="inspiration-name">
                <strong>Kalpana Chawla</strong>
                <span>1962 — 2003 • First Indian Woman in Space</span>
              </div>
            </div>
            <div className="inspiration-text">
              <span className="section-tag">Our Inspiration</span>
              <h2>"The path from dreams to success does exist. May you have the vision to find it."</h2>
              <p>Our college proudly bears the name of <strong>Kalpana Chawla</strong> — the first Indian-born woman to journey into space. Her courage, dedication, and pursuit of knowledge inspires every student who walks through our doors. We strive to nurture the same spirit of curiosity and ambition in the women of Marathwada.</p>
              <Link to="/about" className="link-arrow">Read Our Story →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
     {/* Stats */}
      <section className="stats" style={{padding: '60px 20px', background: '#f9f9f9'}}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div style={{flex: '1', minWidth: '180px'}}>
            <p style={{fontSize: '16px', color: '#555', margin: '0 0 10px 0', fontWeight: '500'}}>Students Enrolled</p>
            <h2 style={{fontSize: '48px', color: '#1565C0', margin: 0, fontWeight: 'bold'}}>500+</h2>
          </div>
          <div style={{flex: '1', minWidth: '180px'}}>
            <p style={{fontSize: '16px', color: '#555', margin: '0 0 10px 0', fontWeight: '500'}}>Expert Faculty</p>
            <h2 style={{fontSize: '48px', color: '#1565C0', margin: 0, fontWeight: 'bold'}}>30+</h2>
          </div>
          <div style={{flex: '1', minWidth: '180px'}}>
            <p style={{fontSize: '16px', color: '#555', margin: '0 0 10px 0', fontWeight: '500'}}>Courses Offered</p>
            <h2 style={{fontSize: '48px', color: '#1565C0', margin: 0, fontWeight: 'bold'}}>20+</h2>
          </div>
          <div style={{flex: '1', minWidth: '180px'}}>
            <p style={{fontSize: '16px', color: '#555', margin: '0 0 10px 0', fontWeight: '500'}}>Years of Excellence</p>
            <h2 style={{fontSize: '48px', color: '#1565C0', margin: 0, fontWeight: 'bold'}}>10+</h2>
          </div>
        </div>
      </section>
      {/* About Preview */}
      <section className="about-preview">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">About Our College</h2>
              <p className="section-subtitle">Dedicated to empowering women with quality education</p>
              <p>Late Kalpana Chawla Mahila Senior Science and Arts College, Gangakhed is committed to providing excellent education to women in the Marathwada region. Named after the legendary astronaut Kalpana Chawla, our college inspires students to reach for the stars.</p>
              <br />
              <p>Affiliated to SNDT Women's University and run by Vidyaniketan Sevabhavi Sanstha, we offer undergraduate programs in Science and Arts with experienced faculty and a supportive learning environment.</p>
              <br />
              <Link to="/about" className="btn btn-primary">Read More</Link>
            </div>
            <div className="about-image">
              <div className="image-placeholder">🏫</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">A Foundation Built on Excellence</h2>
            <p className="section-subtitle">Everything your daughter needs to thrive academically and personally</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
              </div>
              <h3>Quality Education</h3>
              <p>Affiliated to SNDT Women's University with rigorous, industry-relevant curriculum in Arts and Sciences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h3>Experienced Faculty</h3>
              <p>30+ qualified educators dedicated to mentoring students and unlocking their full potential.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <h3>Modern Facilities</h3>
              <p>Well-equipped laboratories, library, and classrooms designed for collaborative learning.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/></svg>
              </div>
              <h3>Safe Environment</h3>
              <p>A secure, supportive campus exclusively for women, fostering confidence and growth.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>
              </div>
              <h3>Holistic Development</h3>
              <p>Sports, cultural events, and extracurricular activities for all-round personality development.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <h3>Scholarships</h3>
              <p>Merit-based and need-based financial assistance ensuring no deserving student is left behind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="courses-preview">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Academic Programs</span>
            <h2 className="section-title">Choose Your Path</h2>
            <p className="section-subtitle">Undergraduate programs designed to shape tomorrow's leaders</p>
          </div>
          <div className="courses-grid">
            <div className="course-card">
              <div className="course-card-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80')"}}>
                <div className="course-card-overlay"></div>
                <span className="course-tag">3 Years</span>
              </div>
              <div className="course-card-body">
                <h3>Bachelor of Arts</h3>
                <p>Explore literature, history, sociology, and the humanities — building strong analytical and communication skills.</p>
                <Link to="/admissions?course=BA" className="course-link">Apply Now →</Link>
              </div>
            </div>
            <div className="course-card">
              <div className="course-card-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80')"}}>
                <div className="course-card-overlay"></div>
                <span className="course-tag">3 Years</span>
              </div>
              <div className="course-card-body">
                <h3>Bachelor of Science</h3>
                <p>Dive into physics, chemistry, biology and mathematics — fostering scientific thinking and innovation.</p>
                <Link to="/admissions?course=BSc" className="course-link">Apply Now →</Link>
              </div>
            </div>
            <div className="course-card">
              <div className="course-card-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80')"}}>
                <div className="course-card-overlay"></div>
                <span className="course-tag">View All</span>
              </div>
              <div className="course-card-body">
                <h3>All Programs</h3>
                <p>Browse our complete list of undergraduate courses, subject combinations, and admission criteria.</p>
                <Link to="/courses" className="course-link">View Courses →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Message - No Photo */}
      <section className="principal-message">
        <div className="container">
          <div className="principal-quote-card">
            <div className="quote-icon">"</div>
            <span className="section-tag">Principal's Message</span>
            <h2>Education is the most powerful weapon we can give our daughters.</h2>
            <p>Education isn't just about memorizing facts; it's about training your mind how to think. Every late-night study session and every difficult problem you solve is building a "mental muscle" that no one can ever take away from you.</p>
            <p><strong>Three Truths for the Journey:</strong></p>
            <p>Growth lives in the struggle. If it feels hard, it means you're leveling up. Real progress happens at the edge of your comfort zone.</p>
            <p>Consistency beats intensity. You don't have to be a genius every single day. You just have to show up. Small, daily efforts compound into massive results over time.</p>
            <p>Your "Current" is not your "Future." A single grade or a bad semester is a data point, not a destination. You are a work in progress, and the story isn't over yet.</p>
            <p>We invite you to join our family — to learn, grow, and become the change-makers our nation needs.</p>
            <div className="principal-signature">
              <strong>Principal</strong>
              <span>LKCWSC, Gangakhed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag" style={{color:'#fff', background:'rgba(255,255,255,0.15)'}}>Student Voices</span>
            <h2 className="section-title" style={{color:'#fff'}}>Hear From Our Alumni</h2>
            <p className="section-subtitle" style={{color:'rgba(255,255,255,0.85)'}}>Stories of transformation, growth, and success</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"This college didn't just teach me Science — it taught me to dream. The faculty believed in me when I doubted myself. Today, I'm pursuing my Master's at a top university."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">NG</div>
                <div>
                  <strong>Ghatge Nikita Sanjay </strong>
                  <span>BSc Graduate,2018-2022</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"The supportive environment here is unmatched. I gained confidence, made lifelong friends, and developed skills that helped me clear my government job exam."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AL</div>
                <div>
                  <strong>Lahane Amruta Keshav</strong>
                  <span>Bsc Graduate, 2018-2021</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"This college gave me more than an education — it gave me confidence to chase bigger goals. The support of my teachers shaped the person I am today."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PG</div>
                <div>
                  <strong>Gaikwad Pooja Shivaji </strong>
                  <span>BA Graduate,2017-2021</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"Coming from a small village, I was nervous. But the teachers and seniors made me feel at home. My time here shaped who I am today — independent and ambitious."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SA</div>
                <div>
                  <strong>Ambure Sita Bhanudas</strong>
                  <span>BA Graduate, 2017-2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg-pattern"></div>
        <div className="cta-content">
          <span className="cta-tag">Begin Your Journey</span>
          <h2>Your future starts here.<br />Apply for Admission Today.</h2>
          <p>Join 500+ ambitious women who are writing their own success stories at LKCWSC. Limited seats available for 2026-27.</p>
          <div className="hero-buttons">
            <Link to="/admissions" className="btn btn-hero-primary">Apply Now →</Link>
            <Link to="/contact" className="btn btn-hero-secondary">Talk to Us</Link>
          </div>
          <div className="cta-contact">
            <a href="tel:9307162914" className="cta-phone">
              📞 <strong>9307162914</strong>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
