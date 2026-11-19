import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import useReducedMotion from '../hooks/useReducedMotion';
export default function AnimatedEntrance({ children, style }) {
  const reduced = useReducedMotion();
  const [value] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduced) { value.setValue(1); return undefined; }
    value.setValue(0);
    const animation = Animated.timing(value, { toValue: 1, duration: 220, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [reduced, value]);
  return <Animated.View style={[style, { opacity: value, transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>{children}</Animated.View>;
}
