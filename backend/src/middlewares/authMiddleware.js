// Middleware de autenticação JWT — protege rotas privadas

import { verifyToken } from '../utils/helpers.js';
import { errorResponse } from '../utils/helpers.js';
import { userRepository } from '../infrastructure/repositories/userRepository.js';

/**
 * Middleware que verifica o token JWT no cookie seguro httpOnly ou no header Authorization
 * Injeta req.user com os dados do usuário autenticado
 * Valida de forma ativa se o usuário ainda existe no banco de dados
 */
export async function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1. Tenta extrair o token do cookie (Método Ultra-Seguro contra XSS)
    if (req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(';').map(c => c.trim().split('='))
      );
      token = cookies.taskhub_token;
    }

    // 2. Fallback para o Header Authorization (para compatibilidade e testes automatizados Jest)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }
    }

    // Se nenhum token foi encontrado
    if (!token) {
      return res.status(401).json(errorResponse('Token de autenticação não fornecido'));
    }

    // Verifica e decodifica o token
    const decoded = verifyToken(token);

    // Valida se o usuário ainda existe (ex: se o banco de dados foi resetado/migrado)
    const userExists = await userRepository.findById(decoded.id);
    if (!userExists) {
      return res.status(401).json(errorResponse('Usuário não encontrado. Por favor, realize o login novamente.'));
    }

    // Injeta os dados do usuário na requisição
    req.user = decoded;
    next();
  } catch (error) {
    // Token expirado ou inválido
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token expirado. Faça login novamente'));
    }
    return res.status(401).json(errorResponse('Token inválido'));
  }
}
