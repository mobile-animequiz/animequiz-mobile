import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Icon from './Icon';
import TextField from './TextField';
import { metrics } from '../styles/theme';

// Password input with the two eye buttons shown in the prototype:
// crossed eye = hide the password, open eye = show it.
export default function PasswordField({ placeholder = 'Password', ...fieldProps }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      placeholder={placeholder}
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      rightElement={
        <View style={styles.icons}>
          <Pressable
            onPress={() => setIsVisible(false)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Hide password"
            accessibilityState={{ selected: !isVisible }}
          >
            <Icon name="eyeOff" />
          </Pressable>
          <Pressable
            onPress={() => setIsVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Show password"
            accessibilityState={{ selected: isVisible }}
          >
            <Icon name="eye" />
          </Pressable>
        </View>
      }
      {...fieldProps}
    />
  );
}

const styles = StyleSheet.create({
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingRight: metrics.fieldIconInset - 1,
  },
});
