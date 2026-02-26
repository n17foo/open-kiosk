import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, AccessibilityRole } from 'react-native';
import { lightColors, borderRadius, typographyPresets } from '../../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[styles.base, sizeStyles[size], variantStyles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityState={{ disabled: isDisabled }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFFFFF' : lightColors.primary} />
      ) : (
        <Text style={[styles.text, sizeTextStyles[size], variantTextStyles[variant], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typographyPresets.button,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  small: { paddingVertical: 6, paddingHorizontal: 12, minHeight: 36 },
  medium: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 44 },
  large: { paddingVertical: 14, paddingHorizontal: 28, minHeight: 52 },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  small: { fontSize: 13 },
  medium: { fontSize: 15 },
  large: { fontSize: 17 },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: lightColors.primary },
  secondary: { backgroundColor: lightColors.surface, borderWidth: 1, borderColor: lightColors.border },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: lightColors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: lightColors.error },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: '#FFFFFF' },
  secondary: { color: lightColors.textPrimary },
  outline: { color: lightColors.primary },
  ghost: { color: lightColors.primary },
  danger: { color: '#FFFFFF' },
};
