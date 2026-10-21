import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, metrics, textStyles } from '../styles/theme';

// "JOGAR" call to action: accent pill, same fill and white label as the prototype's main pill.
export default function PlayButton({ onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? 'JOGAR'}
    >
      <Text style={styles.label}>JOGAR</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: metrics.playButtonMinWidth,
    height: metrics.playButtonHeight,
    paddingHorizontal: 18,
    borderRadius: metrics.playButtonHeight / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...textStyles.button,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
