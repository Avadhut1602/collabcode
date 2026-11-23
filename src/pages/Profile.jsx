// src/pages/Profile.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Palette,
  Bell,
  Check,
  Save,
  ArrowLeft,
  Shield,
  Code2,
  Sparkles,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile, theme, setTheme } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    preferredLanguage: user?.preferredLanguage || 'javascript',
    themePreference: user?.themePreference || theme || 'vs-dark',
    programmingInterests: user?.programmingInterests?.join(', ') || '',
    notificationSettings: user?.notificationSettings || {
      emailAlerts: true,
      roomInvites: true,
      chatMentions: true,
      activityUpdates: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const handleNotificationToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: !prev.notificationSettings[key],
      },
    }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSaveError('Full name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');
      const tagList = formData.programmingInterests
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim(),
        preferredLanguage: formData.preferredLanguage,
        themePreference: formData.themePreference,
        programmingInterests: tagList,
        notificationSettings: formData.notificationSettings,
      });

      setTheme(formData.themePreference);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="header-titles">
          <h1>Account & Profile Settings</h1>
          <p>Customize your developer identity, workspace preferences, and notification alerts.</p>
        </div>
      </div>

      <div className="profile-content-layout">
        {/* Left Identity Card */}
        <div className="card identity-card">
          <div className="avatar-preview-box">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar Preview" className="avatar-large" />
            ) : (
              <div className="avatar-initials-large">{getInitials(formData.name)}</div>
            )}
          </div>

          <h3 className="identity-name">{user?.name}</h3>
          <span className="identity-email">{user?.email}</span>
          <p className="identity-bio">{user?.bio || 'CollabCode Developer'}</p>

          <div className="identity-meta">
            <span className="meta-item">
              <strong>Member since:</strong>{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString([], {
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="meta-item">
              <strong>Preferred Language:</strong> {user?.preferredLanguage?.toUpperCase() || 'JAVASCRIPT'}
            </span>
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="card settings-form-card">
          {saveSuccess && (
            <div className="auth-alert success-alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} />
              <span>Profile settings updated successfully!</span>
            </div>
          )}

          {saveError && <div className="auth-alert error-alert">{saveError}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section-title">Public Developer Profile</div>

            <div className="form-group">
              <label htmlFor="profile-name" className="form-label">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-bio" className="form-label">
                Short Bio
              </label>
              <textarea
                id="profile-bio"
                name="bio"
                className="input"
                rows={2}
                value={formData.bio}
                onChange={handleChange}
                placeholder="What technologies are you working on?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-avatar" className="form-label">
                Avatar Image URL (Optional)
              </label>
              <input
                id="profile-avatar"
                type="url"
                name="avatar"
                className="input"
                placeholder="https://example.com/photo.png"
                value={formData.avatar}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-interests" className="form-label">
                Programming Interests (comma-separated)
              </label>
              <input
                id="profile-interests"
                type="text"
                name="programmingInterests"
                className="input"
                placeholder="React, Python, Algorithms, C++, Machine Learning"
                value={formData.programmingInterests}
                onChange={handleChange}
              />
            </div>

            <div className="form-section-divider"></div>
            <div className="form-section-title">Workspace & IDE Preferences</div>

            <div className="form-group-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="pref-lang" className="form-label">
                  Default Language
                </label>
                <select
                  id="pref-lang"
                  name="preferredLanguage"
                  className="input"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="pref-theme" className="form-label">
                  Visual Theme
                </label>
                <select
                  id="pref-theme"
                  name="themePreference"
                  className="input"
                  value={formData.themePreference}
                  onChange={handleChange}
                >
                  <option value="vs-dark">Dark Theme (VS Code)</option>
                  <option value="light">Light Theme</option>
                  <option value="hc-black">High Contrast Black</option>
                </select>
              </div>
            </div>

            <div className="form-section-divider"></div>
            <div className="form-section-title">Notification Alerts</div>

            <div className="notification-toggles-list">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.notificationSettings.roomInvites}
                  onChange={() => handleNotificationToggle('roomInvites')}
                />
                <span>Workspace Invitations & Join Alerts</span>
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.notificationSettings.chatMentions}
                  onChange={() => handleNotificationToggle('chatMentions')}
                />
                <span>In-Room Chat Notifications</span>
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.notificationSettings.activityUpdates}
                  onChange={() => handleNotificationToggle('activityUpdates')}
                />
                <span>Project Milestone & Version Updates</span>
              </label>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
