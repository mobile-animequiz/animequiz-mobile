import { useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import TextField from './TextField';
import useReducedMotion from '../hooks/useReducedMotion';
import useI18n from '../hooks/useI18n';
export default function PasswordField({ placeholder, ...fieldProps }) {
  const { t } = useI18n();
  const [isVisible, setVisible] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const reduced = useReducedMotion();
  function toggle() {
    setVisible((previous) => !previous);
    if (!reduced) Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }
  return <TextField {...fieldProps} placeholder={placeholder ?? t('Password')} secureTextEntry={!isVisible}
    autoCapitalize="none" autoCorrect={false} rightElement={
      <Pressable onPress={toggle} style={styles.control} accessibilityRole="button"
        accessibilityLabel={t(isVisible ? t("Hide password") : t("Show password"))} accessibilityState={{ selected: isVisible }}>
        <Animated.View style={{ transform: [{ scale }] }}><Icon name={isVisible ? 'eye' : 'eyeOff'} /></Animated.View>
      </Pressable>
    } />;
}
const styles = StyleSheet.create({ control: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' } });
