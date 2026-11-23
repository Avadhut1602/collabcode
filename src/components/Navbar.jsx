// src/components/Navbar.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  Bell,
  Sun,
  Moon,
  Contrast,
  User as UserIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    token,
    logout,
    theme,
    toggleTheme,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useContext(AuthContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Hide Navbar when inside coding workspace (/room/:id)
  if (location.pathname.startsWith('/room/')) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'hc-black') return <Contrast size={18} />;
    return <Moon size={18} />;
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="logo-badge-wrapper">
            <Code2 size={22} className="logo-svg" />
          </div>
          <span className="logo-text">
            Collab<span className="logo-accent">Code</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-desktop">
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            {token && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                  >
                    Analytics
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="nav-actions-group">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="btn btn-ghost btn-icon theme-btn"
              onClick={toggleTheme}
              title={`Theme: ${theme}. Click to switch.`}
              aria-label="Toggle visual theme"
            >
              {renderThemeIcon()}
            </button>

            {/* Notification Bell (if logged in) */}
            {token && (
              <div className="notification-dropdown-wrapper" ref={notifRef}>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon notification-bell-btn"
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="notification-counter-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="notification-panel">
                    <div className="notification-header">
                      <span className="notification-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="mark-all-read-btn"
                          onClick={markAllNotificationsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <ul className="notification-list">
                      {notifications.length === 0 ? (
                        <li className="notification-empty">No notifications yet.</li>
                      ) : (
                        notifications.map((n) => (
                          <li
                            key={n._id}
                            className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              if (!n.isRead) markNotificationRead(n._id);
                              if (n.link) {
                                navigate(n.link);
                                setIsNotificationOpen(false);
                              }
                            }}
                          >
                            <div className="notif-content">
                              <span className="notif-title">{n.title}</span>
                              <p className="notif-message">{n.message}</p>
                              <span className="notif-time">
                                {new Date(n.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {!n.isRead && <span className="unread-dot"></span>}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Guest CTA */}
            {token ? (
              <div className="user-dropdown-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-profile-trigger"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-label="Open user menu"
                >
                  <div className="user-avatar-pill">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="avatar-img" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                  <span className="user-name-label">{user?.name?.split(' ')[0] || 'User'}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <span className="menu-name">{user?.name}</span>
                      <span className="menu-email">{user?.email}</span>
                    </div>

                    <div className="menu-divider"></div>

                    <Link
                      to="/profile"
                      className="menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      to="/analytics"
                      className="menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <BarChart3 size={16} />
                      <span>Coding Analytics</span>
                    </Link>

                    <div className="menu-divider"></div>

                    <button
                      type="button"
                      className="menu-item menu-logout"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation drawer"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <ul className="mobile-links">
            <li>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            {token ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={location.pathname === '/dashboard' ? 'active' : ''}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={location.pathname === '/analytics' ? 'active' : ''}
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={location.pathname === '/profile' ? 'active' : ''}
                  >
                    Profile & Settings
                  </Link>
                </li>
                <li className="mobile-divider"></li>
                <li>
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    Log Out ({user?.name})
                  </button>
                </li>
              </>
            ) : (
              <div className="mobile-auth-cta">
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
