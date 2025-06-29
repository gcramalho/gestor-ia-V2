// controllers/empresa/usuarioEmpresaController.js
const Usuario = require('../../models/Usuario');
const ResponseHelper = require('../../utils/responseHelper');
const { AppError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

class UsuarioEmpresaController {

  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await Usuario.find({ empresa_id: req.user.empresa_id })
        .select('-senha')
        .populate('empresa_id', 'nome');

      return ResponseHelper.success(res, usuarios);
    } catch (error) {
      logger.error(`Erro ao listar usuários: ${error.message}`);
      return next(new AppError('Erro ao listar usuários', 500));
    }
  }

  async atualizarUsuario(req, res, next) {
    try {
      const { id } = req.params;

      // Verifica se o usuário pertence à empresa e se tem permissão
      const usuario = await Usuario.findOne({ _id: id, empresa_id: req.user.empresa_id });

      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário');
      }

      const camposPermitidos = ['nome', 'status'];
      camposPermitidos.forEach((campo) => {
        if (req.body[campo] !== undefined) {
          usuario[campo] = req.body[campo];
        }
      });

      await usuario.save();
      return ResponseHelper.success(res, usuario, 'Usuário atualizado com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar usuário: ${error.message}`);
      return next(new AppError('Erro ao atualizar usuário', 500));
    }
  }

  async deletarUsuario(req, res, next) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findOne({ _id: id, empresa_id: req.user.empresa_id });

      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário');
      }

      await Usuario.findByIdAndDelete(id);

      return ResponseHelper.success(res, null, 'Usuário deletado com sucesso');
    } catch (error) {
      logger.error(`Erro ao deletar usuário: ${error.message}`);
      return next(new AppError('Erro ao deletar usuário', 500));
    }
  }

  async atualizarPerfil(req, res, next) {
    try {
      const usuarioId = req.user.id;

      const usuario = await Usuario.findOne({ _id: usuarioId, empresa_id: req.user.empresa_id });

      if (!usuario) {
        return ResponseHelper.notFound(res, 'Usuário');
      }

      const camposPermitidos = ['nome'];
      camposPermitidos.forEach((campo) => {
        if (req.body[campo] !== undefined) {
          usuario[campo] = req.body[campo];
        }
      });

      await usuario.save();
      return ResponseHelper.success(res, usuario, 'Perfil atualizado com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar perfil: ${error.message}`);
      return next(new AppError('Erro ao atualizar perfil', 500));
    }
  }
}

module.exports = new UsuarioEmpresaController();
