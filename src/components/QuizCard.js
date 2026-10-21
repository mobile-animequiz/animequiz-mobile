import { StyleSheet, Text, View } from 'react-native';

import PlayButton from './PlayButton';
import { colors, metrics, textStyles } from '../styles/theme';
import { formatQuestionCount } from '../utils/formatters';

const DIFFICULTY = {
  easy: { label: 'Fácil', color: colors.difficultyEasy },
  medium: { label: 'Médio', color: colors.difficultyMedium },
  hard: { label: 'Difícil', color: colors.difficultyHard },
};

// Quiz row: category tag, title, question count + difficulty, and the JOGAR button.
export default function QuizCard({ quiz, onPlay }) {
  const difficulty = DIFFICULTY[quiz.difficulty] ?? DIFFICULTY.medium;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.category}>{quiz.categoryLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {quiz.title}
        </Text>

        <View style={styles.meta}>
          <Text style={textStyles.caption}>{formatQuestionCount(quiz.questionCount)}</Text>
          <View style={styles.separator} />
          <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
          <Text style={[textStyles.caption, { color: difficulty.color }]}>{difficulty.label}</Text>
        </View>
      </View>

      <PlayButton onPress={() => onPlay(quiz)} accessibilityLabel={`JOGAR ${quiz.title}`} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  body: {
    flex: 1,
  },
  category: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    ...textStyles.heading,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  separator: {
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
});
