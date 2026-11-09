// client/src/services/api.js
// Axios instance configured with base URL and JWT authorization interceptor

import axios from 'axios';

// Base API URL from environment variable or default local server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios Request Interceptor: Attach JWT token from localStorage to every protected request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aiesec_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Handle global errors (e.g. expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 Unauthorized occurs on a protected route, clear expired session
      if (localStorage.getItem('aiesec_token')) {
        localStorage.removeItem('aiesec_token');
        localStorage.removeItem('aiesec_user');
        // Optional redirect to login if not already on public routes
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

