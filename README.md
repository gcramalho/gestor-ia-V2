# 🤖 Sistema de Gestão de Agentes de IA

Plataforma completa para criar, configurar e gerenciar agentes de IA integrados com WhatsApp e outras plataformas de comunicação.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-blue.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1+-black.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [APIs](#apis)
- [Deploy](#deploy)
- [Desenvolvimento](#desenvolvimento)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Este sistema permite que empresas criem e gerenciem agentes de IA personalizados com:

- **Gestão de Agentes**: Criação e configuração de agentes com prompts, arquivos de contexto e configurações
- **Arquitetura Multi-tenant**: Gestão completa de empresas, usuários e controle de acesso por roles
- **Sistema de Autenticação**: JWT com refresh tokens e controle granular de permissões
- **Histórico de Conversas**: Acompanhamento completo com WebSocket em tempo real
- **API REST**: Integração completa com autenticação via API Keys para sistemas externos
- **WhatsApp Integration**: Preparado para integração com WhatsApp Business API

## ARQUITETURA 

### Padrão MVC
```
src/
├── controllers/     # Lógica de negócio
│   ├── admin/      # Controllers para admin_master
│   ├── empresa/    # Controllers para empresas
│   ├── authController.js
│   └── apiController.js
├── models/         # Modelos de dados (Mongoose)
│   ├── Usuario.js
│   ├── Empresa.js
│   ├── Agente.js
│   ├── Conversa.js
│   └── ArquivoAgente.js
├── routes/         # Definição de rotas
├── middlewares/    # Autenticação e autorização
├── utils/          # Utilitários (logger, helpers)
└── config/         # Configurações (database)
```

### Fluxo de Autenticação
1. **Login**: JWT Token → Middleware de autenticação
2. **API Externa**: API Key → Validação → Acesso ao agente
3. **Autorização**: Role-based access control (RBAC)

### Multi-tenancy
- Cada empresa tem seus próprios dados isolados
- Usuários vinculados a empresas específicas
- Admin Master pode acessar todas as empresas


#### Roles e Permissões
- **`admin_master`**: Acesso total ao sistema
  - Pode gerenciar todas as empresas
  - Pode criar/editar/deletar usuários
  - Pode acessar todos os agentes
  - Pode ver estatísticas globais

- **`admin_empresa`**: Administrador da empresa
  - Pode gerenciar usuários da empresa
  - Pode criar/editar/deletar agentes
  - Pode ver dashboard da empresa
  - Pode configurar empresa

- **`user_empresa`**: Usuário comum
  - Pode visualizar agentes
  - Pode ver conversas
  - Pode usar chat
  - Acesso limitado a dados da empresa


### TIPOS DE AUTENTICAÇÃO
#### 1. JWT (Usuários Internos)
```javascript
// Header para todas as requisições autenticadas
Authorization: Bearer <access_token>

// Exemplo de resposta do login
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "papel": "admin_empresa",
      "empresa_id": "507f1f77bcf86cd799439012"
    }
  }
}
```

#### 2. API Key (Integrações Externas)
```javascript
// Header para APIs externas
x-api-key: <api_key_do_agente>

// Exemplo de uso
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'abc123def456...'
  },
  body: JSON.stringify({
    mensagem: 'Olá, preciso de ajuda',
    clienteTelefone: '+5511999999999'
  })
})
```

### Refresh Token
```javascript
// Renovar access token
POST /api/auth/refresh
{
  "token": "<refresh_token>"
}

// Resposta
{
  "success": true,
  "data": {
    "accessToken": "novo_access_token",
    "refreshToken": "novo_refresh_token"
  }
}

## 🛠️ Tecnologias

### Backend
- **Node.js** (v18+)
- **Express.js** - Framework web
- **MongoDB** - Banco de dados principal
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Socket.io** - Comunicação em tempo real
- **Winston** - Logging estruturado

### Segurança
- **Helmet** - Headers de segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra ataques
- **bcrypt** - Criptografia de senhas

### Documentação e Monitoramento
- **Swagger/OpenAPI** - Documentação da API
- **Prometheus** - Monitoramento
- **Docker** - Containerização

## 🚀 Instalação

### Pré-requisitos
- Node.js v18 ou superior
- MongoDB v5 ou superior
- Docker (opcional, para deploy)

### Passos:

1. **Clone o repositório**
```bash
git clone https://github.com/gcramalho/gestor-ia-V2.git
cd projetoGestorIA
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com as configurações
```

4. **Gere as chaves JWT**
```bash
npm run generate-secrets
# Copie as chaves geradas para o .env
```

5. **Inicie o servidor**
```bash
npm start
# ou para desenvolvimento
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# ===== BANCO DE DADOS =====
MONGODB_URI=mongodb://localhost:27017/gestor_ia

# ===== JWT =====
JWT_SECRET=<seu-jwt-secret>
JWT_REFRESH_SECRET=<seu-refresh-secret>

# ===== APLICAÇÃO =====
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# ===== SERVIÇOS EXTERNOS =====
# OpenAI API Key (futuro)
OPENAI_API_KEY=<sua-chave-openai>
# WhatsApp Business API (futuro)
WHATSAPP_API_KEY=<sua-chave-whatsapp>
```

### Roles do Sistema
- **`admin_master`**: Acesso total ao sistema
- **`admin_empresa`**: Gerencia sua empresa
- **`user_empresa`**: Usuário comum da empresa

## 📖 Uso

### 1. Registro de Empresa
```bash
POST /api/auth/register
{
  "nome": "Minha Empresa",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 99999-9999",
  "email": "admin@empresa.com",
  "senha": "senha123"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "admin@empresa.com",
  "senha": "senha123"
}
```

### 3. Criar Agente
```bash
POST /api/empresa/agentes
{
  "nome": "Agente de Vendas",
  "descricao": "Agente especializado em vendas",
  "prompt": "Você é um agente de vendas...",
  "modelo": "gpt-3.5-turbo",
  "temperatura": 0.7
}
```

### 4. Chat com Agente
```bash
POST /api/chat
{
  "agenteId": "agente_id",
  "mensagem": "Olá, preciso de ajuda",
  "clienteTelefone": "11999999999"
}
```

## 🔌 APIs

### Endpoints Principais

#### Autenticação
```
POST   /api/auth/register          # Registrar empresa
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh token
GET    /api/auth/me                # Dados do usuário
POST   /api/auth/logout            # Logout
POST   /api/auth/alterar-senha     # Alterar senha
```

#### Admin Master
```
GET    /api/admin/empresas         # Listar empresas
POST   /api/admin/empresas         # Criar empresa
GET    /api/admin/usuarios         # Listar usuários
GET    /api/admin/agentes          # Listar agentes
```

#### Empresa
```
GET    /api/empresa/agentes        # Agentes da empresa
POST   /api/empresa/agentes        # Criar agente
PUT    /api/empresa/agentes/:id    # Atualizar agente
DELETE /api/empresa/agentes/:id    # Deletar agente
GET    /api/empresa/dashboard      # Dashboard
GET    /api/empresa/config         # Configurações
```

#### API Externa
```
POST   /api/chat                   # Chat com agente
GET    /api/conversas/:id          # Histórico de conversa
GET    /api/health                 # Health check
```

### Documentação Swagger
Acesse `/api-docs` para documentação interativa da API.

## 🐳 Deploy

### Docker Compose (Recomendado)

1. **Clone e configure**
```bash
git clone <repositorio>
cd projetoGestorIA
cp env.example .env
```

2. **Configure as variáveis**
```bash
npm run generate-secrets
# Edite .env com suas configurações
```

3. **Deploy**
```bash
docker-compose up -d
```

### Deploy Manual

1. **Configure o servidor**
```bash
# Instale Node.js e MongoDB
sudo apt update
sudo apt install nodejs npm mongodb

# Clone o projeto
git clone <repositorio>
cd projetoGestorIA
npm install
```

2. **Configure PM2**
```bash
npm install -g pm2
pm2 start server.js --name "gestor-ia"
pm2 startup
pm2 save
```

## 🧪 Testes

### Frontend de Teste
O projeto inclui um frontend de teste completo:

```bash
# Abra no navegador
open frontend-test.html
```
```

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento com nodemon
npm run lint       # Linting do código
npm run format     # Formatação com Prettier
npm run test       # Executa testes
npm run migrate    # Migração de dados ()
```

### Estrutura de Desenvolvimento
```
src/
├── controllers/   # Lógica de negócio
├── models/        # Modelos MongoDB
├── routes/        # Definição de rotas
├── middlewares/   # Middlewares
├── utils/         # Utilitários
└── config/        # Configurações
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão MongoDB
```bash
# Verifique se o MongoDB está rodando
sudo systemctl status mongodb

# Verifique a URI no .env
MONGODB_URI=mongodb://localhost:27017/gestor_ia
```

#### 2. Erro de Autenticação JWT
```bash
# Regenerate JWT secrets
npm run generate-secrets

# Verifique as variáveis no .env
JWT_SECRET=<seu-jwt-secret>
JWT_REFRESH_SECRET=<seu-refresh-secret>
```

#### 3. Erro de CORS
```bash
# Verifique CLIENT_URL no .env
CLIENT_URL=http://localhost:3000
```

#### 4. Rate Limiting
```bash
# Aumente o limite se necessário
# Em app.js, linha ~40
max: 100, // Aumente este valor
```

### Logs
Os logs são salvos em `logs/` com rotação diária:
- `logs/error.log` - Erros
- `logs/combined.log` - Todos os logs
- `logs/access.log` - Acessos HTTP

## 📄 Licença

Este projeto está sob a licença ISC.

---
