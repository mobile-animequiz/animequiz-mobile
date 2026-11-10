/**
 * Central API configuration.
 *
 * Set EXPO_PUBLIC_API_URL in the environment used to start/build the app.
 * Do not put secrets in EXPO_PUBLIC_* variables: their values are bundled
 * into the client application.
 */
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

function normalizeBaseUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(rawApiUrl);

export function isApiConfigured() {
  return API_BASE_URL.length > 0;
}

export function getApiBaseUrl() {
  if (!isApiConfigured()) {
    throw new Error(
      'A URL da API não foi configurada. Defina EXPO_PUBLIC_API_URL no arquivo .env.local e reinicie o Expo.',
    );
  }

  return API_BASE_URL;
}
