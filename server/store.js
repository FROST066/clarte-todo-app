import fs from 'node:fs';
import path from 'node:path';

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Finaliser la présentation du projet trimestriel',
    description: 'Relire les indicateurs clés et intégrer les retours de l’équipe produit.',
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Professionnel',
  },
  {
    id: 'task-2',
    title: 'Envoyer le devis validé au client',
    description: 'Vérifier les conditions tarifaires et le calendrier de livraison.',
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Commercial',
  },
  {
    id: 'task-3',
    title: 'Planifier la réunion de cadrage technique',
    description: 'Envoyer les invitations et préparer l’ordre du jour partagé.',
    priority: 'medium',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: 'Équipe',
  },
  {
    id: 'task-4',
    title: 'Faire la mise à jour des dépendances du socle web',
    description: 'Vérifier la compatibilité des versions mineures et relancer les tests.',
    priority: 'medium',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    category: 'Technique',
  },
  {
    id: 'task-5',
    title: 'Lire les notes de synthèse sur l’architecture logicielle',
    description: '30 minutes de lecture approfondie.',
    priority: 'low',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    category: 'Veille',
  },
  {
    id: 'task-6',
    title: 'Ranger et sauvegarder l’espace de travail numérique',
    description: 'Archiver les téléchargements du mois et vérifier la sauvegarde cloud.',
    priority: 'low',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    category: 'Organisation',
  },
];

export class TaskStore {
  constructor(filePath) {
    this.filePath = filePath || path.resolve(process.cwd(), 'tasks.json');
    this.init();
  }

  init() {
    if (!fs.existsSync(this.filePath)) {
      this.writeTasks(INITIAL_TASKS);
    }
  }

  readTasks() {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.writeTasks(INITIAL_TASKS);
        return INITIAL_TASKS;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Erreur lors de la lecture de tasks.json:', err);
      return [];
    }
  }

  writeTasks(tasks) {
    const tempPath = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    fs.writeFileSync(tempPath, JSON.stringify(tasks, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  getAll(filter = {}) {
    const tasks = this.readTasks();
    if (filter && filter.status === 'active') {
      return tasks.filter(t => !t.completed);
    }
    if (filter && filter.status === 'completed') {
      return tasks.filter(t => t.completed);
    }
    return tasks;
  }

  getById(id) {
    const tasks = this.readTasks();
    return tasks.find(t => t.id === id);
  }

  create(data = {}) {
    const title = typeof data?.title === 'string' ? data.title.trim() : '';
    if (!title) {
      throw new Error('Le titre est obligatoire');
    }
    const tasks = this.readTasks();
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      title,
      description: data.description ? data.description.trim() : undefined,
      priority: ['high', 'medium', 'low'].includes(data.priority) ? data.priority : 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || undefined,
      category: data.category ? data.category.trim() : undefined,
    };
    tasks.unshift(newTask);
    this.writeTasks(tasks);
    return newTask;
  }

  update(id, updates) {
    const tasks = this.readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return null;
    }

    const current = tasks[index];
    const isCompleted = typeof updates.completed === 'boolean' ? updates.completed : current.completed;
    const completedAt =
      typeof updates.completed === 'boolean'
        ? (updates.completed ? (current.completedAt || new Date().toISOString()) : undefined)
        : current.completedAt;

    const updatedTask = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      completed: isCompleted,
      completedAt,
    };

    if (updates.title !== undefined) {
      const trimmedTitle = typeof updates.title === 'string' ? updates.title.trim() : String(updates.title).trim();
      if (!trimmedTitle) {
        throw new Error('Le titre ne peut pas être vide');
      }
      updatedTask.title = trimmedTitle;
    }
    if (updates.description !== undefined) {
      updatedTask.description = updates.description ? String(updates.description).trim() : undefined;
    }
    if (updates.category !== undefined) {
      updatedTask.category = updates.category ? String(updates.category).trim() : undefined;
    }
    if (updates.dueDate !== undefined) {
      updatedTask.dueDate = updates.dueDate || undefined;
    }

    tasks[index] = updatedTask;
    this.writeTasks(tasks);
    return updatedTask;
  }

  delete(id) {
    const tasks = this.readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    tasks.splice(index, 1);
    this.writeTasks(tasks);
    return true;
  }

  clearCompleted() {
    const tasks = this.readTasks();
    const remaining = tasks.filter(t => !t.completed);
    this.writeTasks(remaining);
    return remaining;
  }

  toggleAll(completed) {
    const tasks = this.readTasks();
    const shouldComplete = typeof completed === 'boolean' ? completed : !tasks.every(t => t.completed);
    const updated = tasks.map(t => ({
      ...t,
      completed: shouldComplete,
      completedAt: shouldComplete ? (t.completedAt || new Date().toISOString()) : undefined,
    }));
    this.writeTasks(updated);
    return updated;
  }

  reset() {
    this.writeTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }

  clearAll() {
    this.writeTasks([]);
    return [];
  }
}
