const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    empresa_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'ID da empresa é obrigatório']
    },

    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },

    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Email deve ter um formato válido'
        }
    },

    supabase_user_id: {
        type: String,
        required: [true, 'ID do usuário Supabase é obrigatório'],
        unique: true
    },

    papel: {
        type: String,
        enum: {
            values: ['admin_master', 'admin_empresa', 'user_empresa'],
            message: 'Papel deve ser um dos seguintes valores: admin_master, admin_empresa, user_empresa'
        },
        default: 'user_empresa'
    },

    status: {
        type: String,
        enum: {
            values: ['ativo', 'inativo'],
            message: 'Status deve ser ativo ou inativo'
        },
        default: 'ativo'
    },

    ultimo_acesso: {
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
usuarioSchema.index({ empresa_id: 1 });
// O índice para 'email' é criado automaticamente por 'unique: true'
// usuarioSchema.index({ email: 1 });
// O índice para 'supabase_user_id' é criado automaticamente por 'unique: true'
// usuarioSchema.index({ supabase_user_id: 1 });
usuarioSchema.index({ papel: 1 });


// Middleware p/ validar se admin_master não precisa de empresa_id
usuarioSchema.pre('save', function(next) {

    if (this.papel === 'admin_master'){
        this.empresa_id = undefined;

    } else if (!this.empresa_id) { // Se !admin_master e empresa_id vazio
        return next(new Error('Empresa é obrigatória para usuários não admin_master'))
    }
    next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);