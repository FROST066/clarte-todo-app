import { CheckSquare, Moon, Sun, RotateCcw } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetSample: () => void;
  activeTab: 'all' | 'focus';
  setActiveTab: (tab: 'all' | 'focus') => void;
}

export function Header({
  theme,
  onToggleTheme,
  onResetSample,
  activeTab,
  setActiveTab,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Clarté
          </span>
        </div>

        {/* Zone 2: Navigation views */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'all'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vue d'ensemble
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'focus'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus Priorités
            {activeTab === 'focus' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Utility actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetSample}
            title="Recharger les tâches exemples"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Recharger les exemples"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
