// Hook de gerenciamento de tarefas — estado e operações CRUD

import { useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';

/**
 * Hook centralizado para gerenciar tarefas
 * Inclui filtros, busca, carregamento e operações CRUD
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'done'
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Busca tarefas da API com filtros opcionais
   */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const response = await api.get('/tasks', { params });
      setTasks(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  // Recarrega quando filtros mudam
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Cria nova tarefa
   * @param {string} title
   * @param {string|null} description
   */
  const createTask = useCallback(async (title, description = null) => {
    const response = await api.post('/tasks', { title, description });
    const newTask = response.data.data;
    // Adiciona ao início da lista
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  /**
   * Atualiza tarefa existente
   * @param {number} id
   * @param {object} data - { title?, description?, done? }
   */
  const updateTask = useCallback(async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    const updatedTask = response.data.data;
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, []);

  /**
   * Alterna status done/pending de uma tarefa
   * @param {number} id
   * @param {boolean} currentDone
   */
  const toggleDone = useCallback(async (id, currentDone) => {
    return updateTask(id, { done: !currentDone });
  }, [updateTask]);

  /**
   * Remove tarefa
   * @param {number} id
   */
  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Estatísticas computadas
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
    percentage: tasks.length > 0
      ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
      : 0,
  };

  return {
    tasks,
    loading,
    error,
    filter,
    searchQuery,
    stats,
    setFilter,
    setSearchQuery,
    fetchTasks,
    createTask,
    updateTask,
    toggleDone,
    deleteTask,
  };
}
