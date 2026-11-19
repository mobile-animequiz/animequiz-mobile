const KEY = 'animequiz.accessToken';
// Keep the web JWT only for this browser session. Account data lives in the API.
export async function getAccessToken() { return globalThis.sessionStorage?.getItem(KEY) ?? null; }
export async function saveAccessToken(token) {
  if (typeof token !== 'string' || !token) throw new Error('Token inválido');
  globalThis.sessionStorage.setItem(KEY, token);
}
export async function clearAccessToken() { globalThis.sessionStorage?.removeItem(KEY); }
