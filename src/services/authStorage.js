import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'animequiz.accessToken';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveAccessToken(token) {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('A API não retornou um token de acesso válido.');
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
