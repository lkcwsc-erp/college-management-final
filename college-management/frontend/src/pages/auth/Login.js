import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReCAPTCHA from 'react-google-recaptcha';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Auth.css';

// Google reCAPTCHA Site Key
const RECAPTCHA_SITE_KEY = '6Lf_9ecsAAAAAIZ_AqaWxD8E-ORneMixV0DW6C_X';

const Login = () => {
  const [step, setStep] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  // Step 1: Login with email + password + CAPTCHA
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', {
        ...formData,
        captchaToken
      });

      if (data.otpRequired) {
        // Staff/Admin → show OTP screen
        setStep('otp');
        setSuccess(data.message);
        startResendCooldown();
      } else {
        // Student → direct login
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthData(data.user, data.token);
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      // Reset CAPTCHA on error
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', {
        email: formData.email,
        otp
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthData(data.user, data.token);

     const role = data.user.role;
if (role === 'admin') navigate('/admin/dashboard');
else if (role === 'staff_student') navigate('/staff/student-section');
else if (role === 'staff_accounts') navigate('/staff/accounts-section');
else if (role === 'staff_exam') navigate('/staff/exam-section');
else if (role === 'staff_scholarship') navigate('/staff/scholarship-section');
else if (role === 'staff') navigate('/staff/dashboard');
else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    try {
      const { data } = await API.post('/auth/resend-otp', { email: formData.email });
      setSuccess(data.message);
      setOtp('');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBackToLogin = () => {
    setStep('login');
    setOtp('');
    setError('');
    setSuccess('');
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
                <div className="auth-logo">🎓</div>
                <h2>Welcome Back</h2>
                <p>Login to your account</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-btn"
                  disabled={loading || !captchaToken}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="auth-link" style={{ fontSize: '13px', color: '#666', marginTop: '20px' }}>
                🎓 New students must contact college staff for registration
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="auth-header">
                <div className="auth-logo">🔐</div>
                <h2>Verify OTP</h2>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  We sent a 6-digit code to<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && (
                <div style={{
                  background: '#d1fae5', color: '#065f46',
                  padding: '12px', borderRadius: '8px', marginBottom: '16px',
                  fontSize: '14px', textAlign: 'center', borderLeft: '4px solid #10b981'
                }}>
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input
                    type="text"
                    placeholder="------"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    required
                    autoFocus
                    style={{
                      textAlign: 'center', fontSize: '24px',
                      letterSpacing: '8px', fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-btn"
                  disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : '✅ Verify OTP'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  Didn't get the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#999' : '#1565C0',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '🔄 Resend OTP'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  style={{
                    background: 'none', border: 'none',
                    color: '#666', cursor: 'pointer', fontSize: '13px'
                  }}>
                  ← Back to Login
                </button>
              </div>

              <div style={{
                background: '#fef3c7', padding: '12px', borderRadius: '8px',
                marginTop: '20px', fontSize: '12px', color: '#92400e',
                borderLeft: '3px solid #f59e0b'
              }}>
                ⏰ OTP is valid for 5 minutes only.
                <br />🔒 Never share your OTP with anyone.
              </div>
            </>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
