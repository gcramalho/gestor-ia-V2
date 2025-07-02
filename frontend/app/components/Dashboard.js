"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import AgentList from "./AgentList"
import AgentForm from "./AgentForm"
import DashboardStats from "./DashboardStats"
import { apiService } from "../services/apiService"
import { Plus, LogOut, Bot, User, BarChart3 } from "lucide-react"

export default function Dashboard() {
  const [agents, setAgents] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("agents")
  const { user, logout } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar agentes e dados do dashboard em paralelo
      const [agentsResponse, dashData] = await Promise.all([
        apiService.getAgentes(),
        apiService
          .getDashboard()
          .catch(() => null), // Dashboard é opcional
      ])

      // Extrair dados dos agentes da resposta
      const agentsData = agentsResponse.data || agentsResponse;
      const dashboardData = dashData?.data || dashData;
      
      console.log('📊 Dados carregados:', { 
        agentsCount: agentsData?.length || 0, 
        hasDashboard: !!dashboardData 
      });

      setAgents(agentsData)
      setDashboardData(dashboardData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setShowForm(true)
  }

  const handleEditAgent = (agent) => {
    // Mapear campos do backend para frontend
    const frontendAgent = {
      _id: agent._id || agent.id,
      name: agent.nome,
      description: agent.descricao,
      systemPrompt: agent.prompt_base,
      instructions: agent.instrucoes,
      model: agent.configuracoes?.modelo,
      temperature: agent.configuracoes?.temperatura,
      maxTokens: agent.configuracoes?.max_tokens,
      topP: agent.configuracoes?.top_p,
      frequencyPenalty: agent.configuracoes?.frequency_penalty,
      presencePenalty: agent.configuracoes?.presence_penalty,
      stopSequences: agent.configuracoes?.stop_sequences,
      status: agent.status,
    }
    setEditingAgent(frontendAgent)
    setShowForm(true)
  }

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm("Tem certeza que deseja excluir este agente?")) {
      try {
        await apiService.deleteAgente(agentId)
        setAgents(agents.filter((agent) => agent._id !== agentId))
      } catch (error) {
        console.error("Erro ao excluir agente:", error)
        alert("Erro ao excluir agente")
      }
    }
  }

  const handleSaveAgent = async (agentData) => {
    try {
      console.log('💾 Salvando agente:', agentData);
      
      if (editingAgent) {
        const response = await apiService.updateAgente(editingAgent._id, agentData)
        const updatedAgent = response.data || response;
        setAgents(agents.map((agent) => (agent._id === editingAgent._id ? updatedAgent : agent)))
        console.log('✅ Agente atualizado:', updatedAgent);
      } else {
        const response = await apiService.createAgente(agentData)
        const newAgent = response.data || response;
        setAgents([...agents, newAgent])
        console.log('✅ Agente criado:', newAgent);
      }
      setShowForm(false)
      setEditingAgent(null)
    } catch (error) {
      console.error("Erro ao salvar agente:", error)
      alert("Erro ao salvar agente")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAgent(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestão de Agentes IA</h1>
                <p className="text-sm text-gray-500">{user?.nome || "Gerencie seus agentes de IA"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("agents")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "agents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <span>Agentes</span>
              </div>
            </button>
            {dashboardData && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && dashboardData ? (
          <DashboardStats data={dashboardData} />
        ) : !showForm ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meus Agentes</h2>
                <p className="text-gray-600">
                  {agents.length} agente{agents.length !== 1 ? "s" : ""} configurado
                  {agents.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleCreateAgent}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Agente</span>
              </button>
            </div>

            <AgentList agents={agents} onEdit={handleEditAgent} onDelete={handleDeleteAgent} />
          </div>
        ) : (
          <AgentForm agent={editingAgent} onSave={handleSaveAgent} onCancel={handleCloseForm} />
        )}
      </main>
    </div>
  )
}
