import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import StudentsReport from '../../components/StudentsReport';

const ExamSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">📝</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Examination Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Dashboard</button>
          <button>📅 Exam Timetable</button>
          <button>📋 Question Papers</button>
          <button>✍️ Marks Entry</button>
          <button>📊 Results</button>
          <button>📄 Marksheets</button>
          <button className={activeTab === 'students_report' ? 'active' : ''} onClick={() => setActiveTab('students_report')}>👩‍🎓 Students Report</button>
          <button>🎓 Pass/Fail Analysis</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>📝 Examination Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Exam Staff)</span></div>
        </div>

        <div className="dashboard-content">

          {activeTab === 'students_report' && <StudentsReport themeColor="#6A1B9A" />}

          {activeTab === 'home' && (
            <div>
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #f57c00' }}>
                <h3 style={{ color: '#f57c00', marginBottom: '8px' }}>📝 Welcome to Examination Section!</h3>
                <p>Manage exam timetables, enter marks, generate results, and create marksheets.</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue"><div className="dash-card-icon">📅</div><div><h3>0</h3><p>Upcoming Exams</p></div></div>
                <div className="dash-card green"><div className="dash-card-icon">✅</div><div><h3>0</h3><p>Marks Entered</p></div></div>
                <div className="dash-card orange"><div className="dash-card-icon">📄</div><div><h3>0</h3><p>Results Generated</p></div></div>
                <div className="dash-card red"><div className="dash-card-icon">⏳</div><div><h3>0</h3><p>Pending Tasks</p></div></div>
              </div>

              <h3 style={{ margin: '30px 0 16px' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="event-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('students_report')}>
                  <span className="notice-tag">View</span>
                  <h4>👩‍🎓 Students Report</h4>
                  <p>View all registered students</p>
                </div>
                <div className="event-card" style={{ cursor: 'pointer' }}>
                  <span className="notice-tag">Enter</span>
                  <h4>✍️ Marks Entry</h4>
                  <p>Add student exam marks</p>
                </div>
                <div className="event-card" style={{ cursor: 'pointer' }}>
                  <span className="notice-tag">Generate</span>
                  <h4>📊 Generate Results</h4>
                  <p>Process exam results</p>
                </div>
                <div className="event-card" style={{ cursor: 'pointer' }}>
                  <span className="notice-tag">Print</span>
                  <h4>📄 Marksheets</h4>
                  <p>Print student marksheets</p>
                </div>
              </div>

              <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '12px', marginTop: '30px', borderLeft: '5px solid #f59e0b' }}>
                <h4 style={{ color: '#92400e', marginBottom: '8px' }}>⚠️ Coming Soon</h4>
                <p style={{ color: '#92400e' }}>Full functionality for exam management and result generation is under development.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ExamSectionDashboard;
