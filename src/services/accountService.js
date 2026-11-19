import { apiGet, apiPatch, apiPut, apiDelete } from './apiClient';
import { normalizeQuiz } from './quizService';
export const getAccountSettings = () => apiGet('users/me/settings');
export const updateAccountSettings = (data) => apiPatch('users/me/settings', data);
export const deleteAvatar = () => apiDelete('users/me/avatar');
export async function uploadAvatar(asset) {
  const body = new FormData();
  if (typeof document !== 'undefined') {
    const response = await fetch(asset.uri);
    body.append('file', await response.blob(), 'avatar.jpg');
  } else {
    body.append('file', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' });
  }
  return apiPut('users/me/avatar', body);
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
