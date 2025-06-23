const Agente = require('../../models/Agente');
const ArquivoAgente = require('../../models/ArquivoAgente');
const Conversa = require('../../models/Conversa');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');
const { generateApiKey } = require('../../utils/helpers');

class AgenteEmpresaController {
  async listarAgentes(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const skip = (page - 1) * limit;

      const filters = {
        empresa_id: req.user.empresa_id
      };

      if (search) {
        filters.$or = [
          { nome: { $regex: search, $options: 'i' } },
          { descricao: { $regex: search, $options: 'i' } }
        ];
      }

      if (status !== '') {
        filters.status = status === 'true';
      }

      const [agentes, total] = await Promise.all([
        Agente.find(filters)
          .sort({ criado_em: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-api_key')
          .lean(),
        Agente.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / limit);

      return ResponseHelper.paginated(res, agentes, total, parseInt(page), totalPages, parseInt(limit));
    } catch (error) {
      logger.error(`Erro ao listar agentes: ${error.message}`);
      return next(new AppError('Erro ao listar agentes', 500));
    }
  }

  async obterAgente(req, res, next) {
    try {
      const { id } = req.params;

      const agente = await Agente.findOne({
        _id: id,
        empresa_id: req.user.empresa_id
      }).select('-api_key').lean();

      if (!agente) throw new AppError('Agente não encontrado', 404);

      const arquivos = await ArquivoAgente.find({ agente_id: id }).lean();

      return ResponseHelper.success(res, { ...agente, arquivos });
    } catch (error) {
      logger.error(`Erro ao obter agente: ${error.message}`);
      return next(error);
    }
  }

  async criarAgente(req, res, next) {
    try {
      const { nome, descricao, prompt_base, configuracoes, telefone_whatsapp } = req.body;

      const totalAgentes = await Agente.countDocuments({ empresa_id: req.user.empresa_id });

      // Limite virá da req.user ou pode ser consultado via Empresa.findById

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

      const agente = await Agente.findOne({ _id: id, empresa_id: req.user.empresa_id });

      if (!agente) throw new AppError('Agente não encontrado', 404);

      const conversasAtivas = await Conversa.countDocuments({ agente_id: id, status: 'ativa' });

      if (conversasAtivas > 0) {
        throw new AppError('Não é possível deletar agente com conversas ativas', 400);
      }

      await ArquivoAgente.deleteMany({ agente_id: id });
      await Agente.findByIdAndDelete(id);

      return ResponseHelper.success(res, null, 'Agente deletado com sucesso');
    } catch (error) {
      logger.error(`Erro ao deletar agente: ${error.message}`);
      return next(error);
    }
  }

  async regenerarApiKey(req, res, next) {
    try {
      const { id } = req.params;

      const novaApiKey = generateApiKey();
      const agente = await Agente.findOneAndUpdate(
        { _id: id, empresa_id: req.user.empresa_id },
        { api_key: novaApiKey },
        { new: true }
      );

      if (!agente) {
        throw new AppError('Agente não encontrado ou não pertence à sua empresa', 404);
      }

      // Retorna a nova chave apenas nesta resposta por segurança
      return ResponseHelper.success(res, {
        message: 'API Key regenerada com sucesso. Esta é a única vez que a chave será exibida.',
        api_key: novaApiKey
      });
    } catch (error) {
      logger.error(`Erro ao regenerar API Key: ${error.message}`);
      return next(error);
    }
  }
}

module.exports = new AgenteEmpresaController();