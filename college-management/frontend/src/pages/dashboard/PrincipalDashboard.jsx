import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrincipalDashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '24px',
        background: '#f5f7fb',
        minHeight: '100vh'
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >

        <div>
          <h1
            style={{
              fontSize: '32px',
              color: '#1e293b',
              marginBottom: '5px'
            }}
          >
            🎓 Principal Dashboard
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '15px'
            }}
          >
            Welcome, {user?.name}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          style={{
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Logout
        </button>

      </div>

      {/* STATS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: '20px',
          marginBottom: '35px'
        }}
      >

        <div style={cardStyle}>
          <h2 style={numberStyle}>120</h2>
          <p style={textStyle}>Total Admissions</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>85</h2>
          <p style={textStyle}>Approved Admissions</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>35</h2>
          <p style={textStyle}>Pending Admissions</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>₹4,50,000</h2>
          <p style={textStyle}>Fees Collected</p>
        </div>

      </div>

      {/* MODULES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
          gap: '20px'
        }}
      >

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/admissions')}
        >
          <h3 style={moduleTitle}>📋 Admissions</h3>

          <p style={moduleText}>
            Review and approve student admissions
          </p>
        </div>

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/staff-reports')}
        >
          <h3 style={moduleTitle}>👨‍🏫 Staff Reports</h3>

          <p style={moduleText}>
            View department staff activities
          </p>
        </div>

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/fees')}
        >
          <h3 style={moduleTitle}>💰 Fees Reports</h3>

          <p style={moduleText}>
            Check fees collection reports
          </p>
        </div>

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/results')}
        >
          <h3 style={moduleTitle}>📘 Examination</h3>

          <p style={moduleText}>
            Examination and result reports
          </p>
        </div>

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/scholarship')}
        >
          <h3 style={moduleTitle}>🎓 Scholarship</h3>

          <p style={moduleText}>
            Scholarship and MahaDBT reports
          </p>
        </div>

        <div
          style={moduleCard}
          onClick={() => navigate('/principal/notifications')}
        >
          <h3 style={moduleTitle}>📢 Notifications</h3>

          <p style={moduleText}>
            Send notices to students and staff
          </p>
        </div>

      </div>

    </div>
  );
};

/* STYLES */

const cardStyle = {
  background: '#fff',
  padding: '25px',
  borderRadius: '14px',
  textAlign: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
};

const numberStyle = {
  fontSize: '32px',
  color: '#2563eb',
  marginBottom: '10px'
};

const textStyle = {
  color: '#64748b',
  fontSize: '15px'
};

const moduleCard = {
  background: '#fff',
  padding: '25px',
  borderRadius: '14px',
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  transition: '0.3s'
};

const moduleTitle = {
  marginBottom: '10px',
  color: '#1e293b'
};

const moduleText = {
  color: '#64748b',
  fontSize: '14px'
};

export default PrincipalDashboard;
