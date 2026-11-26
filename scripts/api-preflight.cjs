const { setTimeout: pause } = require('node:timers/promises');

const TRANSIENT_STATUS = new Set([408, 502, 503, 504]);
const TRANSIENT_NETWORK = new Set(['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN']);

/** Bounded retries for public GET checks only. Never retries an application mutation. */
async function getPublicResource(origin, endpoint, {
  format = 'json', waitForJson = false, attempts = 3, timeoutMs = 45000,
  deadline = Date.now() + 180000, fetchImpl = globalThis.fetch, sleep = pause,
  makeSignal = AbortSignal.timeout, now = Date.now, log = console.log,
} = {}) {
  const url = new URL(endpoint, origin);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error(`${endpoint}: prazo total da verificação esgotado. Confira o serviço e os logs no Render.`);
    const requestTimeout = Math.min(timeoutMs, remaining);
    log(`Consultando ${endpoint} — tentativa ${attempt}/${attempts}, limite de ${Math.ceil(requestTimeout / 1000)} s...`);
    try {
      const response = await fetchImpl(url, {
        method: 'GET', headers: { Accept: format === 'json' ? 'application/json' : 'text/html', 'X-API-Version': '1' },
        signal: makeSignal(requestTimeout), redirect: 'error',
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.transient = TRANSIENT_STATUS.has(response.status);
        await response.body?.cancel().catch(() => {});
        throw error;
      }
      if (format === 'json' && !/json/i.test(response.headers.get('content-type') ?? '')) {
        const error = new Error('resposta não é JSON; o serviço pode estar iniciando ou a URL pode estar incorreta');
        error.transient = waitForJson;
        await response.body?.cancel().catch(() => {});
        throw error;
      }
      const body = format === 'json' ? await response.json() : await response.text();
      log(`OK ${endpoint}`);
      return body;
    } catch (error) {
      const code = error.cause?.code ?? error.code;
      const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
      const retry = error.transient === true || timeout || TRANSIENT_NETWORK.has(code)
        || (error.name === 'TypeError' && !code);
      if (retry && attempt < attempts) {
        const delay = Math.min(2000 * attempt, deadline - now());
        if (delay > 0) {
          log(`${endpoint}: ${timeout ? 'tempo limite atingido' : error.message}. Aguardando ${Math.ceil(delay / 1000)} s antes de tentar novamente.`);
          await sleep(delay);
          continue;
        }
      }
      const detail = code === 'ENOTFOUND' ? `DNS não resolveu ${url.hostname}`
        : timeout ? `a API não respondeu em ${Math.ceil(requestTimeout / 1000)} s (tentativa ${attempt}/${attempts})`
        : error.name === 'SyntaxError' ? 'a API retornou JSON inválido' : error.message;
      const result = new Error(`${endpoint}: ${detail}. Confira o status e os logs do serviço no Render antes de repetir o build.`, { cause: error });
      result.status = error.status;
      throw result;
    }
  }
}

module.exports = { getPublicResource };
