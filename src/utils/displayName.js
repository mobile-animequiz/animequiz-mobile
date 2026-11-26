/** One rule for headers, profile and the default avatar. */
export function getDisplayName(user, settings = {}) {
  for (const value of [settings.displayName, user?.displayName, user?.username, user?.name]) {
    if (typeof value === 'string' && value.trim() && !value.includes('@')
        && !/^jogador[a-z0-9]{16}$/i.test(value.trim())) return value.trim();
  }
  const local = String(user?.email ?? '').split('@')[0].split(/[._+\-\d]+/)[0].trim();
  return local ? local.charAt(0).toLocaleUpperCase() + local.slice(1) : '';
}
