"use client"

import { BarChart3, MessageSquare, Users, Zap } from "lucide-react"

export default function DashboardStats({ data }) {
  const stats = [
    {
      name: "Total de Agentes",
      value: data?.totalAgentes || 0,
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      name: "Conversas Hoje",
      value: data?.conversasHoje || 0,
      icon: MessageSquare,
      color: "bg-green-500",
    },
    {
      name: "Clientes Ativos",
      value: data?.clientesAtivos || 0,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      name: "Mensagens Enviadas",
      value: data?.mensagensEnviadas || 0,
      icon: Zap,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral da sua empresa</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos ou outras informações podem ser adicionadas aqui */}
      {data?.graficos && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
          {/* Implementar gráficos conforme dados do backend */}
        </div>
      )}
    </div>
  )
}
