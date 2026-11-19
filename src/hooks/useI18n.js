import { useSyncExternalStore } from 'react';
import { getLocale, subscribeLocale, t } from '../i18n/runtime';
export default function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);
  return { t, locale };
}
