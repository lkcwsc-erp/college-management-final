import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AccountsSectionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">💰</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Accounts Section</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="active">🏠 Dashboard</button>
          <button>💵 Fees Collection</button>
          <button>🧾 Generate Receipts</button>
          <button>📊 Outstanding Dues</button>
          <button>💳 Payment History</button>
          <button>📈 Financial Reports</button>
          <button>💼 Fee Structure</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>💰 Accounts Section Dashboard</h2>
          <div className="user-info"><span>👋 {user?.name} (Accounts Staff)</span></div>
        </div>

        <div className="dashboard-content">
          <div style={{
            background: '#e8f5e9', padding: '20px', borderRadius: '12px',
            marginBottom: '20px', borderLeft: '5px solid #2E7D32'
          }}>
            <h3 style={{color: '#2E7D32', marginBottom: '8px'}}>💰 Welcome to Accounts Section!</h3>
            <p>Manage fees collection, generate receipts, track payments, and view financial reports.</p>
          </div>

          <div className="dash-cards">
            <div className="dash-card green">
              <div className="dash-card-icon">💵</div>
              <div><h3>₹0</h3><p>Collected Today</p></div>
            </div>
            <div className="dash-card orange">
              <div className="dash-card-icon">⏳</div>
              <div><h3>₹0</h3><p>Outstanding</p></div>
            </div>
            <div className="dash-card blue">
              <div className="dash-card-icon">🧾</div>
              <div><h3>0</h3><p>Receipts Today</p></div>
            </div>
            <div className="dash-card red">
              <div className="dash-card-icon">👥</div>
              <div><h3>0</h3><p>Defaulters</p></div>
            </div>
          </div>

          <h3 style={{margin: '30px 0 16px'}}>🚀 Quick Actions</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Daily</span>
              <h4>💵 Collect Fees</h4>
              <p>Accept fee payment from student</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Auto</span>
              <h4>🧾 Generate Receipt</h4>
              <p>Print payment receipt</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Report</span>
              <h4>📊 View Dues</h4>
              <p>Check outstanding fees</p>
            </div>
            <div className="event-card" style={{cursor: 'pointer'}}>
              <span className="notice-tag">Monthly</span>
              <h4>📈 Financial Report</h4>
              <p>Generate monthly report</p>
            </div>
          </div>

          <div style={{
            background: '#fff3cd', padding: '20px', borderRadius: '12px',
            marginTop: '30px', borderLeft: '5px solid #f59e0b'
          }}>
            <h4 style={{color: '#92400e', marginBottom: '8px'}}>⚠️ Coming Soon</h4>
            <p style={{color: '#92400e'}}>Full functionality for fees collection and reports is under development.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountsSectionDashboard;
