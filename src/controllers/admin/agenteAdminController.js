const Agente = require('../../models/Agente');
const ArquivoAgente = require('../../models/ArquivoAgente');
const Conversa = require('../../models/Conversa');
const Empresa = require('../../models/Empresa');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');

class AgenteAdminController {
  async listarAgentes(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '', empresa_id = '' } = req.query;
      const skip = (page - 1) * limit;

      const filters = {};
      if (search) {
        filters.nome = { $regex: search, $options: 'i' };
      }
      if (status !== '') {
        filters.status = status === 'true';
      }
      if (empresa_id) {
        filters.empresa_id = empresa_id;
      }

      const [agentes, total] = await Promise.all([
        Agente.find(filters)
          .populate('empresa_id', 'nome')
          .sort({ criado_em: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-api_key')
          .lean(),
        Agente.countDocuments(filters)
      ]);

      const agentesComStats = await Promise.all(
        agentes.map(async (agente) => {
          const totalConversas = await Conversa.countDocuments({ agente_id: agente._id });
          const conversasAtivas = await Conversa.countDocuments({ 
            agente_id: agente._id, 
            status: 'ativa' 
          });

          return {
            ...agente,
            estatisticas: {
              ...agente.estatisticas,
              conversas_ativas: conversasAtivas,
              total_conversas_historico: totalConversas
            }
          };
        })
      );

      const totalPages = Math.ceil(total / limit);

      return ResponseHelper.paginated(
        res,
        agentesComStats,
        total,
        parseInt(page),
        totalPages,
        parseInt(limit)
      );
    } catch (error) {
      logger.error(`Erro do Admin ao listar agentes: ${error.message}`);
      return next(new AppError('Erro ao listar agentes', 500));
    }
  }

  async obterAgente(req, res, next) {
    try {
      const { id } = req.params;
      const agente = await Agente.findById(id).populate('empresa_id', 'nome').select('-api_key').lean();
      if (!agente) {
        throw new AppError('Agente não encontrado', 404);
      }
      return ResponseHelper.success(res, agente);
    } catch (error) {
      logger.error(`Erro do Admin ao obter agente: ${error.message}`);
      return next(error);
    }
  }

  async criarAgente(req, res, next) {
    try {
      const { nome, descricao, prompt_base, configuracoes, telefone_whatsapp } = req.body;

      const empresa = await Empresa.findById(req.user.empresa_id);
      const totalAgentes = await Agente.countDocuments({ empresa_id: req.user.empresa_id });

      if (totalAgentes >= empresa.limite_agentes) {
        throw new AppError('Limite de agentes atingido', 400);
      }

      const novoAgente = new Agente({
        empresa_id: req.user.empresa_id,
        nome,
        descricao,
        prompt_base,
        configuracoes,
        telefone_whatsapp,
        api_key: generateApiKey()
      });

      await novoAgente.save();

      const agenteResponse = await Agente.findById(novoAgente._id).select('-api_key').lean();

      return ResponseHelper.success(res, agenteResponse, 'Agente criado com sucesso', 201);
    } catch (error) {
      logger.error(`Erro ao criar agente: ${error.message}`);
      return next(error);
    }
  }

  async atualizarAgente(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const agente = await Agente.findOneAndUpdate(
        { _id: id, empresa_id: req.user.empresa_id },
        updates,
        { new: true, runValidators: true }
      ).select('-api_key');

      if (!agente) throw new AppError('Agente não encontrado', 404);

      return ResponseHelper.success(res, agente, 'Agente atualizado com sucesso');
    } catch (error) {
      logger.error(`Erro ao atualizar agente: ${error.message}`);
      return next(error);
    }
  }

  async deletarAgente(req, res, next) {
    try {
      const { id } = req.params;
      const agente = await Agente.findById(id);
      if (!agente) {
        throw new AppError('Agente não encontrado', 404);
      }

      const conversasAtivas = await Conversa.countDocuments({ agente_id: id, status: 'ativa' });
      if (conversasAtivas > 0) {
        throw new AppError('Não é possível deletar agente com conversas ativas', 400);
      }

      await Agente.findByIdAndDelete(id);
      logger.info(`Admin deletou o agente: ${id}`);
      return ResponseHelper.success(res, null, 'Agente deletado com sucesso');
    } catch (error) {
      logger.error(`Erro do Admin ao deletar agente: ${error.message}`);
      return next(error);
    }
  }

  async regenerarApiKey(req, res, next) {
    try {
      const { id } = req.params;

      if (req.user.papel !== 'admin_empresa' && req.user.papel !== 'admin_master') {
        throw new AppError('Apenas administradores podem regenerar API Keys', 403);
      }

      const novaApiKey = generateApiKey();
      const agente = await Agente.findOneAndUpdate(
        { _id: id, empresa_id: req.user.empresa_id },
        { api_key: novaApiKey },
        { new: true }
      );

      if (!agente) throw new AppError('Agente não encontrado', 404);

      return ResponseHelper.success(res, {
        nome: agente.nome,
        api_key: novaApiKey
      }, 'API Key regenerada com sucesso');
    } catch (error) {
      logger.error(`Erro ao regenerar API Key: ${error.message}`);
      return next(error);
    }
  }
}

module.exports = new AgenteAdminController();