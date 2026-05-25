// DashboardPage — painel principal com tarefas, filtros e barra de progresso

import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskForm from '../components/TaskForm.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

/**
 * Dashboard principal do usuário autenticado
 * Exibe tarefas, filtros, busca, barra de progresso e widget de clima
 */
export default function DashboardPage({ isDark, onThemeToggle }) {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    error,
    filter,
    searchQuery,
    stats,
    setFilter,
    setSearchQuery,
    createTask,
    updateTask,
    toggleDone,
    deleteTask,
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Estados do painel de administração (apenas para ADMIN)
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' ou 'admin'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // Abre modal de edição
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Fecha modal e limpa estado de edição
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Cria ou atualiza tarefa
  const handleSubmitTask = async ({ title, description }) => {
    if (editingTask) {
      await updateTask(editingTask.id, { title, description });
    } else {
      await createTask(title, description);
    }
  };

  // Carrega lista de usuários (se for ADMIN)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('[ERRO] Falha ao carregar usuários:', err);
      setUsersError(err.response?.data?.message || 'Falha ao conectar ao servidor para carregar usuários');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  return (
    <div className="hero-bg min-h-screen">
      <Navbar onThemeToggle={onThemeToggle} isDark={isDark} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ─── Coluna principal ──────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Header de boas-vindas */}
            <div className="animate-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {getGreeting()}, <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">{firstName}!</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {activeTab === 'admin'
                    ? 'Painel administrativo de gerenciamento de usuários no MongoDB Atlas'
                    : (stats.total === 0
                        ? 'Comece criando sua primeira tarefa'
                        : stats.done === stats.total
                          ? '🎉 Todas as tarefas concluídas! Incrível!'
                          : `Você tem ${stats.pending} tarefa${stats.pending !== 1 ? 's' : ''} pendente${stats.pending !== 1 ? 's' : ''}`)
                  }
                </p>
              </div>

              {/* Seletor de abas exclusivo para ADMIN */}
              {user?.role === 'ADMIN' && (
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 select-none">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                      ${activeTab === 'tasks'
                        ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    📝 Tarefas
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      fetchUsers();
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                      ${activeTab === 'admin'
                        ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    👑 Usuários ({users.length || '...'})
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'admin' ? (
              /* ─── Painel Admin: Gestão de Usuários no MongoDB ─── */
              <div className="glass-card animate-slide-up space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>👑</span> Banco de Dados — Usuários Cadastrados
                  </h2>
                  <button
                    onClick={fetchUsers}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                    disabled={loadingUsers}
                  >
                    🔄 {loadingUsers ? 'Carregando...' : 'Atualizar'}
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-xs text-slate-400">Consultando MongoDB Atlas...</p>
                  </div>
                ) : usersError ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {usersError}
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    Nenhum usuário localizado na cluster.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-3 px-4">Nome</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">Perfil / Permissão</th>
                          <th className="py-3 px-4">Cadastro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-medium text-white">{u.name}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                  : 'bg-primary-500/10 text-primary-300 border border-primary-500/20'
                              }`}>
                                {u.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuário'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              {new Date(u.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* ─── Painel Normal: Tarefas ─────────────────── */
              <>
                {/* ─── Barra de progresso ─────────────── */}
                {stats.total > 0 && (
                  <div className="glass-card animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-semibold text-white">Progresso do dia</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">
                            <span className="text-emerald-400 font-medium">{stats.done}</span> de {stats.total} concluídas
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-bold ${
                          stats.percentage === 100 ? 'text-emerald-400' :
                          stats.percentage >= 50 ? 'text-primary-400' : 'text-slate-400'
                        }`}>
                          {stats.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary-500 to-emerald-500"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ─── Barra de ações: busca + filtros + criar ─── */}
                <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
                  {/* Busca */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="search-tasks-input"
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input-field pl-10 pr-8"
                      placeholder="Buscar tarefas..."
                      aria-label="Buscar tarefas por título"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                        aria-label="Limpar busca"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Filtros de status */}
                  <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
                    {[
                      { value: 'all', label: 'Todas', icon: '📋' },
                      { value: 'pending', label: 'Pendentes', icon: '⏳' },
                      { value: 'done', label: 'Concluídas', icon: '✅' },
                    ].map(f => (
                      <button
                        key={f.value}
                        id={`filter-${f.value}-btn`}
                        onClick={() => setFilter(f.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap
                          ${filter === f.value
                            ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <span>{f.icon}</span>
                        <span className="hidden sm:inline">{f.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Botão criar */}
                  <button
                    id="create-task-btn"
                    onClick={() => setShowForm(true)}
                    className="btn-primary whitespace-nowrap"
                    aria-label="Criar nova tarefa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nova tarefa</span>
                  </button>
                </div>

                {/* ─── Mensagem de erro global ─────────── */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* ─── Lista de tarefas ─────────────────── */}
                <div className="custom-scroll">
                  <TaskList
                    tasks={tasks}
                    loading={loading}
                    filter={filter}
                    searchQuery={searchQuery}
                    onToggle={toggleDone}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                    onCreateFirst={() => setShowForm(true)}
                  />
                </div>
              </>
            )}
          </div>

          {/* ─── Sidebar direita ───────────────────── */}
          <aside className="lg:w-72 xl:w-80 space-y-4 animate-slide-up">

            {/* Widget de clima */}
            <WeatherWidget />

            {/* Stats cards */}
            <div className="glass rounded-2xl overflow-hidden border border-white/10">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resumo</span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: stats.total, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                  { label: 'Pendentes', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Concluídas', value: stats.done, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dica de produtividade */}
            <div className="glass rounded-2xl p-4 border border-primary-500/10 bg-primary-500/5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-xs font-semibold text-primary-400 mb-1">Dica do dia</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Divida tarefas grandes em partes menores para aumentar sua produtividade e motivação!
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── Modal de formulário ──────────────────── */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmitTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
