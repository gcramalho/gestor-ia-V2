const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');

// Controllers da Empresa
const agenteEmpresaController = require('../controllers/empresa/agenteEmpresaController');
const usuarioEmpresaController = require('../controllers/empresa/usuarioEmpresaController');
const dashboardController = require('../controllers/empresa/dashboardController');
const empresaConfigController = require('../controllers/empresa/empresaConfigController');

// --- Middleware de autenticação para todas as rotas de empresa ---
router.use(authenticate);

// --- ROTAS PARA ADMIN DA EMPRESA E USUÁRIOS COMUNS ---
// (user_empresa, admin_empresa)

// Agentes (Apenas leitura para usuários comuns)
router.get('/empresa/agentes', authorize(['admin_empresa', 'user_empresa']), agenteEmpresaController.listarAgentes);
router.get('/empresa/agentes/:id', authorize(['admin_empresa', 'user_empresa']), agenteEmpresaController.obterAgente);

// Dashboard
router.get('/empresa/dashboard', authorize(['admin_empresa', 'user_empresa']), dashboardController.obterResumo);

// Usuário (pode atualizar o próprio perfil)
router.put('/empresa/perfil', authorize(['admin_empresa', 'user_empresa']), usuarioEmpresaController.atualizarPerfil);


// --- ROTAS APENAS PARA ADMIN DA EMPRESA ---
// (admin_empresa)

// Gestão de Agentes (CRUD completo)
router.post('/empresa/agentes', authorize(['admin_empresa']), agenteEmpresaController.criarAgente);
router.put('/empresa/agentes/:id', authorize(['admin_empresa']), agenteEmpresaController.atualizarAgente);
router.delete('/empresa/agentes/:id', authorize(['admin_empresa']), agenteEmpresaController.deletarAgente);
router.post('/empresa/agentes/:id/regenerate-key', authorize(['admin_empresa']), agenteEmpresaController.regenerarApiKey);

// Gestão de Usuários da Empresa (o admin da empresa não pode criar, apenas o admin_master)
router.get('/empresa/usuarios', authorize(['admin_empresa']), usuarioEmpresaController.listarUsuarios);
router.put('/empresa/usuarios/:id', authorize(['admin_empresa']), usuarioEmpresaController.atualizarUsuario);
router.delete('/empresa/usuarios/:id', authorize(['admin_empresa']), usuarioEmpresaController.deletarUsuario);

// Configurações da Empresa
router.get('/empresa/config', authorize(['admin_empresa']), empresaConfigController.obterDados);
router.put('/empresa/config', authorize(['admin_empresa']), empresaConfigController.atualizarDados);

module.exports = router;
