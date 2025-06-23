console.log('Iniciando teste do servidor...');

try {
    console.log('1. Carregando dotenv...');
    require('dotenv').config();
    console.log('✅ dotenv carregado');

    console.log('2. Carregando app.js...');
    const app = require('./app.js');
    console.log('✅ app.js carregado');

    console.log('3. Carregando database.js...');
    const connectDB = require('./src/config/database.js');
    console.log('✅ database.js carregado');

    console.log('4. Carregando logger...');
    const logger = require('./src/utils/logger.js');
    console.log('✅ logger carregado');

    console.log('5. Testando conexão com MongoDB...');
    const mongoose = require('mongoose');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'não definido');
    
    console.log('✅ Todos os módulos carregados com sucesso!');
    
} catch (error) {
    console.error('❌ Erro encontrado:', error.message);
    console.error('Stack trace:', error.stack);
} 