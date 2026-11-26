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
    if (filename === 'react-native') return new vm.SyntheticModule(['Platform'], function () { this.setExport('Platform', { OS: 'android' }); }, { context });
    if (filename === 'expo-file-system') return new vm.SyntheticModule(['File'], function () { this.setExport('File', class File {}); }, { context });
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
    if (module.status === 'unlinked') await module.link((specifier, ref) => load(['react-native', 'expo-file-system'].includes(specifier) ? specifier : path.resolve(path.dirname(ref.identifier), `${specifier}.js`)));
    if (module.status === 'linked') await module.evaluate();
    return module.namespace;
  };
}

function response(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, headers: new Headers(), text: async () => JSON.stringify(body) };
}

test('the fixed production contract reaches requests regardless of obsolete version overrides', async () => {
  const calls = [];
  const load = await loadApp(async (url, options) => { calls.push({ url, options }); return response({}); }, { EXPO_PUBLIC_API_VERSION: '1' });
  const client = await load('services/apiClient.js');
  const versions = await load('services/apiVersion.js');
  await client.apiGet('quizzes');
  await client.apiPost('auth/login', { email: 'test@example.test', password: 'example' }, { skipAuth: true });
  await client.apiPost('quizzes/1/attempts', { answers: [] });
  assert.deepEqual(calls.map((call) => call.options.headers['X-API-Version']), ['2', '2', '2']);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-jwt');
  assert.equal(calls[1].options.headers.Authorization, undefined);
  assert.equal(versions.getApiVersion(), '2');
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
  assert.deepEqual(calls.map((call) => call.options.method), ['GET', 'GET', 'GET', 'PUT', 'DELETE']);
  assert.match(calls[4].url, /users\/me\/favorites\/1$/);
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
  assert.deepEqual(Array.from(before, (choice) => choice[0]), ['midnight', 'eclipse', 'ocean', 'forest']);
  assert.deepEqual(Array.from(after, (choice) => choice[0]), ['midnight', 'eclipse', 'ocean', 'forest']);
  assert.notEqual(before[0][1], after[0][1]);
  assert.deepEqual(Array.from(preferences.getAppearanceChoices('accent'), (choice) => choice[0]), ['violet', 'cyan', 'rose', 'amber', 'mint', 'coral']);
});

test('display names prioritize custom names and hide generated registration identifiers', async () => {
  const load = await loadApp(async () => response({}));
  const names = await load('utils/displayName.js');
  assert.equal(names.getDisplayName({email:'isaac@gmail.com'}), 'Isaac');
  assert.equal(names.getDisplayName({email:'isaac.silva@example.test',username:'jogadorabcdefghijklmnop'}, {displayName:'jogadorabcdefghijklmnop'}), 'Isaac');
  assert.equal(names.getDisplayName({email:'isaac@example.test',username:'Ninja'}), 'Ninja');
  assert.equal(names.getDisplayName({email:'isaac@example.test',username:'Ninja'}, {displayName:'Isaac V.'}), 'Isaac V.');
});

test('language reaches catalogue and question requests and keeps server option identifiers', async () => {
  const calls=[];
  const load=await loadApp(async (url)=>{
    calls.push(new URL(url)); const en=new URL(url).searchParams.get('lang')==='en';
    return response({content:[{id:1,text:en?'Which village?':'Qual vila?',options:[{id:7,text:'Konoha'},{id:8,text:'Suna'}],contentLanguage:en?'en':'pt-BR'}],page:{totalPages:1}});
  });
  const i18n=await load('i18n/runtime.js'); const quizzes=await load('services/quizService.js');
  assert.equal((await quizzes.getQuizQuestions(1))[0].text,'Qual vila?');
  i18n.setLocale('en');
  const english=(await quizzes.getQuizQuestions(1))[0];
  assert.equal(english.text,'Which village?'); assert.equal(english.options[0].id,'7');
  await quizzes.getQuizCatalog();
  assert.deepEqual(calls.map(url=>url.searchParams.get('lang')),['pt-BR','en','en']);
});

test('cover paths use the API origin and avatar credentials never enter the URL', async () => {
  const load=await loadApp(async()=>response({}));
  const media=await load('utils/mediaUrl.js'); const avatar=await load('utils/avatarSource.js');
  assert.match(media.mediaUrl('/media/quizzes/naruto.png'),/^https:\/\/[^/]+\/media\/quizzes\/naruto.png$/);
  assert.equal(media.mediaUrl('http://localhost/photo.png'),null);
  assert.equal(media.mediaUrl('/media/quizzes/../private'),null);
  const source=avatar.avatarSource(1,2,'private-token');
  assert.equal(source.headers.Authorization,'Bearer private-token');
  assert.equal(source.headers['X-API-Version'],'2');
  assert.equal(source.uri.includes('private-token'),false);
  assert.notEqual(avatar.avatarSource(1,3,'private-token').uri,source.uri);
});

test('all theme and accent combinations retain readable text contrast', async () => {
  const load=await loadApp(async()=>response({}));const palette=await load('styles/personalPalette.js');
  function luminance(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  for(const theme of Object.keys(palette.THEMES))for(const accent of Object.keys(palette.ACCENTS)){
    const c=palette.getPersonalColors(theme,accent);
    assert.ok(contrast(c.accent,c.textOnLight)>=4.5);
    assert.ok(contrast(c.textPrimary,c.backgroundBottom)>=4.5);
  }
});

test('explicit initiating session cannot be replaced by a later stored token', async () => {
  let sent;
  const load=await loadApp(async(url,options)=>{sent=options;return response({});});
  const client=await load('services/apiClient.js');
  await client.apiPatch('users/me/settings',{displayName:'Ninja'},{headers:{Authorization:'Bearer initiating-session'}});
  assert.equal(sent.headers.Authorization,'Bearer initiating-session');
});
