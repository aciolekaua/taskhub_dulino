// Controller de tarefas — manipula requisições HTTP do CRUD

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService.js';
import { validateRequiredFields } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

/**
 * GET /tasks
 * Lista todas as tarefas do usuário autenticado
 * Suporta query params: ?status=done|pending&q=busca
 */
export async function listTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, q } = req.query;

    const tasks = await getTasks(userId, { status, q });

    return res.status(200).json(
      successResponse(tasks, `${tasks.length} tarefa(s) encontrada(s)`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /tasks/:id
 * Retorna uma tarefa específica do usuário autenticado
 */
export async function getTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validação defensiva: se o ID não for um ObjectId hexadecimal de 24 caracteres válido
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json(errorResponse('Tarefa não encontrada'));
    }

    const task = await getTaskById(id, userId);

    return res.status(200).json(
      successResponse(task, 'Tarefa encontrada')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /tasks
 * Cria uma nova tarefa para o usuário autenticado
 * Body: { title, description? }
 */
export async function createTaskHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    // Valida campo obrigatório
    const { valid, missing } = validateRequiredFields(['title'], req.body);
    if (!valid) {
      return res.status(400).json(
        errorResponse(`Campos obrigatórios faltando: ${missing.join(', ')}`)
      );
    }

    const task = await createTask(userId, title, description);

    return res.status(201).json(
      successResponse(task, 'Tarefa criada com sucesso')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /tasks/:id
 * Atualiza uma tarefa existente do usuário autenticado
 * Body: { title?, description?, done? }
 */
export async function updateTaskHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validação defensiva: se o ID não for um ObjectId hexadecimal de 24 caracteres válido
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json(errorResponse('Tarefa não encontrada'));
    }

    const { title, description, done } = req.body;

    // Verifica se pelo menos um campo foi fornecido
    if (title === undefined && description === undefined && done === undefined) {
      return res.status(400).json(
        errorResponse('Nenhum campo para atualizar foi fornecido')
      );
    }

    const task = await updateTask(id, userId, { title, description, done });

    return res.status(200).json(
      successResponse(task, 'Tarefa atualizada com sucesso')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /tasks/:id
 * Remove uma tarefa do usuário autenticado
 */
export async function deleteTaskHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validação defensiva: se o ID não for um ObjectId hexadecimal de 24 caracteres válido
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json(errorResponse('Tarefa não encontrada'));
    }

    await deleteTask(id, userId);

    return res.status(200).json(
      successResponse(null, 'Tarefa removida com sucesso')
    );
  } catch (error) {
    next(error);
  }
}
