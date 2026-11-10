import { apiPost } from './apiClient';
import { clearAccessToken, saveAccessToken } from './authStorage';

function unwrapResponse(response) {
  if (response && typeof response === 'object' && response.data && typeof response.data === 'object') {
    return { ...response.data, ...response };
  }

  return response ?? {};
}

function getAccessToken(response) {
  const payload = unwrapResponse(response);
  const token = payload.accessToken ?? payload.access_token ?? payload.token ?? payload.jwt;
  return typeof token === 'string' && token.trim() ? token : null;
}

function getUser(response) {
  const payload = unwrapResponse(response);
  return payload.user ?? payload.usuario ?? null;
}

async function persistSession(response) {
  const token = getAccessToken(response);
  if (!token) {
    throw new Error('A resposta da API não contém accessToken. Confira o contrato do endpoint de autenticação.');
  }

  await saveAccessToken(token);
  return { token, user: getUser(response) };
}

/** Authenticates a player using the backend JWT endpoint. */
export async function login(credentials) {
  const response = await apiPost('auth/login', credentials, { skipAuth: true });
  return persistSession(response);
}

/** Creates an account and establishes a session. */
export async function register(data) {
  const response = await apiPost('auth/register', data, { skipAuth: true });
  const token = getAccessToken(response);

  if (token) {
    return persistSession(response);
  }

  // Some APIs return only the created user from registration. In that case,
  // authenticate immediately using the credentials just created.
  return login({ email: data.email, password: data.password });
}

export async function logout() {
  await clearAccessToken();
}

/** Password recovery stays disabled until the backend publishes its contract. */
export async function sendPasswordResetLink() {
  throw new Error('A recuperação de senha ainda não está disponível na API.');
}

/** Social authentication requires provider credentials and backend configuration. */
export async function signInWithProvider(provider) {
  throw new Error(`O login com ${provider} ainda não está configurado.`);
}
