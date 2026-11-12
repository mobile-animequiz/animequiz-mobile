/**
 * Public API configuration shared by Android, iOS and web builds.
 *
 * The Render deployment works out of the box. Set EXPO_PUBLIC_API_URL only
 * when intentionally using another API (for example, a local environment).
 * EXPO_PUBLIC_* values are included in the app bundle: never store secrets here.
 */
const PRODUCTION_API_URL = 'https://animequiz-api-wst8.onrender.com';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

function normalizeBaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(rawApiUrl) || PRODUCTION_API_URL;

export function isApiConfigured() {
  try {
    const url = new URL(API_BASE_URL);
    return (
      ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
    );
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  if (!isApiConfigured()) {
    throw new Error(
      'EXPO_PUBLIC_API_URL inválida. Informe uma URL HTTP ou HTTPS, sem parâmetros ou fragmentos.',
    );
  }

  return API_BASE_URL;
}
