// TaskList — grade de tarefas com estado vazio e skeletons de carregamento

import TaskItem from './TaskItem.jsx';

/**
 * Lista de tarefas com animações e estados de carregamento/vazio
 * @param {object[]} tasks
 * @param {boolean} loading
 * @param {string} filter
 * @param {string} searchQuery
 * @param {function} onToggle
 * @param {function} onEdit
 * @param {function} onDelete
 * @param {function} onCreateFirst
 */
export default function TaskList({ tasks, loading, filter, searchQuery, onToggle, onEdit, onDelete, onCreateFirst }) {

  // Estado de carregamento — skeletons
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card animate-pulse">
            <div className="flex items-start gap-4">
              <div className="skeleton w-6 h-6 rounded-md mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
                <div className="skeleton h-3 rounded w-1/4 mt-3" />
              </div>
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado vazio — com mensagem contextual
  if (tasks.length === 0) {
    const isFiltered = filter !== 'all' || searchQuery.trim();

    return (
      <div className="glass-card text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-violet-500/10 border border-white/5 flex items-center justify-center">
          {isFiltered ? (
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">
          {isFiltered
            ? 'Nenhuma tarefa encontrada'
            : 'Nenhuma tarefa ainda'}
        </h3>

        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          {isFiltered
            ? searchQuery
              ? `Nenhuma tarefa corresponde a "${searchQuery}"`
              : 'Nenhuma tarefa com este filtro'
            : 'Crie sua primeira tarefa e comece a organizar seu dia!'}
        </p>

        {!isFiltered && (
          <button
            id="create-first-task-btn"
            onClick={onCreateFirst}
            className="btn-primary mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Criar primeira tarefa
          </button>
        )}
      </div>
    );
  }

  // Lista de tarefas
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Contador de tarefas no rodapé */}
      <div className="text-center pt-2">
        <span className="text-xs text-slate-600">
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} exibida{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
