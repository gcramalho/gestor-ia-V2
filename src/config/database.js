const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true,
            retryReads: true
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        mongoose.connection.on('connected', () => {
            logger.info('MongoDB conectado com sucesso.');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`Erro na conexão MongoDB: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB desconectado.');
        });

    } catch (error) {
        logger.error(`Falha crítica ao conectar com MongoDB: ${error.message}`);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('Conexão MongoDB fechada devido ao término da aplicação.');
    process.exit(0);
});

module.exports = connectDB;
