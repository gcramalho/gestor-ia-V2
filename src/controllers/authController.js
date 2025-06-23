const { createClient } = require('@supabase/supabase-js');
const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const response = require('../utils/responseHelper');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar tokens
const generateTokens = (userId, userRole, empresaId) => {
    const accessToken = jwt.sign(
        { id: userId, papel: userRole, empresa_id: empresaId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: userId, papel: userRole, empresa_id: empresaId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

// Registrar um novo usuário e empresa
exports.register = async (req, res) => {
    const { nomeEmpresa, emailEmpresa, telefoneEmpresa, nomeUsuario, emailUsuario, senha } = req.body;
    const supabase = req.app.get('supabase');

    try {
        // Criar o usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailUsuario,
            password: senha,
        });

        if (authError) {
            return response.badRequest(res, `Erro no Supabase: ${authError.message}`);
        }
        if (!authData.user) {
            return response.badRequest(res, 'Não foi possível criar o usuário no Supabase.');
        }

        const supabase_user_id = authData.user.id;

        // Criar a empresa no MongoDB
        const novaEmpresa = new Empresa({
            nome: nomeEmpresa,
            email: emailEmpresa,
            telefone: telefoneEmpresa,
        });
        await novaEmpresa.save();

        // Criar o usuário no MongoDB
        const novoUsuario = new Usuario({
            empresa_id: novaEmpresa._id,
            nome: nomeUsuario,
            email: emailUsuario,
            supabase_user_id: supabase_user_id,
            papel: 'admin_empresa', // O primeiro usuário é o admin da empresa
        });
        await novoUsuario.save();

        response.created(res, { 
            message: 'Empresa e usuário registrados com sucesso! Verifique seu e-mail para confirmação.',
            empresa: novaEmpresa,
            usuario: novoUsuario 
        });

    } catch (error) {
        // Se algo der errado
        if (supabase_user_id) {
            await supabase.auth.admin.deleteUser(supabase_user_id);
        }
        response.serverError(res, error);
    }
};

// Fazer login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const supabase = req.app.get('supabase');

    try {
        // Autenticar no Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return response.unauthorized(res, `Credenciais inválidas: ${authError.message}`);
        }

        // Encontrar o usuário no MongoDB
        const usuario = await Usuario.findOne({ email: authData.user.email });
        if (!usuario || usuario.status === 'inativo') {
            return response.unauthorized(res, 'Usuário não encontrado ou inativo.');
        }

        //  Gerar Tokens
        const { accessToken, refreshToken } = generateTokens(usuario._id, usuario.papel, usuario.empresa_id);
        
        // Atualizar último acesso
        usuario.ultimo_acesso = new Date();
        await usuario.save();

        response.success(res, { accessToken, refreshToken });

    } catch (error) {
        response.serverError(res, error);
    }
};

// Obter dados do usuário logado
exports.getMe = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).select('-__v');
        if (!usuario) {
            return response.notFound(res, 'Usuário não encontrado.');
        }
        response.success(res, usuario);
    } catch (error) {
        response.serverError(res, error);
    }
};

// Fazer logout
exports.logout = async (req, res) => {
    const supabase = req.app.get('supabase');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return response.badRequest(res, `Erro no logout do Supabase: ${error.message}`);
        }
        response.success(res, { message: 'Logout realizado com sucesso.' });
    } catch (error) {
        response.serverError(res, error);
    }
};

// Gerar novo access token a partir do refresh token
exports.refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return response.badRequest(res, 'Refresh token é obrigatório.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const { accessToken, refreshToken } = generateTokens(decoded.id, decoded.papel, decoded.empresa_id);
        response.success(res, { accessToken, refreshToken });
    } catch (error) {
        return response.unauthorized(res, 'Refresh token inválido ou expirado.');
    }
}; 