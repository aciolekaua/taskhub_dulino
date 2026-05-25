// Instância Axios configurada para a API TaskHub

import axios from 'axios';

// URL base da API backend
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl}/api/v1`;

// Cria instância Axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Habilita transferência automática de cookies httpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de requisição ───────────────────
// Injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de resposta ─────────────────────
// Redireciona para login se token expirado (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa dados de autenticação
      localStorage.removeItem('taskhub_token');
      localStorage.removeItem('taskhub_user');

      // Redireciona para login se não estiver lá
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
