require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./src/utils/errorHandler');
const { default: mongoose } = require('mongoose');
const logger = require('./src/utils/logger');

// Inicialização do Express
const app = express();

// Middlewares padrão
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? true  // Permite todas as origens em desenvolvimento
        : process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(helmet());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging personalizado ambiente dev
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rate Limiting (100 requests a cada 15 minutos)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Muitas requisições desse IP, tente novamente em 15 minutos.'
    }
});

app.use('/api', limiter);

// Checar saúde - DEVE vir ANTES das outras rotas para não ser interceptada pelos middlewares de autenticação
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Rotas
const authRoutes = require('./src/routes/auth');
const empresaRoutes = require('./src/routes/empresa');
const adminRoutes = require('./src/routes/admin');
const apiRoutes = require('./src/routes/api');

app.use('/api/auth', authRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1', apiRoutes); // Mudado para /api/v1 para não interceptar outras rotas

// Documentação Swagger
if(process.env.NODE_ENV === 'development'){
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./src/utils/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Tratamento de erros
app.use(notFound);
app.use(errorHandler);

// Exporta app configurado
module.exports = app;