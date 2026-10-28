import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import ScreenContainer from '../components/ScreenContainer';
import { colors, metrics, textStyles } from '../styles/theme';

// ---------------------------------------------------------------------------
// Mock data (no API yet). Mirrors the answers of the mocked QuizScreen:
// 7 right and 3 wrong. `isCorrect` is derived from selectedAnswer === correctAnswer.
// ---------------------------------------------------------------------------
const XP_PER_CORRECT_ANSWER = 20;

const MOCK_RESULT = {
  quizTitle: 'One Piece: A Grande Era dos Piratas',
  category: 'Shonen',
  answers: [
    { id: 'q1', question: 'Quem é o protagonista de One Piece?', selectedAnswer: 'Monkey D. Luffy', correctAnswer: 'Monkey D. Luffy' },
    { id: 'q2', question: 'Qual Fruta do Diabo deu a Luffy o corpo de borracha?', selectedAnswer: 'Gomu Gomu no Mi', correctAnswer: 'Gomu Gomu no Mi' },
    { id: 'q3', question: 'Quem deu o chapéu de palha a Luffy?', selectedAnswer: 'Gol D. Roger', correctAnswer: 'Shanks' },
    { id: 'q4', question: 'Qual membro do bando do Chapéu de Palha é o espadachim?', selectedAnswer: 'Roronoa Zoro', correctAnswer: 'Roronoa Zoro' },
    { id: 'q5', question: 'Quem é a navegadora do bando do Chapéu de Palha?', selectedAnswer: 'Nami', correctAnswer: 'Nami' },
    { id: 'q6', question: 'Qual foi o primeiro navio do bando do Chapéu de Palha?', selectedAnswer: 'Thousand Sunny', correctAnswer: 'Going Merry' },
    { id: 'q7', question: 'Qual membro do bando é o cozinheiro?', selectedAnswer: 'Sanji', correctAnswer: 'Sanji' },
    { id: 'q8', question: 'Que animal é Tony Tony Chopper?', selectedAnswer: 'Rena', correctAnswer: 'Rena' },
    { id: 'q9', question: 'Qual Fruta do Diabo dá a Portgas D. Ace o poder do fogo?', selectedAnswer: 'Goro Goro no Mi', correctAnswer: 'Mera Mera no Mi' },
    { id: 'q10', question: 'Em qual cidade Gol D. Roger, o Rei dos Piratas, foi executado?', selectedAnswer: 'Loguetown', correctAnswer: 'Loguetown' },
  ],
};

// Feedback colors reuse the theme's functional colors (green = easy, red = error).
const CORRECT_COLOR = colors.difficultyEasy;
const INCORRECT_COLOR = colors.error;

const FILTER_ALL = 'all';
const FILTER_WRONG = 'wrong';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
function buildSummary(result) {
  const answers = result.answers.map((answer, index) => ({
    ...answer,
    number: index + 1,
    isCorrect: answer.selectedAnswer === answer.correctAnswer,
  }));
  const total = answers.length;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;

  return {
    answers,
    total,
    correctCount,
    wrongCount: total - correctCount,
    percent: total === 0 ? 0 : Math.round((correctCount / total) * 100),
    xpEarned: correctCount * XP_PER_CORRECT_ANSWER,
  };
}

