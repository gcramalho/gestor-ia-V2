const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    
    console.log('API Request Debug:', {
      endpoint,
      url,
      tokenPresent: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    console.log('Request config:', {
      method: config.method || 'GET',
      headers: config.headers,
      hasAuth: !!config.headers.Authorization,
      body: options.body ? JSON.parse(options.body) : null
    });

    try {
      const response = await fetch(url, config)

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('Response data:', responseData);
      return responseData
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // ========== AUTENTICAÇÃO ==========
  async login(email, senha) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    })
  }

  async register(empresaData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(empresaData),
    })
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    })
  }

  async getMe() {
    return this.request("/auth/me")
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async alterarSenha(senhaAtual, novaSenha) {
    return this.request("/auth/alterar-senha", {
      method: "POST",
      body: JSON.stringify({ senhaAtual, novaSenha }),
    })
  }

  // ========== EMPRESA - AGENTES ==========
  async getAgentes() {
    return this.request("/empresa/agentes")
  }

  async getAgente(id) {
    return this.request(`/empresa/agentes/${id}`)
  }

  async createAgente(agenteData) {
    // Mapear campos do frontend para backend
    const backendData = {
      nome: agenteData.name,
      descricao: agenteData.description || 'Agente de IA configurado pelo usuário',
      prompt_base: agenteData.systemPrompt,
      instrucoes: agenteData.instructions || '',
      configuracoes: {
        modelo: agenteData.model || 'gpt-3.5-turbo',
        temperatura: agenteData.temperature || 0.7,
        max_tokens: agenteData.maxTokens || 1000,
        top_p: agenteData.topP || 0.9,
        frequency_penalty: agenteData.frequencyPenalty || 0,
        presence_penalty: agenteData.presencePenalty || 0,
        stop_sequences: agenteData.stopSequences || [],
      },
      status: agenteData.status !== false, // Default true se não especificado
    }

    console.log('Dados do agente a serem enviados:', backendData);

    return this.request("/empresa/agentes", {
      method: "POST",
      body: JSON.stringify(backendData),
    })
  }

  async updateAgente(id, agenteData) {
    // Mapear campos do frontend para backend
    const backendData = {
      nome: agenteData.name,
      descricao: agenteData.description || 'Agente de IA configurado pelo usuário',
      prompt_base: agenteData.systemPrompt,
      instrucoes: agenteData.instructions || '',
      configuracoes: {
        modelo: agenteData.model || 'gpt-3.5-turbo',
        temperatura: agenteData.temperature || 0.7,
        max_tokens: agenteData.maxTokens || 1000,
        top_p: agenteData.topP || 0.9,
        frequency_penalty: agenteData.frequencyPenalty || 0,
        presence_penalty: agenteData.presencePenalty || 0,
        stop_sequences: agenteData.stopSequences || [],
      },
      status: agenteData.status !== false, // Default true se não especificado
    }

    console.log('Dados do agente a serem atualizados:', backendData);

    return this.request(`/empresa/agentes/${id}`, {
      method: "PUT",
      body: JSON.stringify(backendData),
    })
  }

  async deleteAgente(id) {
    return this.request(`/empresa/agentes/${id}`, {
      method: "DELETE",
    })
  }

  // ========== EMPRESA - DASHBOARD ==========
  async getDashboard() {
    return this.request("/empresa/dashboard")
  }

  async getConfig() {
    return this.request("/empresa/config")
  }

  // ========== CHAT ==========
  async sendMessage(agenteId, mensagem, clienteTelefone) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({
        agenteId,
        mensagem,
        clienteTelefone,
      }),
    })
  }

  async getConversa(id) {
    return this.request(`/conversas/${id}`)
  }

  // ========== ADMIN (se necessário) ==========
  async getEmpresas() {
    return this.request("/admin/empresas")
  }

  async getUsuarios() {
    return this.request("/admin/usuarios")
  }

  async getAllAgentes() {
    return this.request("/admin/agentes")
  }

  // ========== HEALTH CHECK ==========
  async healthCheck() {
    return this.request("/health")
  }

  // ========== MODELOS ==========
  async getModels() {
    return this.request("/empresa/models")
  }
}

export const apiService = new ApiService()
