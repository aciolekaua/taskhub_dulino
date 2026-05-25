// TaskForm — modal para criar e editar tarefas

import { useState, useEffect, useRef } from 'react';

/**
 * Modal de formulário de tarefa (criar e editar)
 * @param {object|null} task - Tarefa para edição (null = criação)
 * @param {function} onSubmit - Callback com { title, description }
 * @param {function} onClose - Fecha o modal
 */
export default function TaskForm({ task, onSubmit, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);
  const isEditing = !!task;

  // Foca no campo de título ao abrir
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Fecha modal ao pressionar Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('O título da tarefa é obrigatório');
      titleRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || null });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={isEditing ? 'Editar tarefa' : 'Nova tarefa'}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-glass rounded-2xl overflow-hidden shadow-glass">

          {/* ─── Header ─────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                {isEditing ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <h2 className="font-semibold text-white">
                {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-150"
              aria-label="Fechar modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ─── Formulário ──────────────────────── */}
          <form id="task-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Campo título */}
            <div>
              <label htmlFor="task-title" className="input-label">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                id="task-title"
                ref={titleRef}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field"
                placeholder="Digite o título da tarefa..."
                maxLength={200}
                required
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-600">{title.length}/200</span>
              </div>
            </div>

            {/* Campo descrição */}
            <div>
              <label htmlFor="task-description" className="input-label">
                Descrição <span className="text-slate-600 font-normal">(opcional)</span>
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field resize-none"
                placeholder="Adicione mais detalhes sobre a tarefa..."
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-600">{description.length}/1000</span>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="cancel-task-btn"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="submit-task-btn"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={isEditing ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                    </svg>
                    {isEditing ? 'Salvar alterações' : 'Criar tarefa'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
