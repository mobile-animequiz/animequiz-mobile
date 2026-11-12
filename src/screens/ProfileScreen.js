import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../contexts/AuthContext';

import Icon from '../components/Icon';
import PlayButton from '../components/PlayButton';
import ScreenContainer from '../components/ScreenContainer';
import useGoBack from '../hooks/useGoBack';
import { colors, metrics, textStyles } from '../styles/theme';
import { formatNumber, formatQuestionCount } from '../utils/formatters';
import useProfileData from '../hooks/useProfileData';

import { MOCK_PROFILE, MOCK_USER_FAVORITES, MOCK_QUIZZES } from '../utils/mockData';

const MOCK_USER = MOCK_PROFILE;

const DIFFICULTY = {
  easy: { label: 'Fácil', color: colors.difficultyEasy },
  medium: { label: 'Médio', color: colors.difficultyMedium },
  hard: { label: 'Difícil', color: colors.difficultyHard },
};

// An 8-digit hex is "color + alpha": 24 = 14% (fill), 66 = 40% (border).
const FILL_ALPHA = '24';
const BORDER_ALPHA = '66';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

function getSavedLabel(count) {
  if (count === 0) {
    return 'nenhum salvo';
  }
  return count === 1 ? '1 salvo' : `${count} salvos`;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, progress, hitRate, isLoading, error, refresh } = useProfileData();
  const goBack = useGoBack('/home');

  // Favorites = rows of the join table that belong to the current user.
  const [favoriteQuizIds, setFavoriteQuizIds] = useState(() =>
    MOCK_USER_FAVORITES.filter((favorite) => favorite.userId === MOCK_USER.id).map((favorite) => favorite.quizId),
  );

  const favorites = useMemo(
    () => favoriteQuizIds.map((quizId) => MOCK_QUIZZES.find((quiz) => quiz.id === quizId)).filter(Boolean),
    [favoriteQuizIds],
  );


  function removeFavorite(quizId) {
    setFavoriteQuizIds((ids) => ids.filter((id) => id !== quizId));
  }

  function playQuiz(quiz) {
    router.push({ pathname: '/quiz', params: { quizId: quiz.id } });
  }

  async function logout() {
    try {
      await signOut();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/welcome');
    } catch {
      Alert.alert('Não foi possível sair', 'Tente novamente.');
    }
  }

  function confirmLogout() {
    Alert.alert('Sair da conta?', 'Você precisará entrar novamente para jogar.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Icon name="arrowBack" />
        </Pressable>
        <Text style={textStyles.title} accessibilityRole="header">
          Perfil
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? <Text style={styles.emptyText}>Carregando perfil...</Text> : null}
        {error ? (
          <Pressable onPress={refresh} style={styles.empty} accessibilityRole="button">
            <Text style={textStyles.heading}>Não foi possível carregar o perfil</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Text style={styles.emptyButtonLabel}>Tentar novamente</Text>
          </Pressable>
        ) : null}
        {/* Player card */}
        <View style={styles.playerCard}>
          <View style={styles.identity}>
            <View style={styles.avatar} accessible accessibilityRole="image" accessibilityLabel="Avatar do jogador">
              <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
            </View>

            <View style={styles.identityTexts}>
              <Text style={textStyles.title} numberOfLines={1}>
                {profile.name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.levelRow}>
            <View>
              <Text style={textStyles.heading}>Nível {profile.level}</Text>
              <Text style={textStyles.caption}>{profile.rankTitle}</Text>
            </View>
            <Text style={styles.levelPercent}>{progress.percent}%</Text>
          </View>

          <View
            style={styles.track}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Progresso para o nível ${profile.level + 1}`}
            accessibilityValue={{ min: 0, max: 100, now: progress.percent }}
          >
            <View style={[styles.fill, { width: `${progress.percent}%` }]} />
          </View>

          <View style={styles.levelRow}>
            <Text style={textStyles.caption}>
              {formatNumber(progress.remainingXp)} XP para o nível {profile.level + 1}
            </Text>
            <Text style={textStyles.caption}>
              {formatNumber(profile.xp)} / {formatNumber(profile.nextLevelXp)} XP
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <StatTile value={formatNumber(profile.xp)} label="XP total" color={colors.accent} />
          <StatTile value={String(profile.completedQuizzes)} label="Quizzes concluídos" color={colors.textPrimary} />
          <StatTile value={`${hitRate}%`} label="Taxa de acertos" color={colors.difficultyEasy} />
        </View>

        {/* Favorites */}
        <View style={styles.sectionHeader}>
          <Text style={textStyles.heading} accessibilityRole="header">
            Quizzes favoritos
          </Text>
          <Text style={textStyles.caption}>{getSavedLabel(favorites.length)}</Text>
        </View>

        {favorites.length > 0 ? (
          <View style={styles.favorites}>
            {favorites.map((quiz) => (
              <FavoriteCard
                key={quiz.id}
                quiz={quiz}
                onPlay={() => playQuiz(quiz)}
                onRemove={() => removeFavorite(quiz.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={textStyles.heading}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>Os quizzes que você salvar aparecerão aqui.</Text>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Explorar quizzes"
            >
              <Text style={styles.emptyButtonLabel}>Explorar quizzes</Text>
            </Pressable>
          </View>
        )}

        {/* Account */}
        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text style={styles.logoutLabel}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------
function StatTile({ value, label, color }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function FavoriteCard({ quiz, onPlay, onRemove }) {
  const difficulty = DIFFICULTY[quiz.difficulty] ?? DIFFICULTY.medium;

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardCategory}>{quiz.category}</Text>
        <Text style={[textStyles.heading, styles.cardTitle]} numberOfLines={2}>
          {quiz.title}
        </Text>

        <View style={styles.meta}>
          <Text style={textStyles.caption}>{formatQuestionCount(quiz.questionCount)}</Text>
          <View style={styles.metaSeparator} />
          <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
          <Text style={[textStyles.caption, { color: difficulty.color }]}>{difficulty.label}</Text>
        </View>

        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${quiz.title} dos favoritos`}
        >
          <Text style={styles.removeLabel}>Remover dos favoritos</Text>
        </Pressable>
      </View>

      <PlayButton onPress={onPlay} accessibilityLabel={`JOGAR ${quiz.title}`} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.homeHeaderTop,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.homeSectionGap,
    paddingBottom: 32,
  },

  // Player card
  playerCard: {
    padding: 20,
    gap: metrics.cardGap,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.cardPadding,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.fieldBorderFocused,
    backgroundColor: colors.progressTrack,
  },
  avatarInitials: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  identityTexts: {
    flex: 1,
  },
  email: {
    ...textStyles.body,
    marginTop: 2,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelPercent: {
    ...textStyles.heading,
    color: colors.accent,
  },
  track: {
    height: metrics.progressHeight,
    borderRadius: metrics.progressHeight / 2,
    overflow: 'hidden',
    backgroundColor: colors.progressTrack,
  },
  fill: {
    height: '100%',
    borderRadius: metrics.progressHeight / 2,
    backgroundColor: colors.accent,
  },

  // Stats
  stats: {
    flexDirection: 'row',
    gap: metrics.cardGap,
    marginTop: metrics.cardGap,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  tileValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  tileLabel: {
    ...textStyles.caption,
    textAlign: 'center',
  },

  // Favorites
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: metrics.homeSectionGap,
  },
  favorites: {
    gap: metrics.cardGap,
    marginTop: metrics.cardGap,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.cardGap,
    padding: metrics.cardPadding,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  cardBody: {
    flex: 1,
  },
  cardCategory: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
    backgroundColor: colors.textSecondary,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  removeLabel: {
    ...textStyles.caption,
    textDecorationLine: 'underline',
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    marginTop: metrics.cardGap,
    padding: 24,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  emptyText: {
    ...textStyles.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  emptyButton: {
    height: metrics.chipHeight,
    marginTop: 10,
    paddingHorizontal: metrics.chipPaddingX,
    borderRadius: metrics.chipRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  emptyButtonLabel: {
    ...textStyles.button,
    fontWeight: '700',
  },

  // Account
  logout: {
    height: metrics.buttonHeight,
    marginTop: metrics.homeSectionGap,
    borderRadius: metrics.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.error}${BORDER_ALPHA}`,
    backgroundColor: `${colors.error}${FILL_ALPHA}`,
  },
  logoutLabel: {
    ...textStyles.button,
    fontWeight: '700',
    color: colors.error,
  },
});
