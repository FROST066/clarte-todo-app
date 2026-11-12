import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { request, createTestEnvironment } from './helpers.js';

describe('Routes de mutation (POST /api/tasks, PUT /api/tasks/:id)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment({
      initialTasks: [
        {
          id: 'task-initial-1',
          title: 'Tâche existante',
          description: 'Description initiale',
          completed: false,
          priority: 'medium',
          category: 'Travail',
          dueDate: '2026-12-01',
          createdAt: '2026-11-12T10:00:00.000Z',
        },
      ],
    });
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('POST /api/tasks', () => {
    it('création nominale (201 avec titre, description, priority, category, dueDate)', async () => {
      const payload = {
        title: 'Nouvelle tâche complète',
        description: 'Détails exhaustifs de la tâche',
        priority: 'high',
        category: 'Projet',
        dueDate: '2026-12-31',
      };

      const res = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: payload,
      });

      assert.equal(res.status, 201);
      const created = res.json();
      assert.ok(created.id);
      assert.equal(created.title, payload.title);
      assert.equal(created.description, payload.description);
      assert.equal(created.priority, payload.priority);
      assert.equal(created.category, payload.category);
      assert.equal(created.dueDate, payload.dueDate);
      assert.equal(created.completed, false);
      assert.ok(created.createdAt);

      // Vérifie la persistance dans le fichier temporaire
      const fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      const persisted = fileData.find((t) => t.id === created.id);
      assert.ok(persisted);
      assert.equal(persisted.title, payload.title);
    });

    it('validation d’erreur : 400 si titre manquant dans le body', async () => {
      const res = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: { description: 'Sans titre' },
      });

      assert.equal(res.status, 400);
      const data = res.json();
      assert.ok(data.error);
      assert.equal(data.error, 'Le titre est obligatoire');
    });

    it('validation d’erreur : 400 si titre est une chaîne vide ou uniquement des espaces', async () => {
      const emptyRes = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: { title: '' },
      });
      assert.equal(emptyRes.status, 400);
      assert.equal(emptyRes.json().error, 'Le titre est obligatoire');

      const spaceRes = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: { title: '     ' },
      });
      assert.equal(spaceRes.status, 400);
      assert.equal(spaceRes.json().error, 'Le titre est obligatoire');
    });

    it('validation d’erreur : 400 si le body est vide ou titre non string', async () => {
      const nullBodyRes = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: null,
      });
      assert.equal(nullBodyRes.status, 400);

      const invalidTypeRes = await request(env.app, {
        method: 'POST',
        url: '/api/tasks',
        body: { title: 12345 },
      });
      assert.equal(invalidTypeRes.status, 400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('mise à jour nominale : modification du statut completed et des propriétés', async () => {
      // 1. Marquer comme complétée et changer le titre
      const res1 = await request(env.app, {
        method: 'PUT',
        url: '/api/tasks/task-initial-1',
        body: {
          title: 'Titre modifié',
          completed: true,
          priority: 'urgent',
          description: 'Nouvelle description',
        },
      });

      assert.equal(res1.status, 200);
      const updated1 = res1.json();
      assert.equal(updated1.title, 'Titre modifié');
      assert.equal(updated1.completed, true);
      assert.equal(updated1.priority, 'urgent');
      assert.equal(updated1.description, 'Nouvelle description');
      assert.ok(updated1.completedAt);

      // Vérifie la persistance après 1ère màj
      let fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      let persisted = fileData.find((t) => t.id === 'task-initial-1');
      assert.equal(persisted.completed, true);
      assert.equal(persisted.title, 'Titre modifié');

      // 2. Démarquer la tâche (completed: false)
      const res2 = await request(env.app, {
        method: 'PUT',
        url: '/api/tasks/task-initial-1',
        body: { completed: false },
      });

      assert.equal(res2.status, 200);
      const updated2 = res2.json();
      assert.equal(updated2.completed, false);
      assert.equal(updated2.completedAt, undefined);

      // Vérifie la persistance après 2ème màj
      fileData = JSON.parse(fs.readFileSync(env.tasksFilePath, 'utf-8'));
      persisted = fileData.find((t) => t.id === 'task-initial-1');
      assert.equal(persisted.completed, false);
      assert.equal(persisted.completedAt, undefined);
    });

    it('validation d’erreur : 400 si titre de mise à jour est vide ou uniquement des espaces', async () => {
      const emptyRes = await request(env.app, {
        method: 'PUT',
        url: '/api/tasks/task-initial-1',
        body: { title: '' },
      });
      assert.equal(emptyRes.status, 400);
      assert.equal(emptyRes.json().error, 'Le titre ne peut pas être vide');

      const spaceRes = await request(env.app, {
        method: 'PUT',
        url: '/api/tasks/task-initial-1',
        body: { title: '   ' },
      });
      assert.equal(spaceRes.status, 400);
      assert.equal(spaceRes.json().error, 'Le titre ne peut pas être vide');
    });

    it('cas d’erreur : 404 si la tâche à mettre à jour n’existe pas', async () => {
      const res = await request(env.app, {
        method: 'PUT',
        url: '/api/tasks/id-qui-nexiste-pas',
        body: { title: 'Tentative modification' },
      });

      assert.equal(res.status, 404);
      const data = res.json();
      assert.ok(data.error);
      assert.equal(data.error, 'Tâche non trouvée');
    });
  });
});
