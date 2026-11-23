// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Navigation Bar
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Navigation Bar (automatically hidden in /room/:id) */}
        <Navbar />

        {/* Client-side Application Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Wildcard */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
