// Testes de integração — Autenticação (register e login via Supertest)

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js';

const prisma = new PrismaClient();

// Limpa banco antes e depois dos testes
beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════
// POST /auth/register
// ═══════════════════════════════════════════════

describe('POST /auth/register', () => {
  test('deve criar usuário com dados válidos e retornar 201 + token', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'João Silva', email: 'joao@test.com', password: '123456' });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe('joao@test.com');
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.error).toBeNull();
  });

  test('deve retornar 400 se email já estiver em uso', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'João Duplicado', email: 'joao@test.com', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeNull();
  });

  test('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'incompleto@test.com' }); // sem name e password

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Campos obrigatórios faltando');
  });

  test('deve retornar 400 se email for inválido', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Teste', email: 'nao-e-email', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email inválido');
  });

  test('deve retornar 400 se senha tiver menos de 6 caracteres', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Teste', email: 'curto@test.com', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('mínimo 6 caracteres');
  });
});

// ═══════════════════════════════════════════════
// POST /auth/login
// ═══════════════════════════════════════════════

describe('POST /auth/login', () => {
  beforeAll(async () => {
    // Garante usuário para testes de login
    await request(app)
      .post('/auth/register')
      .send({ name: 'Maria Santos', email: 'maria@test.com', password: 'senha123' });
  });

  test('deve autenticar com credenciais corretas e retornar 200 + token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'maria@test.com', password: 'senha123' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe('maria@test.com');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  test('deve retornar 401 com senha incorreta', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'maria@test.com', password: 'senhaErrada' });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Credenciais inválidas');
  });

  test('deve retornar 401 com email não cadastrado', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@test.com', password: 'qualquercoisa' });

    expect(response.status).toBe(401);
  });

  test('deve retornar 400 se campos faltarem', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'maria@test.com' }); // sem password

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Campos obrigatórios faltando');
  });
});
