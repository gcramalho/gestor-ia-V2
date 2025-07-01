const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

// Controllers da Empresa
const agenteEmpresaController = require('../controllers/empresa/agenteEmpresaController');
const usuarioEmpresaController = require('../controllers/empresa/usuarioEmpresaController');
const dashboardController = require('../controllers/empresa/dashboardController');
const empresaConfigController = require('../controllers/empresa/empresaConfigController');

// --- Middleware de debug para todas as rotas de empresa ---
router.use((req, res, next) => {
    console.log('🏢 Rota de empresa chamada:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        user: req.user ? { id: req.user.id, papel: req.user.papel } : 'null'
    });
    next();
});

// --- Middleware de autenticação para todas as rotas de empresa ---
router.use(authenticate);

// --- ROTAS PARA TODOS OS USUÁRIOS CADASTRADOS ---
// (admin_master, admin_empresa, user_empresa)

// Agentes (CRUD completo para todos os usuários autenticados da empresa)
router.get('/agentes', (req, res, next) => {
    console.log('🔍 Rota GET /agentes chamada');
    next();
}, agenteEmpresaController.listarAgentes);

router.get('/agentes/:id', (req, res, next) => {
    console.log('🔍 Rota GET /agentes/:id chamada');
    next();
}, agenteEmpresaController.obterAgente);

router.post('/agentes', (req, res, next) => {
    console.log('🔍 Rota POST /agentes chamada');
    next();
}, agenteEmpresaController.criarAgente);

router.put('/agentes/:id', (req, res, next) => {
    console.log('🔍 Rota PUT /agentes/:id chamada');
    next();
}, agenteEmpresaController.atualizarAgente);

router.delete('/agentes/:id', (req, res, next) => {
    console.log('🔍 Rota DELETE /agentes/:id chamada');
    next();
}, agenteEmpresaController.deletarAgente);

router.post('/agentes/:id/regenerate-key', (req, res, next) => {
    console.log('🔍 Rota POST /agentes/:id/regenerate-key chamada');
    next();
}, agenteEmpresaController.regenerarApiKey);

// Dashboard
router.get('/dashboard', dashboardController.obterResumo);

// Usuário (pode atualizar o próprio perfil)
router.put('/perfil', usuarioEmpresaController.atualizarPerfil);

// Configurações da Empresa
router.get('/config', empresaConfigController.obterDados);
router.put('/config', empresaConfigController.atualizarDados);

// Gestão de Usuários da Empresa (apenas admin da empresa)
// Se quiser restringir, pode usar authorize(['admin_empresa']) aqui:
// const { authorize } = require('../middlewares/auth');
// router.get('/usuarios', authorize(['admin_empresa']), usuarioEmpresaController.listarUsuarios);
router.get('/usuarios', usuarioEmpresaController.listarUsuarios);
router.put('/usuarios/:id', usuarioEmpresaController.atualizarUsuario);
router.delete('/usuarios/:id', usuarioEmpresaController.deletarUsuario);

module.exports = router;
