import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReCAPTCHA from 'react-google-recaptcha';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Auth.css';

const RECAPTCHA_SITE_KEY = '6Lf_9ecsAAAAAIZ_AqaWxD8E-ORneMixV0DW6C_X';

// Staff role → dashboard route mapping
const STAFF_ROUTES = {
  admin:              '/admin/dashboard',
  principal:          '/principal/dashboard',
  staff_student:      '/staff/student-section',
  staff_accounts:     '/staff/accounts-section',
  staff_exam:         '/staff/exam-section',
  staff_scholarship:  '/staff/scholarship-section',
  staff:              '/staff/dashboard',
};

const StaffLogin = () => {
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

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
    setError('');
  };

  // ── Step 1: Submit credentials + CAPTCHA ──────────────────────────────────
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
      const { data } = await API.post('/auth/staff-login', {
        username:     formData.username,
        email:        formData.email,
        password:     formData.password,
        captchaToken,
      });

      // Staff always goes to OTP
      if (data.otpRequired) {
        setStep('otp');
        setSuccess(data.message || 'OTP sent to your registered email.');
        startResendCooldown();
      } else {
        // Fallback: direct login if backend skips OTP
        saveAndRedirect(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
    setLoading(false);
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', {
        email: formData.email,
        otp,
      });
      saveAndRedirect(data);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
    setLoading(false);
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    try {
      const { data } = await API.post('/auth/resend-otp', { email: formData.email });
      setSuccess(data.message || 'OTP resent successfully.');
      setOtp('');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const saveAndRedirect = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthData(data.user, data.token);

    const route = STAFF_ROUTES[data.user.role] || '/staff/dashboard';
    navigate(route);
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBackToLogin = () => {
    setStep('credentials');
    setOtp('');
    setError('');
    setSuccess('');
    setCaptchaToken(null);
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">

          {/* ── STEP 1: Credentials ── */}
          {step === 'credentials' && (
            <>
              <div className="auth-header">
                <div className="auth-logo">🏫</div>
                <h2>Staff Login</h2>
                <p>Enter your credentials to continue</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin}>

                {/* Username */}
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {/* CAPTCHA */}
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
                  disabled={loading || !captchaToken}
                >
                  {loading ? 'Verifying...' : 'Continue →'}
                </button>
              </form>

              <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '20px' }}>
                🔒 This portal is for authorised staff members only.
              </p>
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <>
              <div className="auth-header">
                <div className="auth-logo">🔐</div>
                <h2>Verify OTP</h2>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  A 6-digit code has been sent to<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              {success && (
                <div style={{
                  background: '#d1fae5', color: '#065f46',
                  padding: '12px', borderRadius: '8px', marginBottom: '16px',
                  fontSize: '14px', textAlign: 'center', borderLeft: '4px solid #10b981',
                }}>
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="──────"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    required
                    autoFocus
                    style={{
                      textAlign: 'center',
                      fontSize: '28px',
                      letterSpacing: '10px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-btn"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : '✅ Verify & Login'}
                </button>
              </form>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  style={{
                    background: 'none', border: 'none',
                    color: resendCooldown > 0 ? '#999' : '#1565C0',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px', textDecoration: 'underline',
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '🔄 Resend OTP'}
                </button>
              </div>

              {/* Back */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  style={{
                    background: 'none', border: 'none',
                    color: '#666', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  ← Back to Login
                </button>
              </div>

              {/* Info box */}
              <div style={{
                background: '#fef3c7', padding: '12px', borderRadius: '8px',
                marginTop: '20px', fontSize: '12px', color: '#92400e',
                borderLeft: '3px solid #f59e0b',
              }}>
                ⏰ OTP is valid for 5 minutes only.<br />
                🔒 Never share your OTP with anyone.
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
