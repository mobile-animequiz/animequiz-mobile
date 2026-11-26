const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

async function app({ os = 'android', size = 12, exists = true } = {}) {
  const uploads = [];
  const reads = [];
  class Form {
    constructor() { this.parts = []; }
    append(...values) { this.parts.push(values); }
    entries() { return this.parts.map(([name, value]) => [name, value]); }
  }
  class File {
    constructor(uri) { this.uri = uri; this.name = 'avatar.jpg'; this.type = 'image/jpeg'; this.size = size; this.exists = exists; }
    async bytes() { return new Uint8Array([255, 216, 255, 217]); }
  }
  const context = vm.createContext({ FormData: Form, Blob, document: {},
    fetch: async (uri) => { reads.push(uri); return { ok: true, blob: async () => new Blob(['jpeg']) }; } });
  const synthetic = (values) => new vm.SyntheticModule(Object.keys(values), function () {
    for (const [key, value] of Object.entries(values)) this.setExport(key, value);
  }, { context });
  const modules = {
    './apiClient': synthetic({ apiGet() {}, apiPatch() {}, apiDelete() {}, apiPut: async (...args) => { uploads.push(args); return { hasAvatar: true }; } }),
    './quizService': synthetic({ normalizeQuiz: value => value, getQuizCatalog: async () => [] }),
    'react-native': synthetic({ Platform: { OS: os } }),
    'expo-file-system': synthetic({ File }),
    '../i18n/runtime': synthetic({ t: key => key, getLocale: () => 'pt-BR' }),
  };
  const source = await fs.readFile(path.join(__dirname, '../src/services/accountService.js'), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link(specifier => modules[specifier]);
  await module.evaluate();
  return { service: module.namespace, uploads, reads, Form, File };
}

test('Android uses an Expo File even if a document global is present', async () => {
  const a = await app();
  await a.service.uploadAvatar({ uri: 'file:///cache/avatar.jpg' });
  assert.deepEqual(a.reads, []);
  assert.equal(a.uploads[0][0], 'users/me/avatar');
  assert.equal(a.uploads[0][1].parts[0][0], 'file');
  assert.ok(a.uploads[0][1].parts[0][1] instanceof a.File);
  assert.equal(a.uploads[0][2].timeoutMs, 90000);
});

test('unreadable and oversized local files fail before any request is sent', async () => {
  for (const options of [{ exists: false }, { size: 0 }, { size: 2097153 }]) {
    const a = await app(options);
    await assert.rejects(a.service.uploadAvatar({ uri: 'file:///cache/avatar.jpg' }), { name: 'AvatarValidationError' });
    assert.equal(a.uploads.length, 0);
  }
});

test('web uploads a Blob rather than a native file descriptor', async () => {
  const a = await app({ os: 'web' });
  await a.service.uploadAvatar({ uri: 'blob:local-photo' });
  assert.equal(a.reads[0], 'blob:local-photo');
  assert.ok(a.uploads[0][1].parts[0][1] instanceof Blob);
  assert.equal(a.uploads[0][1].parts[0][2], 'avatar.jpg');
});

test('the real SDK 57 encoder rejects the old URI object and encodes the new File bytes', async () => {
  const source = await fs.readFile(path.join(__dirname, '../node_modules/expo/src/winter/fetch/convertFormData.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  const context = vm.createContext({ Blob, TextEncoder, Uint8Array });
  const module = new vm.SourceTextModule(code, { context });
  await module.link(() => new vm.SyntheticModule(['blobToArrayBufferAsync'], function () {
    this.setExport('blobToArrayBufferAsync', blob => blob.arrayBuffer());
  }, { context }));
  await module.evaluate();
  const a = await app();
  const old = new a.Form(); old.append('file', { uri: 'file:///avatar.jpg', name: 'avatar.jpg', type: 'image/jpeg' });
  await assert.rejects(module.namespace.convertFormDataAsync(old, 'test-boundary'));
  await a.service.uploadAvatar({ uri: 'file:///cache/avatar.jpg' });
  const encoded = await module.namespace.convertFormDataAsync(a.uploads[0][1], 'test-boundary');
  const body = Buffer.from(encoded.body);
  assert.ok(body.includes(Buffer.from([255, 216, 255, 217])));
  assert.ok(body.toString('latin1').includes('name="file"; filename="avatar.jpg"'));
  assert.ok(body.toString('latin1').includes('content-type: image/jpeg'));
  assert.equal(encoded.boundary, 'test-boundary');
});

test('an avatar keeps the initiating session header through file preparation', async () => {
  const a=await app({os:'web'});
  await a.service.uploadAvatar({uri:'blob:local-image'}, {headers:{Authorization:'Bearer initiating-session'}});
  assert.equal(a.uploads[0][2].headers.Authorization,'Bearer initiating-session');
});
