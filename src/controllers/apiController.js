const Agente = require('../models/Agente');
const Conversa = require('../models/Conversa');
const response = require('../utils/responseHelper');
// const iaService = require('../services/iaService'); // Serviço de IA (quando for implementado)

// 'Mock' do serviço de IA, trocar para o serviço de IA real
const iaService = {
    getCompletion: async (prompt, config) => {
        // Em um caso real, aqui haverá a chamada para a API da OpenAI/Anthropic etc.
        console.log("CHAMADA AO SERVIÇO DE IA COM A CONFIG:", config);
        return {
            content: `Esta é uma resposta simulada para o prompt: "${prompt}"`,
            usage: {
                total_tokens: 50,
            }
        };
    }
};


exports.handleMessage = async (req, res) => {
    const { conversationId, prompt, userIdentifier, userName } = req.body;
    const agente = req.agente; // Injetado, middleware authenticateApiKey

    try {
        let conversa;

        if (conversationId) {
            conversa = await Conversa.findById(conversationId);
            if (!conversa) {
                return response.notFound(res, 'Conversa não encontrada.');
            }
            // Verifica se a conversa pertence ao agente correto
            if (conversa.agente_id.toString() !== agente._id.toString()) {
                return response.forbidden(res, 'Esta conversa não pertence ao agente autenticado.');
            }
        } else {
            // Cria uma nova conversa
            conversa = new Conversa({
                agente_id: agente._id,
                telefone_cliente: userIdentifier,
                nome_cliente: userName,
                canal: 'api',
                status: 'ativa',
            });
        }

        // Adiciona a mensagem do cliente ao histórico
        conversa.historico.push({
            tipo: 'cliente',
            mensagem: prompt,
        });

        // Monta o prompt
        const fullPrompt = `${agente.prompt_base}\n\nHistórico:\n${conversa.historico.map(h => `${h.tipo}: ${h.mensagem}`).join('\n')}\n\ncliente: ${prompt}`;
        
        const startTime = Date.now();
        // Chama o serviço de IA
        const iaResponse = await iaService.getCompletion(fullPrompt, agente.configuracoes);
        const endTime = Date.now();

        // Adiciona a resposta do agente ao histórico
        conversa.historico.push({
            tipo: 'agente',
            mensagem: iaResponse.content,
            metadata: {
                tokens_usados: iaResponse.usage.total_tokens,
                tempo_resposta: endTime - startTime,
                modelo_usado: agente.configuracoes.modelo
            }
        });

        await conversa.save();

        response.success(res, { 
            reply: iaResponse.content, 
            conversationId: conversa._id 
        });

    } catch (error) {
        response.serverError(res, error);
    }
};

exports.getConversationById = async (req, res) => {
    const { id } = req.params;
    const agente = req.agente;

    try {
        const conversa = await Conversa.findById(id);

        if (!conversa) {
            return response.notFound(res, 'Conversa não encontrada.');
        }

        // Verifica se a conversa pertence ao agente correto
        if (conversa.agente_id.toString() !== agente._id.toString()) {
            return response.forbidden(res, 'Acesso negado a esta conversa.');
        }

        response.success(res, conversa);
    } catch (error) {
        response.serverError(res, error);
    }
}; 