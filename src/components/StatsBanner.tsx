import { PriorityFilter } from '../types/todo';

interface StatsBannerProps {
  remaining: number;
  completed: number;
  total: number;
  percent: number;
  highRemaining: number;
  mediumRemaining: number;
  lowRemaining: number;
  priorityFilter: PriorityFilter;
  onSelectPriorityFilter: (filter: PriorityFilter) => void;
}

export function StatsBanner({
  remaining,
  completed,
  total,
  percent,
  highRemaining,
  mediumRemaining,
  lowRemaining,
  priorityFilter,
  onSelectPriorityFilter,
}: StatsBannerProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {remaining}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {remaining === 1 ? 'tâche restante' : 'tâches restantes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {total === 0
              ? 'Aucune tâche enregistrée'
              : `${completed} sur ${total} tâches terminées (${percent}%)`}
          </p>
        </div>

        {/* Priority quick view / filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
              priorityFilter === 'high'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-medium'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 hover:border-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Haute</span>
            <span className="tabular-nums font-semibold">{highRemaining}</span>
          </button>

          <button
            onClick={() => onSelectPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium')}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
              priorityFilter === 'medium'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 hover:border-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Moyenne</span>
            <span className="tabular-nums font-semibold">{mediumRemaining}</span>
          </button>

          <button
            onClick={() => onSelectPriorityFilter(priorityFilter === 'low' ? 'all' : 'low')}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
              priorityFilter === 'low'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 hover:border-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Basse</span>
            <span className="tabular-nums font-semibold">{lowRemaining}</span>
          </button>
        </div>
      </div>

      {/* Clean progress bar */}
      <div className="pt-3">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
