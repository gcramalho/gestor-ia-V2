const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const ResponseHelper = require('../utils/responseHelper');
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

    try {
        // Verificar se o email já existe
        const usuarioExistente = await Usuario.findOne({ email: emailUsuario });
        if (usuarioExistente) {
            return ResponseHelper.badRequest(res, 'Email já está em uso.');
        }

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
            senha: senha, // Será hasheada automaticamente pelo middleware
            papel: 'admin_empresa', // O primeiro usuário é o admin da empresa
        });
        await novoUsuario.save();

        ResponseHelper.created(res, { 
            message: 'Empresa e usuário registrados com sucesso!',
            empresa: novaEmpresa,
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                papel: novoUsuario.papel
            }
        });

    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

// Fazer login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Encontrar o usuário no MongoDB (incluindo a senha)
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario || usuario.status === 'inativo') {
            return ResponseHelper.unauthorized(res, 'Credenciais inválidas ou usuário inativo.');
        }

        // Verificar se a senha está correta
        const senhaCorreta = await usuario.compararSenha(password);
        if (!senhaCorreta) {
            return ResponseHelper.unauthorized(res, 'Credenciais inválidas.');
        }

        // Verificar se a empresa do usuário está ativa (a menos que seja admin_master)
        if (usuario.papel !== 'admin_master' && usuario.empresa_id) {
            const empresa = await Empresa.findById(usuario.empresa_id);
            if (empresa && empresa.status !== 'ativo') {
                return ResponseHelper.forbidden(res, 'A empresa deste usuário está inativa.');
            }
        }

        // Gerar Tokens
        const { accessToken, refreshToken } = generateTokens(usuario._id, usuario.papel, usuario.empresa_id);
        
        // Atualizar último acesso
        usuario.ultimo_acesso = new Date();
        await usuario.save();

        ResponseHelper.success(res, { 
            accessToken, 
            refreshToken,
            user: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
                empresa_id: usuario.empresa_id
            }
        });

    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

// Obter dados do usuário logado
exports.getMe = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id)
            .select('-__v')
            .populate('empresa_id', 'nome email telefone status');
            
        if (!usuario) {
            return ResponseHelper.notFound(res, 'Usuário não encontrado.');
        }
        ResponseHelper.success(res, usuario);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

// Fazer logout
exports.logout = async (req, res) => {
    try {
        // Em uma implementação mais robusta, você poderia invalidar o refresh token
        // Por enquanto, apenas retornamos sucesso
        ResponseHelper.success(res, { message: 'Logout realizado com sucesso.' });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

// Gerar novo access token a partir do refresh token
exports.refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return ResponseHelper.badRequest(res, 'Refresh token é obrigatório.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const { accessToken, refreshToken } = generateTokens(decoded.id, decoded.papel, decoded.empresa_id);
        ResponseHelper.success(res, { accessToken, refreshToken });
    } catch (error) {
        return ResponseHelper.unauthorized(res, 'Refresh token inválido ou expirado.');
    }
};

// Alterar senha
exports.alterarSenha = async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;

    try {
        // Buscar usuário com senha
        const usuario = await Usuario.findById(req.user.id).select('+senha');
        if (!usuario) {
            return ResponseHelper.notFound(res, 'Usuário não encontrado.');
        }

        // Verificar senha atual
        const senhaCorreta = await usuario.compararSenha(senhaAtual);
        if (!senhaCorreta) {
            return ResponseHelper.badRequest(res, 'Senha atual incorreta.');
        }

        // Atualizar senha
        usuario.senha = novaSenha; // Será hasheada automaticamente
        await usuario.save();

        ResponseHelper.success(res, { message: 'Senha alterada com sucesso.' });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
}; 