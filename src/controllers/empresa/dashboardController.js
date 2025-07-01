const Agente = require('../../models/Agente');
const Conversa = require('../../models/Conversa');
const Usuario = require('../../models/Usuario');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');

class DashboardController {
  async obterResumo(req, res, next) {
    try {
      console.log('🔧 obterResumo chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id
      });

      const empresa_id = req.user.empresa_id;

      // Contar agentes
      const totalAgentes = await Agente.countDocuments({ 
        empresa_id, 
        status: { $ne: 'deletado' } 
      });

      const agentesAtivos = await Agente.countDocuments({ 
        empresa_id, 
        status: true 
      });

      // Contar conversas
      const totalConversas = await Conversa.countDocuments({ 
        agente_id: { $in: await Agente.find({ empresa_id }).select('_id') } 
      });

      const conversasAtivas = await Conversa.countDocuments({ 
        agente_id: { $in: await Agente.find({ empresa_id }).select('_id') },
        status: 'ativa'
      });

      // Contar usuários da empresa
      const totalUsuarios = await Usuario.countDocuments({ 
        empresa_id, 
        status: 'ativo' 
      });

      // Agentes mais recentes
      const agentesRecentes = await Agente.find({ 
        empresa_id, 
        status: { $ne: 'deletado' } 
      })
      .select('nome status criado_em')
      .sort({ criado_em: -1 })
      .limit(5);

      // Conversas mais recentes
      const conversasRecentes = await Conversa.find({ 
        agente_id: { $in: await Agente.find({ empresa_id }).select('_id') } 
      })
      .populate('agente_id', 'nome')
      .select('cliente_telefone status criado_em')
      .sort({ criado_em: -1 })
      .limit(5);

      const resumo = {
        estatisticas: {
          totalAgentes,
          agentesAtivos,
          totalConversas,
          conversasAtivas,
          totalUsuarios
        },
        agentesRecentes,
        conversasRecentes
      };

      console.log('✅ Dashboard gerado:', { totalAgentes, agentesAtivos, totalConversas });

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        data: resumo
      });
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
