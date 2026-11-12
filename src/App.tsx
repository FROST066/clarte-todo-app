/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { TaskForm } from './components/TaskForm';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { PriorityMatrixView } from './components/PriorityMatrixView';
import { Priority } from './types/todo';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'focus'>('all');

  const {
    tasks,
    filteredTasks,
    stats,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    duplicateTask,
    clearCompleted,
    toggleAll,
    resetToSample,
  } = useTasks();

  const handleQuickAddWithPriority = (priority: Priority) => {
    const taskName = prompt(`Titre de la nouvelle tâche (${priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'} priorité) :`);
    if (taskName && taskName.trim()) {
      addTask({
        title: taskName.trim(),
        priority,
      });
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetSample={resetToSample}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Real-time remaining counter and progress */}
        <StatsBanner
          remaining={stats.remaining}
          completed={stats.completed}
          total={stats.total}
          percent={stats.percent}
          highRemaining={stats.highRemaining}
          mediumRemaining={stats.mediumRemaining}
          lowRemaining={stats.lowRemaining}
          priorityFilter={priorityFilter}
          onSelectPriorityFilter={setPriorityFilter}
        />

        {/* Task Creator Form */}
        <TaskForm onAddTask={addTask} />

        {/* Real-time Search Bar at top of the task list */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredCount={filteredTasks.length}
          totalCount={tasks.length}
        />

        {/* Dynamic Filter Controls & List vs Focus View */}
        {activeTab === 'all' ? (
          <div className="space-y-4">
            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={stats.total}
              activeCount={stats.remaining}
              completedCount={stats.completed}
            />

            <TaskList
              tasks={filteredTasks}
              allTasksCount={stats.total}
              searchQuery={searchQuery}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onDuplicate={duplicateTask}
              onClearCompleted={clearCompleted}
              onToggleAll={toggleAll}
              onResetFilters={handleResetFilters}
              onResetSample={resetToSample}
              onClearSearch={() => setSearchQuery('')}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>Répartition par colonnes de priorité pour une organisation ciblée.</span>
              <span className="tabular-nums font-medium">{stats.remaining} tâches à réaliser</span>
            </div>

            <PriorityMatrixView
              tasks={searchQuery.trim() ? filteredTasks : tasks}
              searchQuery={searchQuery}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onDuplicate={duplicateTask}
              onQuickAddWithPriority={handleQuickAddWithPriority}
            />
          </div>
        )}
      </main>

      {/* Quiet, minimalist footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-5 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Clarté · Gestion de tâches fluide et sans distraction</span>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>Sauvegarde automatique locale</span>
            <span aria-hidden="true">·</span>
            <span>Raccourci Entrée pour valider</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
