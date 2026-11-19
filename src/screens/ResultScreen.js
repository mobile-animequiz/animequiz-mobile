import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ScreenContainer from '../components/ScreenContainer';
import AnimatedEntrance from '../components/AnimatedEntrance';
import { colors, metrics, textStyles } from '../styles/theme';

// The result is the validated response returned by POST /quizzes/{quizId}/attempts.
// Never calculate correctness or points on the device.
export default function ResultScreen() {
  useI18n();
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
        <AnimatedEntrance style={styles.content}>
          <Text style={styles.tag}>{result ? t("Quiz concluído") : t("Resultado indisponível")}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {result ? t('points', { count: result.points }) : t("Resultado indisponível")}
          </Text>
          {result ? (
            <>
              <View style={styles.medal}><Text style={styles.medalLabel}>{Math.round((result.correctAnswers / Math.max(1, result.totalQuestions)) * 100)}%</Text></View>
              <Text style={textStyles.caption}>{result.quizTitle}</Text>
              <Text style={textStyles.body}>
                {result.correctAnswers} {t("de")} {result.totalQuestions} {t("questões corretas")} </Text>
              <Text style={textStyles.caption}>
                {result.answeredQuestions} {result.answeredQuestions === 1 ? t("questão respondida") : t("questões respondidas")}
              </Text>
              <Text style={styles.verified}>{t("Pontuação calculada e registrada pela API")}</Text>
            </>
          ) : (
            <Text style={textStyles.body}> {t("Não foi possível recuperar o resultado desta tentativa.")} </Text>
          )}
        </AnimatedEntrance>
        <View style={styles.footer}>
          {result?.quizId ? <Pressable onPress={() => router.replace({ pathname: '/quiz', params: { quizId: String(result.quizId) } })}
            accessibilityRole="button" style={styles.again}><Text style={styles.buttonLabel}>{t("Jogar novamente")}</Text></Pressable> : null}
          <Pressable
            onPress={goHome}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("Voltar ao início")}
          >
            <Text style={styles.buttonLabel}>{t("Voltar ao início")}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  medal: { width: 116, height: 116, borderRadius: 58, borderWidth: 6, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  medalLabel: { color: '#fff', fontSize: 30, fontWeight: '900' },
  verified: { fontSize: 14, color: colors.difficultyEasy, textAlign: 'center' },
  again: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.accent, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
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
