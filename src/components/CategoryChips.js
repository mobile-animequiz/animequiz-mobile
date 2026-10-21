import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, metrics, textStyles } from '../styles/theme';

// Horizontal carousel of filter tags. The selected one uses the accent pill of the prototype,
// the others the translucent dark fill. The list bleeds to the screen edges while scrolling.
export default function CategoryChips({ categories, selectedId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipIdle,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={category.label}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{category.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: metrics.homePaddingX,
    gap: metrics.chipGap,
  },
  chip: {
    height: metrics.chipHeight,
    paddingHorizontal: metrics.chipPaddingX,
    borderRadius: metrics.chipRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.fieldFill,
    borderColor: colors.surfaceBorder,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
});
