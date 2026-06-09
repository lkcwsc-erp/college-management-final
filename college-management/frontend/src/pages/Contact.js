import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ===== VALIDATION HANDLERS =====

  // Name: Only alphabets and spaces allowed
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setFormData({ ...formData, name: value });
    }
  };

  // Phone: Only numbers, max 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
    }
  };

  // Other fields: normal change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ===== EXTRA VALIDATION ON SUBMIT =====
    if (formData.name.trim().length < 3) {
      setError('❌ Name must be at least 3 characters long');
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      setError('❌ Phone number must be exactly 10 digits');
      return;
    }

    if (formData.phone && !/^[6-9]/.test(formData.phone)) {
      setError('❌ Phone number must start with 6, 7, 8, or 9');
      return;
    }

    setLoading(true);
    try {
      await API.post('/contact', formData);
      setSuccess('✅ Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError('❌ Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />

      <div className="page-header">
        <h1>Contact Us</h1>
        <p>Get in touch with us for any queries</p>
      </div>

      <section className="contact-section container">
        <div className="contact-grid">

          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Address</h4>
                  <p>Late Kalpana Chawla Mahila Senior Science & Arts College</p>
                  <p>Gangakhed, Maharashtra - 431514</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>+91 9307162914</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <h4>Email</h4>
                  <p>ilkcwscgkd@gmail.com</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">🕐</span>
                <div>
                  <h4>Office Hours</h4>
                  <p>Monday - Saturday: 9:00 AM - 5:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">🎓</span>
                <div>
                  <h4>Affiliated To</h4>
                  <p>SNDT Women's University</p>
                  <p>Run by Vidyaniketan Sevabhavi Sanstha</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h2>Send a Message</h2>

            {success && (
              <div style={{
                background: '#e8f5e9',
                color: '#2E7D32',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

            {error && (
              <div style={{
                background: '#ffebee',
                color: '#C62828',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name * <span style={{fontSize: '12px', color: '#888', fontWeight: 'normal'}}>(alphabets only)</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div className="contact-form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone <span style={{fontSize: '12px', color: '#888', fontWeight: 'normal'}}>(10 digits)</span></label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Message subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  placeholder="Write your message here..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px' }}
                disabled={loading}>
                {loading ? '⏳ Sending...' : '📨 Send Message'}
              </button>
            </form>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
