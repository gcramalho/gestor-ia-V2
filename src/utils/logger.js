const winston = require('winston');
const { format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

const consoleFormat = format.combine(
    format.colorize(),
    format.printf(
        ({ level, message, timestamp, stack }) =>
            `${timestamp} ${level}: ${message} ${stack || ''}`
    )
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        new transports.Console({
            format: consoleFormat
        }),
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ],

    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
    ]
});

// Função para registrar ações do usuário (opcional - pode ser implementada com MongoDB)
logger.logAction = async (action, userId, metadata = {}) => {
    try {
        // Aqui você pode implementar o log de ações no MongoDB se necessário
        // Por exemplo, criar uma coleção 'user_actions' no MongoDB
        logger.info(`User Action: ${action}`, {
            userId,
            metadata,
            timestamp: new Date()
        });
    } catch(err) {
        logger.error(`Falha ao registrar ação: ${err.message}`);
    }
};

module.exports = logger;