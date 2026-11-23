// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Code2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError('');
      await login(formData.email.trim(), formData.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Login failed. Please verify your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo credentials for reviewers
  const handleQuickDemo = (email) => {
    setFormData({
      email,
      password: 'Demo@123',
    });
    setErrors({});
    setServerError('');
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
          <h1>Welcome Back</h1>
          <p>Sign in to access your collaborative coding workspaces.</p>
        </div>

        {serverError && <div className="auth-alert error-alert">{serverError}</div>}

        {/* Quick Demo Login Fillers */}
        <div className="quick-demo-box">
          <span className="quick-demo-title">Quick Demo Accounts:</span>
          <div className="quick-demo-buttons">
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo('alex@example.com')}
            >
              Alex (Fullstack)
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo('priya@example.com')}
            >
              Priya (Python)
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo('rohan@example.com')}
            >
              Rohan (JS)
            </button>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={17} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-prompt">
          Don't have an account? <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
