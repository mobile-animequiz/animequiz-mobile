import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const { user, refreshCurrentUser } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_ID);
  const [loadError, setLoadError] = useState(null);
  const [profileResource, setProfileResource] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPlayer = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const currentUser = await refreshCurrentUser();
      const userId = currentUser?.id ?? currentUser?.userId;
      if (userId !== undefined && userId !== null) {
        const profile = await getProfileByUserId(userId);
        setProfileResource(profile);
      }
    } catch (error) {
      setLoadError(error.message || 'Não foi possível carregar os dados do jogador.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCurrentUser]);

  const refreshQuizzes = useCallback(async () => {
    setIsLoadingQuizzes(true);
    setLoadError(null);
    try {
      const catalog = await getQuizCatalog();
      setQuizzes(catalog);
    } catch (error) {
      setLoadError(error.message || 'Não foi possível carregar os quizzes.');
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    refreshQuizzes();
    refreshPlayer();
  }, [refreshQuizzes, refreshPlayer]);

  const categories = useMemo(() => {
    const unique = new Map();
    quizzes.forEach((quiz) => {
      if (quiz.categoryId && quiz.categoryId !== 'other') {
        unique.set(quiz.categoryId, { id: quiz.categoryId, label: quiz.categoryLabel });
      }
    });
    return [{ id: ALL_CATEGORIES_ID, label: 'Todos' }, ...unique.values()];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => (
    selectedCategoryId === ALL_CATEGORIES_ID
      ? quizzes
      : quizzes.filter((quiz) => quiz.categoryId === selectedCategoryId)
  ), [quizzes, selectedCategoryId]);

  const player = useMemo(() => normalizePlayer(user, profileResource), [user, profileResource]);
  return {
    player,
    categories,
    selectedCategoryId,
    selectCategory: setSelectedCategoryId,
    quizzes: filteredQuizzes,
    loadError,
    isLoadingQuizzes,
    isRefreshing,
    refreshPlayer,
    refreshQuizzes,
  };
}
