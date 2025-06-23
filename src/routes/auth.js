const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Registrar um novo usuário e empresa
// @access  Public
router.post('/auth/register', authController.register);

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/auth/login', authController.login);

// @route   GET api/auth/me
// @desc    Obter dados do usuário logado
// @access  Private
router.get('/auth/me', authenticate, authController.getMe);

// @route   POST api/auth/logout
// @desc    Fazer logout do usuário
// @access  Private
router.post('/auth/logout', authenticate, authController.logout);

// @route   POST api/auth/refresh-token
// @desc    Obter um novo token de acesso
// @access  Public
router.post('/auth/refresh-token', authController.refreshToken);


module.exports = router; 