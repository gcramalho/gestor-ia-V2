const Agente = require('../../models/Agente');
const ArquivoAgente = require('../../models/ArquivoAgente');
const Conversa = require('../../models/Conversa');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');
const { generateApiKey } = require('../../utils/helpers');
const crypto = require('crypto');

class AgenteEmpresaController {
  async listarAgentes(req, res, next) {
    try {
      console.log('🔧 listarAgentes chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id
      });

      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const skip = (page - 1) * limit;

      const filters = {
        empresa_id: req.user.empresa_id
      };

      // Se status for especificado, usar o valor específico
      if (status !== '') {
        filters.status = status === 'true';
      }
      // Se não especificado, não filtrar por status (incluir todos os agentes da empresa)

      console.log('🔍 Filtros aplicados:', filters);

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

      console.log('✅ Agentes encontrados:', { count: agentes.length, total });
      console.log('📋 Dados dos agentes:', agentes.map(a => ({ id: a._id, nome: a.nome, status: a.status })));

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        data: agentes,
        pagination: {
          totalItems: total,
          totalPages,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar agentes: ${error.message}`);
      return next(new AppError('Erro ao listar agentes', 500));
    }
  }

  async obterAgente(req, res, next) {
    try {
      console.log('🔧 obterAgente chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id,
        agenteId: req.params.id
      });

      const { id } = req.params;

      const agente = await Agente.findOne({
        _id: id,
        empresa_id: req.user.empresa_id
      }).select('-api_key').lean();

      if (!agente) throw new AppError('Agente não encontrado', 404);

      const arquivos = await ArquivoAgente.find({ agente_id: id }).lean();

      console.log('✅ Agente encontrado:', { agenteId: agente._id });

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        data: { ...agente, arquivos }
      });
    } catch (error) {
      logger.error(`Erro ao obter agente: ${error.message}`);
      return next(error);
    }
  }

  async criarAgente(req, res, next) {
    try {
      console.log('🔧 criarAgente chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id,
        body: req.body,
        headers: req.headers
      });

      const {
        nome,
        descricao,
        prompt_base,
        instrucoes,
        configuracoes,
        status = true
      } = req.body;

      // Validações básicas
      if (!nome || !prompt_base) {
        console.log('❌ Validação falhou:', { nome: !!nome, prompt_base: !!prompt_base });
        return ResponseHelper.badRequest(res, 'Nome e prompt base são obrigatórios.');
      }

      console.log('✅ Validações passaram, criando agente...');
      console.log('📋 Dados recebidos:', { nome, descricao, prompt_base, configuracoes, status });

      // Gerar API Key única
      const api_key = crypto.randomBytes(32).toString('hex');

      const novoAgente = new Agente({
        empresa_id: req.user.empresa_id,
        nome,
        descricao,
        prompt_base,
        instrucoes,
        configuracoes: configuracoes || {
          modelo: 'gpt-3.5-turbo',
          temperatura: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop_sequences: []
        },
        status,
        api_key
      });

      console.log('📝 Agente a ser salvo:', {
        empresa_id: novoAgente.empresa_id,
        nome: novoAgente.nome,
        status: novoAgente.status,
        configuracoes: novoAgente.configuracoes
      });

      await novoAgente.save();

      const agenteResponse = await Agente.findById(novoAgente._id).select('-api_key').lean();

      console.log('✅ Agente criado com sucesso:', { agenteId: agenteResponse._id });

      // Retornar resposta simples para teste
      return res.status(201).json({
        success: true,
        message: 'Agente criado com sucesso',
        data: agenteResponse
      });
    } catch (error) {
      console.error('❌ Erro ao criar agente:', error);
      logger.error(`Erro ao criar agente: ${error.message}`);
      return next(error);
    }
  }

  async atualizarAgente(req, res, next) {
    try {
      console.log('🔧 atualizarAgente chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id,
        agenteId: req.params.id,
        body: req.body
      });

      const {
        nome,
        descricao,
        prompt_base,
        instrucoes,
        configuracoes,
        status
      } = req.body;

      const agente = await Agente.findOne({
        _id: req.params.id,
        empresa_id: req.user.empresa_id
      });

      if (!agente) {
        return ResponseHelper.notFound(res, 'Agente não encontrado.');
      }

      // Atualizar campos
      if (nome !== undefined) agente.nome = nome;
      if (descricao !== undefined) agente.descricao = descricao;
      if (prompt_base !== undefined) agente.prompt_base = prompt_base;
      if (instrucoes !== undefined) agente.instrucoes = instrucoes;
      if (configuracoes !== undefined) agente.configuracoes = configuracoes;
      if (status !== undefined) agente.status = status;

      await agente.save();

      const agenteResponse = await Agente.findById(agente._id).select('-api_key').lean();

      console.log('✅ Agente atualizado com sucesso:', { agenteId: agenteResponse._id });

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        message: 'Agente atualizado com sucesso',
        data: agenteResponse
      });
    } catch (error) {
      logger.error(`Erro ao atualizar agente: ${error.message}`);
      return next(error);
    }
  }

  async deletarAgente(req, res, next) {
    try {
      console.log('🔧 deletarAgente chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id,
        agenteId: req.params.id
      });

      const { id } = req.params;

      const agente = await Agente.findOne({
        _id: id,
        empresa_id: req.user.empresa_id
      });

      if (!agente) {
        return ResponseHelper.notFound(res, 'Agente não encontrado.');
      }

      // Soft delete - definir status como false (inativo)
      agente.status = false;
      await agente.save();

      const conversasAtivas = await Conversa.countDocuments({ agente_id: id, status: 'ativa' });

      if (conversasAtivas > 0) {
        throw new AppError('Não é possível deletar agente com conversas ativas', 400);
      }

      await ArquivoAgente.deleteMany({ agente_id: id });
      await Agente.findByIdAndDelete(id);

      console.log('✅ Agente deletado com sucesso:', { agenteId: id });

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        message: 'Agente deletado com sucesso'
      });
    } catch (error) {
      logger.error(`Erro ao deletar agente: ${error.message}`);
      return next(error);
    }
  }

  async regenerarApiKey(req, res, next) {
    try {
      console.log('🔧 regenerarApiKey chamado:', {
        userId: req.user?.id,
        userPapel: req.user?.papel,
        empresaId: req.user?.empresa_id,
        agenteId: req.params.id
      });

      const { id } = req.params;

      const agente = await Agente.findOne({
        _id: id,
        empresa_id: req.user.empresa_id
      });

      if (!agente) {
        return ResponseHelper.notFound(res, 'Agente não encontrado.');
      }

      // Gerar nova API Key
      agente.api_key = crypto.randomBytes(32).toString('hex');
      await agente.save();

      console.log('✅ API Key regenerada com sucesso:', { agenteId: agente._id });

      // Retornar resposta simples para teste
      return res.status(200).json({
        success: true,
        message: 'API Key regenerada com sucesso.',
        data: { api_key: agente.api_key }
      });
    } catch (error) {
      logger.error(`Erro ao regenerar API Key: ${error.message}`);
      return next(error);
    }
  }
}

module.exports = new AgenteEmpresaController();