"use client"

import { Edit, Trash2, Bot, Settings, Zap } from "lucide-react"

export default function AgentList({ agents, onEdit, onDelete }) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agente encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro agente de IA.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <div
          key={agent._id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow hover-card"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{agent.nome}</h3>
                  <p className="text-sm text-gray-500">{agent.configuracoes?.modelo || 'gpt-3.5-turbo'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(agent)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar agente"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(agent._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir agente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-3">{agent.descricao || agent.prompt_base}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Settings className="h-3 w-3" />
                  <span>Temp: {agent.configuracoes?.temperatura || 0.7}</span>
                </div>
                {agent.configuracoes?.max_tokens && (
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Max: {agent.configuracoes.max_tokens}</span>
                  </div>
                )}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {agent.status ? "Ativo" : "Inativo"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
