const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');
const { format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

// Só inicializa o Supabase se as variáveis estiverem definidas
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
}

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

// Envio de logs para o Supabase
const supabaseTransport = {
    log: async (info, callback) => {
        if (!supabase) {
            callback();
            return;
        }
        
        try{
            const { error } = await supabase
            .from('system_logs')
            .insert({
                level: info.level,
                message: info.message,
                stack: info.stack,
                timestamp: info.timestamp,
                environments: process.env.NODE_ENV
            });

            if(error) throw error;
        } catch(err) {
            console.error('Falha ao enviar log para o Supabase:', err);
        } finally {
            callback();
        }
    }
};

if(process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.Transport({
        ...supabaseTransport,
        level: 'error'
    }));
}

// Funções adicionais
logger.logAction = async (action, userId, metadata = {}) => {
    if (!supabase) {
        return;
    }
    
    try {
        const { error } = await supabase
        .from('user_actions')
        .insert({
            action,
            user_id: userId,
            metadata: JSON.stringify(metadata),
            ip_address: metadata.ip,
            user_agent: metadata.userAgent
        });

        if(error) throw error;
    } catch(err) {
        logger.error(`Falha ao registrar ação: ${err.message}`);
    }
};

module.exports = logger;