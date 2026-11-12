import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { TaskStore } from '../server/store.js';
import { createApp } from '../server/app.js';

describe('TaskStore & tasks.json persistence', () => {
  let tmpDir;
  let tasksFilePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
    tasksFilePath = path.join(tmpDir, 'tasks.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('initialise tasks.json avec les tâches par défaut si le fichier n’existe pas', () => {
    const store = new TaskStore(tasksFilePath);
    assert.equal(fs.existsSync(tasksFilePath), true);
    const tasks = store.getAll();
    assert.ok(tasks.length > 0);
  });

  it('ajoute une nouvelle tâche et la persiste dans tasks.json', () => {
    const store = new TaskStore(tasksFilePath);
    const initialCount = store.getAll().length;

    const newTask = store.create({
      title: 'Tâche de test',
      description: 'Détail du test',
      priority: 'high',
      category: 'Test',
    });

    assert.equal(newTask.title, 'Tâche de test');
    assert.equal(newTask.completed, false);
    assert.equal(newTask.priority, 'high');

    // Vérification relecture depuis disque
    const raw = JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
    assert.equal(raw.length, initialCount + 1);
    assert.equal(raw[0].id, newTask.id);
  });

  it('met à jour le statut et les propriétés d’une tâche', () => {
    const store = new TaskStore(tasksFilePath);
    const created = store.create({ title: 'A modifier' });

    const updated = store.update(created.id, {
      completed: true,
      title: 'Tâche modifiée',
    });

    assert.equal(updated.completed, true);
    assert.equal(updated.title, 'Tâche modifiée');
    assert.ok(updated.completedAt);

    const reloaded = store.getById(created.id);
    assert.equal(reloaded.completed, true);
    assert.equal(reloaded.title, 'Tâche modifiée');
  });

  it('supprime une tâche par id', () => {
    const store = new TaskStore(tasksFilePath);
    const created = store.create({ title: 'A supprimer' });
    const success = store.delete(created.id);

    assert.equal(success, true);
    assert.equal(store.getById(created.id), undefined);
  });
});

describe('Express API Endpoints', () => {
  let tmpDir;
  let tasksFilePath;
  let server;
  let baseUrl;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-api-test-'));
    tasksFilePath = path.join(tmpDir, 'tasks.json');
    const { app } = createApp({ tasksFilePath });

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('GET /api/tasks renvoie la liste des tâches', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  it('POST /api/tasks crée une tâche valide', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Nouvelle tâche API',
        priority: 'high',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.title, 'Nouvelle tâche API');
    assert.equal(data.priority, 'high');
  });

  it('POST /api/tasks refuse une tâche sans titre', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });
    assert.equal(res.status, 400);
    const err = await res.json();
    assert.ok(err.error);
  });

  it('PUT /api/tasks/:id met à jour la tâche', async () => {
    const listRes = await fetch(`${baseUrl}/api/tasks`);
    const tasks = await listRes.json();
    const target = tasks[0];

    const putRes = await fetch(`${baseUrl}/api/tasks/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    assert.equal(putRes.status, 200);
    const updated = await putRes.json();
    assert.equal(updated.completed, true);
  });

  it('DELETE /api/tasks/:id supprime la tâche', async () => {
    const createRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Temporaire' }),
    });
    const created = await createRes.json();

    const delRes = await fetch(`${baseUrl}/api/tasks/${created.id}`, {
      method: 'DELETE',
    });
    assert.equal(delRes.status, 204);

    const getRes = await fetch(`${baseUrl}/api/tasks/${created.id}`);
    assert.equal(getRes.status, 404);
  });
});

describe('Static File Serving & SPA Fallback', () => {
  let tmpDir;
  let distDir;
  let server;
  let baseUrl;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-static-test-'));
    distDir = path.join(tmpDir, 'dist');
    fs.mkdirSync(distDir);
    fs.writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><html><body>Test SPA</body></html>');
    fs.writeFileSync(path.join(distDir, 'dummy.txt'), 'hello world');

    const tasksFilePath = path.join(tmpDir, 'tasks.json');
    const { app } = createApp({ tasksFilePath, distDir });

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('sert les fichiers statiques de dist', async () => {
    const res = await fetch(`${baseUrl}/dummy.txt`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.equal(text, 'hello world');
  });

  it('sert index.html sur la racine et en fallback SPA', async () => {
    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootHtml = await rootRes.text();
    assert.ok(rootHtml.includes('Test SPA'));

    const routeRes = await fetch(`${baseUrl}/some-spa-route`);
    assert.equal(routeRes.status, 200);
    const routeHtml = await routeRes.text();
    assert.ok(routeHtml.includes('Test SPA'));
  });
});
