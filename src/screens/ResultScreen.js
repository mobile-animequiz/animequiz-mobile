import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ScreenContainer from '../components/ScreenContainer';
import { colors, metrics, textStyles } from '../styles/theme';

// The result is the validated response returned by POST /quizzes/{quizId}/attempts.
// Never calculate correctness or points on the device.
export default function ResultScreen() {
  const router = useRouter();
  const { result: resultParam } = useLocalSearchParams();

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(Array.isArray(resultParam) ? resultParam[0] : resultParam || '');
      if (
        parsed && typeof parsed === 'object'
        && Number.isInteger(parsed.points)
        && Number.isInteger(parsed.correctAnswers)
        && Number.isInteger(parsed.totalQuestions)
        && Number.isInteger(parsed.answeredQuestions)
        && typeof parsed.quizTitle === 'string'
      ) {
        return parsed;
      }
    } catch {
      // Missing or invalid navigation data does not turn into a fictitious result.
    }
    return null;
  }, [resultParam]);

  const goHome = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/home');
  }, [router]);

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
      <ScreenContainer>
        <View style={styles.content}>
          <Text style={styles.tag}>{result ? 'Quiz concluído' : 'Resultado indisponível'}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {result ? `${result.points} pontos` : 'Resultado indisponível'}
          </Text>
          {result ? (
            <>
              <Text style={textStyles.caption}>{result.quizTitle}</Text>
              <Text style={textStyles.body}>
                {result.correctAnswers} de {result.totalQuestions} questões corretas
              </Text>
              <Text style={textStyles.caption}>
                {result.answeredQuestions} {result.answeredQuestions === 1 ? 'questão respondida' : 'questões respondidas'}
              </Text>
            </>
          ) : (
            <Text style={textStyles.body}>
              Não foi possível recuperar o resultado desta tentativa.
            </Text>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable
            onPress={goHome}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao início"
          >
            <Text style={styles.buttonLabel}>Voltar ao início</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.cardGap,
  },
  tag: {
    ...textStyles.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    ...textStyles.title,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
  },
  button: {
    minHeight: metrics.buttonHeight,
    borderRadius: metrics.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: metrics.homePaddingX,
  },
  buttonLabel: {
    ...textStyles.button,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
