// Serviço de tarefas — lógica de negócio do CRUD usando repositories

import { taskRepository } from '../infrastructure/repositories/taskRepository.js';

/**
 * Lista todas as tarefas do usuário com filtros opcionais
 * @param {number} userId - ID do usuário autenticado
 * @param {object} filters - { status: 'done'|'pending', q: string de busca }
 * @returns {Promise<Task[]>}
 */
export async function getTasks(userId, { status, q } = {}) {
  return taskRepository.findManyByUserId(userId, { status, q });
}

/**
 * Busca uma tarefa específica pelo ID, garantindo que pertence ao usuário
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário autenticado
 * @returns {Promise<Task>}
 * @throws {Error} 404 se não encontrada ou não pertence ao usuário
 */
export async function getTaskById(id, userId) {
  const task = await taskRepository.findByIdAndUserId(id, userId);

  if (!task) {
    const error = new Error('Tarefa não encontrada');
    error.statusCode = 404;
    throw error;
  }

  return task;
}

/**
 * Cria uma nova tarefa para o usuário autenticado
 * @param {number} userId
 * @param {string} title
 * @param {string|null} description
 * @returns {Promise<Task>}
 */
export async function createTask(userId, title, description = null) {
  return taskRepository.create({ userId, title, description });
}

/**
 * Atualiza uma tarefa existente verificando ownership
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário autenticado
 * @param {object} data - Campos a atualizar { title, description, done }
 * @returns {Promise<Task>}
 * @throws {Error} 404 se não encontrada ou não pertence ao usuário
 */
export async function updateTask(id, userId, data) {
  // Verifica se a tarefa existe e pertence ao usuário
  await getTaskById(id, userId);

  return taskRepository.update(id, data);
}

/**
 * Remove uma tarefa verificando ownership
 * @param {number} id - ID da tarefa
 * @param {number} userId - ID do usuário autenticado
 * @returns {Promise<void>}
 * @throws {Error} 404 se não encontrada ou não pertence ao usuário
 */
export async function deleteTask(id, userId) {
  // Verifica se a tarefa existe e pertence ao usuário
  await getTaskById(id, userId);

  await taskRepository.delete(id);
}
