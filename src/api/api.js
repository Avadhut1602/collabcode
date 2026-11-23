import axios from 'axios';

// Base URL taken from Vite env variable with fallback to local development port
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 10000, // 10-second timeout to avoid infinite loading screens
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
