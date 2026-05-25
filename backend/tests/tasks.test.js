// Testes de integração — CRUD de tarefas com autenticação JWT (Supertest)

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js';

const prisma = new PrismaClient();

// Variáveis compartilhadas entre os testes
let tokenUserA;
let tokenUserB;
let taskId;

// Setup: criar usuários e obter tokens
beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Registra usuário A
  const resA = await request(app)
    .post('/auth/register')
    .send({ name: 'Usuário A', email: 'usera@test.com', password: 'senha123' });
  tokenUserA = resA.body.data.token;

  // Registra usuário B (para testar isolamento)
  const resB = await request(app)
    .post('/auth/register')
    .send({ name: 'Usuário B', email: 'userb@test.com', password: 'senha123' });
  tokenUserB = resB.body.data.token;
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════
// POST /tasks — Criar tarefa
// ═══════════════════════════════════════════════

describe('POST /tasks', () => {
  test('deve criar tarefa com dados válidos e retornar 201', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Minha primeira tarefa', description: 'Descrição da tarefa' });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Minha primeira tarefa');
    expect(response.body.data.done).toBe(false);

    taskId = response.body.data.id; // Salva para próximos testes
  });

  test('deve criar tarefa sem descrição (campo opcional)', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Tarefa sem descrição' });

    expect(response.status).toBe(201);
    expect(response.body.data.description).toBeNull();
  });

  test('deve retornar 400 se title estiver faltando', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ description: 'Sem título' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Campos obrigatórios faltando');
  });

  test('deve retornar 401 sem token de autenticação', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Tarefa sem auth' });

    expect(response.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════
// GET /tasks — Listar tarefas
// ═══════════════════════════════════════════════

describe('GET /tasks', () => {
  test('deve listar apenas as tarefas do usuário autenticado', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    // Usuário A deve ver pelo menos 2 tarefas criadas no teste anterior
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('usuário B não deve ver tarefas do usuário A', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  test('deve filtrar por status=done', async () => {
    const response = await request(app)
      .get('/tasks?status=done')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    // Nenhuma tarefa concluída ainda
    const doneTasks = response.body.data.filter(t => t.done === true);
    expect(doneTasks).toHaveLength(response.body.data.length);
  });

  test('deve filtrar por status=pending', async () => {
    const response = await request(app)
      .get('/tasks?status=pending')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    const pendingTasks = response.body.data.filter(t => t.done === false);
    expect(pendingTasks).toHaveLength(response.body.data.length);
  });

  test('deve buscar tarefas por título com ?q=', async () => {
    const response = await request(app)
      .get('/tasks?q=primeira')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].title).toContain('primeira');
  });
});

// ═══════════════════════════════════════════════
// GET /tasks/:id — Buscar tarefa específica
// ═══════════════════════════════════════════════

describe('GET /tasks/:id', () => {
  test('deve retornar tarefa específica do usuário autenticado', async () => {
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(taskId);
  });

  test('deve retornar 404 para ID inexistente', async () => {
    const response = await request(app)
      .get('/tasks/99999')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(404);
  });

  test('usuário B não deve acessar tarefa do usuário A', async () => {
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(response.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════
// PUT /tasks/:id — Atualizar tarefa
// ═══════════════════════════════════════════════

describe('PUT /tasks/:id', () => {
  test('deve atualizar título da tarefa', async () => {
    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Título atualizado' });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Título atualizado');
  });

  test('deve marcar tarefa como concluída (done: true)', async () => {
    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ done: true });

    expect(response.status).toBe(200);
    expect(response.body.data.done).toBe(true);
  });

  test('deve retornar 400 se nenhum campo for fornecido', async () => {
    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test('usuário B não deve atualizar tarefa do usuário A', async () => {
    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Tentativa de invasão' });

    expect(response.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════
// DELETE /tasks/:id — Remover tarefa
// ═══════════════════════════════════════════════

describe('DELETE /tasks/:id', () => {
  test('usuário B não deve deletar tarefa do usuário A', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(response.status).toBe(404);
  });

  test('deve deletar tarefa do usuário autenticado', async () => {
    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('removida');
  });

  test('deve retornar 404 após deletar a tarefa', async () => {
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(response.status).toBe(404);
  });
});
