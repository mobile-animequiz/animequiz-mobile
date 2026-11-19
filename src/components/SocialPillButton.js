import useI18n from '../hooks/useI18n';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import Icon from './Icon';
import { colors, metrics, textStyles } from '../styles/theme';
import { useAccount } from '../contexts/AccountContext';

// Auto-width "Continue with ..." pill with the provider icon on the left.
// variant="accent": periwinkle pill, white text (Google).
// variant="light": white pill, navy text (second button of the Welcome screen).
export default function SocialPillButton({
  title,
  icon,
  onPress,
  variant = 'accent',
  isLoading = false,
  disabled = false,
}) {
  useI18n();
  const isLight = variant === 'light';
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
        styles.pill,
        isLight ? styles.pillLight : styles.pillAccent,
        !isLight && { backgroundColor: personal.accent },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textOnLight} />
      ) : (
        <>
          {icon ? <Icon name={icon} tone="dark" /> : null}
          <Text style={[styles.label, styles.labelDark]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    minWidth: metrics.pillMinWidth,
    minHeight: metrics.pillHeight,
    maxWidth: '100%',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.pillGap,
    paddingHorizontal: metrics.pillPaddingX,
    borderRadius: metrics.pillRadius,
  },
  pillAccent: {
    backgroundColor: colors.accent,
  },
  pillLight: {
    backgroundColor: colors.pillLight,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...textStyles.button,
    flexShrink: 1,
    textAlign: 'center',
  },
  labelDark: {
    color: colors.textOnLight,
  },
});
