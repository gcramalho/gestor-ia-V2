// Configuração centralizada dos modelos de IA suportados
const SUPPORTED_MODELS = {
  // OpenAI Models
  'gpt-4': { name: 'GPT-4', provider: 'OpenAI', maxTokens: 8192 },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI', maxTokens: 128000 },
  'gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', maxTokens: 128000 },
  'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI', maxTokens: 128000 },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI', maxTokens: 4096 },
  'gpt-3.5-turbo-16k': { name: 'GPT-3.5 Turbo 16K', provider: 'OpenAI', maxTokens: 16384 },
  'gpt-3.5-turbo-instruct': { name: 'GPT-3.5 Turbo Instruct', provider: 'OpenAI', maxTokens: 4096 },
  
  // Anthropic Models
  'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'Anthropic', maxTokens: 200000 },
  'claude-3-haiku': { name: 'Claude 3 Haiku', provider: 'Anthropic', maxTokens: 200000 },
  'claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', maxTokens: 200000 },
  
  // Google Models
  'gemini-pro': { name: 'Gemini Pro', provider: 'Google', maxTokens: 32768 },
  'gemini-pro-vision': { name: 'Gemini Pro Vision', provider: 'Google', maxTokens: 32768 },
};

// Função para obter lista de modelos para o frontend
const getModelsForFrontend = () => {
  return Object.entries(SUPPORTED_MODELS).map(([value, config]) => ({
    value,
    label: config.name,
    provider: config.provider,
    maxTokens: config.maxTokens
  }));
};

// Função para validar se um modelo é suportado
const isModelSupported = (modelId) => {
  return SUPPORTED_MODELS.hasOwnProperty(modelId);
};

// Função para obter configuração de um modelo
const getModelConfig = (modelId) => {
  return SUPPORTED_MODELS[modelId] || null;
};

// Função para obter lista de valores para validação do Mongoose
const getModelValues = () => {
  return Object.keys(SUPPORTED_MODELS);
};

module.exports = {
  SUPPORTED_MODELS,
  getModelsForFrontend,
  isModelSupported,
  getModelConfig,
  getModelValues
}; 