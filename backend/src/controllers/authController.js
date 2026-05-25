// Controller de autenticação — manipula requisições HTTP de register, login e logout com cookies httpOnly

import { registerUser, loginUser } from '../services/authService.js';
import { validateEmail, validateRequiredFields, validatePassword } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// Utilitário para configurar o cookie JWT com opções de segurança de nível de produção
const setAuthCookie = (res, token) => {
  res.cookie('taskhub_token', token, {
    httpOnly: true, // Protege contra XSS (JavaScript não consegue acessar via F12 ou scripts maliciosos)
    secure: process.env.NODE_ENV === 'production', // Apenas via HTTPS em produção
    sameSite: 'lax', // Proteção contra CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias de expiração
  });
};

/**
 * POST /auth/register
 * Cria novo usuário com name, email e password
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Valida campos obrigatórios
    const { valid, missing } = validateRequiredFields(['name', 'email', 'password'], req.body);
    if (!valid) {
      return res.status(400).json(
        errorResponse(`Campos obrigatórios faltando: ${missing.join(', ')}`)
      );
    }

    // Valida formato do email
    if (!validateEmail(email)) {
      return res.status(400).json(errorResponse('Email inválido'));
    }

    // Valida força da senha
    if (!validatePassword(password)) {
      return res.status(400).json(
        errorResponse('Senha deve ter no mínimo 6 caracteres')
      );
    }

    const { user, token } = await registerUser(name, email, password);

    // Define o token no cookie httpOnly seguro
    setAuthCookie(res, token);

    return res.status(201).json(
      successResponse({ user, token }, 'Usuário criado com sucesso')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 * Autentica usuário e retorna token JWT
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Valida campos obrigatórios
    const { valid, missing } = validateRequiredFields(['email', 'password'], req.body);
    if (!valid) {
      return res.status(400).json(
        errorResponse(`Campos obrigatórios faltando: ${missing.join(', ')}`)
      );
    }

    // Valida formato do email
    if (!validateEmail(email)) {
      return res.status(400).json(errorResponse('Email inválido'));
    }

    const { user, token } = await loginUser(email, password);

    // Define o token no cookie httpOnly seguro
    setAuthCookie(res, token);

    return res.status(200).json(
      successResponse({ user, token }, 'Login realizado com sucesso')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 * Limpa o cookie seguro httpOnly do token
 */
export async function logout(req, res, next) {
  try {
    res.clearCookie('taskhub_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.status(200).json(
      successResponse(null, 'Logout realizado com sucesso')
    );
  } catch (error) {
    next(error);
  }
}
