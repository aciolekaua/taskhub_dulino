// App Express — separado do server.js para facilitar testes

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

import authRoutes from './src/routes/auth.routes.js';
import taskRoutes from './src/routes/task.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { config } from './src/config/index.js';

dotenv.config();

const app = express();

// ─── Segurança e Otimização Globais ─────────────────────────
// Helmet para headers de segurança HTTP
app.use(helmet());

// Compressão gzip nas respostas
app.use(compression());

// Middleware de Request ID para rastreabilidade
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Logger estruturado Morgan com Request ID
morgan.token('id', (req) => req.id);
const morganFormat = '[:id] :method :url :status :res[content-length] - :response-time ms';
if (config.nodeEnv !== 'test') {
  app.use(morgan(morganFormat));
}

// Parser de JSON
app.use(express.json());

// CORS — permite requisições do frontend com credenciais (com resolução dinâmica para evitar incompatibilidades de rede)
app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (testes locais, Jest, Supertest, Postman)
    if (!origin) return callback(null, true);
    
    // Em desenvolvimento, permite origens locais de forma flexível (evita bugs de slashes, IPv6 ou localhost)
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://[::1]:');
    if (isLocal || origin === config.frontendUrl) {
      return callback(null, true);
    }
    
    return callback(new Error('Bloqueado pelo CORS'));
  },
  credentials: true, // Habilita cookies seguros httpOnly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Cookie'],
  optionsSuccessStatus: 200, // Força status de sucesso na preflight OPTIONS para compatibilidade
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    data: null,
    message: 'Muitas requisições originadas deste IP, por favor tente novamente mais tarde.',
    error: 'Too Many Requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test', // Pula rate limiting em testes
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // max 20 tentativas
  message: {
    data: null,
    message: 'Muitas tentativas de login/cadastro. Por favor, tente novamente após 15 minutos.',
    error: 'Too Many Requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test',
});

// Aplica limiters
app.use(globalLimiter);
app.use('/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── Rota de health check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    data: { status: 'ok', timestamp: new Date().toISOString() },
    message: 'TaskHub API está funcionando',
    error: null,
  });
});

// ─── Rotas da API ──────────────────────────────────────────
// Rotas legadas (compatibilidade retroativa)
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Rotas versionadas v1 (padrão escalável)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── Rota 404 para endpoints não encontrados ───────────────
app.use((req, res) => {
  res.status(404).json({
    data: null,
    message: `Endpoint não encontrado: ${req.method} ${req.path}`,
    error: 'Not found',
  });
});

// ─── Middleware global de erros (deve ser o último) ────────
app.use(errorHandler);

export default app;
