import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';
import * as preferenceStorage from '../services/preferenceStorage';
import { useAuth } from './AuthContext';
import * as account from '../services/accountService';
import { setLocale } from '../i18n/runtime';
import { colors as officialColors, backgroundGradient as officialGradient } from '../styles/colors';

const Context = createContext(null);
const defaults = { displayName: '', theme: 'midnight', accent: 'violet', locale: 'pt-BR', hasAvatar: false, avatarVersion: 0 };
const accents = { violet: officialColors.accent, cyan: '#7CE5DF', rose: '#FFB1D2' };
const cacheKey = (id) => 'animequiz.preferences.' + id;
function applyLocale(preference) {
  const language = preference === 'device' ? getLocales()[0]?.languageCode : preference;
  setLocale(language === 'en' ? 'en' : 'pt-BR');
}
export function AccountProvider({ children }) {
  const { user, token } = useAuth();
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
    return Promise.all([account.getAccountSettings(), account.getFavorites()]).then(async ([nextSettings, nextFavorites]) => {
      if (activeOwner.current !== owner || revisions.current.get(owner) !== revision) return;
      setResource({ owner, settings: nextSettings, favorites: nextFavorites, ready: true });
      setError(null);
      await preferenceStorage.setItemAsync(cacheKey(owner), JSON.stringify(nextSettings)).catch(() => {});
    }).catch((failure) => {
      if (activeOwner.current === owner && revisions.current.get(owner) === revision) setError(failure.message);
    });
  }, [owner, nextRevision]);
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
    if (!owner || !current?.ready || mutations.current.has(owner)) return;
    const requestOwner = owner;
    mutations.current.add(owner);
    nextRevision(owner);
    setBusyOwner(owner);
    try {
      const updated = await operation();
      if (activeOwner.current !== requestOwner) return;
      setResource((previous) => ({ owner: requestOwner, settings: updated, favorites: previous?.owner === requestOwner ? previous.favorites : [], ready: true }));
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
    if (favoritesBusy.includes(id) || !owner || !current?.ready) return;
    const requestOwner = owner;
    const requestKey = owner + '|' + id;
    const desired = !favorites.some((item) => String(item.id) === id);
    nextRevision(owner);
    setFavoriteRequests((keys) => [...keys, requestKey]);
    try {
      await account.saveFavorite(id, desired);
      if (activeOwner.current !== requestOwner) return;
      setResource((previous) => {
        if (previous?.owner !== requestOwner) return previous;
        return { ...previous, favorites: desired ? [...previous.favorites.filter((item) => String(item.id) !== id), quiz] : previous.favorites.filter((item) => String(item.id) !== id) };
      });
    } finally { setFavoriteRequests((keys) => keys.filter((key) => key !== requestKey)); }
  }
  const colors = useMemo(() => ({
    ...officialColors,
    backgroundTop: settings.theme === 'eclipse' ? '#180F1D' : officialColors.backgroundTop,
    backgroundBottom: settings.theme === 'eclipse' ? '#352038' : officialColors.backgroundBottom,
    accent: accents[settings.accent] ?? accents.violet,
    link: settings.accent === 'violet' ? officialColors.link : accents[settings.accent] ?? officialColors.link,
  }), [settings.theme, settings.accent]);
  const gradient = settings.theme === 'eclipse' ? { colors: [colors.backgroundTop, colors.backgroundBottom], locations: [0, 1] } : officialGradient;
  return <Context.Provider value={{ settings, favorites, favoritesBusy, busy, error, refresh, colors, gradient, loading: Boolean(owner && !current?.ready && !error),
    update: (data) => mutate(() => account.updateAccountSettings(data)),
    uploadPhoto: (asset) => mutate(() => account.uploadAvatar(asset)),
    removePhoto: () => mutate(account.deleteAvatar), toggleFavorite,
  }}>{children}</Context.Provider>;
}
export function useAccount() { const value = useContext(Context); if (!value) throw new Error('AccountProvider ausente'); return value; }
