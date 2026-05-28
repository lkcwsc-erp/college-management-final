import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import StudentsReport from '../../components/StudentsReport';

const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Scholarship Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Dashboard</button>
          <button>📝 Applications</button>
          <button>✅ Approvals</button>
          <button>💰 Distribution</button>
          <button>📊 Category-wise</button>
          <button>📋 Document Verification</button>
          <button className={activeTab === 'students_report' ? 'active' : ''} onClick={() => setActiveTab('students_report')}>👩‍🎓 Students Report</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>🎓 Scholarship Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Scholarship Staff)</span></div>
        </div>

        <div className="dashboard-content">

          {activeTab === 'students_report' && <StudentsReport themeColor="#0288D1" />}

          {activeTab === 'home' && (
            <div>
              <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #7b1fa2' }}>
                <h3 style={{ color: '#7b1fa2', marginBottom: '8px' }}>🎓 Welcome to Scholarship Section!</h3>
                <p>Manage scholarship applications, approvals, and distribution to deserving students.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue"><div className="dash-card-icon">📝</div><div><h3>0</h3><p>Applications</p></div></div>
                <div className="dash-card green"><div className="dash-card-icon">✅</div><div><h3>0</h3><p>Approved</p></div></div>
                <div className="dash-card orange"><div className="dash-card-icon">⏳</div><div><h3>0</h3><p>Pending</p></div></div>
                <div className="dash-card red"><div className="dash-card-icon">💰</div><div><h3>₹0</h3><p>Distributed</p></div></div>
              </div>

              <h3 style={{ margin: '30px 0 16px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('students_report')}>
                  <span className="notice-tag">View</span>
                  <h4>👩‍🎓 Students Report</h4>
                  <p>View all registered students</p>
                </div>
                <div className="event-card" style={{ cursor: 'pointer' }}>
