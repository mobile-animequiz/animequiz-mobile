import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import QuestionImage from '../components/QuestionImage';
import ScreenContainer from '../components/ScreenContainer';
import { useApiVersion } from '../contexts/ApiVersionContext';
import { colors, metrics, textStyles } from '../styles/theme';
import { getQuizById, getQuizQuestions } from '../services/quizService';
import { submitQuizAttempt } from '../services/attemptService';
import { remainingSeconds, createAttemptKey } from '../utils/quizRound';

const TILES = [
  { color: '#A9344D', shape: '▲' }, { color: '#2051A1', shape: '◆' },
  { color: '#765B07', shape: '●' }, { color: '#1D725D', shape: '■' },
];

export default function QuizScreen() {
  const router = useRouter();
  const { quizId, timed } = useLocalSearchParams();
  const { version } = useApiVersion();
  const requestedQuizId = Array.isArray(quizId) ? quizId[0] : quizId;
  const isTimed = timed === 'true';
  const scrollRef = useRef(null);
  const submittingRef = useRef(false);
  const lockedRef = useRef(false);
  const advancingRef = useRef(false);
  const deadlineRef = useRef(0);
  const attemptKeyRef = useRef(null);
  if (!attemptKeyRef.current) attemptKeyRef.current = createAttemptKey();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [retryLoad, setRetryLoad] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoadingQuiz(true);
    setQuizError(null);
    Promise.all([getQuizById(requestedQuizId), getQuizQuestions(requestedQuizId)])
      .then(([resource, items]) => {
        if (!resource || !items.length) throw new Error('Este quiz ainda não possui perguntas disponíveis.');
        if (active) { setQuiz(resource); setQuestions(items); }
      })
      .catch((error) => { if (active) setQuizError(error.message || 'Não foi possível carregar o quiz.'); })
      .finally(() => { if (active) setIsLoadingQuiz(false); });
    return () => { active = false; };
  }, [requestedQuizId, retryLoad]);

  const question = questions[questionIndex];
  const total = questions.length;
  const lastQuestion = questionIndex === total - 1;
  useEffect(() => { advancingRef.current = false; }, [question?.id]);
  const endQuestionTime = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setSecondsLeft(0); setSelectedIndex(null); setTimedOut(true); setIsConfirmed(true);
  }, []);

  useEffect(() => {
    if (!question || !isTimed || isConfirmed || isLoadingQuiz) return undefined;
    deadlineRef.current = Date.now() + question.timeLimitSeconds * 1000;
    const tick = () => {
      const remaining = remainingSeconds(deadlineRef.current, Date.now());
      setSecondsLeft(remaining);
      if (remaining === 0) endQuestionTime();
    };
    tick();
    const interval = setInterval(tick, 250);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') tick(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [question, isTimed, isConfirmed, isLoadingQuiz, endQuestionTime]);

  const confirmExit = useCallback(() => {
    if (submittingRef.current) return;
    Alert.alert('Sair do quiz?', 'O progresso desta partida será perdido.', [
      { text: 'Continuar jogando', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => router.replace('/home') },
    ]);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { confirmExit(); return true; });
    return () => subscription.remove();
  }, [confirmExit]);

  function handleConfirm() {
    if (lockedRef.current || selectedIndex === null) return;
    if (isTimed && Date.now() >= deadlineRef.current) { endQuestionTime(); return; }
    lockedRef.current = true;
    setSubmittedAnswers((answers) => [...answers, { questionId: question.id, optionId: question.options[selectedIndex].id }]);
    setIsConfirmed(true);
  }

  function restart() {
    lockedRef.current = false;
    advancingRef.current = false;
    attemptKeyRef.current = createAttemptKey();
    setQuestionIndex(0); setSelectedIndex(null); setIsConfirmed(false); setTimedOut(false); setSubmittedAnswers([]);
  }

  async function handleNext() {
    if (!isConfirmed || submittingRef.current || advancingRef.current) return;
    if (!lastQuestion) {
      advancingRef.current = true;
      lockedRef.current = false;
      setQuestionIndex((index) => index + 1);
      setSelectedIndex(null); setIsConfirmed(false); setTimedOut(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    if (!submittedAnswers.length) {
      Alert.alert('Nenhuma resposta enviada', 'O tempo acabou em todas as perguntas. Esta partida não gerou pontuação no servidor.', [
        { text: 'Voltar ao início', onPress: () => router.replace('/home') }, { text: 'Recomeçar', onPress: restart },
      ]);
      return;
    }
    submittingRef.current = true;
    setIsSubmittingAttempt(true);
    try {
      const result = await submitQuizAttempt(quiz.id, submittedAnswers, attemptKeyRef.current);
      router.replace({ pathname: '/result', params: { result: JSON.stringify(result) } });
    } catch (error) {
      Alert.alert('Não foi possível enviar', `${error.message} Tente novamente: a mesma chave evita duplicar esta tentativa.`);
    } finally {
      submittingRef.current = false; setIsSubmittingAttempt(false);
    }
  }

  if (isLoadingQuiz) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.accent} /><Text style={textStyles.body}>Preparando a partida…</Text></View></ScreenContainer>;
  if (quizError || !quiz || !question) return <ScreenContainer><View style={styles.center}>
    <Text style={textStyles.title}>Quiz indisponível</Text><Text style={textStyles.body}>{quizError || 'Não há perguntas disponíveis.'}</Text>
    <ActionButton label="Tentar novamente" onPress={() => setRetryLoad((value) => value + 1)} />
    <ActionButton label="Voltar ao início" onPress={() => router.replace('/home')} />
  </View></ScreenContainer>;

  const label = isSubmittingAttempt ? 'Enviando resultado…' : !isConfirmed ? 'Confirmar resposta' : lastQuestion ? 'Ver resultado' : 'Próxima pergunta';
  return <>
    <Stack.Screen options={{ gestureEnabled: false }} />
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.header}>
        <Pressable onPress={confirmExit} disabled={isSubmittingAttempt} accessibilityRole="button" accessibilityLabel="Sair do quiz" style={styles.close}><Text style={styles.closeLabel}>×</Text></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>API V{version} · {quiz.categoryLabel}</Text><Text style={styles.counter}>Pergunta {questionIndex + 1} de {total}</Text></View>
        {isTimed ? <View style={[styles.timer, secondsLeft <= 5 && styles.timerWarning]} accessibilityLabel={`${secondsLeft} segundos restantes`}>
          <Text style={styles.timerNumber}>{secondsLeft}</Text><Text style={styles.timerUnit}>seg</Text>
        </View> : <Text style={styles.untimed}>Sem tempo</Text>}
      </View>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Progresso da partida" accessibilityValue={{ min: 0, max: total, now: questionIndex + 1 }}>
        <View style={[styles.fill, { width: `${((questionIndex + 1) / total) * 100}%` }]} />
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <QuestionImage key={`${question.id}-${question.imageUrl}`} uri={question.imageUrl} description={question.imageAltText} />
        <Text style={styles.question} accessibilityRole="header">{question.text}</Text>
        <Text style={styles.hint}>{isConfirmed ? 'Sua escolha foi encerrada' : 'Escolha uma alternativa'}</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {question.options.map((option, index) => {
            const tile = TILES[index % TILES.length];
            const selected = index === selectedIndex;
            return <Pressable key={option.id} disabled={isConfirmed} onPress={() => { if (!lockedRef.current) setSelectedIndex(index); }}
              accessibilityRole="radio" accessibilityLabel={`${String.fromCharCode(65 + index)}. ${option.text}`} accessibilityState={{ selected, disabled: isConfirmed }}
              style={({ pressed }) => [styles.tile, { backgroundColor: tile.color }, selected && styles.selected, isConfirmed && !selected && styles.dimmed, pressed && styles.pressed]}>
              <View style={styles.tileTop}><Text style={styles.shape}>{tile.shape}</Text><Text style={styles.letter}>{String.fromCharCode(65 + index)}</Text></View>
              <Text style={styles.optionText}>{option.text}</Text>
              {selected ? <Text style={styles.selection}>{isConfirmed ? 'Confirmada' : 'Selecionada'}</Text> : null}
            </Pressable>;
          })}
        </View>
        {isConfirmed ? <View style={styles.feedback} accessibilityLiveRegion="polite">
          <Text style={styles.feedbackTitle}>{timedOut ? 'O tempo acabou' : 'Resposta confirmada'}</Text>
          <Text style={styles.feedbackBody}>{timedOut ? 'Esta pergunta ficará sem resposta. Continue para a próxima etapa.' : 'Seu resultado será corrigido pela API ao terminar a partida.'}</Text>
        </View> : null}
      </ScrollView>
      <View style={styles.footer}><Text style={styles.footerHint}>{submittedAnswers.length} de {total} respostas confirmadas</Text>
        <ActionButton label={label} disabled={(!isConfirmed && selectedIndex === null) || isSubmittingAttempt} onPress={isConfirmed ? handleNext : handleConfirm} />
      </View>
    </ScreenContainer>
  </>;
}

