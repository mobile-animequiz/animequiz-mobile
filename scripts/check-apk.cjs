#!/usr/bin/env node
// No dependencies, credentials, writes, or account creation. --online adds two
// public read-only checks; it does not validate a session or a physical phone.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const manifest = readJson('app.json').expo;
const eas = readJson('eas.json');
const pkg = readJson('package.json');

function profileFor(name, seen = new Set()) {
  assert(!seen.has(name), 'Herança circular nos perfis de build.');
  seen.add(name);
  const profile = eas.build[name];
  assert(profile, `Perfil de build ausente: ${name}.`);
  const parent = profile.extends ? profileFor(profile.extends, seen) : {};
  return { ...parent, ...profile, env: { ...parent.env, ...profile.env },
    android: { ...parent.android, ...profile.android } };
}

function checkPng(file, label) {
  assert(typeof file === 'string', `${label}: caminho ausente.`);
  const target = path.resolve(root, file);
  assert(target.startsWith(root + path.sep), `${label}: o arquivo deve estar no projeto.`);
  const bytes = fs.readFileSync(target);
  assert(bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
    `${label}: PNG inválido.`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert(width > 0 && height > 0, `${label}: dimensões inválidas.`);
  console.log(`OK ${label}: ${width} × ${height}`);
  return { width, height };
}

async function main() {
  assert(/^~?57\./.test(pkg.dependencies.expo), 'Revisar configuração: SDK diferente de 57.');
  const profile = profileFor('current');
  assert(profile.android.buildType === 'apk', 'O perfil current deve produzir APK.');
  assert(profile.distribution === 'internal' && !profile.developmentClient,
    'O APK atual deve abrir sem depender de Metro.');
  assert(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(manifest.android.package),
    'Identificador Android inválido.');
  assert(/^[0-9a-f-]{36}$/i.test(manifest.extra?.eas?.projectId ?? ''),
    'Vínculo com o projeto Expo ausente.');
  const effectiveUrl = process.env.EXPO_PUBLIC_API_URL || profile.env.EXPO_PUBLIC_API_URL;
  const effectiveVersion = process.env.EXPO_PUBLIC_API_VERSION || profile.env.EXPO_PUBLIC_API_VERSION;
  const url = new URL(effectiveUrl);
  assert(effectiveUrl.replace(/\/+$/, '') === profile.env.EXPO_PUBLIC_API_URL,
    'Remova o override local de EXPO_PUBLIC_API_URL; o perfil current fixa a origem da API.');
  assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash,
    'O APK distribuído precisa de uma origem HTTPS sem credenciais.');
  assert(url.pathname === '/' && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i.test(url.hostname),
    'Use a origem pública da API, acessível fora da rede do computador.');
  assert(profile.env.EXPO_PUBLIC_API_VERSION === '1', 'O perfil current usa o contrato original.');
  assert(effectiveVersion === '1', 'Remova o override local de EXPO_PUBLIC_API_VERSION para usar o perfil current.');
  const icon = checkPng(manifest.icon, 'Ícone');
  assert(icon.width === icon.height && icon.width >= 1024, 'Ícone deve ser quadrado e ter pelo menos 1024 px.');
  checkPng(manifest.android.adaptiveIcon.foregroundImage, 'Ícone adaptativo');
  checkPng(manifest.android.adaptiveIcon.backgroundImage, 'Fundo adaptativo');
  checkPng(manifest.android.adaptiveIcon.monochromeImage, 'Ícone monocromático');
  checkPng(manifest.web.favicon, 'Favicon');
  checkPng(manifest.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen')?.[1]?.image,
    'Splash');
  const lock = readJson('package-lock.json');
  for (const group of ['dependencies', 'devDependencies']) {
    assert.deepEqual(lock.packages[''][group], pkg[group], `Lockfile divergente: ${group}.`);
  }
  console.log(`OK configuração: ${manifest.android.package}; SDK 57; APK interno; API ${url.origin} (contrato 1)`);
  console.log('O ícone existente foi validado como arquivo; a aprovação visual da marca é separada.');
  if (!process.argv.includes('--online')) {
    console.log('Rede não testada. Execute npm run check:apk -- --online antes do build.');
    return;
  }
  for (const endpoint of ['/api/versioned/status', '/quizzes?page=0&size=1']) {
    console.log(`Consultando ${endpoint}...`);
    const result = await fetch(new URL(endpoint, url), {
      headers: { Accept: 'application/json', 'X-API-Version': '1' },
      signal: AbortSignal.timeout(45000), redirect: 'error',
    });
    assert(result.ok, `${endpoint}: HTTP ${result.status}.`);
    assert(/json/i.test(result.headers.get('content-type') ?? ''), `${endpoint}: resposta não é JSON.`);
    const body = await result.json();
    if (endpoint === '/api/versioned/status') {
      assert(String(body.version) === '1' && body.status === 'ok', 'A API não confirmou o contrato 1.');
    } else {
      assert(Array.isArray(body) || Array.isArray(body.content) ||
        (body._embedded && Object.values(body._embedded).some(Array.isArray)), 'Catálogo em formato inesperado.');
    }
    console.log(`OK ${endpoint}`);
  }
  console.log('API respondeu ao computador de build. Falta conferir o fluxo no celular por Wi-Fi e dados móveis.');
}

main().catch((error) => {
  console.error(`Pré-build interrompido: ${error.message}`);
  if (error.cause?.code) console.error(`Rede: ${error.cause.code}`);
  process.exitCode = 1;
});
