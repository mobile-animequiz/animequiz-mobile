import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { StyleSheet, Text } from 'react-native';

import { textStyles } from '../styles/theme';
import { openLegalLink } from '../utils/links';

// "By continuing, you agree to our Terms and Privacy Policy." Both names are tappable
// (same look as the prototype: plain white text).
export default function LegalText() {
  useI18n();
  return (
    <Text style={styles.text}> {t("By continuing, you agree to our")}{' '}
      <Text accessibilityRole="link" onPress={() => openLegalLink('terms')}> {t("Terms")} </Text>{' '} {t("and")}{' '}
      <Text accessibilityRole="link" onPress={() => openLegalLink('privacy')}> {t("Privacy Policy")} </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...textStyles.small,
    textAlign: 'center',
  },
});
