import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ScreenContainer from '../components/ScreenContainer';
import { colors, metrics, textStyles } from '../styles/theme';
import { getQuizById, getQuizQuestions } from '../services/quizService';

// ---------------------------------------------------------------------------
// Question data is loaded from the API; answer correctness stays on the server.
// ---------------------------------------------------------------------------
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Theme colors are retained for the existing selection and feedback styles.
// An 8-digit hex is "color + alpha": 24 = 14% (fill), 66 = 40% (border).
const CORRECT_COLOR = colors.difficultyEasy;
const INCORRECT_COLOR = colors.error;
const FILL_ALPHA = '24';
const BORDER_ALPHA = '66';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function QuizScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams();
  const scrollRef = useRef(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState(null);

  const requestedQuizId = Array.isArray(quizId) ? quizId[0] : quizId;
  useEffect(() => {
    let isActive = true;
    async function loadQuiz() {
      setIsLoadingQuiz(true);
      setQuizError(null);
      try {
        if (!requestedQuizId) throw new Error('Identificador do quiz não informado.');
        const [quizResource, questionResources] = await Promise.all([
          getQuizById(requestedQuizId),
          getQuizQuestions(requestedQuizId),
        ]);
        if (!quizResource) throw new Error('Este quiz não foi encontrado.');
        if (!questionResources.length) throw new Error('Este quiz ainda não possui perguntas disponíveis.');
        if (isActive) {
          setQuiz(quizResource);
          setQuestions(questionResources);
        }
      } catch (error) {
        if (isActive) setQuizError(error.message || 'Não foi possível carregar o quiz.');
      } finally {
        if (isActive) setIsLoadingQuiz(false);
      }
    }
    loadQuiz();
    return () => { isActive = false; };
  }, [requestedQuizId]);

  const isUnavailable = !isLoadingQuiz && (!quiz || questions.length === 0);
  const total = questions.length;
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === total - 1;
  const progressPercent = ((questionIndex + 1) / total) * 100;

  const leaveQuiz = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  }, [router]);

  const confirmExit = useCallback(() => {
    Alert.alert('Sair do quiz?', 'Seu progresso nesta partida será perdido.', [
      { text: 'Continuar jogando', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: leaveQuiz },
    ]);
  }, [leaveQuiz]);

  // Android back button asks for confirmation too (iOS swipe-back is disabled below).
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => subscription.remove();
  }, [confirmExit]);

  function handleSelectOption(index) {
    if (!isConfirmed) {
      setSelectedIndex(index);
    }
  }

  function handleConfirm() {
    if (selectedIndex === null || isConfirmed) return;
    setIsConfirmed(true);
    setSubmittedAnswers((answers) => [...answers, {
      questionId: question.id,
      optionId: question.options[selectedIndex].id,
    }]);
  }

  function handleNext() {
    if (isLastQuestion) {
      const result = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.categoryLabel,
        answers: submittedAnswers,
        pendingAttempt: true,
      };
      router.replace({ pathname: '/result', params: { result: JSON.stringify(result) } });
      return;
    }

    setQuestionIndex((index) => index + 1);
    setSelectedIndex(null);
    setIsConfirmed(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  if (isLoadingQuiz) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.accent} />
        <Text style={textStyles.body}>Carregando quiz...</Text>
      </ScreenContainer>
    );
  }

  if (isUnavailable) {
    return (
      <ScreenContainer>
        <Text style={textStyles.heading}>Quiz indisponível</Text>
        <Text style={textStyles.body}>{quizError || 'As perguntas deste quiz ainda não estão disponíveis.'}</Text>
        <Pressable onPress={() => router.replace('/home')} accessibilityRole="button" accessibilityLabel="Voltar para a Home">
          <Text style={textStyles.body}>Voltar para a Home</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const actionLabel = !isConfirmed
    ? 'Confirmar resposta'
    : isLastQuestion
      ? 'Ver resultado'
      : 'Próxima pergunta';

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <ScreenContainer scrollable={false} padded={false}>
        {/* Header: close button + progress */}
        <View style={styles.header}>
          <Pressable
            onPress={confirmExit}
            hitSlop={8}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Fechar quiz"
          >
            <CloseIcon />
          </Pressable>

          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <Text style={textStyles.heading}>
                Questão {questionIndex + 1} de {total}
              </Text>
              <Text style={textStyles.caption}>
                {submittedAnswers.length} {submittedAnswers.length === 1 ? 'resposta' : 'respostas'}
              </Text>
            </View>

            <View
              style={styles.track}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Progresso do quiz"
              accessibilityValue={{ min: 0, max: total, now: questionIndex + 1 }}
            >
              <View style={[styles.fill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionTag}>{quiz.categoryLabel}</Text>
            <Text style={styles.questionText} accessibilityRole="header">
              {question.text}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.options} accessibilityRole="radiogroup">
            {question.options.map((option, index) => (
              <OptionItem
                key={`${question.id}-${index}`}
                letter={OPTION_LETTERS[index]}
                text={option.text}
                state={getOptionState({ index, selectedIndex, isConfirmed })}
                disabled={isConfirmed}
                onPress={() => handleSelectOption(index)}
              />
            ))}
          </View>

          {isConfirmed ? (
            <View style={styles.feedback} accessibilityLiveRegion="polite">
              <Text style={textStyles.body}>Resposta registrada. O resultado será calculado pelo servidor ao finalizar o quiz.</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Controls */}
        <View style={styles.footer}>
          <ActionButton
            label={actionLabel}
            disabled={selectedIndex === null}
            onPress={isConfirmed ? handleNext : handleConfirm}
          />
        </View>
      </ScreenContainer>
    </>
  );
}

// 'idle' | 'selected' (before confirming) | 'correct' | 'incorrect' | 'dimmed' (after confirming)
function getOptionState({ index, selectedIndex, isConfirmed }) {
  if (isConfirmed) return 'dimmed';
  return index === selectedIndex ? 'selected' : 'idle';
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------
function OptionItem({ letter, text, state, disabled, onPress }) {
  const isActive = state === 'selected' || state === 'correct' || state === 'incorrect';
  const a11ySuffix =
    state === 'correct' ? ', resposta correta' : state === 'incorrect' ? ', resposta incorreta' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.option,
        state === 'selected' && styles.optionSelected,
        state === 'correct' && styles.optionCorrect,
        state === 'incorrect' && styles.optionIncorrect,
        state === 'dimmed' && styles.optionDimmed,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="radio"
      accessibilityLabel={`${letter}. ${text}${a11ySuffix}`}
      accessibilityState={{ selected: state !== 'idle' && state !== 'dimmed', disabled }}
    >
      <View
        style={[
          styles.badge,
          state === 'selected' && styles.badgeSelected,
          state === 'correct' && styles.badgeCorrect,
          state === 'incorrect' && styles.badgeIncorrect,
        ]}
      >
        {state === 'correct' ? (
          <StatusMark type="check" />
        ) : state === 'incorrect' ? (
          <StatusMark type="cross" />
        ) : (
          <Text style={[styles.badgeLetter, isActive && styles.badgeLetterActive]}>{letter}</Text>
        )}
      </View>

      <Text style={styles.optionText}>{text}</Text>
    </Pressable>
  );
}

function ActionButton({ label, disabled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        disabled ? styles.actionDisabled : styles.actionEnabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

// Vector marks drawn with Views (no emoji, no icon font).
function CloseIcon() {
  return (
    <View style={styles.closeIcon}>
      <View style={[styles.closeBar, styles.rotatePositive]} />
      <View style={[styles.closeBar, styles.rotateNegative]} />
    </View>
  );
}

function StatusMark({ type }) {
  if (type === 'check') {
    return <View style={styles.checkMark} />;
  }

  return (
    <View style={styles.crossMark}>
      <View style={[styles.crossBar, styles.rotatePositive]} />
      <View style={[styles.crossBar, styles.rotateNegative]} />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.homeHeaderTop,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
  closeBar: {
    position: 'absolute',
    top: 7,
    left: 0,
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  progressBlock: {
    flex: 1,
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
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

  // Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: metrics.homePaddingX,
    paddingTop: metrics.homeSectionGap,
    paddingBottom: metrics.cardPadding,
  },

  // Question
  questionCard: {
    minHeight: 148,
    justifyContent: 'center',
    padding: 20,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  questionTag: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  questionText: {
    ...textStyles.title,
    marginTop: 8,
  },

  // Options
  options: {
    marginTop: metrics.cardPadding,
    gap: metrics.cardGap,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.cardGap,
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: metrics.fieldRadius,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}29`,
  },
  optionCorrect: {
    borderColor: CORRECT_COLOR,
    backgroundColor: `${CORRECT_COLOR}${FILL_ALPHA}`,
  },
  optionIncorrect: {
    borderColor: INCORRECT_COLOR,
    backgroundColor: `${INCORRECT_COLOR}${FILL_ALPHA}`,
  },
  optionDimmed: {
    opacity: 0.45,
  },
  optionText: {
    ...textStyles.body,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  badgeSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  badgeCorrect: {
    borderColor: CORRECT_COLOR,
    backgroundColor: CORRECT_COLOR,
  },
  badgeIncorrect: {
    borderColor: INCORRECT_COLOR,
    backgroundColor: INCORRECT_COLOR,
  },
  badgeLetter: {
    ...textStyles.button,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  badgeLetterActive: {
    color: colors.textPrimary,
  },
  checkMark: {
    width: 6,
    height: 11,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
  crossMark: {
    width: 12,
    height: 12,
  },
  crossBar: {
    position: 'absolute',
    top: 5,
    left: 0,
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },

  // Feedback
  feedback: {
    marginTop: metrics.cardPadding,
    padding: 14,
    gap: 4,
    borderRadius: metrics.fieldRadius,
    borderWidth: 1,
  },
  feedbackCorrect: {
    borderColor: `${CORRECT_COLOR}${BORDER_ALPHA}`,
    backgroundColor: `${CORRECT_COLOR}${FILL_ALPHA}`,
  },
  feedbackIncorrect: {
    borderColor: `${INCORRECT_COLOR}${BORDER_ALPHA}`,
    backgroundColor: `${INCORRECT_COLOR}${FILL_ALPHA}`,
  },
  feedbackText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  feedbackAnswer: {
    color: colors.textPrimary,
    fontWeight: '700',
  },

  // Controls
  footer: {
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
  actionEnabled: {
    backgroundColor: colors.accent,
  },
  actionDisabled: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  actionLabel: {
    ...textStyles.button,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  actionLabelDisabled: {
    color: colors.textSecondary,
  },
});
