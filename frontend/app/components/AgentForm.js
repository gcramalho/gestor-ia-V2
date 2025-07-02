"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Bot, MessageSquare, Sliders } from "lucide-react"
import { apiService } from "../services/apiService"

// Modelos padrão caso a API não esteja disponível (apenas OpenAI)
const DEFAULT_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-3.5-turbo-16k", label: "GPT-3.5 Turbo 16K" },
  { value: "gpt-3.5-turbo-instruct", label: "GPT-3.5 Turbo Instruct" },
]

export default function AgentForm({ agent, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: "",
    instructions: "",
    status: true,
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [models, setModels] = useState(DEFAULT_MODELS)

  // Carregar modelos disponíveis
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await apiService.getModels()
        if (response.success && response.data) {
          // Filtrar apenas modelos OpenAI (que começam com 'gpt-')
          const openaiModels = response.data.filter(model => model.value.startsWith('gpt-'))
          setModels(openaiModels)
        }
      } catch (error) {
        console.warn('Erro ao carregar modelos, usando modelos padrão:', error)
        setModels(DEFAULT_MODELS)
      }
    }
    
    loadModels()
  }, [])

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        model: agent.model || "gpt-3.5-turbo",
        temperature: agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 1000,
        topP: agent.topP || 1,
        frequencyPenalty: agent.frequencyPenalty || 0,
        presencePenalty: agent.presencePenalty || 0,
        stopSequences: agent.stopSequences ? agent.stopSequences.join(", ") : "",
        instructions: agent.instructions || "",
        status: agent.status || true,
      })
    }
  }, [agent])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) : 
              name === "status" ? value === "active" : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSave = {
        ...formData,
        stopSequences: formData.stopSequences
          ? formData.stopSequences
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
      }

      await onSave(dataToSave)
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Básico", icon: Bot },
    { id: "prompt", label: "Prompt", icon: MessageSquare },
    { id: "advanced", label: "Avançado", icon: Sliders },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{agent ? "Editar Agente" : "Novo Agente"}</h2>
                <p className="text-sm text-gray-500">Configure seu agente de inteligência artificial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab: Básico */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Agente *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Assistente de Vendas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo OpenAI *</label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva brevemente a função deste agente..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Uma descrição ajuda a identificar o propósito do agente. Se não preenchida, será usada uma descrição padrão.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status ? "active" : "inactive"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab: Prompt */}
          {activeTab === "prompt" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt do Sistema *</label>
                <textarea
                  name="systemPrompt"
                  required
                  value={formData.systemPrompt}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Você é um assistente especializado em... Defina o comportamento e personalidade do seu agente aqui."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Este prompt define como o agente se comportará e responderá às interações.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instruções Adicionais</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Instruções específicas ou regras adicionais para o agente..."
                />
              </div>
            </div>
          )}

          {/* Tab: Avançado */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    name="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mais focado</span>
                    <span>Mais criativo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Tokens</label>
                  <input
                    type="number"
                    name="maxTokens"
                    min="1"
                    max="4000"
                    value={formData.maxTokens}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Top P ({formData.topP})</label>
                  <input
                    type="range"
                    name="topP"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.topP}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalidade de Frequência ({formData.frequencyPenalty})
                  </label>
                  <input
                    type="range"
                    name="frequencyPenalty"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.frequencyPenalty}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalidade de Presença ({formData.presencePenalty})
                  </label>
                  <input
                    type="range"
                    name="presencePenalty"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.presencePenalty}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sequências de Parada</label>
                  <input
                    type="text"
                    name="stopSequences"
                    value={formData.stopSequences}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: \n, END, STOP (separados por vírgula)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Sequências que fazem o modelo parar de gerar texto.</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? "Salvando..." : "Salvar Agente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
