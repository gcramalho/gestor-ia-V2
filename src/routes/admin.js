const express = require('express');
const router = express.Router();

const agenteAdminController = require('../controllers/admin/agenteAdminController');
const empresaAdminController = require('../controllers/admin/empresaAdminController');
const usuarioAdminController = require('../controllers/admin/usuarioAdminController');
const { authenticate, authorize } = require('../middlewares/auth');

// Garante que apenas 'admin_master' acesse essas rotas
router.use(authenticate, authorize(['admin_master']));

// Rotas de Gestão de Empresas
router.post('/empresas', empresaAdminController.criarEmpresa);
router.get('/empresas', empresaAdminController.listarEmpresas);
router.get('/empresas/:id', empresaAdminController.obterEmpresa);
router.put('/empresas/:id', empresaAdminController.atualizarEmpresa);
router.delete('/empresas/:id', empresaAdminController.deletarEmpresa);

// Rotas de Gestão de Usuários
router.post('/usuarios', usuarioAdminController.criarUsuario);
router.get('/usuarios', usuarioAdminController.listarUsuarios);

// Ainda não há rota para obter usuário por ID nesse controller, mas pode ser adicionado  
// router.get('/usuarios/:id', usuarioAdminController.obterUsuario);

router.put('/usuarios/:id', usuarioAdminController.atualizarUsuario);
router.delete('/usuarios/:id', usuarioAdminController.deletarUsuario);

// Rotas de Gestão de Agentes
router.get('/agentes', agenteAdminController.listarAgentes);
router.get('/agentes/:id', agenteAdminController.obterAgente);
router.delete('/agentes/:id', agenteAdminController.deletarAgente);

module.exports = router; 