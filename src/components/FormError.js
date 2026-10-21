import { StyleSheet, Text } from 'react-native';

import { textStyles } from '../styles/theme';

// Form-level error (e.g. a failed request). Renders nothing without a message.
export default function FormError({ message, style }) {
  if (!message) {
    return null;
  }

  return (
    <Text style={[styles.text, style]} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...textStyles.error,
    textAlign: 'center',
  },
});
