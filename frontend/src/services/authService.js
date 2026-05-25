// Serviço de autenticação do frontend — chamadas à API auth

import api from './api.js';

/**
 * Registra novo usuário
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, token }>}
 */
export async function register(name, email, password) {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
}

/**
 * Autentica usuário
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, token }>}
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}
