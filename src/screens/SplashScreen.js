import { Animated, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import Logo from '../components/Logo';
import ScreenContainer from '../components/ScreenContainer';
import useSplashAnimation from '../hooks/useSplashAnimation';

// Intro screen: "A" logo with reflection fading in, then replaces itself with Welcome
// (replace, so "back" never returns to the splash).
export default function SplashScreen() {
  const router = useRouter();
  const { opacity, scale } = useSplashAnimation({
    onFinish: () => router.replace('/welcome'),
  });
  const animatedStyle = { opacity, transform: [{ scale }] };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.center}>
        <Animated.View style={animatedStyle}>
          <Logo />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // In the prototype the logo sits slightly above the vertical center.
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
});
