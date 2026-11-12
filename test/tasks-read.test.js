import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { request, createTestEnvironment } from './helpers.js';

describe('Routes de lecture (GET /api/tasks, GET /api/tasks/:id)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment({
      initialTasks: [
        {
          id: 'task-active-1',
          title: 'Tâche active 1',
          completed: false,
          createdAt: '2026-11-12T10:00:00.000Z',
          priority: 'high',
          category: 'Travail',
        },
        {
          id: 'task-active-2',
          title: 'Tâche active 2',
          completed: false,
          createdAt: '2026-11-12T11:00:00.000Z',
          priority: 'medium',
          category: 'Perso',
        },
        {
          id: 'task-completed-1',
          title: 'Tâche terminée 1',
          completed: true,
          completedAt: '2026-11-12T12:00:00.000Z',
          createdAt: '2026-11-12T09:00:00.000Z',
          priority: 'low',
          category: 'Divers',
        },
      ],
    });
  });

  afterEach(() => {
    env.cleanup();
  });

  it('GET /api/tasks : renvoie toutes les tâches sans filtre', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks' });
    assert.equal(res.status, 200);
    const tasks = res.json();
    assert.ok(Array.isArray(tasks));
    assert.equal(tasks.length, 3);
  });

  it('GET /api/tasks?status=all : renvoie toutes les tâches avec le statut explicite "all"', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks?status=all' });
    assert.equal(res.status, 200);
    const tasks = res.json();
    assert.equal(tasks.length, 3);
  });

  it('GET /api/tasks?status=active : filtre uniquement les tâches non complétées', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks?status=active' });
    assert.equal(res.status, 200);
    const tasks = res.json();
    assert.equal(tasks.length, 2);
    assert.ok(tasks.every((t) => t.completed === false));
    assert.ok(tasks.some((t) => t.id === 'task-active-1'));
    assert.ok(tasks.some((t) => t.id === 'task-active-2'));
  });

  it('GET /api/tasks?status=completed : filtre uniquement les tâches complétées', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks?status=completed' });
    assert.equal(res.status, 200);
    const tasks = res.json();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, 'task-completed-1');
    assert.equal(tasks[0].completed, true);
  });

  it('GET /api/tasks/:id : cas nominal (200 avec la tâche correspondante)', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks/task-active-1' });
    assert.equal(res.status, 200);
    const task = res.json();
    assert.equal(task.id, 'task-active-1');
    assert.equal(task.title, 'Tâche active 1');
    assert.equal(task.completed, false);
    assert.equal(task.priority, 'high');
  });

  it('GET /api/tasks/:id : cas d’erreur (404 si la tâche n’existe pas)', async () => {
    const res = await request(env.app, { method: 'GET', url: '/api/tasks/id-inexistant-12345' });
    assert.equal(res.status, 404);
    const data = res.json();
    assert.ok(data.error);
    assert.equal(data.error, 'Tâche non trouvée');
  });
});