function ActionButton({ label, onPress, disabled = false }) {
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => [styles.action, disabled && styles.disabled, pressed && styles.pressed]}><Text style={styles.actionLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: metrics.homePaddingX, paddingTop: 16, paddingBottom: 16 },
  close: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.fieldFill, justifyContent: 'center', alignItems: 'center' },
  closeLabel: { color: '#fff', fontSize: 30 },
  heading: { flex: 1, gap: 5 },
  eyebrow: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  counter: { color: '#fff', fontSize: 17, fontWeight: '800' },
  timer: { minWidth: 52, minHeight: 52, borderRadius: 16, backgroundColor: '#334180', alignItems: 'center', justifyContent: 'center' },
  timerWarning: { backgroundColor: '#A9344D' },
  timerNumber: { color: '#fff', fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerUnit: { color: '#fff', fontSize: 12 },
  untimed: { color: colors.textSecondary, fontSize: 14, maxWidth: 70 },
  track: { height: 5, backgroundColor: colors.progressTrack, marginHorizontal: metrics.homePaddingX, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  content: { padding: metrics.homePaddingX, paddingBottom: 24 },
  question: { color: '#fff', fontSize: 24, lineHeight: 32, fontWeight: '800' },
  hint: { color: colors.textSecondary, fontSize: 14, marginTop: 10, marginBottom: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '46%', flexGrow: 1, minHeight: 132, padding: 15, borderRadius: 18, borderWidth: 3, borderColor: 'transparent', gap: 12 },
  tileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shape: { color: '#fff', fontSize: 22 },
  letter: { color: '#fff', fontSize: 14, fontWeight: '800' },
  optionText: { color: '#fff', fontSize: 16, lineHeight: 23, fontWeight: '700' },
  selected: { borderColor: '#fff' },
  selection: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dimmed: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  feedback: { marginTop: 22, padding: 16, backgroundColor: '#262D50', borderRadius: 16, gap: 6 },
  feedbackTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  feedbackBody: { color: '#D9DEFA', fontSize: 15, lineHeight: 22 },
  footer: { paddingHorizontal: metrics.homePaddingX, paddingBottom: 16, paddingTop: 8, gap: 10 },
  footerHint: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  action: { width: '100%', minHeight: 54, padding: 14, borderRadius: 16, backgroundColor: '#566AC8', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  actionLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
