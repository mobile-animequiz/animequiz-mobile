import { messages } from './messages';
let locale = 'pt-BR';
const listeners = new Set();
export function getLocale() { return locale; }
export function setLocale(value) {
  const next = value === 'en' ? 'en' : 'pt-BR';
  if (next === locale) return;
  locale = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
export function subscribeLocale(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function t(key, values = {}) {
  let text = messages[key]?.[locale] ?? messages[key]?.['pt-BR'] ?? key;
  for (const [name, value] of Object.entries(values)) text = text.replaceAll('{'+name+'}', String(value));
  return text;
}
