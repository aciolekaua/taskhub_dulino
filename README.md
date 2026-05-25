# TaskHub 🗂️

> Aplicação fullstack de gerenciamento de tarefas com autenticação JWT, API RESTful e testes unitários.

**Desafio Técnico Dulino** — Desenvolvido com Node.js, Express, Prisma, React e Tailwind CSS.

---

## ✨ Funcionalidades

- **Autenticação JWT** — Cadastro e login com token de 7 dias com diferenciação de cargos (`USER` e `ADMIN`)
- **Painel Administrativo (Exclusivo ADMIN)** — Visualização gráfica e em tempo real de todos os usuários do sistema diretamente no frontend (buscado do MongoDB Atlas)
- **CRUD completo de tarefas** — Criar, listar, editar, marcar como concluída e deletar
- **Filtros e busca** — Filtre por status (todas/pendentes/concluídas) e busque por título
- **Barra de progresso** — Acompanhe o % de tarefas concluídas no dia
- **Widget de clima** — Temperatura e condições em tempo real (OpenWeather API)
- **Tema claro/escuro** — Toggle com persistência no localStorage
- **Design premium** — Glassmorphism, gradientes, animações suaves
- **Testes** — 54 testes backend (Jest + Supertest) e 20 testes de componentes (Vitest + RTL)

---

## 🛠️ Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js, Express, Prisma ORM, MongoDB (Atlas/Local) |
| **Autenticação** | JWT (jsonwebtoken), bcryptjs |
| **Testes Backend** | Jest, Supertest |
| **Frontend** | React 18, Vite, Tailwind CSS v3 |
| **Estado** | Context API, hooks customizados |
| **HTTP Client** | Axios (com interceptors JWT) |
| **Roteamento** | React Router DOM v6 |
| **Testes Frontend** | Vitest, Testing Library |

---

## 📁 Estrutura do Projeto

```
taskhub/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js    ← Register, Login
│   │   │   └── taskController.js   ← CRUD de tarefas
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── task.routes.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    ← Verifica JWT
│   │   │   └── errorHandler.js     ← Tratamento global de erros
│   │   ├── services/
│   │   │   ├── authService.js      ← Lógica de autenticação
│   │   │   └── taskService.js      ← Lógica de tarefas
│   │   └── utils/
│   │       ├── validators.js        ← Validações reutilizáveis
│   │       └── helpers.js           ← JWT, bcrypt, respostas
│   ├── tests/
│   │   ├── utils.test.js           ← Testes unitários dos utils
│   │   ├── auth.test.js            ← Testes de integração auth
│   │   └── tasks.test.js           ← Testes de integração tasks
│   ├── prisma/
│   │   └── schema.prisma
│   ├── app.js                      ← Express app (sem listen)
│   ├── server.js                   ← Entry point HTTP
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           ← Barra de navegação
    │   │   ├── TaskItem.jsx         ← Card de tarefa
    │   │   ├── TaskForm.jsx         ← Modal criar/editar
    │   │   ├── TaskList.jsx         ← Lista com skeleton/vazio
    │   │   └── WeatherWidget.jsx    ← Widget de clima
    │   ├── pages/
    │   │   ├── LoginPage.jsx        ← Login + Cadastro (toggle)
    │   │   └── DashboardPage.jsx    ← Dashboard principal
    │   ├── context/
    │   │   └── AuthContext.jsx      ← Estado global de auth
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useTasks.js          ← CRUD + filtros + stats
    │   └── services/
    │       ├── api.js               ← Axios configurado
    │       └── authService.js       ← Chamadas de auth
    └── tests/
        ├── TaskItem.test.jsx
        └── TaskForm.test.jsx
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js v18+ 
- npm v8+

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd desafio-tecnico-dulino
```

### 2. Configure o Backend

```bash
cd taskhub/backend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env e defina JWT_SECRET e DATABASE_URL (MongoDB Connection String)
# Por padrão, já está configurada a cluster MongoDB Atlas fornecida no desafio!

# Execute o sincronismo do esquema de coleções e índices com o MongoDB Atlas
npm run db:push

# (Opcional) Popule o banco de desenvolvimento com o usuário administrador padrão
node seed-admin.js

# Inicie o servidor de desenvolvimento
npm run dev
```

> API disponível em `http://localhost:3001`

### 3. Configure o Frontend

```bash
cd taskhub/frontend

# Instale dependências
npm install

# Configure variáveis de ambiente (já incluído no .env)
# VITE_API_URL=http://localhost:3001
# VITE_OPENWEATHER_KEY=sua_chave_aqui

# Inicie o servidor de desenvolvimento
npm run dev
```

> Frontend disponível em `http://localhost:5173`

---

## 🔌 Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/auth/register` | Cria novo usuário | ❌ |
| `POST` | `/auth/login` | Autentica e retorna JWT | ❌ |

