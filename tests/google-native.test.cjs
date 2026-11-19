const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

async function loadGoogle({ environment = 'standalone', native = null, clientId = 'test-client', cancelled = false } = {}) {
  let imports = 0;
  const context = vm.createContext({ process: { env: { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: clientId } } });
  const nativeModule = new vm.SyntheticModule(['TurboModuleRegistry'], function () {
    this.setExport('TurboModuleRegistry', { get: (name) => name === 'RNGoogleSignin' ? native : null });
  }, { context });
  const constants = new vm.SyntheticModule(['default'], function () {
    this.setExport('default', { executionEnvironment: environment });
  }, { context });
  const translations = new vm.SyntheticModule(['t'], function () { this.setExport('t', (key) => key); }, { context });
  const sdk = new vm.SyntheticModule(['GoogleSignin'], function () {
    this.setExport('GoogleSignin', {
      configure: () => {}, hasPlayServices: async () => true,
      signIn: async () => cancelled ? { type: 'cancelled' } : { type: 'success', data: { idToken: 'verified-google-id-token' } },
    });
  }, { context });
  const source = await fs.readFile(path.join(__dirname, '../src/services/googleSignIn.js'), 'utf8');
  const service = new vm.SourceTextModule(source, {
    context,
    importModuleDynamically: async () => { imports += 1; await sdk.link(() => {}); await sdk.evaluate(); return sdk; },
  });
  await service.link((name) => ({ 'react-native': nativeModule, 'expo-constants': constants, '../i18n/runtime': translations })[name]);
  await service.evaluate();
  return { getGoogleIdToken: service.namespace.getGoogleIdToken, imports: () => imports };
}
test('Expo Go loads the app without evaluating the Google SDK', async () => {
  const service = await loadGoogle({ environment: 'storeClient' });
  assert.equal(service.imports(), 0);
  await assert.rejects(service.getGoogleIdToken(), /googleNative/);
  assert.equal(service.imports(), 0);
});
test('an old Android binary reports the missing native module only when Google is tapped', async () => {
  const service = await loadGoogle();
  assert.equal(service.imports(), 0);
  await assert.rejects(service.getGoogleIdToken(), /googleNative/);
  assert.equal(service.imports(), 0);
});
test('a native binary without OAuth configuration does not start Google authentication', async () => {
  const service = await loadGoogle({ native: {}, clientId: '' });
  await assert.rejects(service.getGoogleIdToken(), /googleConfig/);
  assert.equal(service.imports(), 0);
});
test('a configured native binary loads Google on demand and returns the ID token', async () => {
  const service = await loadGoogle({ native: {} });
  assert.equal(await service.getGoogleIdToken(), 'verified-google-id-token');
  assert.equal(service.imports(), 1);
});
test('cancelling native Google sign-in does not create a session', async () => {
  const service = await loadGoogle({ native: {}, cancelled: true });
  assert.equal(await service.getGoogleIdToken(), null);
});

