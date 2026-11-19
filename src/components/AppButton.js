import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, metrics, textStyles } from '../styles/theme';
import { useAccount } from '../contexts/AccountContext';

// Full-width pill button on the dark fill ("Log in", "Send link", "Create Account").
export default function AppButton({ title, onPress, isLoading = false, disabled = false }) {
  const { colors: personal } = useAccount();
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: personal.accent },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textOnLight} />
      ) : (
        <Text style={[styles.label, { color: colors.textOnLight }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: metrics.buttonHeight,
    borderRadius: metrics.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fieldFill,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...textStyles.button,
  },
});
