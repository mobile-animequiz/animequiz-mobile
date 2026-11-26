const test = require('node:test');
const assert = require('node:assert/strict');
const { getPublicResource } = require('../scripts/api-preflight.cjs');

function setup(results) {
  const calls = [], delays = [], signals = [], logs = [];
  const options = {
    fetchImpl: async (url, init) => { calls.push({ url, init }); const result = results.shift(); if (result instanceof Error) throw result; return result; },
    sleep: async ms => { delays.push(ms); }, makeSignal: ms => { const signal = new AbortController().signal; signals.push({ ms, signal }); return signal; },
    log: value => logs.push(value),
  };
  return { options, calls, delays, signals, logs };
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const timeout = () => new DOMException('Request timed out', 'TimeoutError');

test('preflight retries a cold-start timeout with a fresh signal and validates the next response', async () => {
  const a = setup([timeout(), json({ status: 'ok', version: '1' })]);
  const body = await getPublicResource('https://example.test', '/api/versioned/status', a.options);
  assert.equal(body.status, 'ok'); assert.equal(a.calls.length, 2); assert.equal(a.delays.length, 1);
  assert.notEqual(a.signals[0].signal, a.signals[1].signal);
  assert.equal(a.calls[0].init.method, 'GET'); assert.equal(a.calls[0].init.headers['X-API-Version'], '1');
  assert.equal(a.calls[0].init.redirect, 'error');
});

test('temporary gateway responses are retried within the three-attempt limit', async () => {
  const a = setup([json({}, 503), json({}, 502), json({ paths: {} })]);
  await getPublicResource('https://example.test', '/api-docs/v1', a.options);
  assert.equal(a.calls.length, 3); assert.deepEqual(a.delays, [2000, 4000]);
});

test('DNS failure stops immediately and identifies the host and endpoint', async () => {
  const a = setup([new TypeError('fetch failed', { cause: { code: 'ENOTFOUND' } })]);
  await assert.rejects(getPublicResource('https://example.test', '/api-docs/v1', a.options), /\/api-docs\/v1: DNS não resolveu example.test/);
  assert.equal(a.calls.length, 1); assert.equal(a.delays.length, 0);
});

test('permanent HTTP errors do not turn into retries or a successful preflight', async () => {
  for (const status of [401, 404, 500]) {
    const a = setup([json({}, status)]);
    await assert.rejects(getPublicResource('https://example.test', '/api-docs/v1', a.options), error => error.status === status);
    assert.equal(a.calls.length, 1);
  }
});

test('a persistently unavailable server reports the endpoint after three timeouts', async () => {
  const a = setup([timeout(), timeout(), timeout()]);
  await assert.rejects(getPublicResource('https://example.test', '/api-docs/v1', a.options), /\/api-docs\/v1:.*tentativa 3\/3/);
  assert.equal(a.calls.length, 3); assert.equal(a.delays.length, 2);
});

test('warmup may wait through a startup HTML page before JSON becomes available', async () => {
  const a = setup([new Response('<html>Starting</html>', { headers: { 'content-type': 'text/html' } }), json({ status: 'ok' })]);
  await getPublicResource('https://example.test', '/api/versioned/status', { ...a.options, waitForJson: true });
  assert.equal(a.calls.length, 2);
});

test('a wrong documentation content type is rejected instead of hiding a deployment problem', async () => {
  const a = setup([new Response('<html>Wrong site</html>', { headers: { 'content-type': 'text/html' } })]);
  await assert.rejects(getPublicResource('https://example.test', '/api-docs/v1', a.options), /não é JSON/);
  assert.equal(a.calls.length, 1);
});

test('HTML endpoints are read completely and accepted without JSON parsing', async () => {
  const a = setup([new Response('<html>Reset password</html>', { headers: { 'content-type': 'text/html' } })]);
  const body = await getPublicResource('https://example.test', '/reset-password.html', { ...a.options, format: 'html' });
  assert.equal(body, '<html>Reset password</html>');
});

test('an exhausted total budget stops without another HTTP request', async () => {
  const a = setup([]);
  await assert.rejects(getPublicResource('https://example.test', '/api-docs/v1', { ...a.options, deadline: 10, now: () => 11 }), /prazo total/);
  assert.equal(a.calls.length, 0);
});
