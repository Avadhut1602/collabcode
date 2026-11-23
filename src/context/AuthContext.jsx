// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('collabcode_theme') || 'vs-dark');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('collabcode_theme', theme);
  }, [theme]);

  // Load user info & notifications if token exists
  const fetchMe = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      if (res.data.themePreference) {
        setTheme(res.data.themePreference);
      }
      fetchNotifications();
    } catch (err) {
      console.error('Failed to load user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/auth/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Non-fatal
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.user.themePreference) {
      setTheme(data.user.themePreference);
    }
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser((prev) => ({ ...prev, ...data }));
    if (data.themePreference) {
      setTheme(data.themePreference);
    }
    return data;
  };

  const toggleFavorite = async (roomId) => {
    try {
      const { data } = await api.post(`/auth/favorites/${roomId}`);
      setUser((prev) => ({
        ...prev,
        favorites: data.favorites,
      }));
      return data.isFavorite;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/auth/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/auth/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'vs-dark' ? 'light' : theme === 'light' ? 'hc-black' : 'vs-dark';
    setTheme(nextTheme);
    if (user) {
      updateProfile({ themePreference: nextTheme }).catch(() => {});
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        setTheme,
        toggleTheme,
        login,
        signup,
        logout,
        updateProfile,
        toggleFavorite,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
