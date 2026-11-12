import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Calendar, Tag, FileText } from 'lucide-react';
import { Priority, PRIORITY_CONFIG } from '../types/todo';

interface TaskFormProps {
  onAddTask: (data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    category?: string;
  }) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Veuillez renseigner un titre pour la tâche.');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      category: category.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setCategory('');
    setError('');
    // keep current priority for continuous entry or reset to medium
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const setPresetDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    setDueDate(target.toISOString().split('T')[0]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Formulaire d'ajout de tâche"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-all"
    >
      <div className="flex flex-col gap-3">
        {/* Main input row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label htmlFor="new-task-title" className="sr-only">
              Titre de la tâche à ajouter
            </label>
            <input
              id="new-task-title"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Que souhaitez-vous accomplir ?"
              aria-invalid={!!error}
              aria-describedby={error ? 'new-task-error' : undefined}
              className="w-full text-sm sm:text-base px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-400 dark:focus:border-slate-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            aria-label="Ajouter la tâche"
            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 dark:disabled:hover:bg-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Ajouter</span>
          </button>
        </div>

        {error && (
          <p id="new-task-error" role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}

        {/* Priority bar & details trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Priority selection */}
          <div className="flex items-center gap-2">
            <span id="priority-label" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Priorité :
            </span>
            <div
              role="radiogroup"
              aria-labelledby="priority-label"
              className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100/70 dark:bg-slate-800/70"
            >
              <button
                type="button"
                role="radio"
                aria-checked={priority === 'low'}
                onClick={() => setPriority('low')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                  priority === 'low'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Basse
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={priority === 'medium'}
                onClick={() => setPriority('medium')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                  priority === 'medium'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Moyenne
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={priority === 'high'}
                onClick={() => setPriority('high')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1 ${
                  priority === 'high'
                    ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Haute
              </button>
            </div>
          </div>

          {/* Toggle optional details */}
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="task-form-details"
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-2 rounded-xs"
          >
            <span>{isExpanded ? 'Moins d’options' : 'Plus d’options (date, note, catégorie)'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Expandable details area */}
        {isExpanded && (
          <div id="task-form-details" className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            {/* Description note */}
            <div>
              <label htmlFor="new-task-description" className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Description ou détails (facultatif)</span>
              </label>
              <textarea
                id="new-task-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Ajouter des notes, sous-tâches ou précisions..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Due date */}
              <div>
                <label htmlFor="new-task-duedate" className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Échéance</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="new-task-duedate"
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                  />
                  <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Raccourcis de date d'échéance">
                    <button
                      type="button"
                      onClick={() => setPresetDate(0)}
                      aria-label="Définir l'échéance à aujourd'hui"
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1"
                    >
                      Auj.
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetDate(1)}
                      aria-label="Définir l'échéance à demain"
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1"
                    >
                      Demain
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="new-task-category" className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Catégorie / Contexte</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="new-task-category"
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Travail, Perso, Projet X"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
