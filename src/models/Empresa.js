const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome da empresa é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },

    cnpj: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Permite valores únicos, mas não requer que todos os documentos tenham um CNPJ | Permite múltiplos documentos com campo null
        validate: { // Validação CNPJ
            validator: function(v){
                return !v || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v);
            },
            message: 'CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX'
        }
    },

    email: {
        type: String,
        required: [true, 'Email da empresa é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: { // Validação email
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Email deve ter um formato válido'
        }
    },

    telefone: {
        type: String,
        required: [true, 'Telefone da empresa é obrigatório'],
        validate: { // Validação telefone mais flexível
            validator: function(v) {
                // Aceita formatos: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, XXXXXXXXXXX
                return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v);
            },
            message: 'Telefone deve estar em um formato válido'
        }
    },

    limite_agentes: {
        type: Number,
        required: true,
        default: 10, // Limite padrão de agentes
        min: [1, 'O limite minimo de agentes é 1'],
        max: [1000, 'O limite máximo de agentes é 1000']
    },

    status: {
        type: String,
        enum: {
            values: ['ativo', 'inativo'],
            message: 'Status deve ser ativo ou inativo'
        },
        default: 'ativo'
    },

    observacoes: {
        type: String,
        maxlength: [500, 'Observações não podem exceder 500 caracteres']
    },

    criado_em: {
        type: Date,
        default: Date.now
    },

    atualizado_em: {
        type: Date,
        default: Date.now
    }

}, { timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em'}

});

// Indexes pra melhor performance
// O índice para 'email' é criado automaticamente por 'unique: true'
// empresaSchema.index({ email: 1 });
// O índice para 'cnpj' é criado automaticamente por 'unique: true'
// empresaSchema.index({ cnpj: 1 });
empresaSchema.index({ status: 1 });

module.exports = mongoose.model('Empresa', empresaSchema);