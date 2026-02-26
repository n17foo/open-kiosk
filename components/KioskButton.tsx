import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { createStyles, palette } from '../theme/styles';

interface KioskButtonProps extends TouchableOpacityProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export const KioskButton: React.FC<KioskButtonProps> = ({ label, onPress, variant = 'primary', loading, disabled, style, ...rest }) => {
  const buttonStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    (disabled || loading) && styles.disabled,
    style, // Allow custom styles to be passed
  ];

  const textStyle = [styles.label, variant === 'primary' ? styles.primaryText : styles.secondaryText];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={disabled ? undefined : onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? palette.onPrimary : palette.accent} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = createStyles(t => ({
  base: {
    borderRadius: t.radius.xl,
    paddingVertical: t.spacing.lg,
    paddingHorizontal: t.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: t.colors.primary,
  },
  secondary: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: t.typography.button,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: t.colors.text,
  },
  primaryText: {
    color: t.colors.onPrimary,
  },
  secondaryText: {
    color: t.colors.text,
  },
}));
