import { getApiBaseUrl } from '../services/apiConfig';
/** Credentials stay in headers, never in the image URL. */
export function avatarSource(userId, version, token, retry = 0) {
  return {
    uri: `${getApiBaseUrl()}/users/me/avatar?v=${encodeURIComponent(userId + ':' + version)}&retry=${retry}`,
    headers: { Authorization: `Bearer ${token}`, 'X-API-Version': '2' },
    cache: 'reload',
  };
}
