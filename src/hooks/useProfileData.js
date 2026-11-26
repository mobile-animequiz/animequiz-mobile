import { useAccount } from '../contexts/AccountContext';
import { getDisplayName } from '../utils/displayName';
import { t } from '../i18n/runtime';
import { useCallback, useMemo } from 'react';

import useRemoteResource from './useRemoteResource';
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
  const { user } = useAuth();
  const { settings } = useAccount();
  const userId = user?.id;
  const load = useCallback(() => userId ? getProfileByUserId(userId) : Promise.reject(new Error(t('A API não retornou o identificador do usuário.'))), [userId]);
  const resource = useRemoteResource(user?.id, load);
  const profile = useMemo(() => ({ ...normalizeProfile(user, resource.data), name: getDisplayName(user, settings) || t('Jogador') }), [user, resource.data, settings]);
  const progress = getLevelProgress(profile);
  const hitRate = profile.totalAnswers === 0 ? 0 : Math.round(profile.correctAnswers / profile.totalAnswers * 100);
  return { profile, progress, hitRate, isLoading: resource.loading, error: resource.error, refresh: resource.refresh };
}
