import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { request, createTestEnvironment } from './helpers.js';

describe('Routes de suppression (DELETE /api/tasks/:id, DELETE /api/tasks/completed, DELETE /api/tasks)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment({
      initialTasks: [
        {
          id: 'task-active-1',
          title: 'Tâche active 1',
          completed: false,
          createdAt: '2026-11-12T10:00:00.000Z',
        },
        {
          id: 'task-completed-1',
          title: 'Tâche complétée 1',
          completed: true,
          completedAt: '2026-11-12T11:00:00.000Z',
          createdAt: '2026-11-12T09:00:00.000Z',
        },
        {
          id: 'task-completed-2',
          title: 'Tâche complétée 2',
          completed: true,
          completedAt: '2026-11-12T11:30:00.000Z',
          createdAt: '2026-11-12T08:00:00.000Z',
        },
      ],
    });
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('DELETE /api/tasks/completed', () => {
    it('supprime toutes les tâches terminées (200 avec message et remaining)', async () => {
      const res = await request(env.app, {
        method: 'DELETE',
        url: '/api/tasks/completed',
      });

      assert.equal(res.status, 200);
      const data = res.json();
      assert.equal(data.message, 'Tâches terminées supprimées');
      assert.ok(Array.isArray(data.remaining));
      assert.equal(data.remaining.length, 1);
      assert.equal(data.remaining[0].id, 'task-active-1');
      assert.equal(data.remaining[0].completed, false);

      // Vérifie la persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.equal(fileData.length, 1);
      assert.equal(fileData[0].id, 'task-active-1');
    });

    it('fonctionne correctement s’il n’y a aucune tâche terminée', async () => {
      // D'abord supprimer les complétées
      await request(env.app, { method: 'DELETE', url: '/api/tasks/completed' });

      // Réexécuter la suppression
      const res = await request(env.app, { method: 'DELETE', url: '/api/tasks/completed' });
      assert.equal(res.status, 200);
      const data = res.json();
      assert.equal(data.remaining.length, 1);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('suppression nominale d’une tâche existante (204)', async () => {
      const res = await request(env.app, {
        method: 'DELETE',
        url: '/api/tasks/task-active-1',
      });

      assert.equal(res.status, 204);
      assert.equal(res.body, '');

      // Vérifie que la tâche n'existe plus via l'API
      const getRes = await request(env.app, {
        method: 'GET',
        url: '/api/tasks/task-active-1',
      });
      assert.equal(getRes.status, 404);

      // Vérifie la persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.ok(!fileData.some((t) => t.id === 'task-active-1'));
    });

    it('cas d’erreur : 404 si la tâche à supprimer n’existe pas', async () => {
      const res = await request(env.app, {
        method: 'DELETE',
        url: '/api/tasks/id-qui-nexiste-pas',
      });

      assert.equal(res.status, 404);
      const data = res.json();
      assert.ok(data.error);
      assert.equal(data.error, 'Tâche non trouvée');
    });
  });

  describe('DELETE /api/tasks', () => {
    it('suppression de toutes les tâches (204)', async () => {
      const res = await request(env.app, {
        method: 'DELETE',
        url: '/api/tasks',
      });

      assert.equal(res.status, 204);
      assert.equal(res.body, '');

      // Vérifie que la liste retournée est vide
      const listRes = await request(env.app, { method: 'GET', url: '/api/tasks' });
      assert.equal(listRes.status, 200);
      assert.deepEqual(listRes.json(), []);

      // Vérifie la persistance fichier
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      assert.deepEqual(fileData, []);
    });
  });
});
