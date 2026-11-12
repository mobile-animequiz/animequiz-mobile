import { apiPost } from './apiClient';
import { clearAccessToken, saveAccessToken } from './authStorage';

const MAX_USERNAME_ATTEMPTS = 3;

function makeRandomUsername() {
  // A username is a public identifier, never a credential. A long random suffix
  // makes collisions unlikely; a confirmed username collision is retried below.
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // React Native runtimes without Web Crypto still work without extra packages.
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `jogador${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

function formatDateForApi(birthDate) {
  if (!birthDate) return undefined;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate);
  if (!match) throw new Error('Informe uma data de nascimento válida.');
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function isUsernameCollision(error) {
  if (error?.status !== 409) return false;
  const message = String(error?.data?.message ?? error?.message ?? '');
  return /(nome de usu[aá]rio|username).*(uso|exist|cadastrad|taken|used)/i.test(message);
}

function requireAuthResponse(response) {
  const token = response?.accessToken;
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('O servidor não retornou um token válido. Tente novamente.');
  }
  if (!response.user || response.user.id == null) {
    throw new Error('O servidor não retornou os dados da conta. Tente novamente.');
  }
  return { token, user: response.user };
}

async function persistSession(response) {
  const session = requireAuthResponse(response);
  await saveAccessToken(session.token);
  return session;
}

export async function login(credentials) {
  const response = await apiPost('auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  }, { skipAuth: true });
  return persistSession(response);
}

/**
 * Registration retains the Figma form (DD/MM/YYYY, e-mail and password).
 * The backend additionally requires a random username, generated here.
 */
export async function register({ birthDate, email, password }) {
  const payload = {
    email: email.trim(),
    password,
    dateOfBirth: formatDateForApi(birthDate),
  };

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    try {
      const response = await apiPost('auth/register', {
        ...payload,
        username: makeRandomUsername(),
      }, { skipAuth: true });
      return persistSession(response);
    } catch (error) {
      // Only retry if the API explicitly reports an occupied username.
      // Retrying other 409s (e.g. an existing e-mail) would be misleading.
      if (!isUsernameCollision(error) || attempt === MAX_USERNAME_ATTEMPTS - 1) throw error;
    }
  }
  throw new Error('Não foi possível criar um nome de usuário. Tente novamente.');
}

export async function logout() {
  await clearAccessToken();
}

export async function sendPasswordResetLink() {
  throw new Error('A recuperação de senha ainda não está disponível na API.');
}

export async function signInWithProvider(provider) {
  throw new Error(`O login com ${provider} ainda não está configurado.`);
}
