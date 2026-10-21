import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const FADE_IN_DURATION_MS = 800;

// Fades / scales the splash logo in, keeps it on screen for `holdDuration`
// and then calls `onFinish` (used to navigate to the Welcome screen).
export default function useSplashAnimation({ onFinish, holdDuration = 1500 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  // Keeps the latest callback without restarting the animation on re-renders.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    intro.start();

    const timeoutId = setTimeout(() => onFinishRef.current?.(), FADE_IN_DURATION_MS + holdDuration);

    return () => {
      intro.stop();
      clearTimeout(timeoutId);
    };
  }, [opacity, scale, holdDuration]);

  return { opacity, scale };
}
