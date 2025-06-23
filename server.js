require('dotenv').config();
// const { Methods } = require('openai/resources/fine-tuning.js');
const app = require('./app.js');
const connectDB = require('./src/config/database.js');
const logger = require('./src/utils/logger.js');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Configuração porta
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Servidor HTTP
const httpServer = createServer(app);

// Websocket para conversas em tempo real
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', //mudar para o URL do cliente
        methods: ['GET', 'POST']
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, //2 minutos
        skipMiddlewares: true
    }
});

// Injeta io no app para uso nos conrollers
app.set('io', io);

// Manipula eventos WebSocket
io.on('connection', (socket) => {
    logger.info(`Novo cliente conectado: ${socket.id}`);

    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        logger.info(`Cliente ${socket.id} entrou na conversa ${conversationId}`);
    });
});

// Função iniciar servidor
const startServer = async () => {
    try {
        // Conecta ao banco de dados
        await connectDB();

        // Inicia o servidor
        httpServer.listen(PORT, () => {
            logger.info(`
VV    VV EEEEEE   CCCCC   TTTTTTT   AAAA
 VV  VV  EE      CC         TTT    AA  AA
  VVVV   EEEEEE  CC         TTT    AAAAAA
   VV    EE      CC         TTT    AA  AA
   VV    EEEEEE   CCCCC     TTT    AA  AA

    Modo: ${NODE_ENV}
    URL: http://localhost:${PORT}
    MongoDB: ${process.env.MONGODB_URI}
    `);
        });

    // Tratadores de erros globais
    process.on('unhandledRejection', (err) => {
        logger.error(`Erro não tratado: ${err.message}`);
        httpServer.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
        logger.info('SIGTERM recebido. Encerrando servidor...');
        httpServer.close(() => {
            logger.info('Servidor encerrado.');
            process.exit(0);
        });
    });

    } catch (error) {
        logger.error(`Falha ao iniciar o servidor: ${error.message}`);
        process.exit(1);
    }
};

// Iniciar aplicação
startServer();