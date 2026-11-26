import { t } from '../i18n/runtime';
const CHOICES = {
  theme: ['midnight', 'eclipse', 'ocean', 'forest'],
  accent: ['violet', 'cyan', 'rose', 'amber', 'mint', 'coral'],
};
export function getAppearanceChoices(kind) {
  return (CHOICES[kind] ?? []).map((value) => [value, t(value)]);
}
