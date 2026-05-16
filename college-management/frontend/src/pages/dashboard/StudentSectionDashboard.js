import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const StudentSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">👩‍🎓</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Student Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="active">🏠 Dashboard</button>
          <button>📝 Admission Enquiries</button>
          <button>👥 Generate Credentials</button>
          <button>📋 Document Verification</button>
          <button>🎓 SY/TY Carry Forward</button>
          <button>📄 Generate TC</button>
          <button>📜 Generate Bonafide</button>
          <button>🪪 Generate ID Card</button>
          <button>🔢 Update PRN/ABC ID</button>
          <button>👩‍🎓 All Students</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>👩‍🎓 Student Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Student Section Staff)</span></div>
        </div>

        <div className="dashboard-content">
          <div style={{
            background: '#e3f2fd', padding: '20px', borderRadius: '12px',
            marginBottom: '20px', borderLeft: '5px solid #1565C0'
          }}>
            <h3 style={{color: '#1565C0', marginBottom: '8px'}}>👋 Welcome to Student Section!</h3>
            <p>Manage student admissions, verify documents, generate certificates, and maintain student records.</p>
          </div>

          <div className="dash-cards">
            <div className="dash-card blue">
              <div className="dash-card-icon">📝</div>
              <div><h3>0</h3><p>Pending Enquiries</p></div>
            </div>
            <div className="dash-card green">
              <div className="dash-card-icon">✅</div>
              <div><h3>0</h3><p>Verified Today</p></div>
            </div>
            <div className="dash-card orange">
              <div className="dash-card-icon">📄</div>
              <div><h3>0</h3><p>TCs Generated</p></div>
            </div>
            <div className="dash-card red">
              <div className="dash-card-icon">🪪</div>
              <div><h3>0</h3><p>ID Cards Issued</p></div>
            </div>
          </div>

          <h3 style={{margin: '30px 0 16px'}}>🚀 Quick Actions</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Most Used</span>
              <h4>📝 New Admission Enquiry</h4>
              <p>Add new student enquiry manually</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Quick</span>
              <h4>👥 Generate Login</h4>
              <p>Create student login credentials</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Important</span>
              <h4>📋 Verify Documents</h4>
              <p>Review uploaded student documents</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Auto</span>
              <h4>📄 Generate TC</h4>
              <p>Issue Transfer Certificate</p>
            </div>
          </div>

          <div style={{
            background: '#fff3cd', padding: '20px', borderRadius: '12px',
            marginTop: '30px', borderLeft: '5px solid #f59e0b'
          }}>
            <h4 style={{color: '#92400e', marginBottom: '8px'}}>⚠️ Coming Soon</h4>
            <p style={{color: '#92400e'}}>Full functionality for all features is under development. Currently this is a preview of the Student Section dashboard structure.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentSectionDashboard;
