// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, Code2, CheckCircle2 } from 'lucide-react';
import api from '../api/api';
import './Login.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request Token, 2: Reset Password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Submit email to get reset token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage(res.data.message || 'Reset token generated successfully.');
      if (res.data.resetToken) {
        // Auto-fill token in dev/demo mode for seamless testing
        setResetToken(res.data.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit token and new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) {
      setError('Please provide reset token and new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/auth/reset-password', {
        token: resetToken.trim(),
        newPassword,
      });
      setMessage(res.data.message || 'Password updated successfully!');
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card card">
        <div className="auth-brand">
          <div className="auth-logo-badge">
            <Code2 size={22} />
          </div>
          <span className="auth-logo-text">CollabCode</span>
        </div>

        <div className="auth-header">
          <h1>{step === 1 ? 'Reset Your Password' : 'Set New Password'}</h1>
          <p>
            {step === 1
              ? 'Enter your account email to receive a password reset token.'
              : 'Enter your reset token and your new account password.'}
          </p>
        </div>

        {error && <div className="auth-alert error-alert">{error}</div>}
        {message && <div className="auth-alert success-alert">{message}</div>}

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your password has been reset successfully. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Sign In
            </Link>
          </div>
        ) : step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestToken}>
            <div className="form-group">
              <label htmlFor="reset-email" className="form-label">
                Account Email
              </label>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  id="reset-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="reset-token" className="form-label">
                Reset Verification Token
              </label>
              <div className="input-with-icon">
                <Key size={17} className="input-icon" />
                <input
                  id="reset-token"
                  type="text"
                  className="input"
                  placeholder="Paste your reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  id="new-password"
                  type="password"
                  className="input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-new-password" className="form-label">
                Confirm New Password
              </label>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  id="confirm-new-password"
                  type="password"
                  className="input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="auth-footer-prompt">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
