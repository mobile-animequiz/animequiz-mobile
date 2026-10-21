import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import Icon from './Icon';
import { colors, metrics, textStyles } from '../styles/theme';

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
  const isLight = variant === 'light';
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
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isLight ? colors.textOnLight : colors.textPrimary} />
      ) : (
        <>
          {icon ? <Icon name={icon} tone={isLight ? 'dark' : 'light'} /> : null}
          <Text style={[styles.label, isLight && styles.labelDark]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    minWidth: metrics.pillMinWidth,
    height: metrics.pillHeight,
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
  },
  labelDark: {
    color: colors.textOnLight,
  },
});
