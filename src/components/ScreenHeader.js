import { Pressable, StyleSheet, Text, View } from 'react-native';

import Icon from './Icon';
import { metrics, textStyles } from '../styles/theme';

// Header of the inner screens: back arrow (←), title and optional instructions.
export default function ScreenHeader({ title, subtitle, onBackPress }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBackPress}
        hitSlop={16}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="arrowBack" />
      </Pressable>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.headerBottomGap,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: metrics.headerArrowTop,
    marginLeft: metrics.headerArrowLeft,
  },
  title: {
    ...textStyles.title,
    marginTop: metrics.headerTitleTop,
    marginLeft: metrics.contentInset,
  },
  // The instructions line is wider than the form column in the prototype,
  // so it is allowed to extend past the right padding.
  subtitle: {
    ...textStyles.small,
    lineHeight: 11,
    marginTop: 3.5,
    marginLeft: metrics.contentInset,
    marginRight: -(metrics.screenPaddingX - 6),
    marginBottom: metrics.headerSubtitleBottomGap,
  },
});
