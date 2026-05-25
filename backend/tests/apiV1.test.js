// Testes de integração para a API v1 e controle de Roles (ADMIN / USER)

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('API v1 & Roles Integration Tests', () => {
  let userToken;
  let adminToken;
  let createdTaskId;

  // 1. Cadastro e login via rotas versionadas /api/v1
  describe('Authentication on /api/v1', () => {
    test('deve registrar um usuário padrão via /api/v1/auth/register', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Standard User', email: 'user@v1.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('USER');
      userToken = response.body.data.token;
    });

    test('deve autenticar o usuário padrão via /api/v1/auth/login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@v1.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('USER');
    });

    test('deve registrar um usuário ADMIN diretamente no banco para testar autorização', async () => {
      // Nota: Pelo controller padrão register, criamos USER por padrão.
      // Vamos criar um usuário ADMIN para testes inserindo direto ou registrando e modificando.
      // Usaremos o banco Prisma diretamente para setar a role como ADMIN.
      const hashedPassword = await prisma.user.findFirst({
        where: { email: 'user@v1.com' }
      }).then(u => u.password);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@v1.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      expect(adminUser.role).toBe('ADMIN');

      // Agora faz login como ADMIN
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@v1.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('ADMIN');
      adminToken = response.body.data.token;
    });
  });

  // 2. Operações de tarefas via rotas versionadas /api/v1/tasks
  describe('Tasks CRUD on /api/v1/tasks', () => {
    test('deve criar uma tarefa via /api/v1/tasks', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task V1', description: 'Testing v1 routes' });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Task V1');
      createdTaskId = response.body.data.id;
    });

    test('deve listar tarefas do usuário via /api/v1/tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(createdTaskId);
    });

    test('deve obter uma tarefa específica por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Task V1');
    });

    test('deve atualizar uma tarefa via PUT', async () => {
      const response = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Task V1', done: true });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Task V1');
      expect(response.body.data.done).toBe(true);
    });
  });

  // 3. Controle de acesso a rotas de administrador
  describe('Admin Role Authorization', () => {
    test('deve negar acesso a /api/v1/admin/users para usuário padrão (USER) com 403', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Acesso negado');
    });

    test('deve permitir acesso a /api/v1/admin/users para administrador (ADMIN) com 200', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Deve listar pelo menos o user@v1.com e admin@v1.com
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('role');
    });

    test('deve retornar 401 se nenhum token for fornecido para rota admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users');

      expect(response.status).toBe(401);
    });
  });

  // 4. Teste de remoção
  describe('Cleanup task', () => {
    test('deve deletar a tarefa via /api/v1/tasks/:id', async () => {
      const response = await request(app)
        .delete(`/api/v1/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removida');
    });
  });
});
