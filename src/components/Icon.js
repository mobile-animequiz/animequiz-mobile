import { Image, StyleSheet } from 'react-native';

import { colors } from '../styles/theme';

// PNG icons exported from the Figma prototype shapes (white, 4x). Sizes are in dp.
const ICONS = {
  arrowBack: { source: require('../../assets/icons/icon-arrow-back.png'), width: 25.25, height: 17.75 },
  eye: { source: require('../../assets/icons/icon-eye.png'), width: 18.5, height: 14.5 },
  eyeOff: { source: require('../../assets/icons/icon-eye-off.png'), width: 18.5, height: 17.75 },
  info: { source: require('../../assets/icons/icon-info.png'), width: 18.5, height: 18.5 },
  google: { source: require('../../assets/icons/icon-google.png'), width: 16.25, height: 16.5 },
  gmail: { source: require('../../assets/icons/icon-gmail.png'), width: 18.5, height: 14 },
};

// tone="light" keeps the white artwork; tone="dark" tints it with the navy used on white pills.
export default function Icon({ name, tone = 'light' }) {
  const icon = ICONS[name];

  return (
    <Image
      source={icon.source}
      style={[sizes[name], tone === 'dark' && styles.dark]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

const sizes = StyleSheet.create(
  Object.fromEntries(
    Object.entries(ICONS).map(([name, { width, height }]) => [name, { width, height }])
  )
);

const styles = StyleSheet.create({
  dark: {
    tintColor: colors.textOnLight,
  },
});
