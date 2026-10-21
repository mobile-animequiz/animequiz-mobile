import { Image, StyleSheet } from 'react-native';

// "A" brush logo with its mirrored reflection (single transparent PNG, 3x).
// Replace assets/logo-a-reflection.png with the original Figma export if available
// and keep the width / height below in sync (dp).
const LOGO_SOURCE = require('../../assets/logo-a-reflection.png');

export default function Logo() {
  return (
    <Image
      source={LOGO_SOURCE}
      style={styles.logo}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Anime Quiz"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 153.5,
    height: 289.3,
  },
});