**POST /auth/register**
```json
// Request
{ "name": "João Silva", "email": "joao@email.com", "password": "123456" }

// Response 201
{ "data": { "user": {...}, "token": "eyJ..." }, "message": "Usuário criado com sucesso", "error": null }
```

**POST /auth/login**
```json
// Request
{ "email": "joao@email.com", "password": "123456" }

// Response 200
{ "data": { "user": {...}, "token": "eyJ..." }, "message": "Login realizado com sucesso", "error": null }
```

### Tarefas (todas requerem `Authorization: Bearer <token>`)

| Método | Endpoint | Descrição | Query Params |
|--------|----------|-----------|--------------|
| `GET` | `/tasks` | Lista tarefas do usuário | `?status=done\|pending&q=busca` |
| `GET` | `/tasks/:id` | Retorna tarefa específica | — |
| `POST` | `/tasks` | Cria nova tarefa | — |
| `PUT` | `/tasks/:id` | Atualiza tarefa | — |
| `DELETE` | `/tasks/:id` | Remove tarefa | — |

**POST /tasks**
```json
// Request
{ "title": "Estudar React", "description": "Aprender hooks" }

// Response 201
{ "data": { "id": 1, "userId": 1, "title": "Estudar React", "done": false, ... }, "message": "Tarefa criada com sucesso", "error": null }
```

**PUT /tasks/:id**
```json
// Request
{ "title": "Novo título", "done": true }

// Response 200
{ "data": { "id": 1, "done": true, ... }, "message": "Tarefa atualizada com sucesso", "error": null }
```

### Códigos de Resposta

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Dados inválidos / campo faltando |
| `401` | Não autenticado / token inválido |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |

---

## 🧪 Executando os Testes

### Backend (Jest + Supertest)
```bash
cd taskhub/backend
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --forceExit --verbose
```

**Cobertura dos testes:**
- `utils.test.js` — 20 testes unitários (validators + helpers)
- `auth.test.js` — 9 testes de integração (register + login)
- `tasks.test.js` — 14 testes de integração (CRUD + isolamento)
- **Total: 43 testes ✅**

### Frontend (Vitest + Testing Library)
```bash
cd taskhub/frontend
npm test
```

---

## 🔐 Variáveis de Ambiente

### Backend (`taskhub/backend/.env`)
```env
DATABASE_URL="mongodb+srv://<usuario>:<senha>@<seu-cluster>.mongodb.net/taskhub_dev?retryWrites=true&w=majority"
JWT_SECRET="seu_segredo_super_secreto_jwt"
PORT=3001
NODE_ENV=development
```

### Frontend (`taskhub/frontend/.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_OPENWEATHER_KEY=sua_chave_openweather
```

---

## 📋 Modelos de Dados (MongoDB)

### User
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String   // hash bcrypt
  createdAt DateTime @default(now())
  role      String   @default("USER")
  tasks     Task[]
}
```

