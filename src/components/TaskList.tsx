import { Task } from '../types/todo';
import { TaskItem } from './TaskItem';
import { CheckCircle2, ListFilter, PlusCircle, CheckCheck, Trash } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  allTasksCount: number;
  searchQuery?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDuplicate: (id: string) => void;
  onClearCompleted: () => void;
  onToggleAll: () => void;
  onResetFilters: () => void;
  onResetSample: () => void;
  onClearSearch?: () => void;
}

export function TaskList({
  tasks,
  allTasksCount,
  searchQuery = '',
  onToggle,
  onDelete,
  onUpdate,
  onDuplicate,
  onClearCompleted,
  onToggleAll,
  onResetFilters,
  onResetSample,
  onClearSearch,
}: TaskListProps) {
  const completedInView = tasks.filter(t => t.completed).length;
  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  if (allTasksCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          Aucune tâche pour le moment
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Votre espace de travail est parfaitement clair. Ajoutez une première tâche ci-dessus ou chargez les tâches d'exemples.
        </p>
        <button
          onClick={onResetSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Charger des exemples</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    const isSearching = searchQuery.trim().length > 0;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 text-center shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <ListFilter className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {isSearching
            ? `Aucun résultat pour « ${searchQuery.trim()} »`
            : 'Aucune tâche correspondante'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
          {isSearching
            ? 'Vérifiez l’orthographe ou essayez un mot-clé plus court.'
            : 'Aucune tâche ne correspond à vos critères de filtrage actuels.'}
        </p>
        <div className="flex items-center justify-center gap-2">
          {isSearching && onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Effacer la recherche
            </button>
          )}
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* List items */}
      <div className="space-y-2.5">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            searchQuery={searchQuery}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>

      {/* Batch actions footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 px-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAll}
            className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{allCompleted ? 'Tout démarquer' : 'Tout marquer comme terminé'}</span>
          </button>
        </div>

        {completedInView > 0 && (
          <button
            onClick={onClearCompleted}
            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Effacer les tâches terminées ({completedInView})</span>
          </button>
        )}
      </div>
    </div>
  );
}
