import { errorResponse } from '../utils/helpers.js';

/**
 * Middleware que verifica se o usuário autenticado possui uma das roles autorizadas
 * @param {...string} roles - As roles permitidas (ex: 'ADMIN', 'USER')
 * @returns {Function} Express middleware
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Não autenticado'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse('Acesso negado. Nível de permissão insuficiente.'));
    }

    next();
  };
}
