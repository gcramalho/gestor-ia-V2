class ResponseHelper {
  static success(res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    // inclui metadados de paginação se existir
    if (data?.pagination) {
      response.pagination = data.pagination;
      delete data.pagination;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Erro interno do servidor', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    // Filtra detalhes sensiveis em produção
    if (process.env.NODE_ENV === 'production' && errors) {
      delete response.errors.stack;
      delete response.errors.fullError;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'Recurso criado com sucesso') {
    return this.success(res, data, message, 201);
  }

  static serverError(res, error, message = 'Erro interno do servidor') {
    const errorDetails = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    return this.error(res, message, 500, errorDetails);
  }

  static paginated(
    res,
    data,
    totalItems,
    currentPage,
    pageSize,
    message = 'Dados paginados retornados com sucesso'
  ) {
    const totalPages = Math.ceil(totalItems / pageSize);

    return ResponseHelper.success(
      res,
      {
        data,
        pagination: {
          totalItems,
          totalPages,
          currentPage,
          pageSize,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      },
      message
    );
  }

  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} não encontrado`, 404);
  }

  static unauthorized(res, message = 'Não autorizado') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Acesso negado') {
    return this.error(res, message, 403);
  }

  static conflict(res, message = 'Conflito de dados') {
    return this.error(res, message, 409);
  }

  static badRequest(res, message = 'Requisição inválida', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static rateLimitExceeded(res){
    return this.error(
        res,
        'Houve muitas requisições. Por favor, tente novamente mais tarde.',
        429
    );
  }
}

module.exports = ResponseHelper;