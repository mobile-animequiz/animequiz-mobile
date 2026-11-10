import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { getProfileByUserId } from '../services/profileService';
import { getLevelProgress } from '../utils/progress';

function valueFrom(sources, keys, fallback) {
  for (const source of sources) {
    for (const key of keys) {
      if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
    }
  }
  return fallback;
}

function normalizeProfile(user, profile) {
  const sources = [profile, user?.profile, user?.playerProfile, user];
  const level = Number(valueFrom(sources, ['level', 'currentLevel'], 1));
  const xp = Number(valueFrom(sources, ['xp', 'totalXp', 'experiencePoints'], 0));
  const levelStartXp = Number(valueFrom(sources, ['levelStartXp', 'currentLevelStartXp'], 0));
  const nextLevelXp = Number(valueFrom(sources, ['nextLevelXp', 'xpForNextLevel'], Math.max(levelStartXp + 100, xp + 1)));
  const correctAnswers = Number(valueFrom(sources, ['correctAnswers', 'correctAnswerCount'], 0));
  const totalAnswers = Number(valueFrom(sources, ['totalAnswers', 'answeredQuestions'], 0));

  return {
    id: valueFrom([user, profile], ['userId', 'id'], null),
    name: String(valueFrom([profile, user], ['displayName', 'name', 'username'], 'Jogador')),
    email: String(valueFrom([user, profile], ['email'], '')),
    level: Number.isFinite(level) ? level : 1,
    rankTitle: String(valueFrom(sources, ['rankTitle', 'title'], '')),
    xp: Number.isFinite(xp) ? xp : 0,
    levelStartXp: Number.isFinite(levelStartXp) ? levelStartXp : 0,
    nextLevelXp: Number.isFinite(nextLevelXp) ? nextLevelXp : Math.max(xp + 1, 1),
    completedQuizzes: Number(valueFrom(sources, ['completedQuizzes', 'completedQuizCount'], 0)) || 0,
    correctAnswers: Number.isFinite(correctAnswers) ? correctAnswers : 0,
    totalAnswers: Number.isFinite(totalAnswers) ? totalAnswers : 0,
  };
}

export default function useProfileData() {
  const { user, refreshCurrentUser } = useAuth();
  const [profileResource, setProfileResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = user ?? await refreshCurrentUser();
      const userId = currentUser?.id ?? currentUser?.userId;
      if (userId === undefined || userId === null) {
        throw new Error('A API não retornou o identificador do usuário.');
      }
      const result = await getProfileByUserId(userId);
      setProfileResource(result);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar o perfil.');
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshCurrentUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const profile = useMemo(() => normalizeProfile(user, profileResource), [user, profileResource]);
  const progress = useMemo(() => getLevelProgress(profile), [profile]);
  const hitRate = profile.totalAnswers === 0
    ? 0
    : Math.round((profile.correctAnswers / profile.totalAnswers) * 100);

  return { profile, progress, hitRate, isLoading, error, refresh };
}
