import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, metrics, textStyles } from '../styles/theme';

// Rounded dark input (the placeholder acts as the label, as in the prototype) with an
// optional element on the right (info / eye icons) and an inline error message.
// Focused fields lose the fill and get a thin periwinkle border.
// Any extra prop is forwarded to the underlying <TextInput>.
export default function TextField({
  error,
  rightElement,
  inputRef,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const [isFocused, setIsFocused] = useState(false);

  function handleFocus(event) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <View>
      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.textPrimary}
          selectionColor={colors.accent}
          keyboardAppearance="dark"
          accessibilityLabel={inputProps.placeholder}
          {...inputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightElement}
      </View>

      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: metrics.fieldHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: metrics.contentInset - 1,
    borderRadius: metrics.fieldRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.fieldFill,
  },
  fieldFocused: {
    borderColor: colors.fieldBorderFocused,
    backgroundColor: colors.fieldFillFocused,
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    ...textStyles.body,
    // The prototype's field text is medium weight (same as the buttons).
    fontWeight: '500',
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  errorText: {
    ...textStyles.error,
    marginTop: 6,
    marginLeft: metrics.contentInset,
  },
});
