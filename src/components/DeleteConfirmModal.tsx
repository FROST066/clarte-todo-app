import { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { Task, PRIORITY_CONFIG } from '../types/todo';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  task,
  isOpen,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isDeleting) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !task) {
    return null;
  }

  const priorityMeta = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={e => {
        if (e.target === e.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="delete-dialog-title"
                className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                Supprimer la tâche ?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cette action est irréversible.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Preview Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
              {task.title}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${priorityMeta.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotClass}`} />
              <span>{priorityMeta.label}</span>
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {task.category && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Catégorie : <span className="font-medium text-slate-700 dark:text-slate-300">{task.category}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Supprimer définitivement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
