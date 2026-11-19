import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import useReducedMotion from './useReducedMotion';
export default function useSplashAnimation({ onFinish, holdDuration = 1500 }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(1));
  const reduced = useReducedMotion();
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => {
    if (reduced) { opacity.setValue(1); scale.setValue(1); }
    else { opacity.setValue(0); scale.setValue(0.96); }
    const intro = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    if (!reduced) intro.start();
    const timer = setTimeout(() => onFinishRef.current?.(), holdDuration + (reduced ? 0 : 300));
    return () => { intro.stop(); clearTimeout(timer); };
  }, [opacity, scale, reduced, holdDuration]);
  return { opacity, scale };
}
