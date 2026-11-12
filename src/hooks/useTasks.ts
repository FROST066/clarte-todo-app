import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Priority, StatusFilter, PriorityFilter, SortOption } from '../types/todo';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');

  // Fetch initial tasks from backend API
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des tâches depuis le serveur', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    category?: string;
  }) => {
    const trimmedTitle = data?.title?.trim();
    if (!trimmedTitle) {
      console.warn("Impossible d'ajouter une tâche avec un titre vide.");
      return;
    }
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          title: trimmedTitle,
        }),
      });
      if (response.ok) {
        const createdTask = await response.json();
        setTasks(prev => [createdTask, ...prev]);
        return createdTask;
      }
    } catch (e) {
      console.error("Erreur lors de l'ajout de la tâche", e);
    }
  };

  const toggleTask = async (id: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === id);
    if (!target) return false;
    const nextCompleted = !target.completed;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erreur lors du basculement de la tâche', e);
      return false;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (updates.title !== undefined && !updates.title.trim()) {
      console.warn("Impossible de mettre à jour une tâche avec un titre vide.");
      return;
    }
    const cleanUpdates = updates.title !== undefined ? { ...updates, title: updates.title.trim() } : updates;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdates),
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
      }
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la tâche', e);
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erreur lors de la suppression de la tâche', e);
      return false;
    }
  };

  const duplicateTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    return addTask({
      title: `${target.title} (copie)`,
      description: target.description,
      priority: target.priority,
      dueDate: target.dueDate,
      category: target.category,
    });
  };

  const clearCompleted = async () => {
    try {
      const response = await fetch('/api/tasks/completed', {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks(prev => prev.filter(task => !task.completed));
      }
    } catch (e) {
      console.error('Erreur lors du nettoyage des tâches terminées', e);
    }
  };

  const toggleAll = async (forceCompleted?: boolean) => {
    const allCompleted = tasks.every(t => t.completed);
    const shouldComplete = forceCompleted !== undefined ? forceCompleted : !allCompleted;
    try {
      const response = await fetch('/api/tasks/toggle-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: shouldComplete }),
      });
      if (response.ok) {
        const updatedTasks = await response.json();
        setTasks(updatedTasks);
      }
    } catch (e) {
      console.error('Erreur lors du basculement global des tâches', e);
    }
  };

  const resetToSample = async () => {
    try {
      const response = await fetch('/api/tasks/reset', {
        method: 'POST',
      });
      if (response.ok) {
        const resetTasks = await response.json();
        setTasks(resetTasks);
      }
    } catch (e) {
      console.error('Erreur lors de la réinitialisation des tâches', e);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks([]);
      }
    } catch (e) {
      console.error('Erreur lors de la suppression de toutes les tâches', e);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const highRemaining = tasks.filter(t => !t.completed && t.priority === 'high').length;
    const mediumRemaining = tasks.filter(t => !t.completed && t.priority === 'medium').length;
    const lowRemaining = tasks.filter(t => !t.completed && t.priority === 'low').length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      remaining,
      highRemaining,
      mediumRemaining,
      lowRemaining,
      percent,
    };
  }, [tasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Status filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query) ?? false;
          const matchCat = task.category?.toLowerCase().includes(query) ?? false;
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'created_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'priority_desc') {
          const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          if (weight[b.priority] !== weight[a.priority]) {
            return weight[b.priority] - weight[a.priority];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title, 'fr');
        }
        return 0;
      });
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortBy]);

  return {
    tasks,
    isLoading,
    filteredTasks,
    stats,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    duplicateTask,
    clearCompleted,
    toggleAll,
    resetToSample,
    clearAll,
  };
}
