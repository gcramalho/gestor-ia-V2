"use client"

import { useAuth } from "../contexts/AuthContext"
import LoginScreen from "./LoginScreen"
import Dashboard from "./Dashboard"

export default function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <div className="min-h-screen bg-gray-50">{user ? <Dashboard /> : <LoginScreen />}</div>
}
