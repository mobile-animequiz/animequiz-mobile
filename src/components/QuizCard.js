import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import QuizCover from './QuizCover';
import PlayButton from './PlayButton';
import { useAccount } from '../contexts/AccountContext';
import useI18n from '../hooks/useI18n';
import { metrics, textStyles } from '../styles/theme';
export default function QuizCard({ quiz, onPlay }) {
  const { t } = useI18n();
  const { colors, favorites, favoritesBusy, toggleFavorite, loading, error, favoritesError } = useAccount();
  const favorite = favorites.some((item) => String(item.id) === String(quiz.id));
  const busy = favoritesBusy.includes(String(quiz.id));
  const difficulty = { easy: t("Fácil"), medium: t("Médio"), hard: t("Difícil") }[quiz.difficulty] ?? t("Médio");
  async function toggle() { try { await toggleFavorite(quiz); } catch (error) { Alert.alert(t('saveFailed'), error.message); } }
  return <View style={[styles.card, { borderColor: colors.surfaceBorder, backgroundColor: colors.fieldFill }]}>
    <View style={{ flex: 1, gap: 6 }}>
      <QuizCover quiz={quiz} />
      <Text style={[textStyles.caption, { color: colors.accent }]}>{quiz.categoryLabel}</Text>
      <Text style={textStyles.heading}>{quiz.title}</Text>
      <Text style={textStyles.caption}>{t('questionCount', { count: quiz.questionCount })} · {t(difficulty)}</Text>
      <Text style={textStyles.caption}>{t('questionTime', { seconds: quiz.timeLimitSeconds })}</Text>
      <Pressable onPress={toggle} disabled={busy || loading || Boolean(error || favoritesError)} accessibilityRole="button"
        accessibilityLabel={t(favorite ? 'unfavorite' : 'favorite', { title: quiz.title })} accessibilityState={{ selected: favorite, busy, disabled: busy || loading || Boolean(error || favoritesError) }}
        style={styles.favorite}>
        {busy ? <ActivityIndicator color={colors.accent} /> : <Text style={[textStyles.body, { color: colors.accent }]}>{favorite ? '♥ ' : '♡ '}{t(favorite ? 'saved' : 'save')}</Text>}
      </Pressable>
    </View>
    <PlayButton onPress={() => onPlay(quiz)} accessibilityLabel={t('playQuiz', { title: quiz.title })} />
  </View>;
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: metrics.cardPadding, borderRadius: metrics.cardRadius, borderWidth: 1 },
  favorite: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingRight: 12 },
});
