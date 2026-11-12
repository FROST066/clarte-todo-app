import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { TaskStore } from '../server/store.js';

describe('TaskStore & persistance tasks.json', () => {
  let tmpDir;
  let tasksFilePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-store-test-'));
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

  it('refuse la création d’une tâche avec un titre vide ou manquant', () => {
    const store = new TaskStore(tasksFilePath);
    assert.throws(() => store.create({ title: '' }), /titre est obligatoire/i);
    assert.throws(() => store.create({ title: '   ' }), /titre est obligatoire/i);
    assert.throws(() => store.create({}), /titre est obligatoire/i);
    assert.throws(() => store.create(null), /titre est obligatoire/i);
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

  it('refuse la mise à jour d’une tâche avec un titre vide ou uniquement des espaces', () => {
    const store = new TaskStore(tasksFilePath);
    const created = store.create({ title: 'Tâche valide' });
    assert.throws(() => store.update(created.id, { title: '' }), /titre ne peut pas être vide/i);
    assert.throws(() => store.update(created.id, { title: '   ' }), /titre ne peut pas être vide/i);
  });

  it('permet de marquer une tâche comme faite puis de revenir en arrière avec persistance dans tasks.json', () => {
    const store = new TaskStore(tasksFilePath);
    const created = store.create({ title: 'Tester bascule statut' });
    assert.equal(created.completed, false);

    // 1. Marquer comme faite
    const markedDone = store.update(created.id, { completed: true });
    assert.equal(markedDone.completed, true);
    assert.ok(markedDone.completedAt);

    let diskTasks = JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
    let diskTask = diskTasks.find((t) => t.id === created.id);
    assert.equal(diskTask.completed, true);
    assert.ok(diskTask.completedAt);

    // 2. Revenir en arrière (démarquer la tâche)
    const reverted = store.update(created.id, { completed: false });
    assert.equal(reverted.completed, false);
    assert.equal(reverted.completedAt, undefined);

    diskTasks = JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
    diskTask = diskTasks.find((t) => t.id === created.id);
    assert.equal(diskTask.completed, false);
    assert.equal(diskTask.completedAt, undefined);
  });

  it('filtre les tâches par statut : toutes, seulement actives, seulement terminées', () => {
    const store = new TaskStore(tasksFilePath);
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

    assert.ok(activeTasks.every((t) => !t.completed));
    assert.ok(completedTasks.every((t) => t.completed));
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
