import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useAccount } from '../contexts/AccountContext';
import useI18n from '../hooks/useI18n';
export default function QuizCover({ quiz, height = 142 }) {
  const { colors } = useAccount();
  const { t } = useI18n();
  const [failed, setFailed] = useState(null);
  return <View style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.fieldFill, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
    {quiz.imageUrl && failed !== quiz.imageUrl
      ? <Image source={{ uri: quiz.imageUrl }} accessibilityLabel={quiz.imageAltText || quiz.title}
        resizeMode="cover" style={{ width: '100%', height: '100%' }} onError={() => setFailed(quiz.imageUrl)} />
      : <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 20 }}>{quiz.title || t('quizCover')}</Text>}
  </View>;
}
