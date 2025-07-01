const Empresa = require('../../models/Empresa');
const ResponseHelper = require('../../utils/responseHelper');
const { AppError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

class EmpresaConfigController {

  async obterDados(req, res, next) {
    try {
      const empresa = await Empresa.findById(req.user.empresa_id)
        .select('-__v');

      if (!empresa) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada.');
      }

      return ResponseHelper.success(res, empresa);
    } catch (error) {
      logger.error(`Erro ao obter dados da empresa: ${error.message}`);
      return next(new AppError('Erro ao obter dados da empresa', 500));
    }
  }

  /**====================================
   * Atualizar dados da própria empresa
   */
  async atualizarDados(req, res, next) {
    try {
      const { nome, email, telefone, endereco } = req.body;

      const empresa = await Empresa.findById(req.user.empresa_id);

      if (!empresa) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada.');
      }

      // Atualizar campos permitidos
      if (nome !== undefined) empresa.nome = nome;
      if (email !== undefined) empresa.email = email;
      if (telefone !== undefined) empresa.telefone = telefone;
      if (endereco !== undefined) empresa.endereco = endereco;

      await empresa.save();
      return ResponseHelper.success(res, empresa, 'Dados da empresa atualizados com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar dados da empresa: ${error.message}`);
      return next(new AppError('Erro ao atualizar dados da empresa', 500));
    }
  }
}

module.exports = new EmpresaConfigController();
