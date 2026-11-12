import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import CategoryChips from '../components/CategoryChips';
import HomeHeader from '../components/HomeHeader';
import QuizCard from '../components/QuizCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import StatusCard from '../components/StatusCard';
import useHomeData from '../hooks/useHomeData';
import { colors, metrics, textStyles } from '../styles/theme';

// Home / dashboard: greeting, player status, category filter and quiz list.
// Data comes from useHomeData (mock for now); the Figma file has no Home, so the layout is built
// only from the shared tokens in src/styles.
export default function HomeScreen() {
  const router = useRouter();
  const { player, categories, selectedCategoryId, selectCategory, quizzes, loadError, isLoadingQuizzes, refreshPlayer, refreshQuizzes } = useHomeData();

  function handlePlay(quiz) {
    router.push({ pathname: '/quiz', params: { quizId: quiz.id } });
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.padded}>
        <HomeHeader name={player.name} />
        {loadError ? (
          <Text onPress={() => { refreshPlayer(); refreshQuizzes(); }} style={styles.loadError}>Não foi possível carregar os dados. Toque para tentar novamente.</Text>
        ) : null}
        <View style={styles.statusCard}>
          <StatusCard player={player} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Categorias" />
        <View style={styles.chips}>
          <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={selectCategory} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Quizzes"
          hint={`${quizzes.length} ${quizzes.length === 1 ? 'disponível' : 'disponíveis'}`}
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
            <Text style={styles.empty}>Nenhum quiz disponível nesta categoria.</Text>
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