function getPerformance(percent) {
  if (percent === 100) {
    return { title: 'Perfeito!', message: 'Você acertou todas as perguntas. Um verdadeiro mestre dos animes.' };
  }
  if (percent >= 80) {
    return { title: 'Excelente!', message: 'Seu conhecimento sobre anime impressiona.' };
  }
  if (percent >= 60) {
    return { title: 'Mandou bem!', message: 'Você está no caminho certo. Jogue de novo para melhorar a pontuação.' };
  }
  if (percent >= 40) {
    return { title: 'Bom começo', message: 'Continue jogando para dominar mais títulos.' };
  }
  return { title: 'Continue treinando', message: 'Revise as respostas abaixo e tente outra vez.' };
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ResultScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState(FILTER_ALL);

  const summary = useMemo(() => buildSummary(MOCK_RESULT), []);
  const performance = getPerformance(summary.percent);
  const visibleAnswers =
    filter === FILTER_WRONG ? summary.answers.filter((answer) => !answer.isCorrect) : summary.answers;

  // Leaves the finished quiz behind: clears the history and lands on Home.
  const goHome = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/home');
  }, [router]);

  function playAgain() {
    router.replace('/quiz');
  }

  // Android back button goes Home too (iOS swipe-back is disabled below).
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => subscription.remove();
  }, [goHome]);

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <ScreenContainer scrollable={false} padded={false}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Headline */}
          <View style={styles.headline}>
            <Text style={styles.tag}>Quiz concluído</Text>
            <Text style={styles.headlineTitle} accessibilityRole="header">
              {performance.title}
            </Text>
            <Text style={styles.headlineMessage}>{performance.message}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreCard}>
            <Text style={textStyles.caption} numberOfLines={1}>
              {MOCK_RESULT.category} - {MOCK_RESULT.quizTitle}
            </Text>
            <Text style={styles.percent} accessibilityLabel={`${summary.percent} por cento de acertos`}>
              {summary.percent}%
            </Text>
            <Text style={styles.scoreText}>
              {summary.correctCount} de {summary.total} questões corretas
            </Text>

            <View style={styles.segments}>
              {summary.answers.map((answer) => (
                <View
                  key={answer.id}
                  style={[styles.segment, answer.isCorrect ? styles.segmentCorrect : styles.segmentWrong]}
                  accessible
                  accessibilityLabel={`Questão ${answer.number}: ${answer.isCorrect ? 'correta' : 'incorreta'}`}
                />
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <StatTile value={summary.correctCount} label="Acertos" color={CORRECT_COLOR} />
            <StatTile value={summary.wrongCount} label="Erros" color={INCORRECT_COLOR} />
            <StatTile value={`+${summary.xpEarned}`} label="XP ganho" color={colors.accent} />
          </View>

          {/* Review */}
          <View style={styles.reviewHeader}>
            <Text style={textStyles.heading} accessibilityRole="header">
              Revisão das respostas
            </Text>
          </View>

          {summary.wrongCount > 0 ? (
            <View style={styles.filters}>
              <FilterChip
                label={`Todas (${summary.total})`}
                selected={filter === FILTER_ALL}
                onPress={() => setFilter(FILTER_ALL)}
              />
              <FilterChip
                label={`Erros (${summary.wrongCount})`}
                selected={filter === FILTER_WRONG}
                onPress={() => setFilter(FILTER_WRONG)}
              />
            </View>
          ) : null}

          <View style={styles.reviewCard}>
            {visibleAnswers.map((answer, index) => (
              <ReviewRow key={answer.id} answer={answer} showDivider={index > 0} />
            ))}
          </View>
        </ScrollView>

        {/* Controls */}
        <View style={styles.footer}>
          <ActionButton label="Jogar novamente" variant="primary" onPress={playAgain} />
          <ActionButton label="Voltar ao início" variant="secondary" onPress={goHome} />
        </View>
      </ScreenContainer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------
function StatTile({ value, label, color }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={textStyles.caption}>{label}</Text>
    </View>
  );
}

function FilterChip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function ReviewRow({ answer, showDivider }) {
  return (
    <View style={[styles.reviewRow, showDivider && styles.reviewDivider]}>
      <ResultMark correct={answer.isCorrect} />

      <View style={styles.reviewBody}>
        <Text style={styles.reviewQuestion}>
          {answer.number}. {answer.question}
        </Text>

        {answer.isCorrect ? (
          <Text style={[textStyles.caption, { color: CORRECT_COLOR }]}>{answer.correctAnswer}</Text>
        ) : (
          <>
            <Text style={[textStyles.caption, { color: INCORRECT_COLOR }]}>
              Sua resposta: {answer.selectedAnswer}
            </Text>
            <Text style={[textStyles.caption, { color: CORRECT_COLOR }]}>
              Resposta certa: {answer.correctAnswer}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

function ActionButton({ label, variant, onPress }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        isPrimary ? styles.actionPrimary : styles.actionSecondary,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.actionLabel, !isPrimary && styles.actionLabelSecondary]}>{label}</Text>
    </Pressable>
  );
}

// Check / cross drawn with Views (no emoji, no icon font).
function ResultMark({ correct }) {
  return (
    <View
      style={[styles.mark, correct ? styles.markCorrect : styles.markWrong]}
      accessible
      accessibilityLabel={correct ? 'Correta' : 'Incorreta'}
    >
      {correct ? (
        <View style={styles.check} />
      ) : (
        <View style={styles.cross}>
          <View style={[styles.crossBar, styles.rotatePositive]} />
          <View style={[styles.crossBar, styles.rotateNegative]} />
        </View>
      )}
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
  rotatePositive: {
    transform: [{ rotate: '45deg' }],
  },
  rotateNegative: {
    transform: [{ rotate: '-45deg' }],
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.homeSectionGap,
    paddingBottom: metrics.cardPadding,
  },

  // Headline
  headline: {
    alignItems: 'center',
  },
  tag: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headlineTitle: {
    ...textStyles.title,
    marginTop: 8,
    textAlign: 'center',
  },
  headlineMessage: {
    ...textStyles.body,
    maxWidth: 300,
    marginTop: 6,
    textAlign: 'center',
    color: colors.textSecondary,
  },

  // Score card
  scoreCard: {
    alignItems: 'center',
    marginTop: metrics.homeSectionGap,
    padding: 20,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  percent: {
    marginTop: 8,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scoreText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  segments: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 4,
    marginTop: 20,
  },
  segment: {
    flex: 1,
    height: metrics.progressHeight,
    borderRadius: metrics.progressHeight / 2,
  },
  segmentCorrect: {
    backgroundColor: CORRECT_COLOR,
  },
  segmentWrong: {
    backgroundColor: INCORRECT_COLOR,
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

  // Review
  reviewHeader: {
    marginTop: metrics.homeSectionGap,
  },
  filters: {
    flexDirection: 'row',
    gap: metrics.chipGap,
    marginTop: metrics.cardGap,
  },
  chip: {
    height: metrics.chipHeight,
    paddingHorizontal: metrics.chipPaddingX,
    borderRadius: metrics.chipRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.fieldFill,
    borderColor: colors.surfaceBorder,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textPrimary,
  },
  reviewCard: {
    marginTop: metrics.cardGap,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    gap: metrics.cardGap,
    padding: 14,
  },
  reviewDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  reviewBody: {
    flex: 1,
    gap: 2,
  },
  reviewQuestion: {
    ...textStyles.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCorrect: {
    backgroundColor: CORRECT_COLOR,
  },
  markWrong: {
    backgroundColor: INCORRECT_COLOR,
  },
  check: {
    width: 5,
    height: 10,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
  cross: {
    width: 10,
    height: 10,
  },
  crossBar: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },

  // Controls
  footer: {
    gap: metrics.cardGap,
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.cardGap,
    paddingBottom: metrics.cardPadding,
  },
  action: {
    height: metrics.buttonHeight,
    borderRadius: metrics.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.accent,
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  actionLabel: {
    ...textStyles.button,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  actionLabelSecondary: {
    fontWeight: '500',
    letterSpacing: 0,
  },
});
