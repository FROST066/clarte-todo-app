import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { request, createTestEnvironment } from './helpers.js';

describe('Fallback SPA & fichiers statiques', () => {
  let env;
  let mockDistDir;

  beforeEach(() => {
    env = createTestEnvironment();
    mockDistDir = path.join(env.tmpDir, 'mock-dist');
    fs.mkdirSync(mockDistDir, { recursive: true });

    // Fichiers statiques simulés
    fs.writeFileSync(
      path.join(mockDistDir, 'index.html'),
      '<!doctype html><html><head><title>Clarté</title></head><body><div id="root">SPA App</div></body></html>',
      'utf-8'
    );
    fs.writeFileSync(path.join(mockDistDir, 'style.css'), 'body { background: #fff; }', 'utf-8');
  });

  afterEach(() => {
    env.cleanup();
  });

  it('sert les fichiers statiques présents dans distDir avec le code 200', async () => {
    const { app } = createTestEnvironment({ distDir: mockDistDir });
    const res = await request(app, { method: 'GET', url: '/style.css' });

    assert.equal(res.status, 200);
    assert.equal(res.text(), 'body { background: #fff; }');
  });

  it('sert index.html sur la racine "/"', async () => {
    const { app } = createTestEnvironment({ distDir: mockDistDir });
    const res = await request(app, { method: 'GET', url: '/' });

    assert.equal(res.status, 200);
    const html = res.text();
    assert.ok(html.includes('<title>Clarté</title>'));
    assert.ok(html.includes('SPA App'));
  });

  it('sert index.html en fallback SPA pour des routes client arbitraires', async () => {
    const { app } = createTestEnvironment({ distDir: mockDistDir });

    const paths = ['/tasks', '/active', '/settings/profile', '/some/deep/route'];
    for (const routePath of paths) {
      const res = await request(app, { method: 'GET', url: routePath });
      assert.equal(res.status, 200, `La route ${routePath} devrait renvoyer 200`);
      assert.ok(res.text().includes('SPA App'));
    }
  });

  it('ne capture pas les routes /api inconnues (laisse Express répondre en 404 API standard)', async () => {
    const { app } = createTestEnvironment({ distDir: mockDistDir });
    const res = await request(app, { method: 'GET', url: '/api/non-existent-route' });

    assert.equal(res.status, 404);
    assert.ok(!res.text().includes('SPA App'), 'Ne doit pas servir index.html pour les routes /api');
  });

  it('renvoie une 404 explicite si le fichier dist/index.html n’existe pas', async () => {
    const emptyDistDir = path.join(env.tmpDir, 'empty-dist');
    fs.mkdirSync(emptyDistDir, { recursive: true });

    const { app } = createTestEnvironment({ distDir: emptyDistDir });
    const res = await request(app, { method: 'GET', url: '/any-route' });

    assert.equal(res.status, 404);
    assert.ok(res.text().includes('Application build non trouvée'));
  });
});
