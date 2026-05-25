// Rotas de autenticação

import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';

const router = Router();

// POST /auth/register — cria novo usuário
router.post('/register', register);

// POST /auth/login — autentica usuário e retorna JWT (e define cookie httpOnly)
router.post('/login', login);

// POST /auth/logout — invalida a sessão limpando o cookie httpOnly
router.post('/logout', logout);

export default router;
