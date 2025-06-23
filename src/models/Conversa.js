const mongoose = require('mongoose');

const conversaSchema = new mongoose.Schema({
    agente_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agente',
        required: [true, 'ID do agente é obrigatório']
    },

    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },

    telefone_cliente: {
        type: String,
        required: [true, 'Telefone do cliente é obrigatório'],
        validate: {
            validator: function(v) {
                return /^\+\d{10,15}$/.test(v);
            },
            message: 'Telefone deve ser válido e no formato +<código do país><número>'
        }
    },

    nome_cliente: {
        type: String,
        trim: true,
        maxlength: [100, 'Nome do cliente não pode exceder 100 caracteres']
    },

    canal: {
        type: String,
        enum: {
            values: ['whatsapp', 'web', 'api'],
            message: 'Canal deve ser whatsapp, web ou api'
        },
        default: 'whatsapp'
    },

    historico: [{
        tipo: {
            type: String,
            enum: {
                values: ['cliente', 'agente', 'sistema'],
                message: 'Tipo deve ser cliente, agente ou sistema'
            },
            required: [true, 'Tipo de mensagem é obrigatório']
        },
        
        mensagem: {
            type: String,
            required: [true, 'Mensagem é obrigatória'],
            maxlength: [4000, 'Mensagem não pode exceder 4000 caracteres']
        },

        timestamp: {
            type: Date,
            default: Date.now
        },

        metadata: {
            tokens_usados: { type: Number },
            tempo_resposta: { type: Number }, // milisegundos
            modelo_usado: { type: String },
            erro: { type: String }
        }
    }],

    status: {
        type: String,
        enum: {
            values: ['ativa', 'encerrada', 'arquivada', 'pausada'],
            message: 'Status deve ser ativa, encerrada, arquivada ou pausada'
        },
        default: 'ativa'
    },

    resumo_conversa: {
        type: String,
        maxlength: [1000, 'Resumo não pode exceder 1000 caracteres']
    },

    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag não pode exceder 50 caracteres'],
    }],

    avaliacao: {
        nota: {
            type: Number,
            min: [1, 'Nota minima é 1'],
            max: [5, 'Nota máxima é 5']
        },

        comentario: {
            type: String,
            maxlength: [500, 'Comentário não pode exceder 500 caracteres']
        },
        data_avaliacao: { type: Date }
    },

    estatisticas: {
        total_mensagens: { type: Number, default: 0 },
        total_tokens: { type: Number, default: 0 },
        tempo_total: { type: Number, default: 0 }, // minutos
        primeira_resposta: { type: Date },
        ultima_resposta: { type: Date }
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
conversaSchema.index({ agente_id: 1 });
conversaSchema.index({ telefone_cliente: 1 });
conversaSchema.index({ status: 1 });
conversaSchema.index({ canal: 1 });
conversaSchema.index({ criado_em: -1 });
conversaSchema.index({ 'avaliacao.nota': 1 });


// Middleware p/ atualizar estatisticas
conversaSchema.pre('save', function(next) {
    if(this.isModified('historico')) {
        this.estatisticas.total_mensagens = this.historico.length;

         // Calcular total de tokens
         this.estatisticas.total_tokens = this.historico.reduce((total, msg) => {
            return total + (msg.metadata?.tokens_usados || 0);
        }, 0);

        // Encontrar primeira e última resposta do agente
        const respostasAgente = this.historico.filter(msg => msg.tipo === 'agente');

        if(respostasAgente.length > 0){
            this.estatisticas.primeira_resposta = respostasAgente[0].timestamp;
            this.estatisticas.ultima_resposta = respostasAgente[respostasAgente.length - 1].timestamp;
        }
    }
    next();
});

module.exports = mongoose.model('Conversa', conversaSchema);