import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const taskRepository = {
  /**
   * Encontra todas as tarefas de um usuário com filtros opcionais
   * @param {string} userId (String ObjectId no MongoDB)
   * @param {object} filters - { status, q }
   * @returns {Promise<Task[]>}
   */
  async findManyByUserId(userId, { status, q } = {}) {
    const where = { userId };

    if (status === 'done') {
      where.done = true;
    } else if (status === 'pending') {
      where.done = false;
    }

    if (q && q.trim()) {
      where.title = {
        contains: q.trim(),
        mode: 'insensitive', // O MongoDB suporta mode: 'insensitive' nativamente via Prisma!
      };
    }

    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Encontra uma tarefa específica pelo ID e ID do usuário (ownership validation)
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Task|null>}
   */
  async findByIdAndUserId(id, userId) {
    return prisma.task.findFirst({
      where: { id, userId },
    });
  },

  /**
   * Cria uma nova tarefa
   * @param {object} taskData - { userId, title, description }
   * @returns {Promise<Task>}
   */
  async create({ userId, title, description = null }) {
    return prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        done: false,
      },
    });
  },

  /**
   * Atualiza uma tarefa por ID
   * @param {string} id
   * @param {object} updateData - { title, description, done }
   * @returns {Promise<Task>}
   */
  async update(id, updateData) {
    const data = {};
    if (updateData.title !== undefined) data.title = updateData.title.trim();
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.done !== undefined) data.done = Boolean(updateData.done);

    return prisma.task.update({
      where: { id },
      data,
    });
  },

  /**
   * Deleta uma tarefa por ID
   * @param {string} id
   * @returns {Promise<Task>}
   */
  async delete(id) {
    return prisma.task.delete({
      where: { id },
    });
  },
};
