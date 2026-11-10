import { apiGet } from './apiClient';

/** Returns the authenticated player. The backend contract defines GET /users/me. */
export async function getCurrentUser() {
  const response = await apiGet('users/me');
  return unwrapResource(response);
}


function unwrapResource(response) {
  if (!response || typeof response !== 'object') return response ?? null;
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.user && typeof response.user === 'object') return response.user;
  if (response._embedded && typeof response._embedded === 'object') {
    const firstCollection = Object.values(response._embedded).find(Array.isArray);
    if (firstCollection?.length) return firstCollection[0];
  }
  return response;
}
