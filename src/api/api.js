import axios from 'axios';

// Base URL dynamically resolves:
// 1. Explicit VITE_API_URL environment variable if set
// 2. http://localhost:5000/api if running Vite dev server on port 5173
// 3. Relative /api for unified production deployments (Render, Railway, Heroku, Docker)
const baseURL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5000/api'
    : '/api');

const api = axios.create({
  baseURL,
  timeout: 15000, // 15-second timeout
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
