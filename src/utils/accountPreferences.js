import { t } from '../i18n/runtime';
const CHOICES = {
  theme: ['midnight', 'eclipse'],
  accent: ['violet', 'cyan', 'rose'],
};
export function getAppearanceChoices(kind) {
  return (CHOICES[kind] ?? []).map((value) => [value, t(value)]);
}
