import { useAccount } from '../contexts/AccountContext';
import useI18n from './useI18n';
import { getDisplayName } from '../utils/displayName';
import { t } from '../i18n/runtime';
import { useCallback, useMemo, useState } from 'react';

import useRemoteResource from './useRemoteResource';
import { useAuth } from '../contexts/AuthContext';
import { getLevelProgress } from '../utils/progress';
import { ALL_CATEGORIES_ID } from '../utils/mockData';
import { getQuizCatalog } from '../services/quizService';
import { getProfileByUserId } from '../services/profileService';

function firstDefined(source, keys, fallback) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return fallback;
}

function normalizePlayer(user, profileResource) {
  const profile = profileResource ?? user?.profile ?? user?.playerProfile ?? {};
  const level = Number(firstDefined(profile, ['level', 'currentLevel'], firstDefined(user, ['level'], 1)));
  const xp = Number(firstDefined(profile, ['xp', 'totalXp', 'experiencePoints'], firstDefined(user, ['xp', 'totalXp'], 0)));
  const levelStartXp = Number(firstDefined(profile, ['levelStartXp', 'currentLevelStartXp'], 0));
  const nextLevelXp = Number(firstDefined(profile, ['nextLevelXp', 'xpForNextLevel'], Math.max(levelStartXp + 100, xp + 1)));
  const name = firstDefined(profile, ['displayName', 'name'], firstDefined(user, ['displayName', 'username', 'name', 'email'], 'Jogador'));
  return {
    name: String(name),
    level: Number.isFinite(level) ? level : 1,
    rankTitle: String(firstDefined(profile, ['rankTitle', 'title'], '')),
    xp: Number.isFinite(xp) ? xp : 0,
    progress: getLevelProgress({ xp, levelStartXp, nextLevelXp }),
  };
}

export default function useHomeData() {
  const { user } = useAuth();
  const { settings } = useAccount();
  const { locale } = useI18n();

  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_ID);
  const loadCatalog = useCallback(() => getQuizCatalog(locale), [locale]);
  const userId = user?.id;
  const loadProfile = useCallback(() => userId ? getProfileByUserId(userId) : Promise.resolve(null), [userId]);
  const catalog = useRemoteResource('catalog:' + locale, loadCatalog);
  const playerData = useRemoteResource('player:' + user?.id, loadProfile);
  const quizzes = useMemo(() => catalog.data ?? [], [catalog.data]);
  const allLabel = t('Todos');
  const categories = useMemo(() => {
    const unique = new Map();
    quizzes.forEach((quiz) => { if (quiz.categoryId && quiz.categoryId !== 'other') unique.set(quiz.categoryId, { id: quiz.categoryId, label: quiz.categoryLabel }); });
    return [{ id: ALL_CATEGORIES_ID, label: allLabel }, ...unique.values()];
  }, [quizzes, allLabel]);
  const filtered = selectedCategoryId === ALL_CATEGORIES_ID ? quizzes : quizzes.filter((quiz) => quiz.categoryId === selectedCategoryId);
  return { player: { ...normalizePlayer(user, playerData.data), name: getDisplayName(user, settings) || t('Jogador') }, categories, selectedCategoryId, selectCategory: setSelectedCategoryId,
    quizzes: filtered, loadError: catalog.error || playerData.error, isLoadingQuizzes: catalog.loading, isRefreshing: playerData.loading,
    refreshPlayer: playerData.refresh, refreshQuizzes: catalog.refresh };
}
