import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';
import * as preferenceStorage from '../services/preferenceStorage';
import { useAuth } from './AuthContext';
import * as account from '../services/accountService';
import useI18n from '../hooks/useI18n';
import { setLocale } from '../i18n/runtime';
import { getPersonalColors } from '../styles/personalPalette';
import { backgroundGradient as officialGradient } from '../styles/colors';

const Context = createContext(null);
const defaults = { displayName: '', theme: 'midnight', accent: 'violet', locale: 'pt-BR', hasAvatar: false, avatarVersion: 0 };
const cacheKey = (id) => 'animequiz.preferences.' + id;
function applyLocale(preference) {
  const language = preference === 'device' ? getLocales()[0]?.languageCode : preference;
  setLocale(language === 'en' ? 'en' : 'pt-BR');
}
export function AccountProvider({ children }) {
  const { user, token } = useAuth();
  const { locale } = useI18n();
  const owner = token && user?.id ? String(user.id) : null;
  const [resource, setResource] = useState(null);
  const [busyOwner, setBusyOwner] = useState(null);
  const busy = Boolean(owner && busyOwner === owner);
  const [favoriteRequests, setFavoriteRequests] = useState([]);
  const favoritesBusy = favoriteRequests.filter((key) => key.startsWith(owner + '|')).map((key) => key.slice(key.indexOf('|') + 1));
  const [error, setError] = useState(null);
  const activeOwner = useRef(owner);
  const mutations = useRef(new Set());
  const revisions = useRef(new Map());
  const nextRevision = useCallback((id) => {
    const revision = (revisions.current.get(id) ?? 0) + 1;
    revisions.current.set(id, revision);
    return revision;
  }, []);
  useEffect(() => { activeOwner.current = owner; return () => { activeOwner.current = null; }; }, [owner]);
  const current = resource?.owner === owner ? resource : null;
  const settings = current?.settings ?? defaults;
  const favorites = current?.favorites ?? [];
  const refresh = useCallback(() => {
    if (!owner) return Promise.resolve();
    if (mutations.current.has(owner)) return Promise.resolve();
    const revision = nextRevision(owner);
    return Promise.allSettled([account.getAccountSettings(), account.getFavorites(locale)]).then(async ([settingsResult, favoritesResult]) => {
      if (settingsResult.status !== 'fulfilled') throw settingsResult.reason;
      const nextSettings = settingsResult.value;
      if (activeOwner.current !== owner || revisions.current.get(owner) !== revision) return;
      setResource(previous => ({ owner, settings: nextSettings,
        favorites: favoritesResult.status === 'fulfilled' ? favoritesResult.value : (previous?.owner === owner ? previous.favorites : []),
        favoritesReady: favoritesResult.status === 'fulfilled',
        favoritesError: favoritesResult.status === 'rejected' ? favoritesResult.reason.message : null,
        ready: true }));
      setError(null);
      await preferenceStorage.setItemAsync(cacheKey(owner), JSON.stringify(nextSettings)).catch(() => {});
    }).catch((failure) => {
      if (activeOwner.current === owner && revisions.current.get(owner) === revision) setError(failure.message);
    });
  }, [owner, nextRevision, locale]);
  useEffect(() => {
    if (!owner) { applyLocale('pt-BR'); return undefined; }
    let active = true;
    preferenceStorage.getItemAsync(cacheKey(owner)).then((saved) => {
      if (!active || !saved) return;
      const cached = JSON.parse(saved);
      setResource((previous) => previous?.owner === owner ? previous : { owner, settings: { ...defaults, ...cached }, favorites: [], ready: false });
    }).catch(() => {});
    refresh();
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { active = false; subscription.remove(); };
  }, [owner, refresh]);
  useEffect(() => {
    applyLocale(settings.locale);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') applyLocale(settings.locale); });
    return () => subscription.remove();
  }, [settings.locale]);
  async function mutate(operation) {
    if (!owner || activeOwner.current !== owner || !current?.ready || mutations.current.has(owner)) return;
    const requestOwner = owner;
    mutations.current.add(owner);
    nextRevision(owner);
    setBusyOwner(owner);
    try {
      const updated = await operation();
      if (activeOwner.current !== requestOwner) return;
      setResource((previous) => ({ ...(previous?.owner === requestOwner ? previous : {}), owner: requestOwner, settings: updated, favorites: previous?.owner === requestOwner ? previous.favorites : [], ready: true }));
      await preferenceStorage.setItemAsync(cacheKey(requestOwner), JSON.stringify(updated)).catch(() => {});
      setError(null);
      return updated;
    } finally {
      mutations.current.delete(requestOwner);
      setBusyOwner((value) => value === requestOwner ? null : value);
    }
  }
  async function toggleFavorite(quiz) {
    const id = String(quiz.id);
    if (favoritesBusy.includes(id) || !owner || activeOwner.current !== owner || !current?.ready || !current?.favoritesReady) return;
    const requestOwner = owner;
    const requestKey = owner + '|' + id;
    const desired = !favorites.some((item) => String(item.id) === id);
    nextRevision(owner);
    setFavoriteRequests((keys) => [...keys, requestKey]);
    try {
      await account.saveFavorite(id, desired, { headers: { Authorization: 'Bearer ' + token } });
      if (activeOwner.current !== requestOwner) return;
      setResource((previous) => {
        if (previous?.owner !== requestOwner) return previous;
        return { ...previous, favorites: desired ? [...previous.favorites.filter((item) => String(item.id) !== id), quiz] : previous.favorites.filter((item) => String(item.id) !== id) };
      });
    } finally { setFavoriteRequests((keys) => keys.filter((key) => key !== requestKey)); }
  }
  const colors = useMemo(() => getPersonalColors(settings.theme, settings.accent), [settings.theme, settings.accent]);
  const gradient = settings.theme !== 'midnight' ? { colors: [colors.backgroundTop, colors.backgroundBottom], locations: [0, 1] } : officialGradient;
  return <Context.Provider value={{ settings, favorites, favoritesBusy, favoritesError: current?.favoritesError ?? null, busy, error, refresh, colors, gradient, loading: Boolean(owner && !current?.ready && !error),
    update: (data) => mutate(() => account.updateAccountSettings(data, { headers: { Authorization: 'Bearer ' + token } })),
    uploadPhoto: (asset) => mutate(() => account.uploadAvatar(asset, { headers: { Authorization: 'Bearer ' + token } })),
    removePhoto: () => mutate(() => account.deleteAvatar({ headers: { Authorization: 'Bearer ' + token } })), toggleFavorite,
  }}>{children}</Context.Provider>;
}
export function useAccount() { const value = useContext(Context); if (!value) throw new Error('AccountProvider ausente'); return value; }
