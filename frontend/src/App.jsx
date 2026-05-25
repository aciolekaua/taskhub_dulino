// App.jsx — roteamento principal com proteção de rotas

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

/**
 * Rota protegida — redireciona para login se não autenticado
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Aguarda verificação do localStorage
  if (isLoading) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 mx-auto flex items-center justify-center shadow-glow animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">Carregando TaskHub...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Rota pública — redireciona para dashboard se já autenticado
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

/**
 * Componente interno com acesso ao AuthContext para verificações
 */
function AppRoutes() {
  // Gerencia tema claro/escuro
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('taskhub_theme');
    return saved !== 'light'; // dark por padrão
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
    localStorage.setItem('taskhub_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(v => !v);

  return (
    <Routes>
      {/* Rota raiz — redireciona com base em autenticação */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rota de login — pública */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Dashboard — privada */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage isDark={isDark} onThemeToggle={toggleTheme} />
          </PrivateRoute>
        }
      />

      {/* 404 — redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App raiz — envolve tudo com providers necessários
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
