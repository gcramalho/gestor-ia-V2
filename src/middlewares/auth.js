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
        console.log('🔍 Auth header:', authHeader ? 'presente' : 'ausente');
        console.log('🔍 Auth header completo:', authHeader);
        console.log('🔍 Request path:', req.path);
        console.log('🔍 Request method:', req.method);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Header de autorização inválido:', authHeader);
            return ResponseHelper.unauthorized(res, 'Acesso negado. Nenhum token fornecido.');
        }
        const token = authHeader.substring(7);
        console.log('🔑 Token extraído:', token ? 'presente' : 'ausente', 'length:', token?.length);

        // Verificar e decodificar o token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔓 Token decodificado:', { id: decoded.id, papel: decoded.papel, empresa_id: decoded.empresa_id });

        // Buscar o usuário no MongoDB
        const usuario = await Usuario.findById(decoded.id).populate('empresa_id');
        console.log('👤 Usuário encontrado:', { 
            encontrado: !!usuario, 
            id: usuario?._id, 
            papel: usuario?.papel,
            empresa_id: usuario?.empresa_id?._id,
            empresa_status: usuario?.empresa_id?.status
        });
        
        if (!usuario || usuario.status === 'inativo') {
            console.log('❌ Usuário não encontrado ou inativo:', { 
                usuario_existe: !!usuario, 
                status: usuario?.status 
            });
            return ResponseHelper.unauthorized(res, 'Usuário não encontrado ou inativo no sistema.');
        }

        // Verificar se a empresa do usuário está ativa (a menos que seja admin_master)
        if (usuario.papel !== 'admin_master' && usuario.empresa_id && usuario.empresa_id.status !== 'ativo') {
            console.log('❌ Empresa inativa:', { 
                papel: usuario.papel, 
                empresa_status: usuario.empresa_id?.status,
                empresa_id: usuario.empresa_id?._id
            });
            return ResponseHelper.forbidden(res, 'A empresa deste usuário está inativa.');
        }

        // Log adicional para debug
        console.log('🔍 Verificação da empresa:', {
            papel: usuario.papel,
            temEmpresa: !!usuario.empresa_id,
            empresaStatus: usuario.empresa_id?.status,
            empresaId: usuario.empresa_id?._id,
            isAdminMaster: usuario.papel === 'admin_master'
        });

        // Verificar se a senha foi alterada após o token ser emitido
        // DESABILITADO TEMPORARIAMENTE PARA DESENVOLVIMENTO
        // try {
        //     if (usuario.senhaAlteradaApos && usuario.senhaAlteradaApos(decoded.iat)) {
        //         return ResponseHelper.unauthorized(res, 'Usuário alterou a senha recentemente. Faça login novamente.');
        //     }
        // } catch (error) {
        //     console.log('Erro na verificação de senha alterada, continuando...', error);
        // }

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

        console.log('✅ Autenticação bem-sucedida:', { 
            userId: req.user.id, 
            papel: req.user.papel, 
            empresa_id: req.user.empresa_id,
            requestPath: req.path,
            requestMethod: req.method
        });
        next();
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
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
        console.log('🔐 Middleware authorize chamado:', {
            user: req.user ? { id: req.user.id, papel: req.user.papel } : 'null',
            roles: roles,
            requestPath: req.path,
            requestMethod: req.method,
            fullUrl: req.originalUrl,
            baseUrl: req.baseUrl,
            stackTrace: new Error().stack.split('\n').slice(1, 6).join('\n') // Stack trace mais detalhado
        });
        
        if (!req.user || !roles.includes(req.user.papel)) {
            console.log('❌ Autorização negada:', {
                temUser: !!req.user,
                userPapel: req.user?.papel,
                rolesPermitidos: roles,
                requestPath: req.path
            });
            return ResponseHelper.forbidden(res, 'Acesso negado: Você não tem permissão para executar esta ação.');
        }
        
        console.log('✅ Autorização aprovada');
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