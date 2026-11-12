import { Task, Priority, PRIORITY_CONFIG } from '../types/todo';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';

interface PriorityMatrixViewProps {
  tasks: Task[];
  searchQuery?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDuplicate: (id: string) => void;
  onQuickAddWithPriority: (priority: Priority) => void;
}

export function PriorityMatrixView({
  tasks,
  searchQuery = '',
  onToggle,
  onDelete,
  onUpdate,
  onDuplicate,
  onQuickAddWithPriority,
}: PriorityMatrixViewProps) {
  const priorities: Priority[] = ['high', 'medium', 'low'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {priorities.map(priority => {
        const config = PRIORITY_CONFIG[priority];
        const priorityTasks = tasks.filter(t => t.priority === priority);
        const remainingCount = priorityTasks.filter(t => !t.completed).length;

        return (
          <div
            key={priority}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col min-h-[350px] shadow-xs"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Priorité {config.label}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                {remainingCount} en cours
              </span>
            </div>

            {/* Tasks in column */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
              {priorityTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500">
                  <span>Aucune tâche {config.label.toLowerCase()}</span>
                </div>
              ) : (
                priorityTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    searchQuery={searchQuery}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onDuplicate={onDuplicate}
                  />
                ))
              )}
            </div>

            {/* Quick add for this priority */}
            <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onQuickAddWithPriority(priority)}
                className="w-full py-1.5 px-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter en priorité {config.label.toLowerCase()}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
