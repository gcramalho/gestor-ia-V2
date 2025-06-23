const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API do Gestor de Agentes de IA',
    version: '1.0.0',
    description: 'Documentação da API REST para o sistema de gestão de agentes de IA. A API permite criar, configurar e gerenciar agentes, empresas e usuários.',
    contact: {
      name: 'Suporte',
      email: 'suporte@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}/api`,
      description: 'Servidor de Desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de acesso JWT para autenticação de usuário.'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Chave de API para autenticação de agentes em integrações externas.'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  // Caminho para os arquivos que contêm as anotações da API (JSDoc)
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 