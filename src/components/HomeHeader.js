import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, metrics, textStyles } from '../styles/theme';

// Top of the Home screen: personalized greeting + avatar placeholder (initial of the name).
export default function HomeHeader({ name }) {
  const router = useRouter();
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.greeting} numberOfLines={1}>
          Olá, {name}!
        </Text>
        <Text style={styles.subtitle}>Pronto para o próximo quiz?</Text>
      </View>

      <Pressable
        onPress={() => router.push('/profile')}
        style={styles.avatar}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil do jogador"
        hitSlop={8}
      >
        <Text style={styles.avatarInitial}>{initial}</Text>
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
