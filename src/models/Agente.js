const mongoose = require('mongoose');
const crypto = require('crypto');
const { getModelValues } = require('../config/models');

const agenteSchema = new mongoose.Schema({
    empresa_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'ID da empresa é obrigatório']
    },

    nome: {
        type: String,
        required: [true, 'Nome do agente é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },

    descricao: {
        type: String,
        maxlength: [500, 'Descrição não pode exceder 500 caracteres']
    },

    prompt_base: {
        type: String,
        required: [true, 'Prompt base é obrigatório'],
        maxlength: [5000, 'Prompt base não pode exceder 5000 caracteres']
    },

    instrucoes: {
        type: String,
        maxlength: [2000, 'Instruções não podem exceder 2000 caracteres']
    },

    configuracoes: {
        modelo: {
            type: String,
            enum: {
                values: getModelValues(),
                message: 'Modelo de IA não suportado'
            },
            default: 'gpt-3.5-turbo'
        },

        temperatura: {
            type: Number,
            min: [0, 'Temperatura minima é 0'],
            max: [2, 'Temperatura máxima é 2'],
            default: 0.7
        },

        top_p: {
            type: Number,
            min: [0, 'Top P minimo é 0'],
            max: [1, 'Top P máximo é 1'],
            default: 0.9
        },

        max_tokens: {
            type: Number,
            min: [1, 'Minimo 1 token'],
            max: [4000, 'Máximo 4000 tokens'],
            default: 1000
        },

        frequency_penalty: {
            type: Number,
            min: [0, 'Penalidade de frequência mínima é 0'],
            max: [2, 'Penalidade de frequência máxima é 2'],
            default: 0
        },

        presence_penalty: {
            type: Number,
            min: [0, 'Penalidade de presença mínima é 0'],
            max: [2, 'Penalidade de presença máxima é 2'],
            default: 0
        },

        stop_sequences: {
            type: [String],
            default: []
        },

        resposta_padrao: {
            type: String,
            maxlength: [500, 'Resposta padrão não pode exceder 500 caracteres']
        }
    },

    api_key: {
        type: String,
        required: [true, 'API Key é obrigatória'],
        unique: true,
        default: function() {
            return crypto.randomBytes(32).toString('hex');
        }
    },

    avatar_url: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'URL do avatar deve ser uma URL válida de imagem'
        }
    },

    status: {
        type: Boolean,
        default: true
    },

    whatsapp_integrado: {
        type: Boolean,
        default: false
    },

    telefone_whatsapp: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\+\d{10,15}$/.test(v);
            },
            message: 'Telefone Whatsapp deve estar no formato (+XXXXXXXXXXX)'
        }
    },

    estatisticas: {
        total_conversas: { type: Number, default: 0 },
        total_mensagens: { type: Number, default: 0 },
        ultima_atividade: { type: Date }
    },

    criado_em: {
        type: Date,
        default: Date.now
    },

    atualizado_em: {
        type: Date,
        default: Date.now
    }

}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' }
});

// Indexes pra melhor performance
agenteSchema.index({ empresa_id: 1 });
// O índice para 'api_key' é criado automaticamente por 'unique: true'
// agenteSchema.index({ api_key: 1 });
agenteSchema.index({ status: 1 });
agenteSchema.index({ whatsapp_integrado: 1 });

module.exports = mongoose.model('Agente', agenteSchema);