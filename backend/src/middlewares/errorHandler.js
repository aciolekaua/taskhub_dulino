// Middleware global de tratamento de erros

/**
 * Captura erros lançados pelos controllers e retorna resposta padronizada
 * Deve ser registrado como último middleware no app.js
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${new Date().toISOString()} — ${err.message}`);
  console.error(err.stack);

  // Erros do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      data: null,
      message: 'Registro já existe com esses dados únicos',
      error: 'Conflito de dados duplicados',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      data: null,
      message: 'Registro não encontrado',
      error: 'Not found',
    });
  }

  // Erros de validação de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      data: null,
      message: 'JSON inválido no corpo da requisição',
      error: 'Parse error',
    });
  }

  // Erro genérico — não expor detalhes internos em produção
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  return res.status(statusCode).json({
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : message,
  });
}
