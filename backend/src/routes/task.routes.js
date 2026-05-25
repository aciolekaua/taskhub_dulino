// Rotas de tarefas — todas protegidas pelo authMiddleware

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  listTasks,
  getTask,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/taskController.js';

const router = Router();

// Aplica autenticação em todas as rotas de tarefas
router.use(authMiddleware);

// GET  /tasks       → lista tarefas (suporta ?status=&q=)
router.get('/', listTasks);

// GET  /tasks/:id   → retorna tarefa específica
router.get('/:id', getTask);

// POST /tasks       → cria tarefa
router.post('/', createTaskHandler);

// PUT  /tasks/:id   → atualiza tarefa
router.put('/:id', updateTaskHandler);

// DELETE /tasks/:id → remove tarefa
router.delete('/:id', deleteTaskHandler);

export default router;
