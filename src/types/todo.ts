export type Priority = 'low' | 'medium' | 'high';

export type StatusFilter = 'all' | 'active' | 'completed';
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type SortOption = 'created_desc' | 'created_asc' | 'priority_desc' | 'title_asc';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  category?: string;
}

export const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    description: string;
    badgeClass: string;
    textClass: string;
    borderClass: string;
    bgClass: string;
    dotClass: string;
    level: number;
  }
> = {
  high: {
    label: 'Haute',
    description: 'Priorité urgente ou critique',
    badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/60 border-rose-200/90 dark:border-rose-800/80 shadow-2xs',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-300 dark:border-rose-800',
    bgClass: 'bg-rose-500',
    dotClass: 'bg-rose-500',
    level: 3,
  },
  medium: {
    label: 'Moyenne',
    description: 'Priorité standard importante',
    badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/60 border-amber-200/90 dark:border-amber-800/80 shadow-2xs',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-300 dark:border-amber-800',
    bgClass: 'bg-amber-500',
    dotClass: 'bg-amber-500',
    level: 2,
  },
  low: {
    label: 'Basse',
    description: 'Tâche de fond ou secondaire',
    badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
    bgClass: 'bg-emerald-500',
    dotClass: 'bg-emerald-500',
    level: 1,
  },
};
