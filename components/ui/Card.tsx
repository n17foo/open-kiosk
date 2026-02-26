import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { lightColors, borderRadius, spacing } from '../../utils/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, padded = true }) => (
  <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
);

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  padded: {
    padding: spacing.medium,
  },
});
