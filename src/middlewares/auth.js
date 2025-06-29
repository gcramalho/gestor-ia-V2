const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Agente = require('../models/Agente');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Middleware para verificar se o usuário está autenticado via JWT
 * e se ele existe e está ativo no banco de dados.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ResponseHelper.unauthorized(res, 'Acesso negado. Nenhum token fornecido.');
        }
        const token = authHeader.substring(7);

        // Verificar e decodificar o token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar o usuário no MongoDB
        const usuario = await Usuario.findById(decoded.id).populate('empresa_id');
        if (!usuario || usuario.status === 'inativo') {
            return ResponseHelper.unauthorized(res, 'Usuário não encontrado ou inativo no sistema.');
        }

        // Verificar se a senha foi alterada após o token ser emitido
        if (usuario.senhaAlteradaApos(decoded.iat)) {
            return ResponseHelper.unauthorized(res, 'Usuário alterou a senha recentemente. Faça login novamente.');
        }

        // Verificar se a empresa do usuário está ativa (a menos que seja admin_master)
        if (usuario.papel !== 'admin_master' && usuario.empresa_id && usuario.empresa_id.status !== 'ativo') {
            return ResponseHelper.forbidden(res, 'A empresa deste usuário está inativa.');
        }

        // Atualizar o último acesso do usuário
        await Usuario.findByIdAndUpdate(usuario._id, { ultimo_acesso: new Date() });

        // Anexar os dados essenciais do usuário à requisição
        req.user = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            papel: usuario.papel,
            empresa_id: usuario.empresa_id?._id,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return ResponseHelper.unauthorized(res, 'Token inválido.');
        }
        if (error.name === 'TokenExpiredError') {
            return ResponseHelper.unauthorized(res, 'Token expirado. Faça login novamente.');
        }
        ResponseHelper.serverError(res, error, 'Erro no middleware de autenticação.');
    }
};

/**
 * Middleware para autorizar o acesso com base nos papéis (roles) do usuário.
 * @param {string[]} roles - Array de papéis que têm permissão.
 */
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.papel)) {
            return ResponseHelper.forbidden(res, 'Acesso negado: Você não tem permissão para executar esta ação.');
        }
        next();
    };
};

/**
 * Middleware para autenticar requisições de API externas usando uma API Key de Agente.
 */
const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            return ResponseHelper.unauthorized(res, 'Acesso negado. Nenhuma chave de API fornecida.');
        }

        // Procura por um agente ativo que tenha a API Key correspondente
        const agente = await Agente.findOne({ api_key: apiKey, status: true });
        if (!agente) {
            return ResponseHelper.unauthorized(res, 'Chave de API inválida ou agente inativo.');
        }

        // Anexa os dados do agente à requisição
        req.agente = agente;
        next();
    } catch (error) {
        ResponseHelper.serverError(res, error, 'Erro na autenticação por API Key.');
    }
};

module.exports = {
    authenticate,
    authorize,
    authenticateApiKey
};