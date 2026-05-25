import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis do .env
dotenv.config();

// Se estiver rodando em ambiente de testes Jest, altera a URL do banco de dados para isolar os ambientes
if (process.env.NODE_ENV === 'test' && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('/taskhub_dev', '/taskhub_test');
}

// Validação simples
const requiredEnv = ['JWT_SECRET'];
const missingEnv = requiredEnv.filter((envVar) => !process.env[envVar]);

if (missingEnv.length > 0) {
  throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missingEnv.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limite global
};
