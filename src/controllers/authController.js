const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const ResponseHelper = require('../utils/responseHelper');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar tokens
const generateTokens = (userId, userRole, empresaId) => {
    const accessToken = jwt.sign(
        { id: userId, papel: userRole, empresa_id: empresaId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
        { id: userId, papel: userRole, empresa_id: empresaId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

// Teste de conectividade
exports.test = async (req, res) => {
    try {
        console.log('Teste de conectividade chamado');
        
        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            message: 'Backend funcionando corretamente!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

// Registrar um novo usuário e empresa
exports.register = async (req, res) => {
    const { nomeEmpresa, emailEmpresa, telefoneEmpresa, cnpjEmpresa, nomeUsuario, emailUsuario, senha } = req.body;

    try {
        console.log('Dados recebidos:', req.body); // Log para debug
        console.log('Campos obrigatórios:', { nomeEmpresa, emailEmpresa, telefoneEmpresa, nomeUsuario, emailUsuario, senha }); // Log para debug

        // Validações básicas
        if (!nomeEmpresa || !emailEmpresa || !telefoneEmpresa || !nomeUsuario || !emailUsuario || !senha) {
            console.log('Campos faltando:', { 
                nomeEmpresa: !!nomeEmpresa, 
                emailEmpresa: !!emailEmpresa, 
                telefoneEmpresa: !!telefoneEmpresa, 
                nomeUsuario: !!nomeUsuario, 
                emailUsuario: !!emailUsuario, 
                senha: !!senha 
            }); // Log para debug
            return ResponseHelper.badRequest(res, 'Todos os campos são obrigatórios.');
        }

        // Verificar se o email já existe
        const usuarioExistente = await Usuario.findOne({ email: emailUsuario });
        if (usuarioExistente) {
            return ResponseHelper.badRequest(res, 'Email já está em uso.');
        }

        // Verificar se o email da empresa já existe
        const empresaExistente = await Empresa.findOne({ email: emailEmpresa });
        if (empresaExistente) {
            return ResponseHelper.badRequest(res, 'Email da empresa já está em uso.');
        }

        // Criar a empresa no MongoDB
        const novaEmpresa = new Empresa({
            nome: nomeEmpresa,
            email: emailEmpresa,
            telefone: telefoneEmpresa,
            cnpj: cnpjEmpresa, // Adicionar CNPJ se fornecido
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

        // Gerar tokens para login automático
        const { accessToken, refreshToken } = generateTokens(novoUsuario._id, novoUsuario.papel, novoUsuario.empresa_id);

        console.log('Registro realizado com sucesso:', { empresaId: novaEmpresa._id, usuarioId: novoUsuario._id }); // Log para debug

        // Retornar resposta simples para teste
        return res.status(201).json({
            success: true,
            message: 'Empresa e usuário registrados com sucesso!',
            data: {
            accessToken,
            refreshToken,
            empresa: novaEmpresa,
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                papel: novoUsuario.papel
                }
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error); // Log para debug
        ResponseHelper.serverError(res, error);
    }
};

// Fazer login
exports.login = async (req, res) => {
    const { email, password, senha } = req.body;
    const passwordToCheck = password || senha; // Aceita ambos os campos

    try {
        console.log('Tentativa de login:', { email, password: passwordToCheck ? '***' : 'undefined' }); // Log para debug

        // Encontrar o usuário no MongoDB (incluindo a senha)
        const usuario = await Usuario.findOne({ email }).select('+senha');
        console.log('Usuário encontrado:', { 
            encontrado: !!usuario, 
            id: usuario?._id, 
            temSenha: !!usuario?.senha,
            senhaLength: usuario?.senha?.length 
        }); // Log para debug

        if (!usuario || usuario.status === 'inativo') {
            return ResponseHelper.unauthorized(res, 'Credenciais inválidas ou usuário inativo.');
        }

        // Verificar se a senha está correta
        console.log('Comparando senhas...'); // Log para debug
        const senhaCorreta = await usuario.compararSenha(passwordToCheck);
        console.log('Resultado da comparação:', senhaCorreta); // Log para debug

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

        console.log('Login realizado com sucesso:', { userId: usuario._id }); // Log para debug

        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            data: {
            accessToken, 
            refreshToken,
            user: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
                empresa_id: usuario.empresa_id
                }
            }
        });

    } catch (error) {
        console.error('Erro no login:', error); // Log para debug
        ResponseHelper.serverError(res, error);
    }
};

// Obter dados do usuário logado
exports.getMe = async (req, res) => {
    try {
        console.log('getMe chamado:', { userId: req.user?.id }); // Log para debug
        
        const usuario = await Usuario.findById(req.user.id)
            .select('-__v')
            .populate('empresa_id', 'nome email telefone status');
            
        console.log('Usuário encontrado no getMe:', { encontrado: !!usuario, id: usuario?._id }); // Log para debug
        
        if (!usuario) {
            return ResponseHelper.notFound(res, 'Usuário não encontrado.');
        }
        
        console.log('Retornando dados do usuário:', { id: usuario._id, nome: usuario.nome }); // Log para debug
        
        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Erro no getMe:', error); // Log para debug
        ResponseHelper.serverError(res, error);
    }
};

// Fazer logout
exports.logout = async (req, res) => {
    try {
        console.log('Logout chamado:', { userId: req.user?.id });
        
        // Em uma implementação mais robusta, você poderia invalidar o refresh token
        // Por enquanto, apenas retornamos sucesso
        
        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso.'
        });
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
        
        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            data: { accessToken, refreshToken }
        });
    } catch (error) {
        return ResponseHelper.unauthorized(res, 'Refresh token inválido ou expirado.');
    }
};

// Alterar senha
exports.alterarSenha = async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;

    try {
        console.log('Alterar senha chamado:', { userId: req.user?.id });
        
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

        console.log('Senha alterada com sucesso:', { userId: usuario._id });

        // Retornar resposta simples para teste
        return res.status(200).json({
            success: true,
            message: 'Senha alterada com sucesso.'
        });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
}; 