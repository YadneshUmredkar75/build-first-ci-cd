'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('GET / returns app info', async () => {
  const res = await fetch(`${base}/`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.name, 'cicd-demo');
});

test('POST /api/tasks creates a task', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Write pipeline' }),
  });
  const task = await res.json();
  assert.equal(res.status, 201);
  assert.equal(task.title, 'Write pipeline');
  assert.equal(task.done, false);
});

test('POST /api/tasks rejects empty title', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' }),
  });
  assert.equal(res.status, 400);
});

test('POST /api/tasks rejects invalid JSON', async () => {
  const res = await fetch(`${base}/api/tasks`, { method: 'POST', body: '{bad' });
  assert.equal(res.status, 400);
});

test('GET /api/tasks lists created tasks', async () => {
  const res = await fetch(`${base}/api/tasks`);
  const list = await res.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.length >= 1);
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});
