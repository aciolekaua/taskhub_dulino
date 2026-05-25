// LoginPage — página de autenticação com toggle entre login e cadastro

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { login as apiLogin, register as apiRegister } from '../services/authService.js';

/**
 * Página de autenticação com animação de slide entre formulários
 * Suporta login e cadastro com toggle
 */
export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleMode = () => {
    setIsRegister(v => !v);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        if (!formData.name.trim()) {
          setError('Nome é obrigatório');
          return;
        }
        data = await apiRegister(formData.name, formData.email, formData.password);
      } else {
        data = await apiLogin(formData.email, formData.password);
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ─── Efeitos de fundo ──────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">

        {/* ─── Logo ──────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-glow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
            TaskHub
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Organize seu dia com eficiência</p>
        </div>

        {/* ─── Card principal ─────────────────────────── */}
        <div className="glass rounded-3xl overflow-hidden shadow-glass border border-white/10">

          {/* Toggle Login/Cadastro */}
          <div className="flex p-1 m-4 bg-white/5 rounded-2xl">
            <button
              id="login-tab-btn"
              type="button"
              onClick={() => !loading && setIsRegister(false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                ${!isRegister
                  ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Entrar
            </button>
            <button
              id="register-tab-btn"
              type="button"
              onClick={() => !loading && setIsRegister(true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                ${isRegister
                  ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Formulário */}
          <form id="auth-form" onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-white">
                {isRegister ? 'Criar sua conta' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegister
                  ? 'Preencha os dados para começar'
                  : 'Entre com suas credenciais'}
              </p>
            </div>

            {/* Nome (apenas cadastro) */}
            {isRegister && (
              <div className="animate-slide-down">
                <label htmlFor="auth-name" className="input-label">Nome completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Seu nome"
                    autoComplete="name"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="auth-email" className="input-label">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="auth-password" className="input-label">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="auth-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder={isRegister ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                />
              </div>
              {isRegister && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        formData.password.length >= i * 3
                          ? i <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isRegister ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  {isRegister ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Criar conta grátis
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Entrar no TaskHub
                    </>
                  )}
                </>
              )}
            </button>

            {/* Link alternativo */}
            <p className="text-center text-sm text-slate-500">
              {isRegister ? 'Já tem uma conta? ' : 'Não tem conta? '}
              <button
                type="button"
                id="toggle-auth-mode-btn"
                onClick={toggleMode}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                {isRegister ? 'Faça login' : 'Cadastre-se'}
              </button>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 mt-6">
          TaskHub © 2024 — Desafio Técnico Dulino
        </p>
      </div>
    </div>
  );
}
