# ======== Sistema de Gestão de Agentes de IA ===========

Plataforma completa para criar, configurar e gerenciar agentes de IA integrados com WhatsApp e outras plataformas de comunicação.

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Testes de Autenticação](#testes-de-autenticação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [APIs](#apis)
- [Autenticação](#autenticação)
- [Multi-tenancy](#multi-tenancy)
- [Deploy](#deploy)
- [Desenvolvimento](#desenvolvimento)
- [Troubleshooting](#troubleshooting)

## Visão Geral

Este sistema permite que empresas criem e gerenciem agentes de IA personalizados com:

- **Gestão de Agentes**: Criação e configuração de agentes com prompts, arquivos de contexto e configurações
- **Arquitetura Multi-tenant**: Gestão completa de empresas, usuários e controle de acesso por roles
- **Gestão de Usuários**: Sistema completo de autenticação com Supabase Auth e controle granular de permissões
- **Histórico**: Acompanhamento de conversas, métricas de uso e performance dos agentes
- **API REST**: Integração completa com autenticação via API Keys para sistemas externos

##  =========== Arquitetura ===========

### Padrão MVC
```
src/
├── controllers/     # Lógica de negócio
├── models/         # Modelos de dados (Mongoose)
├── routes/         # Definição de rotas
├── middlewares/    # Autenticação e autorização
├── utils/          # Utilitários (logger, helpers)
└── config/         # Configurações (database)
```

### Fluxo de Autenticação
1. **Login**: Supabase Auth → JWT Token → Middleware de autenticação
2. **API Externa**: API Key → Validação → Acesso ao agente
3. **Autorização**: Role-based access control (RBAC)

### Multi-tenancy
- Cada empresa tem seus próprios dados isolados
- Usuários vinculados a empresas específicas
- Admin Master pode acessar todas as empresas

## =========== Tecnologias ===========

### Backend
- **Node.js** (v18+)
- **Express.js** - Framework web
- **MongoDB** - Banco de dados principal
- **Mongoose** - ODM para MongoDB
- **Supabase** - Autenticação e autorização
- **JWT** - Tokens de acesso
- **Socket.io** - Comunicação em tempo real
- **Winston** - Logging estruturado

### Segurança
- **Helmet** - Headers de segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra ataques
- **bcrypt** - Criptografia de senhas

### Documentação
- **Swagger/OpenAPI** - Documentação da API

## ================= Instalação =====================

### Pré-requisitos
- Node.js v18 ou superior
- MongoDB v5 ou superior
- Conta no Supabase

### Passos:

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd projetoGestorIA
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com as configurações certas
```

4. **Gere as chaves JWT**
```bash
node generate-secrets.js
# Copie as chaves geradas para o .env
```

5. **Inicie o servidor**
```bash
npm start
# ou
node server.js
```

##  ===================== Configuração =====================

### VARIAVEIS DE AMBIENTE (.env) | ADAPTAR AO CONTEXTO

```env
# ===== BANCO DE DADOS =====
MONGODB_URI=mongodb://<usuario>:<senha>@mongo:27017/

# ===== SUPABASE =====
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_ANON_KEY=<sua-chave-anonima>
SUPABASE_SERVICE_KEY=<sua-chave-service>

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

### ===================== Configuração do Supabase =====================

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias:
   - `system_logs` (para logs)
   - `user_actions` (para auditoria)

3. Configure as políticas de segurança (RLS)

## ===================== Testes de Autenticação =====================

Para testar e diagnosticar problemas com a autenticação, especialmente o erro "Erro no Supabase: fetch failed", use os arquivos de teste incluídos:

### 🧪 Arquivos de Teste Disponíveis

1. **`test-auth.html`** - Interface web completa para testar registro e login
2. **`test-supabase.html`** - Interface específica para diagnóstico do Supabase
3. **`test-supabase.js`** - Script Node.js para testar configuração do Supabase
4. **`TESTE_AUTENTICACAO.md`** - Guia detalhado de testes

### 🚀 Como Testar

#### 1. Teste via Interface Web (Recomendado)
```bash
# Abra no navegador
open test-auth.html
# ou
open test-supabase.html
```

#### 2. Teste via Script Node.js
```bash
# Execute o script de teste
node test-supabase.js
```

### 🔧 Diagnóstico de Problemas

#### Erro "Erro no Supabase: fetch failed"

**Causas Possíveis:**
1. Variáveis de ambiente não configuradas
2. URL do Supabase incorreta
3. Chaves do Supabase incorretas
4. Projeto Supabase inativo
5. Problema de conectividade de rede

**Soluções:**
1. Execute `node test-supabase.js` para verificar configuração
2. Verifique se o projeto Supabase está ativo
3. Confirme se as chaves estão corretas
4. Teste a conectividade de rede

### 📋 Passos para Teste Completo

1. **Verificar Backend**
   - Certifique-se de que está rodando: `npm start`
   - Teste conectividade via `test-auth.html`

2. **Testar Registro**
   - Use dados de teste no formulário
   - Verifique se retorna sucesso

3. **Testar Login**
   - Use credenciais válidas
   - Verifique se gera tokens

4. **Testar Endpoints Protegidos**
   - Use o token para acessar `/api/auth/me`

Para mais detalhes, consulte o arquivo `TESTE_AUTENTICACAO.md`.

## ===================== ESTRUTURA DO PROJETO =====================

```
projetoGestorIA/
├── src/
│   ├── config/
│   │   └── database.js          # Conexão MongoDB
│   ├── controllers/
│   │   ├── admin/               # Controladores para admin_master
│   │   │   ├── agenteAdminController.js
│   │   │   ├── empresaAdminController.js
│   │   │   └── usuarioAdminController.js
│   │   ├── empresa/             # Controladores para empresas
│   │   │   ├── agenteEmpresaController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── empresaConfigController.js
│   │   │   └── usuarioEmpresaController.js
│   │   ├── authController.js    # Autenticação
│   │   └── apiController.js     # API externa
│   ├── middlewares/
│   │   └── auth.js              # Autenticação e autorização
│   ├── models/
│   │   ├── Agente.js            # Modelo do agente
│   │   ├── ArquivoAgente.js     # Arquivos do agente
│   │   ├── Conversa.js          # Histórico de conversas
│   │   ├── Empresa.js           # Modelo da empresa
│   │   └── Usuario.js           # Modelo do usuário
│   ├── routes/
│   │   ├── admin.js             # Rotas administrativas
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── empresa.js           # Rotas da empresa
│   │   └── api.js               # API externa
│   └── utils/
│       ├── errorHandler.js      # Tratamento de erros
│       ├── helpers.js           # Funções auxiliares
│       ├── logger.js            # Sistema de logs
│       ├── responseHelper.js    # Padronização de respostas
│       └── swagger.js           # Documentação da API
├── logs/                        # Arquivos de log
├── app.js                       # Configuração Express
├── server.js                    # Ponto de entrada
├── test-auth.html              # Interface de teste de autenticação
├── test-supabase.html          # Interface de diagnóstico do Supabase
├── test-supabase.js            # Script de teste do Supabase
├── generate-secrets.js         # Gerador de chaves JWT
├── env.example                 # Exemplo de variáveis de ambiente
├── TESTE_AUTENTICACAO.md       # Guia de testes
└── package.json
```

## APIs

### Base URL
```
http://localhost:5000/api
```

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "nomeEmpresa": "Minha Empresa",
  "emailEmpresa": "empresa@example.com",
  "telefoneEmpresa": "(11) 99999-9999",
  "nomeUsuario": "João Silva",
  "emailUsuario": "joao@empresa.com",
  "senha": "senha123"
}
```

### Empresas (Admin Master)

#### Listar Empresas
```http
GET /api/empresas
Authorization: Bearer <jwt-token>
```

#### Criar Empresa
```http
POST /api/empresas
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "nome": "Nova Empresa",
  "email": "empresa@example.com",
  "telefone": "(11) 99999-9999",
  "limite_agentes": 50
}
```

### Agentes (Empresa)

#### Listar Agentes
```http
GET /api/empresa/agentes
Authorization: Bearer <jwt-token>
```

#### Criar Agente
```http
POST /api/empresa/agentes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "nome": "Agente de Vendas",
  "descricao": "Agente especializado em vendas",
  "prompt_base": "Você é um assistente de vendas...",
  "configuracoes": {
    "modelo": "gpt-4",
    "temperatura": 0.7,
    "max_tokens": 1000
  }
}
```

### API Externa

#### Enviar Mensagem
```http
POST /api/v1/conversations
x-api-key: <api-key-do-agente>
Content-Type: application/json

{
  "prompt": "Olá, preciso de ajuda",
  "userIdentifier": "+5511999999999",
  "userName": "João Silva"
}
```

### ===================== Documentação =====================
Acesse: `http://localhost:5000/api-docs` (desenvolvimento)

## AUTENTICAÇÃO

### Tipos de Autenticação

   **JWT (Usuários)**
   - Header: `Authorization: Bearer <token>`
   - Usado para acesso ao painel administrativo

   **API Key (Agentes)**
   - Header: `x-api-key: <api-key>`
   - Usado para integrações externas

- **Usuários internos**: JWT + Supabase Auth
- **APIs externas**: API Keys por agente
- **Roles**: admin_master, admin_empresa, user_empresa

### Papéis (Roles)

- **admin_master**: Acesso total ao sistema
- **admin_empresa**: Administrador da empresa
- **user_empresa**: Usuário comum da empresa

### Fluxo de Autenticação

    A[Login] --> B[Supabase Auth]
    B --> C[Gerar JWT]
    C --> D[Middleware Auth]
    D --> E[Verificar Role]
    E --> F[Acesso Permitido]

## Multi-tenancy

### Isolamento de Dados

Cada empresa tem seus dados completamente isolados:

```javascript
// Buscar agentes da empresa do usuário
const agentes = await Agente.find({ 
  empresa_id: req.user.empresa_id 
});
```

### APIs Principais
- `/api/auth/*` - Autenticação
- `/api/empresa/*` - Gestão da empresa
- `/api/admin/*` - Administração (admin_master)
- `/api/v1/conversations` - API externa

### Lógica

```
Empresa
├── Usuários
│   ├── admin_empresa
│   └── user_empresa
├── Agentes
│   ├── Configurações
│   ├── Arquivos
│   └── Conversas
└── Configurações
```

## ===================== Deploy =====================

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "27017:27017"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongoadmin:secreto@localhost:27017/
      - MONGO_INITDB_ROOT_USERNAME=mongoadmin
      - MONGO_INITDB_ROOT_PASSWORD=secreto
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### ===================== Variáveis de Produção =====================

```env
NODE_ENV=production
MONGODB_URI=mongodb://<usuario>:<senha>@mongo:27017/
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_ANON_KEY=<sua-chave-anonima>
SUPABASE_SERVICE_KEY=<sua-chave-service>
JWT_SECRET=<seu-jwt-secret>
JWT_REFRESH_SECRET=<seu-refresh-secret>
CLIENT_URL=https://<seu-frontend>.com
```

## ===================== Desenvolvimento =====================

### Scripts

```bash
npm start          # Inicia o servidor
npm run dev        # Inicia em modo desenvolvimento
npm run test       # Executa testes (futuro)
npm run lint       # Verifica código (futuro)
```

###  ===================== Estrutura dos Logs =====================

```
logs/
├── application-2025-06-22.log    # Logs da aplicação
├── exceptions.log                # Exceções não tratadas
└── rejections.log                # Promises rejeitadas
```

### ===================== WebSocket =====================

O sistema suporta comunicação em tempo real via Socket.io:

```javascript
// Conectar ao WebSocket
const socket = io('http://localhost:5000');

// Entrar em uma conversa
socket.emit('join_conversation', 'conversation-id');

// Receber mensagens em tempo real
socket.on('message', (data) => {
  console.log('Nova mensagem:', data);
});
```

### ===================== Troubleshooting =====================

### Tratamento Problemas Comuns

#### 1. Erro de Conexão MongoDB
```
Error: connectDB is not a function
```
**Solução**: Verificar se o MongoDB está rodando e a URI está correta.

#### 2. Erro de Autenticação Supabase
```
Error: Token inválido ou expirado
```
**Solução**: Verificar as chaves do Supabase no .env.

#### 3. Erro de CORS
```
Error: CORS policy
```
**Solução**: Verificar se CLIENT_URL está configurado corretamente.

#### 4. Erro de Rate Limiting
```
Error: Muitas requisições
```
**Solução**: Aguardar 15 minutos ou ajustar limites no código.

### Logs de Debug

- Logs em `logs/` directory
- Swagger UI em `/api-docs`
- Health check em `/api/health`
- Métricas em Prometheus/Grafana

- Verificar logs da aplicação
- Verificar conectividade com MongoDB
- Verificar configurações do Supabase
- Verificar variáveis de ambiente

Para debug detalhado, configure:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Health Check

```http
GET /api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-22T16:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

## ===================== EM ABERTO =====================

### Infraestrutura
- [ ] Configurar ambiente de produção
- [ ] Configurar monitoramento (Prometheus/Grafana)
- [ ] Configurar backup automático do MongoDB
- [ ] Configurar CDN para arquivos
- [ ] Configurar SSL/TLS

### Front-end
- [ ] Implementar tela de login/registro
- [ ] Implementar dashboard administrativo
- [ ] Implementar gestão de agentes
- [ ] Implementar histórico de conversas
- [ ] Implementar configurações de empresa

### Back-end Melhorias
- [ ] Implementar upload de arquivos
- [ ] Implementar notificações push
- [ ] Implementar testes automatizados
- [ ] Implementar serviço real de IA
- [ ] Implementar métricas avançadas

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2025  
**Mantido por**: Equipe de Desenvolvimento 