import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import ParentOrg from "./pages/ParentOrg";
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import Faculty from './pages/Faculty';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Admissions from './pages/Admissions';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudentSectionDashboard from './pages/dashboard/StudentSectionDashboard';
import AccountsSectionDashboard from './pages/dashboard/AccountsSectionDashboard';
import ExamSectionDashboard from './pages/dashboard/ExamSectionDashboard';
import ScholarshipSectionDashboard from './pages/dashboard/ScholarshipSectionDashboard';
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Resources from './pages/Resources';
import Examination from './pages/Examination';
import StaffLogin from './pages/auth/StaffLogin';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/parent-organisation" element={<ParentOrg />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/examination" element={<Examination />} />
          <Route path="/staff-login" element={<StaffLogin />} />

          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff/dashboard" element={
            <ProtectedRoute roles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff/student-section" element={
            <ProtectedRoute roles={['staff_student', 'admin']}>
              <StudentSectionDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff/accounts-section" element={
            <ProtectedRoute roles={['staff_accounts', 'admin']}>
              <AccountsSectionDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff/exam-section" element={
            <ProtectedRoute roles={['staff_exam', 'admin']}>
              <ExamSectionDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff/scholarship-section" element={
            <ProtectedRoute roles={['staff_scholarship', 'admin']}>
              <ScholarshipSectionDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
           <Route path="/principal/dashboard" element={
  <ProtectedRoute roles={['principal']}>
    <PrincipalDashboard />
  </ProtectedRoute>
} /> 

          <Route path="*" element={
            <div style={{
              textAlign: 'center',
              padding: '100px 20px',
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{ fontSize: '5rem' }}>😕</p>
              <h1 style={{ color: '#1565C0', fontSize: '2rem', marginBottom: '16px' }}>
                Page Not Found
              </h1>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                The page you are looking for does not exist.
              </p>
              <a href="/" style={{
                background: '#1565C0',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px'
              }}>
                Go to Home Page
              </a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
