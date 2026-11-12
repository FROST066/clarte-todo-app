import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md ${
          isError
            ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : isSuccess
            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-slate-900/95 dark:bg-slate-800/95 border-slate-700 text-white'
        }`}
      >
        <div className="shrink-0 mt-0.5" aria-hidden="true">
          {isError && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          {!isError && !isSuccess && <Info className="w-4 h-4 text-slate-300" />}
        </div>

        <p className="text-xs sm:text-sm font-medium flex-1 leading-snug">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 -mr-1 -mt-1 text-current opacity-60 hover:opacity-100 rounded transition-opacity"
          aria-label="Fermer la notification"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
