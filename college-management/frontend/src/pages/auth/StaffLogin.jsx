import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReCAPTCHA from 'react-google-recaptcha';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Auth.css';

const RECAPTCHA_SITE_KEY = '6Lf_9ecsAAAAAIZ_AqaWxD8E-ORneMixV0DW6C_X';

const StaffLogin = () => {
  const [step, setStep] = useState('login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigateByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'staff_principal' || role === 'principal') navigate('/principal/dashboard');
    else if (role === 'staff_student') navigate('/staff/student-section');
    else if (role === 'staff_accounts') navigate('/staff/accounts-section');
    else if (role === 'staff_exam') navigate('/staff/exam-section');
    else if (role === 'staff_scholarship') navigate('/staff/scholarship-section');
    else if (role === 'staff') navigate('/staff/dashboard');
    else navigate('/student/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!captchaToken) { setError('Please complete the CAPTCHA verification.'); return; }
    if (!formData.username && !formData.email) {
      setError('Please enter username or email.'); return;
    }
    setLoading(true);
    try {
      // Username ya email jo bhi bhara ho woh backend ko bhejo
      const loginId = formData.username || formData.email;
      const { data } = await API.post('/auth/login', {
        email: loginId,
        password: formData.password,
        captchaToken
      });
      if (data.otpRequired) {
        setStep('otp');
        setSuccess(data.message);
        startResendCooldown();
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthData(data.user, data.token);
        navigateByRole(data.user.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const loginId = formData.username || formData.email;
      const { data } = await API.post('/auth/verify-otp', { email: loginId, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthData(data.user, data.token);
      navigateByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError(''); setSuccess('');
    try {
      const loginId = formData.username || formData.email;
      const { data } = await API.post('/auth/resend-otp', { email: loginId });
      setSuccess(data.message); setOtp(''); startResendCooldown();
    } catch (err) { setError(err.response?.data?.message || 'Failed to resend OTP.'); }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleBackToLogin = () => {
    setStep('login'); setOtp(''); setError(''); setSuccess('');
    setCaptchaToken(null);
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">

          {step === 'login' && (
            <>
              <div className="auth-header">
                <div className="auth-logo">👨‍💼</div>
                <h2>Staff Login</h2>
                <p>Login with your staff credentials</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" placeholder="Enter your username" required
                    value={formData.username} onChange={handleChange} />
                </div>


                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="Enter your email" required
                    value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" placeholder="Enter your password"
                    value={formData.password} onChange={handleChange} required />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)} />
                </div>

                <button type="submit" className="btn btn-primary auth-btn" disabled={loading || !captchaToken}>
                  {loading ? 'Logging in...' : 'Staff Login'}
                </button>
              </form>

              <p style={{ fontSize: '13px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
                Are you a student?{' '}
                <span onClick={() => navigate('/login')}
                  style={{ color: '#1565C0', textDecoration: 'underline', fontWeight: '500', cursor: 'pointer' }}>
                  Student Login →
                </span>
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="auth-header">
                <div className="auth-logo">🔐</div>
                <h2>Verify OTP</h2>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  We sent a 6-digit code to your registered email
                </p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input type="text" placeholder="------" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6" required autoFocus
                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                </div>
                <button type="submit" className="btn btn-primary auth-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : '✅ Verify OTP'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Didn't get the code?</p>
                <button type="button" onClick={handleResendOTP} disabled={resendCooldown > 0}
                  style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#999' : '#1565C0', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '🔄 Resend OTP'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button type="button" onClick={handleBackToLogin}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px' }}>
                  ← Back to Login
                </button>
              </div>

              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', marginTop: '20px', fontSize: '12px', color: '#92400e', borderLeft: '3px solid #f59e0b' }}>
                ⏰ OTP is valid for 5 minutes only.<br />🔒 Never share your OTP with anyone.
              </div>
            </>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffLogin;
