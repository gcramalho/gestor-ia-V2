const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
        select: false // Não retorna a senha nas consultas
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
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ papel: 1 });

// Middleware p/ validar se admin_master não precisa de empresa_id
usuarioSchema.pre('save', function(next) {
    if (this.papel === 'admin_master'){
        this.empresa_id = undefined;
    } else if (!this.empresa_id) {
        return next(new Error('Empresa é obrigatória para usuários não admin_master'))
    }
    next();
});

// Middleware para hash da senha antes de salvar
usuarioSchema.pre('save', async function(next) {
    // Só hash a senha se ela foi modificada (ou é nova)
    if (!this.isModified('senha')) {
        console.log('Senha não foi modificada, pulando hash'); // Log para debug
        return next();
    }
    
    try {
        console.log('Hashando senha...', { senhaLength: this.senha?.length }); // Log para debug
        // Hash da senha com salt de 12 rounds
        this.senha = await bcrypt.hash(this.senha, 12);
        console.log('Senha hasheada com sucesso', { hashLength: this.senha?.length }); // Log para debug
        next();
    } catch (error) {
        console.error('Erro ao hashear senha:', error); // Log para debug
        next(error);
    }
});

// Método para comparar senhas
usuarioSchema.methods.compararSenha = async function(senhaCandidata) {
    console.log('compararSenha chamado:', { 
        temSenhaCandidata: !!senhaCandidata, 
        senhaCandidataLength: senhaCandidata?.length,
        temSenhaHash: !!this.senha,
        senhaHashLength: this.senha?.length 
    }); // Log para debug
    
    if (!senhaCandidata || !this.senha) {
        console.log('Erro: senhaCandidata ou this.senha está undefined/null'); // Log para debug
        return false;
    }
    
    return await bcrypt.compare(senhaCandidata, this.senha);
};

// Método para verificar se a senha foi alterada após o token ser emitido
usuarioSchema.methods.senhaAlteradaApos = function(JWTTimestamp) {
    if (this.atualizado_em) {
        const alteradoTimestamp = parseInt(
            this.atualizado_em.getTime() / 1000,
            10
        );
        return JWTTimestamp < alteradoTimestamp;
    }
    return false;
};

module.exports = mongoose.model('Usuario', usuarioSchema);