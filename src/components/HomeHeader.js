import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, metrics, textStyles } from '../styles/theme';
import AccountAvatar from './AccountAvatar';
import { useAccount } from '../contexts/AccountContext';

// Top of the Home screen: personalized greeting + avatar placeholder (initial of the name).
export default function HomeHeader({ name }) {
  useI18n();
  const router = useRouter();
  const { settings } = useAccount();
  const displayName = settings.displayName || name;

  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.greeting} numberOfLines={1}> {t("Olá,")} {displayName}!
        </Text>
        <Text style={styles.subtitle}>{t("Pronto para o próximo quiz?")}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/profile')}
        style={styles.avatar}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t("Abrir perfil do jogador")}
        hitSlop={8}
      >
        <AccountAvatar size={48} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.cardGap,
  },
  texts: {
    flex: 1,
  },
  greeting: {
    ...textStyles.title,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: metrics.avatarSize,
    height: metrics.avatarSize,
    borderRadius: metrics.avatarSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fieldFill,
    borderWidth: 1.5,
    borderColor: colors.fieldBorderFocused,
  },
  avatarInitial: {
    ...textStyles.heading,
    color: colors.accent,
  },
});
