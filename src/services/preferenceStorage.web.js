export async function getItemAsync(key) { return globalThis.localStorage?.getItem(key) ?? null; }
export async function setItemAsync(key, value) { globalThis.localStorage?.setItem(key, value); }
