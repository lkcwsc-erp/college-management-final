import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'staff_principal') return '/principal/dashboard';
    if (user?.role === 'staff_student') return '/staff/student-section';
    if (user?.role === 'staff_accounts') return '/staff/accounts-section';
    if (user?.role === 'staff_exam') return '/staff/exam-section';
    if (user?.role === 'staff_scholarship') return '/staff/scholarship-section';
    if (user?.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="navbar">

      {/* BRAND */}
      <div className="navbar-brand">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <img
            src="/new college logo.png"
            alt="College Logo"
            className="brand-logo-img"
          />
          <div className="brand-text">
              <span className="brand-vnss">
             Vidyaniketan Sevabhavi Sanstha (VNSS), Dongargaon
            </span>
            <span className="brand-name">
              Late Kalpana Chawla Women's Senior College
            </span>
            <span className="brand-sub">
              Senior Science & Arts College, Gangakhed
            </span>
          </div>
        </Link>
      </div>

      {/* NAV LINKS */}
      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>

        {!user && (
          <>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
            <Link to="/faculty" onClick={() => setMenuOpen(false)}>Faculty</Link>
            <Link to="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>
            <Link to="/events" onClick={() => setMenuOpen(false)}>Events</Link>
            <Link to="/achievements" onClick={() => setMenuOpen(false)}>Achievements</Link>
            <Link to="/resources" onClick={() => setMenuOpen(false)}>Resources</Link>
            <Link to="/notifications" onClick={() => setMenuOpen(false)} className="nav-notification-link">
              Notifications
              <span className="nav-notif-dot"></span>
            </Link>
            <Link to="/admissions" onClick={() => setMenuOpen(false)}>Admissions</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </>
        )}

        {user ? (
          <>
            <Link
              to={getDashboardLink()}
              onClick={() => setMenuOpen(false)}
              className="dashboard-link"
            >
              Dashboard
            </Link>
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="btn login-btn"
          >
            Login
          </Link>
        )}

      </div>

      {/* HAMBURGER */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

    </nav>
  );
};

export default Navbar;
