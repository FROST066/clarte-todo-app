import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TaskStore } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(options = {}) {
  const app = express();
  const store = options.store || new TaskStore(options.tasksFilePath);

  app.use(express.json());

  // API Routes
  app.get('/api/tasks', (req, res) => {
    const { status } = req.query;
    res.json(store.getAll({ status }));
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = store.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    res.json(task);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, description, priority, dueDate, category } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Le titre est obligatoire' });
    }
    try {
      const task = store.create({ title, description, priority, dueDate, category });
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Le titre est obligatoire' });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { title } = req.body || {};
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'Le titre ne peut pas être vide' });
    }
    try {
      const updated = store.update(req.params.id, req.body || {});
      if (!updated) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Données invalides' });
    }
  });

  app.delete('/api/tasks/completed', (req, res) => {
    const remaining = store.clearCompleted();
    res.json({ message: 'Tâches terminées supprimées', remaining });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const deleted = store.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    res.status(204).end();
  });

  app.delete('/api/tasks', (req, res) => {
    store.clearAll();
    res.status(204).end();
  });

  app.post('/api/tasks/toggle-all', (req, res) => {
    const { completed } = req.body || {};
    const updated = store.toggleAll(completed);
    res.json(updated);
  });

  app.post('/api/tasks/reset', (req, res) => {
    const tasks = store.reset();
    res.json(tasks);
  });

  // Serve static assets from front dist directory
  const distDir = options.distDir || path.resolve(__dirname, '../dist');
  app.use(express.static(distDir));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application build non trouvée. Veuillez exécuter `npm run build`.');
    }
  });

  return { app, store };
}
