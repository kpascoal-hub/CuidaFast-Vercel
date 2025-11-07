// Vercel Serverless Function Handler
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');

const authRoutes = require('../back-end/api/routes/authRoutes');
const cadastroRoutes = require('../back-end/api/routes/cadastroRoutes');
const perfilRoutes = require('../back-end/api/routes/perfilRoutes');
const pagamentoRoutes = require('../back-end/api/routes/pagamentoRoutes');
const clienteRoutes = require('../back-end/api/routes/clienteRoutes');
const mensagemRoutes = require('../back-end/api/routes/mensagensRoutes');
const notificationRoutes = require('../back-end/api/routes/notificationRoutes');
const tokenRoutes = require('../back-end/api/routes/tokenRoutes');

const app = express();

moment.tz.setDefault('America/Sao_Paulo');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/cadastro', cadastroRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/pagamento', pagamentoRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/notificacoes', notificationRoutes);
app.use('/api/tokens', tokenRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/teste', (req, res) => res.json({ ok: true, mensagem: 'API funcionando corretamente!' }));

// Rota raiz da API
app.get('/api', (req, res) => res.json({ 
  status: 'online', 
  message: 'CuidaFast API',
  version: '1.0.0'
}));

module.exports = app;
