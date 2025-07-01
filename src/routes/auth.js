const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Registrar um novo usuário e empresa
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/refresh
// @desc    Renovar access token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   GET api/auth/me
// @desc    Obter dados do usuário logado
// @access  Private
router.get('/me', authenticate, authController.getMe);

// @route   POST api/auth/logout
// @desc    Fazer logout
// @access  Private
router.post('/logout', authenticate, authController.logout);

// @route   POST api/auth/alterar-senha
// @desc    Alterar senha do usuário
// @access  Private
router.post('/alterar-senha', authenticate, authController.alterarSenha);

// @route   GET api/auth/test
// @desc    Testar conectividade do backend
// @access  Public
router.get('/test', authController.test);

module.exports = router; 