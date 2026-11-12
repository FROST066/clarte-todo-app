import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { request, createTestEnvironment } from './helpers.js';

describe('Routes d’actions globales (POST /api/tasks/toggle-all, POST /api/tasks/reset)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment({
      initialTasks: [
        {
          id: 'task-action-1',
          title: 'Tâche 1',
          completed: false,
          createdAt: '2026-11-12T10:00:00.000Z',
        },
        {
          id: 'task-action-2',
          title: 'Tâche 2',
          completed: true,
          completedAt: '2026-11-12T10:30:00.000Z',
          createdAt: '2026-11-12T09:00:00.000Z',
        },
      ],
    });
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('POST /api/tasks/toggle-all', () => {
    it('bascule toutes les tâches en complétées avec completed=true (200)', async () => {
      const res = await request(env.app, {
        method: 'POST',
        url: '/api/tasks/toggle-all',
        body: { completed: true },
      });

      assert.equal(res.status, 200);
      const tasks = res.json();
      assert.equal(tasks.length, 2);
      assert.ok(tasks.every((t) => t.completed === true));
      assert.ok(tasks.every((t) => typeof t.completedAt === 'string'));

      // Persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.ok(fileData.every((t) => t.completed === true));
    });

    it('bascule toutes les tâches en non-complétées avec completed=false (200)', async () => {
      const res = await request(env.app, {
        method: 'POST',
        url: '/api/tasks/toggle-all',
        body: { completed: false },
      });

      assert.equal(res.status, 200);
      const tasks = res.json();
      assert.equal(tasks.length, 2);
      assert.ok(tasks.every((t) => t.completed === false));
      assert.ok(tasks.every((t) => t.completedAt === undefined));

      // Persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.ok(fileData.every((t) => t.completed === false));
    });

    it('bascule intelligemment l’état quand aucun booléen n’est fourni (incomplètes -> toutes complètes)', async () => {
      // Au départ : 1 incomplète, 1 complète -> bascule vers toutes complètes
      const res1 = await request(env.app, {
        method: 'POST',
        url: '/api/tasks/toggle-all',
        body: {},
      });
      assert.equal(res1.status, 200);
      assert.ok(res1.json().every((t) => t.completed === true));

      // Second appel : toutes sont complètes -> bascule vers toutes incomplètes
      const res2 = await request(env.app, {
        method: 'POST',
        url: '/api/tasks/toggle-all',
        body: {},
      });
      assert.equal(res2.status, 200);
      assert.ok(res2.json().every((t) => t.completed === false));
    });
  });

  describe('POST /api/tasks/reset', () => {
    it('réinitialise les tâches aux valeurs par défaut (200)', async () => {
      // D'abord modifier l'état (ex: vider toutes les tâches)
      await request(env.app, { method: 'DELETE', url: '/api/tasks' });
      const emptyCheck = await request(env.app, { method: 'GET', url: '/api/tasks' });
      assert.equal(emptyCheck.json().length, 0);

      // Appeler le reset
      const res = await request(env.app, {
        method: 'POST',
        url: '/api/tasks/reset',
      });

      assert.equal(res.status, 200);
      const tasks = res.json();
      assert.ok(Array.isArray(tasks));
      assert.ok(tasks.length > 0);

      // Vérifier la présence des tâches initiales standard
      assert.ok(tasks.some((t) => t.title.includes('présentation du projet')));
      assert.ok(tasks.some((t) => t.title.includes('devis validé au client')));

      // Vérifie la persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.equal(fileData.length, tasks.length);
      assert.equal(fileData[0].title, tasks[0].title);
    });
  });
});
