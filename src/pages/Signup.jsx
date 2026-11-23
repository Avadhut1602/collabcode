// src/pages/Signup.jsx
import React, { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Code2, Check, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 2, label: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 3, label: 'Good', color: '#3b82f6' };
      case 4:
        return { score: 4, label: 'Strong', color: '#10b981' };
      default:
        return { score: 0, label: 'Too Short', color: '#64748b' };
    }
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await signup(formData.name.trim(), formData.email.trim(), formData.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-card card">
        <div className="signup-brand">
          <div className="signup-logo-badge">
            <Code2 size={22} />
          </div>
          <span className="signup-logo-text">CollabCode</span>
        </div>

        <div className="signup-header">
          <h1>Create an Account</h1>
          <p>Join CollabCode to write, compile, and pair-program in real time.</p>
        </div>

        {serverError && <div className="auth-alert error-alert">{serverError}</div>}

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={17} className="input-icon" />
              <input
                id="name"
                type="text"
                name="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={17} className="input-icon" />
              <input
                id="signup-email"
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="strength-meter-container">
                <div className="strength-meter-bars">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className="strength-bar"
                      style={{
                        backgroundColor:
                          bar <= passwordStrength.score ? passwordStrength.color : 'var(--surface-hover)',
                      }}
                    ></div>
                  ))}
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary signup-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="signup-footer-prompt">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
