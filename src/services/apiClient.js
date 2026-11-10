import { getApiBaseUrl } from './apiConfig';
import { getAccessToken } from './authStorage';

const DEFAULT_TIMEOUT_MS = 15000;

/** Error returned when the API responds with a non-2xx status. */
export class ApiError extends Error {
  constructor(message, { status, data, headers } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.data = data ?? null;
    this.headers = headers ?? null;
  }
}

/** Error used for connection failures and request timeouts. */
export class ApiConnectionError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ApiConnectionError';
    this.cause = cause;
  }
}

function buildUrl(path, query) {
  const normalizedPath = String(path ?? '').replace(/^\/+/, '');
  const url = `${getApiBaseUrl()}/${normalizedPath}`;

  if (!query || Object.keys(query).length === 0) {
    return url;
  }

  const queryString = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${url}?${queryString}` : url;
}

async function readResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function getErrorMessage(data, status) {
  if (data && typeof data === 'object') {
    return data.message || data.detail || data.title || `A API retornou o erro ${status}.`;
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return `A API retornou o erro ${status}.`;
}

/**
 * Makes a JSON HTTP request to the Anime Quiz API.
 *
 * @param {string} path API path, with or without a leading slash.
 * @param {object} options fetch options plus `query` and `timeoutMs`.
 */
export async function apiRequest(path, options = {}) {
  const {
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers: customHeaders = {},
    body,
    skipAuth = false,
    ...fetchOptions
  } = options;

  // Resolve configuration errors before the network error handler so a missing
  // EXPO_PUBLIC_API_URL is reported accurately to the caller.
  const requestUrl = buildUrl(path, query);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    Accept: 'application/json',
    ...customHeaders,
  };

  let requestBody = body;
  if (body !== undefined && body !== null && typeof body !== 'string') {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    requestBody = JSON.stringify(body);
  }

  try {
    if (!skipAuth && !headers.Authorization) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    const response = await fetch(requestUrl, {
      ...fetchOptions,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.status), {
        status: response.status,
        data,
        headers: response.headers,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new ApiConnectionError('A conexão com o servidor demorou demais. Tente novamente.', error);
    }

    throw new ApiConnectionError(
      'Não foi possível conectar à API. Verifique sua conexão com a internet e tente novamente.',
      error,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: 'GET' });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'POST', body });
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PUT', body });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PATCH', body });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: 'DELETE' });
}
