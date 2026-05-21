import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);

  // Document Request States
  const [myDocRequests, setMyDocRequests] = useState([]);
  const [docFormData, setDocFormData] = useState({
    documentType: '',
    reason: '',
    urgency: 'normal'
  });
  const [docMessage, setDocMessage] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    API.get('/notices')
      .then(res => setNotices(res.data.notices || []));

    if (user?.email) {
      API.get(`/admissions/by-email/${user.email}`)
        .then(res => {
          if (res.data.success) {
            setMyAdmission(res.data.admission);
          }
          setAdmissionLoading(false);
        })
        .catch(() => {
          setAdmissionLoading(false);
        });

      API.get('/document-requests/my')
        .then(res => setMyDocRequests(res.data.requests || []))
        .catch(() => {});
    } else {
      setAdmissionLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFormData.documentType) {
      setDocMessage('❌ Please select a document type');
      return;
    }
    setDocLoading(true);
    try {
      const res = await API.post('/document-requests', docFormData);
      if (res.data.success) {
        setDocMessage('✅ Request submitted! Waiting for Accounts Section approval.');
        setDocFormData({ documentType: '', reason: '', urgency: 'normal' });
        API.get('/document-requests/my')
          .then(r => setMyDocRequests(r.data.requests || []));
        setTimeout(() => setDocMessage(''), 4000);
      }
    } catch (err) {
      setDocMessage('❌ ' + (err.response?.data?.message || 'Failed to submit'));
    } finally {
      setDocLoading(false);
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case 'pending_accounts':
        return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Accounts' };
      case 'rejected_by_accounts':
        return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' };
      case 'approved_by_accounts':
      case 'pending_principal':
        return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending - Principal' };
      case 'rejected_by_principal':
        return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' };
      case 'approved_by_principal':
      case 'pending_generation':
        return { bg: '#e3f2fd', color: '#1565C0', label: '🎯 Pending - Generation' };
      case 'completed':
        return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Completed' };
      default:
        return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'application', label: '📋 My Application' },
    { id: 'profile', label: '👤 My Profile' },
    { id: 'fees', label: '💰 My Fees' },
    { id: 'documents', label: '📄 Request Documents' },
    { id: 'attendance', label: '📊 Attendance' },
    { id: 'results', label: '🎓 Results' },
    { id: 'notices', label: '📢 Notices' },
  ];

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' };
  };

  const getStatusMessage = (status) => {
    if (status === 'approved') return 'Congratulations! Your admission has been approved.';
    if (status === 'rejected') return 'Unfortunately your application was not approved. Please contact the college office.';
    return 'Your application is being reviewed. Please check back later.';
  };

  const getStatusEmoji = (status) => {
    if (status === 'approved') return '🎉';
    if (status === 'rejected') return '😞';
    return '⏳';
  };

  const docList = [
    { key: 'studentPhoto', label: '📸 Student Photo' },
    { key: 'aadharPhoto', label: '🪪 Aadhar Card' },
    { key: 'sscMarksheet', label: '📄 SSC Marksheet' },
    { key: 'hscMarksheet', label: '📄 HSC Marksheet' },
    { key: 'gapCertificate', label: '📅 Gap Certificate' },
    { key: 'casteCertificate', label: '📋 Caste Certificate' },
    { key: 'casteValidityCertificate', label: '✅ Caste Validity' },
  ];
