import { apiGet, apiPut } from './apiClient';

function unwrapResource(response) {
  if (!response || typeof response !== 'object') return response ?? null;
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.profile && typeof response.profile === 'object') return response.profile;
  if (response._embedded && typeof response._embedded === 'object') {
    const firstCollection = Object.values(response._embedded).find(Array.isArray);
    if (firstCollection?.length) return firstCollection[0];
  }
  return response;
}

/** Profile resource planned by the API: GET /users/{userId}/profile. */
export async function getProfileByUserId(userId) {
  if (userId === undefined || userId === null || userId === '') {
    throw new Error('A API não informou o identificador do usuário.');
  }
  const response = await apiGet(`users/${encodeURIComponent(userId)}/profile`);
  return unwrapResource(response);
}

/** Updates the authenticated player's profile. */
export async function updateProfileByUserId(userId, payload) {
  if (userId === undefined || userId === null || userId === '') {
    throw new Error('A API não informou o identificador do usuário.');
  }
  const response = await apiPut(`users/${encodeURIComponent(userId)}/profile`, payload);
  return unwrapResource(response);
}
