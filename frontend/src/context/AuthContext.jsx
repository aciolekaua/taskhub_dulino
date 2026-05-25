// Contexto global de autenticação — gerencia estado do usuário logado usando cookies seguros httpOnly

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

// Cria o contexto de autenticação
const AuthContext = createContext(null);

/**
 * Provider de autenticação — envolve a aplicação inteira
 * O token fica seguro no cookie httpOnly (invisível ao JS do F12/XSS)
 * Apenas os metadados do usuário e o status logado são persistidos localmente
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega estado de autenticação ao montar (sem expor o token JWT ao JS)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taskhub_user');
      const isLoggedIn = localStorage.getItem('taskhub_logged_in') === 'true';

      if (isLoggedIn && savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Garante limpeza caso inconsistente
        localStorage.removeItem('taskhub_user');
        localStorage.removeItem('taskhub_logged_in');
      }
    } catch (error) {
      localStorage.removeItem('taskhub_user');
      localStorage.removeItem('taskhub_logged_in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Realiza login — armazena usuário e flag de status
   * O token JWT enviado pelo backend já está salvo no cookie httpOnly do navegador
   * @param {string} _ignoredToken - Ignorado (mantido na assinatura para compatibilidade)
   * @param {object} newUser - Dados públicos do usuário (nome, e-mail, role)
   */
  const login = useCallback((_ignoredToken, newUser) => {
    setUser(newUser);
    localStorage.setItem('taskhub_user', JSON.stringify(newUser));
    localStorage.setItem('taskhub_logged_in', 'true');
    
    // Limpa token residual do localStorage legado por segurança
    localStorage.removeItem('taskhub_token');
  }, []);

  /**
   * Realiza logout — limpa cookies no backend, estado em memória e localStorage
   */
  const logout = useCallback(async () => {
    try {
      // Chama o backend para invalidar e apagar o cookie httpOnly
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao efetuar logout na API:', error);
    } finally {
      // Garante limpeza local mesmo se a chamada de rede falhar
      setUser(null);
      localStorage.removeItem('taskhub_user');
      localStorage.removeItem('taskhub_logged_in');
      localStorage.removeItem('taskhub_token');
    }
  }, []);

  const value = {
    user,
    token: null, // O token agora reside apenas em httpOnly, isolado do JavaScript
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 * @returns {object} Contexto de auth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
