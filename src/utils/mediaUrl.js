import { getApiBaseUrl } from '../services/apiConfig';
/** Only HTTPS remote images or media belonging to the configured API. */
export function mediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith('/media/quizzes/') && !value.includes('..')) return getApiBaseUrl() + value;
  return null;
}
