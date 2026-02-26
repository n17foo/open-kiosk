import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { lightColors, borderRadius, typographyPresets } from '../../utils/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#E8F5E9', text: lightColors.success },
  warning: { bg: '#FFF3E0', text: lightColors.warning },
  error: { bg: '#FFEBEE', text: lightColors.error },
  info: { bg: '#E3F2FD', text: lightColors.info },
  neutral: { bg: '#F5F5F5', text: lightColors.textSecondary },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'neutral', style }) => {
  const colors = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]} accessibilityRole="text">
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typographyPresets.caption,
    fontWeight: '600',
  },
});
