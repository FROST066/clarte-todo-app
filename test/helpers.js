import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { Duplex } from 'node:stream';
import { createApp } from '../server/app.js';

class MockSocket extends Duplex {
  _read() {}
  _write(chunk, enc, cb) {
    cb();
  }
}

/**
 * Execute une requête HTTP in-memory contre l'application Express sans passer par les sockets réseau réels.
 */
export function request(app, { method = 'GET', url = '/', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const socket = new MockSocket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;

    let payload = null;
    const reqHeaders = { ...headers };
    if (body !== null && body !== undefined) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      if (!reqHeaders['content-type']) {
        reqHeaders['content-type'] = 'application/json';
      }
      reqHeaders['content-length'] = Buffer.byteLength(payload);
    }
    req.headers = Object.fromEntries(
      Object.entries(reqHeaders).map(([k, v]) => [k.toLowerCase(), String(v)])
    );

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    const chunks = [];
    socket._write = (chunk, enc, cb) => {
      chunks.push(chunk);
      cb();
    };

    res.on('finish', () => {
      const output = Buffer.concat(chunks).toString();
      const splitIdx = output.indexOf('\r\n\r\n');
      const resBody = splitIdx !== -1 ? output.slice(splitIdx + 4) : '';
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        body: resBody,
        text: () => resBody,
        json: () => (resBody ? JSON.parse(resBody) : null),
      });
    });

    res.on('error', reject);

    app(req, res);

    if (payload !== null) {
      req.push(payload);
    }
    req.push(null);
  });
}

/**
 * Crée un environnement isolé avec fichier temporaire pour ne jamais toucher à tasks.json du projet.
 */
export function createTestEnvironment(options = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clarte-todo-test-'));
  const tasksFilePath = path.join(tmpDir, 'tasks.json');

  if (options.initialTasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(options.initialTasks, null, 2), 'utf-8');
  }

  const { app, store } = createApp({
    tasksFilePath,
    distDir: options.distDir,
  });

  const cleanup = () => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  };

  return { tmpDir, tasksFilePath, app, store, cleanup };
}
