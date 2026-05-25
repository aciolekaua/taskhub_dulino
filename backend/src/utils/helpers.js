// Helpers de autenticação — geração e verificação de JWT, hash de senha

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

/**
 * Gera um token JWT com o payload fornecido
 * @param {object} payload - Dados a incluir no token (ex: { id, email })
 * @returns {string} Token JWT assinado
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica um token JWT
 * @param {string} token
 * @returns {object} Payload decodificado
 * @throws {Error} Se o token for inválido ou expirado
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Cria hash bcrypt da senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara senha em texto plano com hash armazenado
 * @param {string} plain - Senha em texto plano
 * @param {string} hash - Hash armazenado no banco
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Formata resposta padronizada da API
 * @param {any} data - Dados a retornar
 * @param {string} message - Mensagem descritiva
 * @returns {object} Resposta formatada
 */
export function successResponse(data, message = 'Operação realizada com sucesso') {
  return { data, message, error: null };
}

/**
 * Formata resposta de erro padronizada da API
 * @param {string} message - Mensagem de erro
 * @param {any} details - Detalhes adicionais do erro
 * @returns {object} Resposta de erro formatada
 */
export function errorResponse(message = 'Erro interno do servidor', details = null) {
  return { data: null, message, error: details || message };
}
