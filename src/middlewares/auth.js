const { createClient } = require('@supabase/supabase-js');
const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Agente = require('../models/Agente');
const response = require('../utils/responseHelper');

// Só inicializa o Supabase se as variáveis estiverem definidas
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
}

/**
 * Middleware para verificar se o usuário está autenticado via token do Supabase
 * e se ele existe e está ativo no banco de dados local.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.unauthorized(res, 'Acesso negado. Nenhum token fornecido.');
        }
        const token = authHeader.substring(7);

        // Verifica se o Supabase está configurado
        if (!supabase) {
            return response.serverError(res, 'Serviço de autenticação não configurado.');
        }

        // Verifica o token com o Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return response.unauthorized(res, 'Token inválido ou expirado.');
        }

        // Busca o usuário correspondente no MongoDB
        const usuarioMongo = await Usuario.findOne({ supabase_user_id: user.id, status: 'ativo' }).populate('empresa_id');
        if (!usuarioMongo) {
            return response.unauthorized(res, 'Usuário não encontrado ou inativo no sistema.');
        }

        // Verifica se a empresa do usuário está ativa (a menos que seja admin_master)
        if (usuarioMongo.papel !== 'admin_master' && usuarioMongo.empresa_id && usuarioMongo.empresa_id.status !== 'ativo') {
            return response.forbidden(res, 'A empresa deste usuário está inativa.');
        }

        // Atualiza o último acesso do usuário
        await Usuario.findByIdAndUpdate(usuarioMongo._id, { ultimo_acesso: new Date() });

        // Anexa os dados essenciais do usuário à requisição para uso nos próximos middlewares/controllers
        req.user = {
            id: usuarioMongo._id,
            supabase_id: user.id,
            nome: usuarioMongo.nome,
            email: usuarioMongo.email,
            papel: usuarioMongo.papel,
            empresa_id: usuarioMongo.empresa_id?._id,
        };

        next();
    } catch (error) {
        response.serverError(res, error, 'Erro no middleware de autenticação.');
    }
};

/**
 * Middleware para autorizar o acesso com base nos papéis (roles) do usuário.
 * @param {string[]} roles - Array de papéis que têm permissão.
 */
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.papel)) {
            return response.forbidden(res, 'Acesso negado: Você não tem permissão para executar esta ação.');
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
            return response.unauthorized(res, 'Acesso negado. Nenhuma chave de API fornecida.');
        }

        // Procura por um agente ativo que tenha a API Key correspondente
        const agente = await Agente.findOne({ api_key: apiKey, status: true });
        if (!agente) {
            return response.unauthorized(res, 'Chave de API inválida ou agente inativo.');
        }

        // Anexa os dados do agente à requisição
        req.agente = agente;
        next();
    } catch (error) {
        response.serverError(res, error, 'Erro na autenticação por API Key.');
    }
};

module.exports = {
    authenticate,
    authorize,
    authenticateApiKey
};