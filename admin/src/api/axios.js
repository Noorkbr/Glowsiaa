import axios from 'axios';

// In production set VITE_API_URL=https://glowsiaa-production.up.railway.app
// in Railway admin environment variables.
// Falls back to the known production backend when the env var is not set at build time.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : import.meta.env.DEV
    ? '/api'                                                 // Vite dev-server proxy
    : 'https://glowsiaa-production.up.railway.app/api';     // production fallback

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
