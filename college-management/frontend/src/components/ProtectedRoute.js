import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#1565C0',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '3rem' }}>🎓</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Role ke hisaab se sahi dashboard pe bhejo
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff_principal' || user.role === 'principal') return <Navigate to="/principal/dashboard" replace />;
    if (user.role === 'staff_student') return <Navigate to="/staff/student-section" replace />;
    if (user.role === 'staff_accounts') return <Navigate to="/staff/accounts-section" replace />;
    if (user.role === 'staff_exam') return <Navigate to="/staff/exam-section" replace />;
    if (user.role === 'staff_scholarship') return <Navigate to="/staff/scholarship-section" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
