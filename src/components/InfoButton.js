import { Pressable, StyleSheet } from 'react-native';

import Icon from './Icon';
import { metrics } from '../styles/theme';

// Round "i" button placed on the right of a field (e.g. Date of Birth).
export default function InfoButton({ onPress, accessibilityLabel = 'More information' }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name="info" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: metrics.fieldIconInset + 1,
  },
});
