import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backgroundGradient, metrics } from '../styles/theme';

// Common shell of every screen: dark gradient background, safe-area padding,
// keyboard avoidance and (optionally) vertical scrolling.
// `padded={false}` removes the horizontal screen padding (used by the Splash).
export default function ScreenContainer({ children, scrollable = true, padded = true }) {
  const contentStyle = padded ? styles.padded : null;

  return (
    <LinearGradient
      colors={backgroundGradient.colors}
      locations={backgroundGradient.locations}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {scrollable ? (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.fill, contentStyle]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: metrics.screenPaddingX,
  },
});
