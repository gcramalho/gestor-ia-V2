const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const ResponseHelper = require('./responseHelper');

// Só inicializa o Supabase se as variáveis estiverem definidas
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY    
    );
}

class ErrorHandler {
    static async logErrorToDatabase(error, req) {
        try{
            const { data, error: dbError } = await supabase
            .from('error_logs')
            .insert({
                error_name: error.name,
                error_message: error.message,
                stack_trace: error.stack,
                route: req?.originalUrl,
                method: req?.method,
                user_id: req?.user?.id,
                user_agent: req?.headers['user-agent'],
                ip_address: req?.ip,
                environment: process.env.NODE_ENV
            });

            if(dbError) throw dbError;
        } catch(loggingError) {
            logger.error(`Falha ao registrar erro no banco: ${loggingError.message}`);
        }
    }

     static developmentErrors(err, res) {
        return ResponseHelper.error(
            res,
            err.message,
            err.statusCode || 500,
            {
                stack: err.stack,
                fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
            }
        );
    }

    static productionErrors(err, res) {
        // erros operacionais conhecidos
        if(err.isOperational){
            return ResponseHelper.error(
                res,
                err.message,
                err.statusCode
            );
        }

        // erros de biblioteca/desconhecidos
        logger.error(`ERRO CRITICO: ${err.message}`);
        return ResponseHelper.error(
            res,
            'Algo deu muito errado. Nossa equipe foi notificada.',
            500
        );
    }

    static handleJWTError(){
        return new AppError('Token inválido. Por favor, faça login novamente.', 401);
    }

    static handleJWTExpiredError() {
        return new AppError('Seu token expirou. Por favor, faça login novamente.', 401);
    }

    static handleDBValidationError(err){
        const errors = Object.values(err.errors).map(el => ({
            field: el.path,
            message: el.message
        }));

        return new AppError('Dados de entrada inválidos', 400, errors);
    }

    static handleDBDuplicateError(err) {
        const field = Object.keys(err.keyPattern)[0];
        
        return new AppError(`${field} já está em uso. Por favor, use outro valor.`, 400);
    }

    static handleDBCastError(){
        return new AppError('Recurso não encontrado. ID inválido.', 404);
    }
}

// Classe de erro personalizado
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para capturar requisições a rotas não existentes (erro 404).
 */
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware para tratamento de erros genéricos.
 * Ele captura qualquer erro que ocorra na aplicação.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Loga o erro
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Em modo de produção, não expõe o stack trace do erro.
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
  });
};

// Middleware principal
module.exports = {
    notFound,
    errorHandler,
    AppError,
    asyncError: fn => (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
};