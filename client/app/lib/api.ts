import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedApiUrl,
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const AUTH_LOGIN_URL = `${normalizedApiUrl}/auth/login`;

export default api;
