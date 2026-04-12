import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedApiUrl,
  withCredentials: true,
});

export const AUTH_LOGIN_URL = `${normalizedApiUrl}/auth/login`;

export default api;
