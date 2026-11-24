'use strict';

const http = require('node:http');
const { version } = require('../package.json');

const startedAt = Date.now();

function createApp() {
  // In-memory store. Fine for a CI/CD demo, replace with a DB later.
  const tasks = [];
  let nextId = 1;

  const send = (res, status, body) => {
    const data = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    });
    res.end(data);
  };

  const readJson = (req) =>
    new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
        if (raw.length > 1e6) reject(new Error('Body too large'));
      });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
    });

  return http.createServer(async (req, res) => {
    const { method } = req;
    const path = new URL(req.url, 'http://localhost').pathname;

    if (method === 'GET' && path === '/') {
      return send(res, 200, { name: 'cicd-demo', version, env: process.env.APP_ENV || 'local' });
    }

    if (method === 'GET' && path === '/health') {
      return send(res, 200, {
        status: 'ok',
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      });
    }

    if (method === 'GET' && path === '/api/tasks') {
      return send(res, 200, tasks);
    }

    if (method === 'POST' && path === '/api/tasks') {
      try {
        const body = await readJson(req);
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        if (!title) return send(res, 400, { error: 'title is required' });
        const task = { id: nextId++, title, done: false };
        tasks.push(task);
        return send(res, 201, task);
      } catch (err) {
        return send(res, 400, { error: err.message });
      }
    }

    return send(res, 404, { error: 'Not found' });
  });
}

module.exports = { createApp };
