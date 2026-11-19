import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Icon from './Icon';
import { metrics, textStyles } from '../styles/theme';

// Header of the inner screens: back arrow (←), title and optional instructions.
export default function ScreenHeader({ title, subtitle, onBackPress }) {
  useI18n();
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBackPress}
        hitSlop={16}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel={t("Go back")}
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
    lineHeight: 20,
    marginTop: 3.5,
    marginLeft: metrics.contentInset,
    marginRight: 0,
    marginBottom: metrics.headerSubtitleBottomGap,
  },
});
