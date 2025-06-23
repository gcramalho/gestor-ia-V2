const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middlewares/auth');
const apiController = require('../controllers/apiController');

// Middleware para autenticar todas as requisições com API Key
router.use(authenticateApiKey);

// @route   POST /api/v1/conversations
// @desc    Iniciar uma nova conversa ou enviar mensagem para uma conversa existente
// @access  Private (API Key)
router.post('/v1/conversations', apiController.handleMessage);

// @route   GET /api/v1/conversations/:id
// @desc    Obter o histórico de uma conversa
// @access  Private (API Key)
router.get('/v1/conversations/:id', apiController.getConversationById);

module.exports = router; 