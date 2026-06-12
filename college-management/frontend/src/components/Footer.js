import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3>🎓 Late Kalpana Chawla</h3>
          <p>Mahila Senior Science & Arts College</p>
          <p>Gangakhed, Marathwada, Maharashtra</p>
          <p style={{marginTop:'8px'}}>Affiliated to SNDT Women's University</p>
          <p>Run by Vidyaniketan Sevabhavi Sanstha</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/faculty">Faculty</Link></li>
            <li><Link to="/admissions">Admissions</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Courses Offered</h4>
          <ul>
            <li><Link to="/courses">Bachelor of Arts (BA)</Link></li>
            <li><Link to="/courses">Bachelor of Science (BSc)</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📍 Gangakhed, Marathwada</p>
          <p>Maharashtra - 431514</p>
          <p>📞 +919307162914</p>
          <p>✉️ lkcwscgkd@gmail.com</p>
          <p>🕐 Mon - Sat: 9:00 AM - 5:00 PM</p>
        </div>

      </div>
      <div className="footer-bottom">
        <p>© 2024 Late Kalpana Chawla Mahila Senior Science & Arts College, Gangakhed. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
