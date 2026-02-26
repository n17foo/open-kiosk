import React, { useState, useCallback } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { lightColors, borderRadius, typographyPresets, spacing } from '../../utils/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({ label, error, hint, containerStyle, inputStyle, ...textInputProps }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      textInputProps.onFocus?.(e);
    },
    [textInputProps]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      textInputProps.onBlur?.(e);
    },
    [textInputProps]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      ) : null}
      <TextInput
        {...textInputProps}
        style={[styles.input, isFocused && styles.inputFocused, error ? styles.inputError : undefined, inputStyle]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={lightColors.textDisabled}
        accessibilityLabel={label ?? textInputProps.accessibilityLabel}
        accessibilityState={{ disabled: textInputProps.editable === false }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  label: {
    ...typographyPresets.caption,
    color: lightColors.textSecondary,
    marginBottom: spacing.tiny,
    fontWeight: '600',
  },
  input: {
    ...typographyPresets.body,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: '#FFFFFF',
    color: lightColors.textPrimary,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: lightColors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: lightColors.error,
  },
  errorText: {
    ...typographyPresets.caption,
    color: lightColors.error,
    marginTop: spacing.tiny,
  },
  hintText: {
    ...typographyPresets.caption,
    color: lightColors.textDisabled,
    marginTop: spacing.tiny,
  },
});
