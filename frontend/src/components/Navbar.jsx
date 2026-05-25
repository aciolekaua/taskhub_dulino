// Navbar — barra de navegação superior com tema, usuário e logout

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Componente de navegação superior
 * Exibe logo, nome do usuário, toggle de tema e botão de logout
 */
export default function Navbar({ onThemeToggle, isDark }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const close = () => setShowDropdown(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // Iniciais do nome do usuário para o avatar
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ─── Logo ────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-glow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
            TaskHub
          </span>
        </div>

        {/* ─── Ações direitas ───────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Toggle de tema */}
          <button
            id="theme-toggle-btn"
            onClick={onThemeToggle}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:bg-white/5"
            title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              id="user-menu-btn"
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass hover:bg-white/5 transition-all duration-200"
              aria-label="Menu do usuário"
            >
              {/* Avatar com iniciais */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block max-w-[120px] truncate">
                {user?.name || 'Usuário'}
              </span>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 dropdown-menu rounded-2xl overflow-hidden shadow-glass animate-slide-down">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-slate-500 font-medium">Conectado como</p>
                  <p className="text-sm text-white font-semibold truncate">{user?.email}</p>
                </div>
                <button
                  id="logout-btn"
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
