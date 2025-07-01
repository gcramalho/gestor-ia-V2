// controllers/empresa/usuarioEmpresaController.js
const Usuario = require('../../models/Usuario');
const ResponseHelper = require('../../utils/responseHelper');
const { AppError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

class UsuarioEmpresaController {

  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await Usuario.find({ 
        empresa_id: req.user.empresa_id,
        status: 'ativo'
      })
      .select('-senha -__v')
      .sort({ criado_em: -1 });

      return ResponseHelper.success(res, usuarios);
    } catch (error) {
      logger.error(`Erro ao listar usuários: ${error.message}`);
      return next(new AppError('Erro ao listar usuários', 500));
    }
  }

  async atualizarUsuario(req, res, next) {
    try {
      const { nome, email, papel, status } = req.body;

      const usuario = await Usuario.findOne({
        _id: req.params.id,
        empresa_id: req.user.empresa_id
      });

      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado.');
      }

      // Atualizar campos permitidos
      if (nome !== undefined) usuario.nome = nome;
      if (email !== undefined) usuario.email = email;
      if (papel !== undefined) usuario.papel = papel;
      if (status !== undefined) usuario.status = status;

      await usuario.save();

      return ResponseHelper.success(res, {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        status: usuario.status
      });
    } catch (error) {
      logger.error(`Erro ao atualizar usuário: ${error.message}`);
      return next(new AppError('Erro ao atualizar usuário', 500));
    }
  }

  async deletarUsuario(req, res, next) {
    try {
      const usuario = await Usuario.findOne({
        _id: req.params.id,
        empresa_id: req.user.empresa_id
      });

      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado.');
      }

      // Não permitir deletar o próprio usuário
      if (usuario._id.toString() === req.user.id) {
        return ResponseHelper.badRequest(res, 'Não é possível deletar seu próprio usuário.');
      }

      // Soft delete
      usuario.status = 'inativo';
      await usuario.save();

      return ResponseHelper.success(res, { message: 'Usuário deletado com sucesso.' });
    } catch (error) {
      logger.error(`Erro ao deletar usuário: ${error.message}`);
      return next(new AppError('Erro ao deletar usuário', 500));
    }
  }

  async atualizarPerfil(req, res, next) {
    try {
      const { nome, email } = req.body;

      const usuario = await Usuario.findById(req.user.id);
      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado.');
      }

      // Atualizar campos permitidos
      if (nome !== undefined) usuario.nome = nome;
      if (email !== undefined) usuario.email = email;

      await usuario.save();

      return ResponseHelper.success(res, {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        empresa_id: usuario.empresa_id
      });
    } catch (error) {
      logger.error(`Erro ao atualizar perfil: ${error.message}`);
      return next(new AppError('Erro ao atualizar perfil', 500));
    }
  }
}

module.exports = new UsuarioEmpresaController();
