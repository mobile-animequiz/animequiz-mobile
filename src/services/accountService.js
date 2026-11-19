import { apiGet, apiPatch, apiPut, apiDelete } from './apiClient';
import { normalizeQuiz } from './quizService';
import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { t } from '../i18n/runtime';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export class AvatarValidationError extends Error {
  constructor(message) { super(message); this.name = 'AvatarValidationError'; }
}
export const getAccountSettings = () => apiGet('users/me/settings');
export const updateAccountSettings = (data) => apiPatch('users/me/settings', data);
export const deleteAvatar = () => apiDelete('users/me/avatar');
export async function uploadAvatar(asset) {
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
  return apiPut('users/me/avatar', body, { timeoutMs: 90000 });
}
export async function getFavorites() {
  const result = [];
  for (let page = 0; ; page += 1) {
    const response = await apiGet('users/me/favorites', { query: { page, size: 50 } });
    result.push(...(response.content ?? []).map(normalizeQuiz));
    if (page + 1 >= (response.totalPages ?? 1)) return result;
  }
}
export const saveFavorite = (quizId, favorite) => favorite
  ? apiPut('users/me/favorites/' + encodeURIComponent(quizId))
  : apiDelete('users/me/favorites/' + encodeURIComponent(quizId));
