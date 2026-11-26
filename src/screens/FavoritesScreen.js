import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccount } from '../contexts/AccountContext';
import useI18n from '../hooks/useI18n';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import QuizCard from '../components/QuizCard';
import AppButton from '../components/AppButton';
import { textStyles } from '../styles/theme';
export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { favorites, loading, error: settingsError, favoritesError, refresh, colors } = useAccount();
  const error = settingsError || favoritesError;
  return <ScreenContainer scrollable={false}>
    <ScreenHeader title={t('myFavorites')} onBackPress={() => router.back()} />
    {error ? <><Text style={textStyles.error}>{error}</Text><AppButton title={t('Tentar novamente')} onPress={refresh} /></> : null}
    <FlatList data={favorites} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ paddingBottom: 28, gap: 12 }}
      renderItem={({ item }) => <QuizCard quiz={item} onPlay={(quiz) => router.push({ pathname: '/quiz', params: { quizId: quiz.id } })} />}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.accent} /> : <View style={{ gap: 12 }}><Text style={textStyles.heading}>{t('Nenhum favorito ainda')}</Text><Text style={textStyles.body}>{t('Os quizzes que você salvar aparecerão aqui.')}</Text></View>} />
  </ScreenContainer>;
}
