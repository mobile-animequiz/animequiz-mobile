const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

async function loadApp(fetchImpl, env = {}) {
  const context = vm.createContext({ fetch: fetchImpl, URL, FormData, AbortController, setTimeout, clearTimeout, process: { env } });
  const cache = new Map();
  const root = path.resolve(__dirname, '../src');
  async function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const pending = (async () => {
    const code = filename.endsWith('authStorage.js')
      ? 'export async function getAccessToken() { return "test-jwt"; } export async function saveAccessToken() {} export async function clearAccessToken() {}'
      : await fs.readFile(filename, 'utf8');
    const module = new vm.SourceTextModule(code, { context, identifier: filename });
    return module;
    })();
    cache.set(filename, pending);
    return pending;
  }
  return async (relative) => {
    const module = await load(path.join(root, relative));
    if (module.status === 'unlinked') await module.link((specifier, ref) => load(path.resolve(path.dirname(ref.identifier), `${specifier}.js`)));
    if (module.status === 'linked') await module.evaluate();
    return module.namespace;
  };
}

function response(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, headers: new Headers(), text: async () => JSON.stringify(body) };
}

test('the fixed production contract reaches requests regardless of obsolete version overrides', async () => {
  const calls = [];
  const load = await loadApp(async (url, options) => { calls.push({ url, options }); return response({}); }, { EXPO_PUBLIC_API_VERSION: '2' });
  const client = await load('services/apiClient.js');
  const versions = await load('services/apiVersion.js');
  await client.apiGet('quizzes');
  await client.apiPost('auth/login', { email: 'test@example.test', password: 'example' }, { skipAuth: true });
  await client.apiPost('quizzes/1/attempts', { answers: [] });
  assert.deepEqual(calls.map((call) => call.options.headers['X-API-Version']), ['1', '1', '1']);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-jwt');
  assert.equal(calls[1].options.headers.Authorization, undefined);
  assert.equal(versions.getApiVersion(), '1');
  assert.equal(versions.setSelectedApiVersion, undefined);
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

test('profile photos use multipart with its boundary supplied by fetch', async () => {
  let submitted;
  const load = await loadApp(async (url, options) => { submitted = options; return response({ hasAvatar: true }); });
  const client = await load('services/apiClient.js');
  const form = new FormData();
  form.append('file', 'photo-content');
  await client.apiPut('users/me/avatar', form);
  assert.equal(submitted.body, form);
  assert.equal(submitted.headers['Content-Type'], undefined);
  assert.equal(submitted.headers.Authorization, 'Bearer test-jwt');
});

test('favorites traverse real API pages and use idempotent owned routes', async () => {
  const calls = [];
  const load = await loadApp(async (url, options) => {
    calls.push({ url, options });
    const page = Number(new URL(url).searchParams.get('page'));
    return options.method === 'GET' ? response({ content: [{ id: page + 1, title: 'Quiz ' + page, questionCount: 15 }], totalPages: 2 }) : response(null, 204);
  });
  const account = await load('services/accountService.js');
  const favorites = await account.getFavorites();
  assert.equal(favorites.length, 2);
  await account.saveFavorite(1, true);
  await account.saveFavorite(1, false);
  assert.deepEqual(calls.map((call) => call.options.method), ['GET', 'GET', 'PUT', 'DELETE']);
  assert.match(calls[3].url, /users\/me\/favorites\/1$/);
});

test('password recovery sends the email without an existing session', async () => {
  let submitted;
  const load = await loadApp(async (url, options) => { submitted = { url, options }; return response({ message: 'Generic response' }, 202); });
  const auth = await load('services/authService.js');
  await auth.sendPasswordResetLink({ email: ' player@example.test ' });
  assert.match(submitted.url, /auth\/forgot-password$/);
  assert.equal(submitted.options.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(submitted.options.body), { email: 'player@example.test' });
});

test('interface locale defaults to Portuguese, falls back safely, and preserves question content', async () => {
  const load = await loadApp(async () => response({}));
  const i18n = await load('i18n/runtime.js');
  const quizzes = await load('services/quizService.js');
  assert.equal(i18n.getLocale(), 'pt-BR');
  i18n.setLocale('en');
  assert.equal(i18n.t('myFavorites'), 'My favorites');
  assert.equal(i18n.t('questionCount', { count: 15 }), '15 questions');
  assert.equal(quizzes.normalizeQuestion({ id: 1, text: 'Qual é a vila de Naruto?', options: [{ id: 1, text: 'Konoha' }, { id: 2, text: 'Suna' }] }).text, 'Qual é a vila de Naruto?');
  i18n.setLocale('ja');
  assert.equal(i18n.t('myFavorites'), 'Meus favoritos');
});

test('English API errors hide server diagnostics and translate connection failures', async () => {
  const load = await loadApp(async () => response({ message: '<html>java.Exception secret</html>' }, 500));
  const i18n = await load('i18n/runtime.js');
  i18n.setLocale('en');
  const client = await load('services/apiClient.js');
  await assert.rejects(client.apiGet('users/me/settings'), (error) => error.status === 500 && error.message.includes('temporarily unavailable') && !error.message.includes('secret'));
  const offlineLoad = await loadApp(async () => { throw new TypeError('offline'); });
  const offlineLocale = await offlineLoad('i18n/runtime.js');
  offlineLocale.setLocale('en');
  const offlineClient = await offlineLoad('services/apiClient.js');
  await assert.rejects(offlineClient.apiGet('users/me/settings'), (error) => error.name === 'ApiConnectionError' && error.message.includes('internet connection'));
});

test('changing language preserves the appearance values sent to the API', async () => {
  const load = await loadApp(async () => response({}));
  const preferences = await load('utils/accountPreferences.js');
  const i18n = await load('i18n/runtime.js');
  const before = preferences.getAppearanceChoices('theme');
  i18n.setLocale('en');
  const after = preferences.getAppearanceChoices('theme');
  assert.deepEqual(Array.from(before, (choice) => choice[0]), ['midnight', 'eclipse']);
  assert.deepEqual(Array.from(after, (choice) => choice[0]), ['midnight', 'eclipse']);
  assert.notEqual(before[0][1], after[0][1]);
  assert.deepEqual(Array.from(preferences.getAppearanceChoices('accent'), (choice) => choice[0]), ['violet', 'cyan', 'rose']);
});
