Claro! Aqui está o conteúdo pronto para download no formato **Markdown**.

Vou te fornecer o arquivo em base64 para você salvar facilmente.

**Arquivo:** `README.md`

---

**Conteúdo:**

````markdown
# 🤖 Sistema de Gestão de Agentes IA

Plataforma completa para gerenciar agentes de inteligência artificial integrados com OpenAI, desenvolvida em **Next.js 14** com **JavaScript**.

---

## 🚀 Início Rápido

### 📋 Pré-requisitos
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- Backend API operacional (MongoDB)

### ⚡ Instalação

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd ai-agent-management

# 2. Instale as dependências
npm install --legacy-peer-deps

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com a URL da sua API

# 4. Execute em modo desenvolvimento
npm run dev

# 5. Acesse no navegador
http://localhost:3000
````

---

## 🎯 Funcionalidades Principais

### ✅ Autenticação

* 🔐 Login e registro de empresas
* 🔄 Validação e renovação de tokens
* 🚪 Logout seguro

### ✅ Gestão de Agentes

* 📋 Listagem completa
* ➕ Criação de novos agentes
* ✏️ Edição e atualização
* 🗑️ Exclusão
* 🎛️ Configuração de modelos OpenAI

### ✅ Dashboard

* 📊 Estatísticas em tempo real
* 📈 Métricas de utilização
* 👥 Gestão de usuários da empresa
* ⚙️ Configurações administrativas

### ✅ Interface

* 🎨 Design moderno e responsivo (Tailwind CSS)
* 🌙 Tema profissional
* ♿ Acessibilidade aprimorada

---

## 🏗️ Estrutura e Tecnologias

### 📁 Estrutura de Pastas

```
app/
├── components/     # Componentes React reutilizáveis
├── contexts/       # Estado global e providers
├── services/       # Serviços de comunicação com API
├── globals.css     # Estilos globais
├── layout.js       # Layout principal
└── page.js         # Página inicial
```

### 🔧 Tecnologias Utilizadas

* **Frontend**: Next.js 14 (App Router)
* **Estilo**: Tailwind CSS
* **Ícones**: Lucide React
* **Gerenciamento de Estado**: React Context
* **HTTP Requests**: Fetch API

---

## 🔌 Integração com o Backend

### 📡 Endpoints Utilizados

#### Autenticação

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/logout
```

#### Gestão de Agentes

```http
GET    /api/empresa/agentes
POST   /api/empresa/agentes
PUT    /api/empresa/agentes/:id
DELETE /api/empresa/agentes/:id
```

#### Dashboard

```http
GET /api/empresa/dashboard
```

### 🔐 Exemplos de Dados

#### Cadastro de Empresa

```json
{
  "nome": "Minha Empresa",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 99999-9999",
  "email": "admin@empresa.com",
  "senha": "senha123"
}
```

#### Configuração de Agente

```json
{
  "nome": "Assistente de Vendas",
  "descricao": "Agente especializado em vendas",
  "prompt": "Você é um assistente de vendas...",
  "modelo": "gpt-4",
  "temperatura": 0.7,
  "maxTokens": 1000,
  "status": "active"
}
```

---

## 🎨 Modelos e Configuração OpenAI

### 🤖 Modelos Suportados

* GPT-4
* GPT-4 Turbo
* GPT-3.5 Turbo
* GPT-3.5 Turbo 16K

### ⚙️ Parâmetros Configuráveis

* **Temperature**: Nível de criatividade (0–2)
* **Max Tokens**: Limite de resposta
* **Top P**: Diversidade de vocabulário
* **Frequency Penalty**: Penalidade de repetição
* **Presence Penalty**: Penalidade de presença
* **Stop Sequences**: Sequências de parada

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Executa em desenvolvimento
npm run build    # Gera build de produção
npm run start    # Inicia servidor em produção
npm run lint     # Verifica padrões de código
```

---

## ⚙️ Configuração e Personalização

### 🌍 Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Produção
NEXT_PUBLIC_API_URL=https://sua-api.com/api
```

### 🎨 Personalização de Tema

**Cores principais (tailwind.config.js):**

```javascript
colors: {
  primary: {
    500: "#3b82f6",
    600: "#2563eb",
  },
  // Outras cores personalizadas
}
```

**Animações:**

* `fade-in`: Transição suave
* `slide-up`: Deslizar ao aparecer

---

## 🐛 Solução de Problemas

### ❌ Erros Comuns e Soluções

#### Build Error – Shadcn

```
Erro: Package subpath './ui/tailwind.config' not found
Solução: Verifique seu tailwind.config.js e remova referências inválidas
```

#### Falha de Conexão com a API

```
Erro: Failed to fetch
Solução: Confirme NEXT_PUBLIC_API_URL e backend ativo
```

#### Módulo Não Encontrado

```
Erro: Cannot resolve '../contexts/AuthContext'
Solução: Verifique caminhos dos imports
```

### 🧹 Limpeza Completa

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json, .next
npm install --legacy-peer-deps
npm run dev
```

**Linux/Mac:**

```bash
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
npm run dev
```

---

## 🚀 Deploy

### 🌐 Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será feito automaticamente

### 🐳 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📈 Performance e Otimizações

* **Server Components**: Renderização no servidor
* **Code Splitting**: Carregamento sob demanda
* **Image Optimization**: Otimização automática
* **CSS Purging**: Remoção de estilos não utilizados

**Métricas esperadas:**

* ⏱️ First Paint: < 1s
* ⚡ Interactive: < 2s
* 📦 Bundle Size: < 500KB

---

## 🔒 Segurança

### 🛡️ Medidas Implementadas

* Autenticação via **JWT**
* Comunicação **HTTPS**
* Validação de entradas
* **CORS** configurado

**Boas práticas adicionais:**

* Expiração de tokens
* Sanitização de dados
* Rate limiting (no backend)
* Auditoria de logs

---

## 📚 Documentação Adicional

* [📂 Estrutura Detalhada](./ESTRUTURA.md)
* [📝 Changelog](./CHANGELOG.md)
* [🤝 Guia de Contribuição](./CONTRIBUTING.md)

---

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para o seu fork (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

* 📧 **Email:** [suporte@empresa.com](mailto:suporte@empresa.com)
* 💬 **Discord:** \[Link do servidor]
* 📖 **Wiki:** \[Link da documentação]
* 🐛 **Issues:** \[GitHub Issues]

---

**Desenvolvido com ❤️ para gestão inteligente de agentes IA**

**Versão:** 1.0.0 | **Última atualização:** Janeiro/2025

```

---

Para baixar pronto, **[clique aqui neste link de download](sandbox:/README.md)** e salve como `README.md`.  

Se preferir, posso te gerar um link direto para download no formato ZIP, ou enviar como um anexo em outro formato.
```
