import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import useReducedMotion from '../hooks/useReducedMotion';
import { useAccount } from '../contexts/AccountContext';
export default function AnimatedProgress({ value, label, height = 8 }) {
  const fraction = Math.max(0, Math.min(1, Number(value) || 0));
  const [progress] = useState(() => new Animated.Value(fraction));
  const [width, setWidth] = useState(0);
  const reduced = useReducedMotion();
  const { colors } = useAccount();
  useEffect(() => {
    if (reduced) { progress.setValue(fraction); return undefined; }
    const animation = Animated.timing(progress, { toValue: fraction, duration: 260, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [fraction, progress, reduced]);
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
    onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    style={{ height, borderRadius: height / 2, backgroundColor: colors.progressTrack, overflow: 'hidden' }}>
    <Animated.View style={{ width: '100%', height, backgroundColor: colors.accent, transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] }) }] }} />
  </View>;
}
