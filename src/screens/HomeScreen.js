import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import CategoryChips from '../components/CategoryChips';
import HomeHeader from '../components/HomeHeader';
import QuizCard from '../components/QuizCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import StatusCard from '../components/StatusCard';
import ApiVersionSelector from '../components/ApiVersionSelector';
import AppButton from '../components/AppButton';
import AnimatedEntrance from '../components/AnimatedEntrance';
import { useApiVersion } from '../contexts/ApiVersionContext';
import useHomeData from '../hooks/useHomeData';
import { colors, metrics, textStyles } from '../styles/theme';

// Home / dashboard: greeting, player status, category filter and quiz list.
// Catalog and player statistics come from the selected API version.
export default function HomeScreen() {
  useI18n();
  const router = useRouter();
  const { isChecking } = useApiVersion();
  const [timed, setTimed] = useState(false);
  const { player, categories, selectedCategoryId, selectCategory, quizzes, loadError, isLoadingQuizzes, refreshPlayer, refreshQuizzes } = useHomeData();

  function handlePlay(quiz) {
    if (isChecking) return;
    router.push({ pathname: '/quiz', params: { quizId: quiz.id, timed: String(timed) } });
  }

  const header = (
    <View style={styles.header}>
      <AnimatedEntrance style={styles.padded}>
        <HomeHeader name={player.name} />
        {loadError ? (
          <Text onPress={() => { refreshPlayer(); refreshQuizzes(); }} style={styles.loadError}>{t("Não foi possível carregar os dados. Toque para tentar novamente.")}</Text>
        ) : null}
        <View style={styles.statusCard}>
          <StatusCard player={player} />
        </View>
        <ApiVersionSelector />
        <View style={{ marginTop: 16 }}><AppButton title={t('myFavorites')} onPress={() => router.push('/favorites')} /></View>
        <Text style={[textStyles.caption, { marginTop: 12 }]}>{t('questionLanguage')}</Text>
        <View style={styles.challenge}>
          <View style={{ flex: 1, gap: 4 }}><Text style={textStyles.body}>{t("Desafio com tempo")}</Text><Text style={styles.challengeHint}>{t("Ao zerar, a pergunta fica sem resposta.")}</Text></View>
          <Switch value={timed} onValueChange={setTimed} accessibilityLabel={t("Ativar desafio com tempo")} />
        </View>
      </AnimatedEntrance>

      <View style={styles.section}>
        <SectionHeader title={t("Categorias")} />
        <View style={styles.chips}>
          <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={selectCategory} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t("Quizzes")}
          hint={t('availableCount', { count: quizzes.length })}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <FlatList
        data={quizzes}
        keyExtractor={(quiz) => quiz.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <QuizCard quiz={item} onPlay={handlePlay} />
          </View>
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={
          isLoadingQuizzes ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : (
            <Text style={styles.empty}>{t("Nenhum quiz disponível nesta categoria.")}</Text>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  challenge: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  challengeHint: { ...textStyles.caption, fontSize: 14 },
  listContent: {
    paddingTop: metrics.homeHeaderTop,
    paddingBottom: 32,
  },
  header: {
    paddingBottom: metrics.cardGap,
  },
  padded: {
    paddingHorizontal: metrics.homePaddingX,
  },
  statusCard: {
    marginTop: metrics.homeSectionGap,
  },
  section: {
    marginTop: metrics.homeSectionGap,
  },
  chips: {
    marginTop: metrics.cardGap,
  },
  cardWrapper: {
    paddingHorizontal: metrics.homePaddingX,
  },
  separator: {
    height: metrics.cardGap,
  },
  loadError: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: 6,
  },
  loading: {
    paddingVertical: 32,
  },
  empty: {
    ...textStyles.body,
    textAlign: 'center',
    paddingHorizontal: metrics.homePaddingX,
    paddingVertical: 32,
  },
});