### Task
```prisma
model Task {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  title       String
  description String?
  done        Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🎨 Design

O frontend foi construído com foco em **experiência premium**:

- **Glassmorphism** — Cards com blur e transparência
- **Dark mode por padrão** — Paleta deep navy (#0f0f1a)
- **Gradientes** — Indigo (#6366f1) → Violet (#8b5cf6)
- **Micro-animações** — Fade-in, slide-up, scale-in
- **Checkbox animado** — Transição com pulse-glow ao marcar
- **Skeleton loaders** — Estado de carregamento elegante
- **Responsive** — Mobile-first com sidebar em desktop

---

## 🔧 Scripts Disponíveis

### Backend
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor com hot-reload (nodemon) |
| `npm start` | Inicia servidor em produção |
| `npm test` | Executa suite de testes |
| `npm run db:push` | Sincroniza esquema e índices no MongoDB |
| `npm run db:studio` | Abre Prisma Studio (GUI do banco) |

### Frontend
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor Vite com HMR |
| `npm run build` | Gera bundle de produção |
| `npm test` | Executa testes Vitest |
| `npm run test:coverage` | Testes com relatório de cobertura |

---

## 🧠 Respostas às Perguntas Conceituais

Durante a implementação do TaskHub, além dos requisitos mínimos e bônus exigidos, adotamos práticas arquiteturais de nível de produção. Abaixo estão as respostas técnicas fundamentadas às principais questões conceituais de desenvolvimento Fullstack:

### 1. Autenticação baseada em Tokens JWT vs. Sessões Tradicionais
*   **Sessões Tradicionais (Stateful):** O servidor gera uma sessão, armazena-a na memória ou banco de dados (ex: Redis) e envia um ID de sessão em um cookie para o cliente. Cada requisição do cliente exige que o servidor consulte a sessão no banco para validar o usuário.
    *   *Desvantagem:* Dificulta a escalabilidade horizontal, pois as requisições subsequentes de um mesmo cliente devem ir para o mesmo servidor (sticky sessions) ou consultar uma base de dados compartilhada, gerando latência e gargalos.
*   **Tokens JWT (Stateless):** O servidor gera um token assinado criptograficamente contendo as informações necessárias (ex: `userId`, `email`, `role`) e envia para o cliente. O cliente armazena o token e o envia no cabeçalho `Authorization: Bearer <token>`. O servidor apenas valida a assinatura criptográfica do token usando a chave secreta (`JWT_SECRET`) sem precisar consultar nenhuma tabela ou banco de dados.
    *   *Vantagem:* Altamente escalável. Qualquer instância da API pode validar de forma independente e instantânea o token, permitindo balanceamento de carga livre de estado.

### 2. Escalabilidade Horizontal vs. Escalabilidade Vertical
*   **Escalabilidade Vertical (Scaling Up):** Consiste em adicionar mais recursos de hardware (CPU, Memória RAM, Armazenamento) à máquina servidor existente.
    *   *Limitação:* Há um teto físico e financeiro (hardware de alta performance fica exponencialmente mais caro) e cria um ponto único de falha (Single Point of Failure).
*   **Escalabilidade Horizontal (Scaling Out):** Consiste em adicionar mais instâncias de servidores rodando a mesma aplicação atrás de um balanceador de carga.
    *   *Como aplicamos no TaskHub:*
        1.  **Stateful para Stateless:** Como a autenticação JWT é stateless, qualquer nova instância de API pode processar a requisição de qualquer usuário imediatamente.
        2.  **Processos com PM2 Cluster:** Adicionamos um arquivo de configuração `ecosystem.config.cjs` para permitir executar a API em modo cluster (`pm2 start server.js -i max`), distribuindo requisições round-robin entre múltiplos processos locais e utilizando todos os núcleos da CPU.
        3.  **Banco de Dados:** SQLite é excelente para testes e projetos pequenos, mas por travar arquivos em escritas concorrentes, para escala horizontal basta alterar a string de conexão no `.env` (`DATABASE_URL`) para apontar para um banco PostgreSQL ou MySQL de alta disponibilidade; o Prisma cuidará do restante sem alterar nenhuma linha de código de negócio.

### 3. O Padrão Repository (Repository Pattern) na Arquitetura Backend
*   **O que é:** Uma camada de abstração entre a lógica de negócios (`services`) e a camada de acesso a dados (banco de dados/Prisma). Em vez dos services chamarem o Prisma Client diretamente, eles interagem com interfaces simples (`userRepository`, `taskRepository`).
*   **Benefícios no Projeto:**
    *   **Isolamento de Banco:** Se precisarmos trocar o Prisma ORM por outro (como TypeORM, Sequelize ou Mongoose), ou trocar SQLite por MongoDB, alteramos apenas os arquivos na pasta `infrastructure/repositories/`, sem tocar em nenhuma regra de negócio dos `services` ou nos controladores da camada HTTP.
    *   **Testabilidade:** Permite criar mocks extremamente fáceis dos repositórios em testes unitários puros, testando a lógica dos `services` sem necessitar de conexões ativas com o banco de dados.
    *   **DDD (Domain-Driven Design) Light:** Mantém a separação de responsabilidades limpa e bem organizada, propiciando clean code e maior facilidade de manutenção a longo prazo.

### 4. Boas Práticas de Segurança em APIs RESTful
No TaskHub, adicionamos as seguintes defesas ativas:
*   **Helmet:** Adiciona automaticamente 11 cabeçalhos de segurança HTTP essenciais (como `Content-Security-Policy` para evitar ataques de injeção e `X-Frame-Options` para evitar Clickjacking).
*   **Express Rate Limit:** Protege contra ataques de Força Bruta (Brute-Force) em endpoints críticos (como login e cadastro limitados a 20 tentativas por 15 minutos) e mitiga ataques de DoS (Denial of Service) por meio de um limite global de requisições.
*   **Compressão Gzip:** Utiliza o middleware `compression` para comprimir as respostas HTTP em tempo de execução, reduzindo a largura de banda utilizada e acelerando a experiência em conexões lentas de dados móveis.
*   **CORS Restrito:** Configuração explícita das origens e métodos permitidos, evitando que scripts maliciosos façam requisições em nome do usuário a partir de sites não autorizados.
*   **Hasheamento de Senhas:** Senhas salvas de forma irreversível utilizando `bcryptjs` com custo computacional (salt rounds) otimizado contra dicionários de senhas e Rainbow Tables.

### 5. Autorização e Controle de Acesso por Roles (RBAC)
*   **Implementação:** Adicionamos o campo `role` (padrão `USER`, alternável para `ADMIN`) no modelo do usuário. 
*   **Middleware requireRole:** Criamos uma camada que intercepta rotas privadas e valida o nível de acesso contido no payload decodificado do JWT do usuário.
*   **Rota Protegida v1 Admin:** Adicionamos a rota `/api/v1/admin/users`, exclusiva para administradores, para exemplificar como sistemas de auditoria e listagem administrativa podem ser criados de forma segura sem vazar dados a usuários normais.

---

*Desenvolvido como parte do Desafio Técnico Dulino — 2026*
