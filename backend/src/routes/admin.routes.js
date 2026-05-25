import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { userRepository } from '../infrastructure/repositories/userRepository.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

// Protege todas as rotas admin com JWT e role ADMIN
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

/**
 * GET /api/v1/admin/users
 * Lista todos os usuários cadastrados no sistema (apenas para administradores)
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await userRepository.findAll();
    res.status(200).json(successResponse(users, 'Usuários listados com sucesso'));
  } catch (error) {
    next(error);
  }
});

export default router;
