const mongoose = require('mongoose');

const arquivoAgenteSchema = new mongoose.Schema({
    agente_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agente',
        required: [true, 'ID do agente é obrigatório']
    },

    nome_arquivo: {
        type: String,
        required: [true, 'Nome do arquivo é obrigatório'],
        trim: true,
        maxlength: [255, 'Nome do arquivo não pode exceder 255 caracteres']
    },

    nome_original: {
        type: String,
        required: [true, 'Nome original do arquivo é obrigatório']
    },

    url: {
        type: String,
        required: [true, 'URL do arquivo é obrigatória'],
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'URL deve ser válida'
        }
    },

    tipo: {
        type: String,
        enum: {
            values: ['pdf', 'txt', 'csv', 'json', 'docx', 'xlsx'],
            message: 'Tipo de arquivo não suportado'
        },
        required: [true, 'Tipo de arquivo é obrigatório']
    },
    
    tamanho: {
        type: Number,
        required: [true, 'Tamanho do arquivo é obrigatório'],
        min: [1, 'Tamanho minimo é 1 byte'],
        max: [50 * 1024 * 1024, 'Tamanho máximo é 50MB']
    },

    hash_arquivo: {
        type: String,
        required: true // p verificar integridade
    },

    processado: {
        type: Boolean,
        default: false
    },

    erro_processamento: {
        type: String,
    },

    criado_em: {
        type: Date,
        default: Date.now
    }

}, {
  timestamps: { createdAt: 'criado_em', updatedAt: false }
});

// Indexes pra melhor performance
arquivoAgenteSchema.index({ agente_id: 1 });
arquivoAgenteSchema.index({ tipo: 1 });
arquivoAgenteSchema.index({ processado: 1 });

module.exports = mongoose.model('ArquivoAgente', arquivoAgenteSchema)