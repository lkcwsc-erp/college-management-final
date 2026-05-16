import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ScholarshipSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <button className="active">🏠 Dashboard</button>
          <button>📝 Applications</button>
          <button>✅ Approvals</button>
          <button>💰 Distribution</button>
          <button>📊 Category-wise</button>
          <button>📋 Document Verification</button>
          <button>📈 Reports</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>🎓 Scholarship Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Scholarship Staff)</span></div>
        </div>

        <div className="dashboard-content">
          <div style={{
            background: '#f3e5f5', padding: '20px', borderRadius: '12px',
            marginBottom: '20px', borderLeft: '5px solid #7b1fa2'
          }}>
            <h3 style={{color: '#7b1fa2', marginBottom: '8px'}}>🎓 Welcome to Scholarship Section!</h3>
            <p>Manage scholarship applications, approvals, and distribution to deserving students.</p>
          </div>

          <div className="dash-cards">
            <div className="dash-card blue">
              <div className="dash-card-icon">📝</div>
              <div><h3>0</h3><p>Applications</p></div>
            </div>
            <div className="dash-card green">
              <div className="dash-card-icon">✅</div>
              <div><h3>0</h3><p>Approved</p></div>
            </div>
            <div className="dash-card orange">
              <div className="dash-card-icon">⏳</div>
              <div><h3>0</h3><p>Pending</p></div>
            </div>
            <div className="dash-card red">
              <div className="dash-card-icon">💰</div>
              <div><h3>₹0</h3><p>Distributed</p></div>
            </div>
          </div>

          <h3 style={{margin: '30px 0 16px'}}>🚀 Quick Actions</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Review</span>
              <h4>📝 New Applications</h4>
              <p>Review scholarship applications</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Approve</span>
              <h4>✅ Pending Approvals</h4>
              <p>Process pending requests</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Distribute</span>
              <h4>💰 Disbursement</h4>
              <p>Release scholarship funds</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Report</span>
              <h4>📊 View Reports</h4>
              <p>Generate distribution reports</p>
            </div>
          </div>

          <div style={{
            background: '#fff3cd', padding: '20px', borderRadius: '12px',
            marginTop: '30px', borderLeft: '5px solid #f59e0b'
          }}>
            <h4 style={{color: '#92400e', marginBottom: '8px'}}>⚠️ Coming Soon</h4>
            <p style={{color: '#92400e'}}>Full functionality for scholarship management is under development.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScholarshipSectionDashboard;
