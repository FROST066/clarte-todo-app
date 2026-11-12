import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { StatusFilter, PriorityFilter, SortOption } from '../types/todo';

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  activeCount: number;
  completedCount: number;
}

export function FilterBar({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  activeCount,
  completedCount,
}: FilterBarProps) {
  const isFiltered = statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onStatusChange('all');
    onPriorityChange('all');
    onSearchChange('');
  };

  return (
    <div className="space-y-3">
      {/* Filters and Sort Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented control */}
        <div
          role="group"
          aria-label="Filtrer par statut"
          className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-full md:w-auto"
        >
          <button
            type="button"
            aria-pressed={statusFilter === 'all'}
            onClick={() => onStatusChange('all')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Toutes</span>
            <span className="text-[11px] opacity-70 tabular-nums">({totalCount})</span>
          </button>

          <button
            type="button"
            aria-pressed={statusFilter === 'active'}
            onClick={() => onStatusChange('active')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>À faire</span>
            <span className="text-[11px] opacity-70 tabular-nums">({activeCount})</span>
          </button>

          <button
            type="button"
            aria-pressed={statusFilter === 'completed'}
            onClick={() => onStatusChange('completed')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Terminées</span>
            <span className="text-[11px] opacity-70 tabular-nums">({completedCount})</span>
          </button>
        </div>

        {/* Priority Filter & Sort */}
        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
          {/* Priority options */}
          <div
            role="group"
            aria-label="Filtrer par priorité"
            className="flex items-center gap-1.5 overflow-x-auto"
          >
            <span id="filter-priority-label" className="text-xs text-slate-400 dark:text-slate-500 mr-0.5 hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
              Priorité :
            </span>

            <button
              type="button"
              aria-pressed={priorityFilter === 'all'}
              onClick={() => onPriorityChange('all')}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                priorityFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-medium'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              Toutes
            </button>

            <button
              type="button"
              aria-pressed={priorityFilter === 'high'}
              onClick={() => onPriorityChange('high')}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                priorityFilter === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-medium'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Haute
            </button>

            <button
              type="button"
              aria-pressed={priorityFilter === 'medium'}
              onClick={() => onPriorityChange('medium')}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                priorityFilter === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Moyenne
            </button>

            <button
              type="button"
              aria-pressed={priorityFilter === 'low'}
              onClick={() => onPriorityChange('low')}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                priorityFilter === 'low'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Basse
            </button>
          </div>

          {/* Sort selector */}
          <div className="relative shrink-0">
            <label htmlFor="tasks-sort-select" className="sr-only">
              Trier les tâches par
            </label>
            <select
              id="tasks-sort-select"
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="appearance-none text-xs pl-7 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white cursor-pointer"
            >
              <option value="created_desc">Plus récentes</option>
              <option value="priority_desc">Priorité</option>
              <option value="title_asc">A-Z</option>
              <option value="created_asc">Plus anciennes</option>
            </select>
            <ArrowUpDown className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Réinitialiser tous les filtres"
              className="text-xs px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-dashed border-slate-300 dark:border-slate-700 rounded-md whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
