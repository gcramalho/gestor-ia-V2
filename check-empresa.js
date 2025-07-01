require('dotenv').config();
const mongoose = require('mongoose');
const Empresa = require('./src/models/Empresa');
const Usuario = require('./src/models/Usuario');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado com sucesso.');
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error);
        process.exit(1);
    }
};

const checkEmpresa = async () => {
    try {
        await connectDB();

        // ID da empresa do usuário
        const empresaId = '6861e64201359838c393737e';
        
        console.log('🔍 Verificando empresa:', empresaId);
        
        const empresa = await Empresa.findById(empresaId);
        
        if (!empresa) {
            console.log('❌ Empresa não encontrada');
            return;
        }
        
        console.log('✅ Empresa encontrada:', {
            id: empresa._id,
            nome: empresa.nome,
            email: empresa.email,
            status: empresa.status,
            criado_em: empresa.criado_em
        });

        // Verificar usuários da empresa
        const usuarios = await Usuario.find({ empresa_id: empresaId });
        
        console.log('👥 Usuários da empresa:', usuarios.length);
        usuarios.forEach(usuario => {
            console.log('  -', {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
                status: usuario.status
            });
        });

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexão fechada.');
    }
};

checkEmpresa(); 