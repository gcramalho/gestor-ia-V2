const Agente = require('../../models/Agente');
const Conversa = require('../../models/Conversa');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');

class DashboardController {
  async obterResumo(req, res, next) {
    try {
      const empresaId = req.user.empresa_id;

      const [totalAgentes, agentesAtivos, totalConversas, conversasHoje] = await Promise.all([
        Agente.countDocuments({ empresa_id: empresaId }),
        Agente.countDocuments({ empresa_id: empresaId, status: true }),
        Conversa.countDocuments({ agente_id: { $in: await Agente.find({ empresa_id: empresaId }).distinct('_id') } }),
        Conversa.countDocuments({
          agente_id: { $in: await Agente.find({ empresa_id: empresaId }).distinct('_id') },
          criado_em: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ]);

      const resumo = {
        total_agentes: totalAgentes,
        agentes_ativos: agentesAtivos,
        total_conversas: totalConversas,
        conversas_hoje: conversasHoje
      };

      return ResponseHelper.success(res, resumo);
    } catch (error) {
      logger.error(`Erro ao obter resumo do dashboard: ${error.message}`);
      return next(new AppError('Erro ao obter dados do dashboard', 500));
    }
  }

  async estatisticasPorCanal(req, res, next) {
    try {
      const empresaId = req.user.empresa_id;
      const agenteIds = await Agente.find({ empresa_id: empresaId }).distinct('_id');

      const resultado = await Conversa.aggregate([
        { $match: { agente_id: { $in: agenteIds } } },
        { $group: {
          _id: '$canal',
          total: { $sum: 1 }
        } }
      ]);

      const estatisticas = resultado.reduce((acc, item) => {
        acc[item._id] = item.total;
        return acc;
      }, {});

      return ResponseHelper.success(res, estatisticas);
    } catch (error) {
      logger.error(`Erro ao obter estatísticas por canal: ${error.message}`);
      return next(new AppError('Erro ao obter estatísticas por canal', 500));
    }
  }
}

module.exports = new DashboardController();
