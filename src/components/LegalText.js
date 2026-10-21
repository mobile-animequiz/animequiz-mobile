import { StyleSheet, Text } from 'react-native';

import { textStyles } from '../styles/theme';
import { openLegalLink } from '../utils/links';

// "By continuing, you agree to our Terms and Privacy Policy." Both names are tappable
// (same look as the prototype: plain white text).
export default function LegalText() {
  return (
    <Text style={styles.text}>
      By continuing, you agree to our{' '}
      <Text accessibilityRole="link" onPress={() => openLegalLink('terms')}>
        Terms
      </Text>{' '}
      and{' '}
      <Text accessibilityRole="link" onPress={() => openLegalLink('privacy')}>
        Privacy Policy
      </Text>
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
