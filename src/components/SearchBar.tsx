import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" or "Ctrl+K" / "Cmd+K" focuses search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (searchQuery) {
          onSearchChange('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs transition-all focus-within:border-slate-400 dark:focus-within:border-slate-600 focus-within:ring-2 focus-within:ring-slate-900/5 dark:focus-within:ring-white/5">
      <div className="relative flex items-center gap-2.5">
        <div className="text-slate-400 dark:text-slate-500 pl-1 shrink-0">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Rechercher par mot-clé en temps réel (titre, note, tag)..."
          className="w-full text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          aria-label="Rechercher une tâche en temps réel"
        />

        {/* Real-time match counter pill and clear button */}
        <div className="flex items-center gap-2 shrink-0">
          {isSearching && (
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {filteredCount} {filteredCount === 1 ? 'résultat' : 'résultats'}
            </span>
          )}

          {isSearching ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Effacer la recherche (Échap)"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded select-none">
              /
            </kbd>
          )}
        </div>
      </div>
    </div>
  );
}
