const Usuario = require('../../models/Usuario');
const Empresa = require('../../models/Empresa');
const ResponseHelper = require('../../utils/responseHelper');
const { AppError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const bcrypt = require('bcrypt');

class UsuarioAdminController {
  async listarUsuarios(req, res, next) {
    try {
      const { empresaId } = req.query;
      const filtros = empresaId ? { empresa_id: empresaId } : {};

      const usuarios = await Usuario.find(filtros)
        .select('-senha')
        .sort({ criado_em: -1 })
        .lean();

      return ResponseHelper.success(res, usuarios);
    } catch (error) {
      logger.error(`Erro ao listar usuários: ${error.message}`);
      return next(new AppError('Erro ao listar usuários', 500));
    }
  }

  async criarUsuario(req, res, next) {
    try {
      const { nome, email, senha, papel, empresa_id, status } = req.body;

      const empresa = await Empresa.findById(empresa_id);
      if (!empresa) throw new AppError('Empresa não encontrada', 404);

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) throw new AppError('Email já está em uso', 409);

      const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;

      const novoUsuario = new Usuario({
        nome,
        email,
        papel,
        empresa_id,
        status,
        ...(senhaHash && { senha: senhaHash })
      });

      await novoUsuario.save();

      const usuarioResponse = await Usuario.findById(novoUsuario._id)
        .select('-senha')
        .lean();

      return ResponseHelper.success(res, usuarioResponse, 'Usuário criado com sucesso', 201);
    } catch (error) {
      logger.error(`Erro ao criar usuário: ${error.message}`);
      return next(error);
    }
  }

  async atualizarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, email, senha, papel, status } = req.body;

      const updates = { nome, email, papel, status };

      if (senha) {
        updates.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await Usuario.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).select('-senha');

      if (!usuario) throw new AppError('Usuário não encontrado', 404);

      return ResponseHelper.success(res, usuario, 'Usuário atualizado com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar usuário: ${error.message}`);
      return next(error);
    }
  }

  async deletarUsuario(req, res, next) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findById(id);
      if (!usuario) throw new AppError('Usuário não encontrado', 404);

      await Usuario.findByIdAndDelete(id);

      return ResponseHelper.success(res, null, 'Usuário deletado com sucesso');
    } catch (error) {
      logger.error(`Erro ao deletar usuário: ${error.message}`);
      return next(error);
    }
  }
}

module.exports = new UsuarioAdminController();
