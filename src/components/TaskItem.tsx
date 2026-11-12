import { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Edit3, Copy, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, Priority, PRIORITY_CONFIG } from '../types/todo';
import { formatTaskDate } from '../utils/date';
import { highlightText } from '../utils/highlight';

interface TaskItemProps {
  task: Task;
  searchQuery?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDuplicate: (id: string) => void;
}

export function TaskItem({
  task,
  searchQuery = '',
  onToggle,
  onDelete,
  onUpdate,
  onDuplicate,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editCategory, setEditCategory] = useState(task.category || '');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      return;
    }
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      category: editCategory.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
    setEditCategory(task.category || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const priorityMeta = PRIORITY_CONFIG[task.priority];
  const formattedDueDate = formatTaskDate(task.dueDate);
  const isOverdue = formattedDueDate?.includes('En retard') && !task.completed;

  if (isEditing) {
    const editTitleId = `edit-title-${task.id}`;
    const editDescId = `edit-desc-${task.id}`;
    const editPrioId = `edit-prio-${task.id}`;
    const editDueId = `edit-due-${task.id}`;
    const editCatId = `edit-cat-${task.id}`;

    return (
      <li className="list-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 shadow-sm space-y-3">
        <div>
          <label htmlFor={editTitleId} className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Modifier la tâche
          </label>
          <input
            ref={editInputRef}
            id={editTitleId}
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
          />
        </div>

        <div>
          <label htmlFor={editDescId} className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Note ou détails
          </label>
          <textarea
            id={editDescId}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            rows={2}
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Priority */}
          <div>
            <label htmlFor={editPrioId} className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Priorité
            </label>
            <select
              id={editPrioId}
              value={editPriority}
              onChange={e => setEditPriority(e.target.value as Priority)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
            >
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor={editDueId} className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Échéance
            </label>
            <input
              id={editDueId}
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor={editCatId} className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Catégorie
            </label>
            <input
              id={editCatId}
              type="text"
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              placeholder="Ex: Travail"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={!editTitle.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
          >
            Enregistrer
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className="list-none group relative bg-white dark:bg-slate-900 border rounded-xl p-3.5 sm:p-4 transition-all duration-150 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
    >
      <div className="flex items-start gap-3">
        {/* Custom Accessible Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-2 ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-800'
          }`}
          aria-label={
            task.completed
              ? `Marquer la tâche "${task.title}" comme non terminée`
              : `Marquer la tâche "${task.title}" comme terminée`
          }
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />}
        </button>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3
                className={`text-sm sm:text-base font-medium leading-snug select-none transition-colors ${
                  task.completed
                    ? 'line-through text-slate-900 dark:text-slate-100 decoration-slate-400 dark:decoration-slate-500 decoration-2'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {highlightText(task.title, searchQuery)}
              </h3>

              {/* Distinct colored priority badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 select-none transition-all ${priorityMeta.badgeClass}`}
              >
                <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotClass}`} />
                <span>{priorityMeta.label}</span>
              </span>
            </div>

            {/* Actions: visible on hover AND on keyboard focus */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Modifier la tâche"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1"
                aria-label={`Modifier la tâche "${task.title}"`}
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onDuplicate(task.id)}
                title="Dupliquer la tâche"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white focus-visible:outline-offset-1"
                aria-label={`Dupliquer la tâche "${task.title}"`}
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(task.id)}
                title="Supprimer la tâche"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors focus-visible:outline-2 focus-visible:outline-rose-600 dark:focus-visible:outline-rose-400 focus-visible:outline-offset-1"
                aria-label={`Supprimer la tâche "${task.title}"`}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Description preview or text */}
          {task.description && (
            <div className="mt-1">
              <p
                id={`task-desc-${task.id}`}
                className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed ${
                  task.completed ? 'line-through decoration-slate-400 dark:decoration-slate-500' : ''
                } ${isDescriptionOpen ? '' : 'line-clamp-2'}`}
              >
                {highlightText(task.description, searchQuery)}
              </p>
              {task.description.length > 90 && (
                <button
                  type="button"
                  aria-expanded={isDescriptionOpen}
                  aria-controls={`task-desc-${task.id}`}
                  aria-label={
                    isDescriptionOpen
                      ? `Réduire la description de "${task.title}"`
                      : `Afficher toute la description de "${task.title}"`
                  }
                  onClick={() => setIsDescriptionOpen(prev => !prev)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-0.5 inline-flex items-center gap-0.5 focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
                >
                  <span>{isDescriptionOpen ? 'Réduire' : 'Afficher plus'}</span>
                  {isDescriptionOpen ? (
                    <ChevronUp className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Metadata with typographic separator (·) */}
          {(task.category || formattedDueDate || task.completed) && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {/* Category if any */}
              {task.category && (
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Tag className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>{highlightText(task.category, searchQuery)}</span>
                </span>
              )}

              {/* Due Date if any */}
              {formattedDueDate && (
                <>
                  {task.category && (
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 ${
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    <span>{formattedDueDate}</span>
                  </span>
                </>
              )}

              {/* Completed indicator text if completed */}
              {task.completed && (
                <>
                  {(task.category || formattedDueDate) && (
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  )}
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                    Terminée
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
