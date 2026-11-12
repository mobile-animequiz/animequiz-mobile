import { getApiBaseUrl } from './apiConfig';
import { getAccessToken } from './authStorage';

// Render may take longer to respond after an idle period (cold start).
const DEFAULT_TIMEOUT_MS = 45000;

// Installed by AuthProvider. Avoid importing React state into the HTTP layer.
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

const DEFAULT_ERROR_MESSAGES = {
  400: 'Não foi possível processar os dados enviados. Verifique as informações e tente novamente.',
  401: 'Autenticação necessária ou sessão expirada. Entre novamente.',
  403: 'Você não tem permissão para realizar esta operação.',
  404: 'Não foi possível encontrar o recurso solicitado.',
  409: 'Já existe um registro com essas informações.',
  429: 'Muitas solicitações em pouco tempo. Tente novamente mais tarde.',
};

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
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function getErrorMessage(data, status) {
  // Never expose unexpected server diagnostics (including HTML or stack traces)
  // through user-facing screens.
  if (status >= 500) {
    return 'O servidor está temporariamente indisponível. Tente novamente mais tarde.';
  }

  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  if (
    message
    && message.length <= 200
    && !/[<>\r\n]/.test(message)
    && !/(exception|stack ?trace|traceback|org\.springframework|java\.)/i.test(message)
  ) {
    return message;
  }

  return DEFAULT_ERROR_MESSAGES[status] ?? 'Não foi possível concluir a solicitação. Tente novamente.';
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
  let requestToken = null;
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

    // Only invalidate the session that actually issued this request. An older
    // response must not discard a newer login's JWT.
    requestToken = typeof headers.Authorization === 'string' && headers.Authorization.startsWith('Bearer ')
      ? headers.Authorization.slice(7)
      : null;

    const response = await fetch(requestUrl, {
      ...fetchOptions,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      // A deleted H2 user may yield 404 from /users/me even with a signed JWT.
      const missingCurrentUser = response.status === 404 && String(path).replace(/^\/+/, '') === 'users/me';
      if ((response.status === 401 || missingCurrentUser) && !skipAuth && requestToken && unauthorizedHandler) {
        try {
          await unauthorizedHandler(requestToken);
        } catch {
          // Preserve the original HTTP error even if local session cleanup fails.
        }
      }
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
