"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/apiService"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem("authToken")
    if (token) {
      // Validar token e buscar dados do usuário
      validateToken()
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async () => {
    try {
      console.log('🔍 Validando token...');
      const response = await apiService.getMe()
      console.log('✅ Token válido, resposta:', response);
      
      // Extrair dados do usuário da resposta
      const userData = response.data || response;
      console.log('✅ Dados do usuário:', userData);
      
      setUser(userData)
    } catch (error) {
      console.error("❌ Token inválido:", error)
      localStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, senha) => {
    try {
      console.log('🔐 Tentando fazer login com:', { email, senha: senha ? '***' : 'undefined' });
      
      const response = await apiService.login(email, senha)
      console.log('✅ Resposta do login:', response); // Log para debug

      // Salvar token - a resposta tem estrutura { success: true, data: { accessToken, ... } }
      const token = response.data?.accessToken || response.accessToken;
      console.log('🔑 Token a ser salvo:', token ? 'presente' : 'ausente'); // Log para debug
      
      if (!token) {
        console.error('❌ Token não encontrado na resposta');
        return { success: false, error: 'Token não recebido do servidor' }
      }
      
      localStorage.setItem("authToken", token)
      
      // Verificar se foi salvo corretamente
      const savedToken = localStorage.getItem("authToken");
      console.log('💾 Token salvo no localStorage:', {
        saved: !!savedToken,
        length: savedToken?.length,
        matches: savedToken === token
      });

      // Buscar dados do usuário
      console.log('👤 Buscando dados do usuário...'); // Log para debug
      const userResponse = await apiService.getMe()
      console.log('✅ Dados do usuário:', userResponse); // Log para debug
      
      // Extrair dados do usuário da resposta
      const userData = userResponse.data || userResponse;
      console.log('👤 Dados finais do usuário:', userData);
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('❌ Erro no login:', error); // Log para debug
      return { success: false, error: error.message }
    }
  }

  const register = async (empresaData) => {
    try {
      console.log('📝 Tentando registrar empresa:', empresaData);
      const response = await apiService.register(empresaData)
      console.log('✅ Resposta do registro:', response); // Log para debug

      // Salvar token se retornado no registro
      const token = response.data?.accessToken || response.accessToken;
      if (token) {
        console.log('🔑 Token do registro a ser salvo:', token ? 'presente' : 'ausente'); // Log para debug
        localStorage.setItem("authToken", token)
        const userResponse = await apiService.getMe()
        const userData = userResponse.data || userResponse;
        setUser(userData)
      }

      return { success: true, data: response }
    } catch (error) {
      console.error('❌ Erro no registro:', error); // Log para debug
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error("Erro no logout:", error)
    } finally {
      localStorage.removeItem("authToken")
      setUser(null)
    }
  }

  const alterarSenha = async (senhaAtual, novaSenha) => {
    try {
      await apiService.alterarSenha(senhaAtual, novaSenha)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    alterarSenha,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
