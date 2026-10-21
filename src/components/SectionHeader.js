import { StyleSheet, Text, View } from 'react-native';

import { metrics, textStyles } from '../styles/theme';

// Section title with an optional gray hint on the right ("11 disponíveis").
export default function SectionHeader({ title, hint }) {
  return (
    <View style={styles.container}>
      <Text style={textStyles.heading} accessibilityRole="header">
        {title}
      </Text>
      {hint ? <Text style={textStyles.caption}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.homePaddingX,
  },
});
