// TaskItem — card de tarefa individual com checkbox animado, edição e exclusão

import { useState } from 'react';

/**
 * Componente de item de tarefa
 * @param {object} task - Dados da tarefa
 * @param {function} onToggle - Callback para marcar/desmarcar
 * @param {function} onEdit - Callback para abrir edição
 * @param {function} onDelete - Callback para deletar
 */
export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Formata data relativa
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(task.id, task.done);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className={`glass-card group transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5
        ${task.done ? 'opacity-75' : 'opacity-100'}
        animate-slide-up`}
      data-task-id={task.id}
    >
      <div className="flex items-start gap-4">

        {/* ─── Checkbox animado ──────────────────── */}
        <div className="pt-0.5 flex-shrink-0">
          <input
            id={`task-check-${task.id}`}
            type="checkbox"
            className="checkbox-custom"
            checked={task.done}
            onChange={handleToggle}
            disabled={isToggling}
            aria-label={`Marcar tarefa "${task.title}" como ${task.done ? 'pendente' : 'concluída'}`}
          />
        </div>

        {/* ─── Conteúdo ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-sm leading-snug transition-all duration-300
                ${task.done
                  ? 'line-through text-slate-500'
                  : 'task-item-title task-item-hover'
                }`}
            >
              {task.title}
            </h3>

            {/* Badge de status */}
            <div className="flex-shrink-0">
              {task.done ? (
                <span className="badge-done">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Concluída
                </span>
              ) : (
                <span className="badge-pending">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Pendente
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          {task.description && (
            <p className={`text-xs mt-1.5 leading-relaxed transition-colors duration-300
              ${task.done ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'}`}>
              {task.description}
            </p>
          )}

          {/* Data e ações */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-600">
              {formatDate(task.createdAt)}
            </span>

            {/* Botões de ação (visíveis no hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Editar */}
              <button
                id={`edit-task-${task.id}`}
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-150"
                title="Editar tarefa"
                aria-label="Editar tarefa"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Deletar — com confirmação inline */}
              {!showConfirm ? (
                <button
                  id={`delete-task-${task.id}`}
                  onClick={() => setShowConfirm(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                  title="Deletar tarefa"
                  aria-label="Deletar tarefa"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-1 animate-scale-in">
                  <button
                    id={`confirm-delete-${task.id}`}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
