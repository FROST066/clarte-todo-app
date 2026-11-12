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

  it('permet de marquer une tâche comme faite puis de revenir en arrière avec persistance dans tasks.json', () => {
    const store = new TaskStore(tasksFilePath);
    const created = store.create({ title: 'Tester bascule statut' });
    assert.equal(created.completed, false);

    // 1. Marquer comme faite
    const markedDone = store.update(created.id, { completed: true });
    assert.equal(markedDone.completed, true);
    assert.ok(markedDone.completedAt);

    // Vérification persistance disque dans tasks.json
    let diskTasks = JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
    let diskTask = diskTasks.find(t => t.id === created.id);
    assert.equal(diskTask.completed, true);
    assert.ok(diskTask.completedAt);

    // 2. Revenir en arrière (démarquer la tâche)
    const reverted = store.update(created.id, { completed: false });
    assert.equal(reverted.completed, false);
    assert.equal(reverted.completedAt, undefined);

    // Vérification persistance disque dans tasks.json après retour en arrière
    diskTasks = JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
    diskTask = diskTasks.find(t => t.id === created.id);
    assert.equal(diskTask.completed, false);
    assert.equal(diskTask.completedAt, undefined);
  });

  it('filtre les tâches par statut : toutes, seulement actives, seulement terminées', () => {
    const store = new TaskStore(tasksFilePath);
    // Vider pour tester le filtre de manière déterministe
    store.clearAll();

    const t1 = store.create({ title: 'Tâche à faire 1' });
    const t2 = store.create({ title: 'Tâche à faire 2' });
    const t3 = store.create({ title: 'Tâche terminée' });
    store.update(t3.id, { completed: true });

    const allTasks = store.getAll({ status: 'all' });
    const activeTasks = store.getAll({ status: 'active' });
    const completedTasks = store.getAll({ status: 'completed' });

    assert.equal(allTasks.length, 3);
    assert.equal(activeTasks.length, 2);
    assert.equal(completedTasks.length, 1);

    assert.ok(activeTasks.every(t => !t.completed));
    assert.ok(completedTasks.every(t => t.completed));
    assert.equal(completedTasks[0].id, t3.id);
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

  it('GET /api/tasks?status=active|completed filtre les tâches retournées', async () => {
    // Créer une tâche active et une terminée
    const postRes1 = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Tâche active API' }),
    });
    const taskActive = await postRes1.json();

    const postRes2 = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Tâche complétée API' }),
    });
    const taskToComplete = await postRes2.json();

    await fetch(`${baseUrl}/api/tasks/${taskToComplete.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    const activeRes = await fetch(`${baseUrl}/api/tasks?status=active`);
    const activeTasks = await activeRes.json();
    assert.ok(activeTasks.every((t) => !t.completed));
    assert.ok(activeTasks.some((t) => t.id === taskActive.id));

    const completedRes = await fetch(`${baseUrl}/api/tasks?status=completed`);
    const completedTasks = await completedRes.json();
    assert.ok(completedTasks.every((t) => t.completed));
    assert.ok(completedTasks.some((t) => t.id === taskToComplete.id));
  });

  it('PUT /api/tasks/:id met à jour la tâche et permet de revenir en arrière', async () => {
    const listRes = await fetch(`${baseUrl}/api/tasks`);
    const tasks = await listRes.json();
    const target = tasks[0];

    // Marquer comme faite
    const putRes = await fetch(`${baseUrl}/api/tasks/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    assert.equal(putRes.status, 200);
    const updated = await putRes.json();
    assert.equal(updated.completed, true);
    assert.ok(updated.completedAt);

    // Revenir en arrière
    const revertRes = await fetch(`${baseUrl}/api/tasks/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: false }),
    });

    assert.equal(revertRes.status, 200);
    const reverted = await revertRes.json();
    assert.equal(reverted.completed, false);
    assert.equal(reverted.completedAt, undefined);
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
