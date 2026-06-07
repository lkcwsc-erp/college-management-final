import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Notifications.css';

const notifications = [
  { id: 1, type: 'admission', label: 'Admissions', date: 'May 20, 2026', title: 'Admissions Open for 2026-27', desc: 'Applications are now open for B.A. and B.Sc. first year admissions for the academic year 2026-27. Last date to apply is June 30, 2026.', isNew: true },
  { id: 2, type: 'exam', label: 'Examination', date: 'May 18, 2026', title: 'Semester Exam Timetable Released', desc: 'The timetable for the upcoming semester examinations has been released. Students are advised to check the notice board and college website.', isNew: true },
  { id: 3, type: 'event', label: 'Event', date: 'May 15, 2026', title: 'Annual Cultural Festival – Udaan 2026', desc: 'The annual cultural festival "Udaan 2026" will be held on June 10-12. Registrations for cultural events are open till June 1.', isNew: false },
  { id: 4, type: 'scholarship', label: 'Scholarship', date: 'May 12, 2026', title: 'Government Scholarship Applications', desc: 'Students eligible for EBC, OBC, SC, ST scholarships for 2025-26 are requested to submit renewal applications by May 31, 2026.', isNew: false },
  { id: 5, type: 'general', label: 'General', date: 'May 10, 2026', title: 'Library Timing Change', desc: 'The college library will now remain open from 8:00 AM to 6:00 PM on all working days. Students are encouraged to make use of this facility.', isNew: false },
  { id: 6, type: 'exam', label: 'Examination', date: 'May 5, 2026', title: 'Hall Tickets for Semester Exams', desc: 'Hall tickets for semester examinations are available for download from the student portal. Contact the office for any discrepancies.', isNew: false },
];

const typeColors = {
  admission: '#1565C0',
  exam: '#6a1b9a',
  event: '#e65100',
  scholarship: '#2e7d32',
  general: '#37474f',
};

const Notifications = () => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <>
      <Navbar />
      <div className="notif-page">

        {/* HERO */}
        <section className="notif-hero">
          <p className="notif-hero-tag">Stay Updated</p>
          <h1>Notifications</h1>
          <p className="notif-hero-sub">
            Latest announcements, exam schedules, events, and important updates from the college.
          </p>
        </section>

        {/* FILTER TABS */}
        <section className="notif-filters">
          <div className="notif-filters-inner">
            {['all', 'admission', 'exam', 'event', 'scholarship', 'general'].map(f => (
              <button
                key={f}
                className={`notif-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* NOTIFICATIONS LIST */}
        <section className="notif-section">
          <div className="notif-inner">
            {filtered.map(n => (
              <div className="notif-card" key={n.id}>
                <div className="notif-card-left">
                  <span
                    className="notif-type-badge"
                    style={{ background: typeColors[n.type] }}
                  >
                    {n.label}
                  </span>
                  <span className="notif-date">{n.date}</span>
                </div>
                <div className="notif-card-body">
                  <div className="notif-title-row">
                    <h3>{n.title}</h3>
                    {n.isNew && <span className="notif-new-badge">NEW</span>}
                  </div>
                  <p>{n.desc}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="notif-empty">No notifications found.</div>
            )}
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default Notifications;
