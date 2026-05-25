// Entry point do servidor — importa o app e inicia o listener HTTP

import app from './app.js';
import { config } from './src/config/index.js';

app.listen(config.port, () => {
  console.log(`🚀 TaskHub API rodando em http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/health`);
  console.log(`🔑 Ambiente: ${config.nodeEnv}`);
});
