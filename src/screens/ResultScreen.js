import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ScreenContainer from '../components/ScreenContainer';
import { colors, metrics, textStyles } from '../styles/theme';

// The backend does not expose attempt submission/scoring yet. This screen must
// not infer correctness or receive an answer key from the client/API.
export default function ResultScreen() {
  const router = useRouter();
  const { result: resultParam } = useLocalSearchParams();

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(Array.isArray(resultParam) ? resultParam[0] : resultParam || '');
      if (parsed && typeof parsed === 'object') {
        return {
          quizTitle: typeof parsed.quizTitle === 'string' ? parsed.quizTitle : '',
          category: typeof parsed.category === 'string' ? parsed.category : '',
        };
      }
    } catch {
      // Invalid or missing route data is handled by the neutral fallback below.
    }
    return { quizTitle: '', category: '' };
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
          <Text style={styles.tag}>Quiz concluído</Text>
          <Text style={styles.title} accessibilityRole="header">
            Respostas registradas
          </Text>
          {result.quizTitle ? (
            <Text style={textStyles.caption}>
              {result.category ? `${result.category} - ` : ''}{result.quizTitle}
            </Text>
          ) : null}
          <Text style={textStyles.body}>
            A pontuação oficial ficará disponível quando o envio das respostas e o cálculo forem integrados à API.
          </Text>
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
