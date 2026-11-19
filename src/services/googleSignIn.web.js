import { t } from '../i18n/runtime';
let scriptPromise;
function loadGoogle() {
  if (globalThis.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.onload = resolve;
    script.onerror = () => { scriptPromise = null; reject(new Error(t('googleFailed'))); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
export async function getGoogleIdToken() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) throw new Error(t('googleConfig'));
  await loadGoogle();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; reject(new Error(t('googleFailed'))); } }, 60000);
    globalThis.google.accounts.id.initialize({ client_id: clientId, callback: (response) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (response.credential) resolve(response.credential); else reject(new Error(t('googleFailed')));
    } });
    globalThis.google.accounts.id.prompt((notice) => {
      if (!settled && (notice.isNotDisplayed?.() || notice.isSkippedMoment?.())) {
        settled = true; clearTimeout(timer); reject(new Error(t('googleFailed')));
      }
    });
  });
}
