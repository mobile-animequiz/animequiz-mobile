const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

async function loadApp(fetchImpl) {
  const context = vm.createContext({ fetch: fetchImpl, URL, AbortController, setTimeout, clearTimeout, process: { env: {} } });
  const cache = new Map();
  const root = path.resolve(__dirname, '../src');
  async function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const code = filename.endsWith('authStorage.js')
      ? 'export async function getAccessToken() { return "test-jwt"; }'
      : await fs.readFile(filename, 'utf8');
    const module = new vm.SourceTextModule(code, { context, identifier: filename });
    cache.set(filename, module);
    await module.link((specifier, ref) => load(path.resolve(path.dirname(ref.identifier), `${specifier}.js`)));
    return module;
  }
  return async (relative) => {
    const module = await load(path.join(root, relative));
    if (module.status === 'linked') await module.evaluate();
    return module.namespace;
  };
}

function response(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, headers: new Headers(), text: async () => JSON.stringify(body) };
}

test('the chosen version reaches real catalog, login and attempt requests', async () => {
  const calls = [];
  const load = await loadApp(async (url, options) => { calls.push({ url, options }); return response({}); });
  const client = await load('services/apiClient.js');
  const versions = await load('services/apiVersion.js');
  await client.apiGet('quizzes');
  versions.setSelectedApiVersion('2');
  await client.apiPost('auth/login', { email: 'test@example.test', password: 'example' }, { skipAuth: true });
  await client.apiPost('quizzes/1/attempts', { answers: [] });
  assert.deepEqual(calls.map((call) => call.options.headers['X-API-Version']), ['1', '2', '2']);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-jwt');
  assert.equal(calls[1].options.headers.Authorization, undefined);
  assert.throws(() => versions.setSelectedApiVersion('3'));
});

test('both HAL question contracts are playable, paginated, and do not expose an answer key', async () => {
  let requests = 0;
  const load = await loadApp(async (url) => {
    requests += 1;
    const page = Number(new URL(url).searchParams.get('page'));
    return response({ _embedded: { questions: [{ id: page + 1, text: 'Pergunta de anime?',
      options: [{ id: 1, text: 'Opção A', isCorrect: true }, { id: 2, text: 'Opção B' }],
      ...(page ? { imageUrl: 'https://example.test/anime.jpg', imageAltText: 'Anime', timeLimitSeconds: 45 } : {}),
    }] }, page: { totalPages: 2 } });
  });
  const quizzes = await load('services/quizService.js');
  const questions = await quizzes.getQuizQuestions(1);
  assert.equal(requests, 2);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].imageUrl, null);
  assert.equal(questions[0].timeLimitSeconds, 30);
  assert.equal(questions[1].imageUrl, 'https://example.test/anime.jpg');
  assert.equal(questions[1].timeLimitSeconds, 45);
  assert.equal(questions[0].options[0].isCorrect, undefined);
});

test('retrying a submission reuses the key and sends only selected answer IDs', async () => {
  const calls = [];
  const load = await loadApp(async (url, options) => {
    calls.push({ url, options });
    return response({ quizId: 1, points: 10, correctAnswers: 1, totalQuestions: 3, answeredQuestions: 1 });
  });
  const attempts = await load('services/attemptService.js');
  const answers = [{ questionId: '1', optionId: '2', correct: true, points: 999 }];
  await attempts.submitQuizAttempt('1', answers, 'same-key-123');
  await attempts.submitQuizAttempt('1', answers, 'same-key-123');
  assert.deepEqual(calls.map((call) => call.options.headers['X-Idempotency-Key']), ['same-key-123', 'same-key-123']);
  assert.deepEqual(JSON.parse(calls[0].options.body), { answers: [{ questionId: 1, optionId: 2 }] });
  await assert.rejects(attempts.submitQuizAttempt(1, [], 'same-key-123'));
});

test('expired authentication is reported and invalidates only the token used by the request', async () => {
  let rejectedToken;
  const load = await loadApp(async () => response({ message: 'Sessão expirada' }, 401));
  const client = await load('services/apiClient.js');
  client.setUnauthorizedHandler(async (token) => { rejectedToken = token; });
  await assert.rejects(client.apiGet('users/me'), (error) => error.status === 401);
  assert.equal(rejectedToken, 'test-jwt');
});

test('a failed network submission is not automatically repeated', async () => {
  let calls = 0;
  const load = await loadApp(async () => { calls += 1; throw new TypeError('Connection lost'); });
  const client = await load('services/apiClient.js');
  await assert.rejects(client.apiPost('quizzes/1/attempts', {}), (error) => error.name === 'ApiConnectionError');
  assert.equal(calls, 1);
});

test('the timer catches up after backgrounding and stops at zero', async () => {
  const load = await loadApp(async () => response({}));
  const round = await load('utils/quizRound.js');
  assert.equal(round.remainingSeconds(30000, 1000), 29);
  assert.equal(round.remainingSeconds(30000, 29999), 1);
  assert.equal(round.remainingSeconds(30000, 45000), 0);
  assert.match(round.createAttemptKey(), /^[A-Za-z0-9_-]{8,128}$/);
});
