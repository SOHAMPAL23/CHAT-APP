import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './LoginPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      
      toast.success(data.message || 'Password reset email sent!');
      setEmailSent(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="login-title">Forgot Password?</h2>
            <p className="login-subtitle">
              {emailSent
                ? 'Check your email for reset instructions'
                : "No worries, we'll send you reset instructions"}
            </p>
          </div>

          {!emailSent ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary">
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="login-form" style={{ textAlign: 'center' }}>
              <div
                style={{
                  padding: '2rem',
                  background: '#d1fae5',
                  borderRadius: '12px',
                  marginBottom: '1.5rem'
                }}
              >
                <svg
                  style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 1rem',
                    color: '#10b981'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p style={{ color: '#065f46', fontWeight: '600' }}>
                  Email sent successfully!
                </p>
                <p style={{ color: '#047857', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Check your inbox for the password reset link.
                </p>
              </div>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="btn btn-primary"
              >
                Send Another Email
              </button>
            </div>
          )}

          <div className="login-footer">
            <p>
              <Link to="/login">← Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
