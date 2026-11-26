import { apiGet, apiPatch, apiPut, apiDelete } from './apiClient';
import { getQuizCatalog, normalizeQuiz } from './quizService';
import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { t, getLocale } from '../i18n/runtime';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export class AvatarValidationError extends Error {
  constructor(message) { super(message); this.name = 'AvatarValidationError'; }
}
export const getAccountSettings = (options) => apiGet('users/me/settings', options);
export const updateAccountSettings = (data, options) => apiPatch('users/me/settings', data, options);
export const deleteAvatar = (options) => apiDelete('users/me/avatar', options);
export async function uploadAvatar(asset, options = {}) {
  if (typeof asset?.uri !== 'string' || !asset.uri.trim()) throw new AvatarValidationError(t('photoFailed'));
  const body = new FormData();
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new AvatarValidationError(t('photoFailed'));
    const blob = await response.blob();
    if (blob.size > MAX_AVATAR_BYTES) throw new AvatarValidationError(t('error413'));
    body.append('file', blob, 'avatar.jpg');
  } else {
    const file = new File(asset.uri);
    if (!file.exists || file.size <= 0) throw new AvatarValidationError(t('photoFailed'));
    if (file.size > MAX_AVATAR_BYTES) throw new AvatarValidationError(t('error413'));
    // SDK 57 installs expo/fetch globally. Its multipart encoder accepts File/Blob,
    // but the old React Native { uri, name, type } object has no bytes() method.
    body.append('file', file);
  }
  return apiPut('users/me/avatar', body, { timeoutMs: 90000, ...options });
}
export async function getFavorites(language = getLocale()) {
  const result = [];
  for (let page = 0; ; page += 1) {
    const response = await apiGet('users/me/favorites', { query: { page, size: 50 } });
    result.push(...(response.content ?? []).map(normalizeQuiz));
    if (page + 1 >= (response.totalPages ?? 1)) {
      if (!result.length) return result;
      // One catalogue join, not one request per favorite. Includes localized covers.
      const catalog = new Map((await getQuizCatalog(language)).map(quiz => [quiz.id, quiz]));
      return result.map(quiz => catalog.get(quiz.id) ?? quiz);
    }
  }
}
export const saveFavorite = (quizId, favorite, options = {}) => favorite
  ? apiPut('users/me/favorites/' + encodeURIComponent(quizId), undefined, options)
  : apiDelete('users/me/favorites/' + encodeURIComponent(quizId), options);
