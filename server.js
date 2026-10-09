const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./database/connection');
const { startScheduler } = require('./services/scheduler');
const postsRoutes = require('./routes/posts');
const systemRoutes = require('./routes/system');
const accountsRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');
const groupsRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Desabilitar cache em ambiente de desenvolvimento para atualização instantânea
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Servir arquivos estáticos (Frontend e Uploads)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/accounts', accountsRoutes);

// Rota fallback para o index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização
async function startServer() {
  console.log('🚀 Inicializando Social Publisher...');
  
  // Inicializar banco de dados MySQL
  await initDB();

  // Iniciar agendador de tarefas
  startScheduler();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ Servidor rodando com sucesso!`);
    console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

startServer();
