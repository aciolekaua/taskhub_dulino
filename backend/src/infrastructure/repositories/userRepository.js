import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  /**
   * Encontra um usuário pelo email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  /**
   * Encontra um usuário pelo ID (String ObjectId no MongoDB)
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Cria um novo usuário
   * @param {object} userData - { name, email, password, role }
   * @returns {Promise<User>}
   */
  async create({ name, email, password, role = 'USER' }) {
    return prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      },
    });
  },

  /**
   * Encontra todos os usuários (ex: para rota de admin)
   * @returns {Promise<User[]>}
   */
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
