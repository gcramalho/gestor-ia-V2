const Empresa = require('../../models/Empresa');
const ResponseHelper = require('../../utils/responseHelper');
const { AppError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

class EmpresaConfigController {

  async obterDados(req, res, next) {
    try {
      const empresa = await Empresa.findById(req.user.empresa_id).lean();

      if (!empresa) {
        return ResponseHelper.notFound(res, 'Empresa');
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
      const empresa = await Empresa.findById(req.user.empresa_id);

      if (!empresa) {
        return ResponseHelper.notFound(res, 'Empresa');
      }

      const camposPermitidos = [
        'nome',
        'telefone',
        'limite_agentes',
        'observacoes',
        'status'
      ];

      camposPermitidos.forEach((campo) => {
        if (req.body[campo] !== undefined) {
          empresa[campo] = req.body[campo];
        }
      });

      await empresa.save();
      return ResponseHelper.success(res, empresa, 'Dados da empresa atualizados com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar dados da empresa: ${error.message}`);
      return next(new AppError('Erro ao atualizar dados da empresa', 500));
    }
  }
}

module.exports = new EmpresaConfigController();
