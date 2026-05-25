// Serviço de autenticação — lógica de negócio para register e login usando repositories

import { userRepository } from '../infrastructure/repositories/userRepository.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';

/**
 * Registra um novo usuário no banco de dados
 * @param {string} name - Nome do usuário
 * @param {string} email - Email único
 * @param {string} password - Senha em texto plano (será hasheada)
 * @param {string} role - Papel do usuário (USER ou ADMIN)
 * @returns {Promise<{ user, token }>}
 * @throws {Error} Se email já estiver em uso
 */
export async function registerUser(name, email, password, role = 'USER') {
  // Verifica se email já está cadastrado
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    const error = new Error('Email já está em uso');
    error.statusCode = 400;
    throw error;
  }

  // Cria hash da senha
  const hashedPassword = await hashPassword(password);

  // Cria usuário usando o repositório
  const createdUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  // Retorna dados do usuário sem a senha
  const { password: _, ...userWithoutPassword } = createdUser;

  // Gera token JWT
  const token = generateToken({ 
    id: userWithoutPassword.id, 
    email: userWithoutPassword.email, 
    role: userWithoutPassword.role 
  });

  return { user: userWithoutPassword, token };
}

/**
 * Autentica um usuário com email e senha
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, token }>}
 * @throws {Error} Se credenciais inválidas
 */
export async function loginUser(email, password) {
  // Busca usuário pelo email usando o repositório
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error('Credenciais inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Compara senha fornecida com hash armazenado
  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    const error = new Error('Credenciais inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Gera novo token JWT contendo ID, email e role
  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  // Retorna dados do usuário sem a senha
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}
