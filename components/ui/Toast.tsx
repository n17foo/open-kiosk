import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightColors, borderRadius, typographyPresets, spacing } from '../../utils/theme';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
}

const VARIANT_BG: Record<ToastVariant, string> = {
  success: lightColors.success,
  error: lightColors.error,
  warning: lightColors.warning,
  info: lightColors.info,
};

const Toast: React.FC<ToastProps> = ({ message, variant = 'info', visible, onDismiss, durationMs = 4000 }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const timer = setTimeout(onDismiss, durationMs);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    return undefined;
  }, [visible, durationMs, onDismiss, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: VARIANT_BG[variant], opacity }]}>
      <TouchableOpacity onPress={onDismiss} style={styles.inner} accessibilityLabel={`Toast: ${message}`} accessibilityRole="alert">
        <Text style={styles.text}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: spacing.medium,
    right: spacing.medium,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  inner: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    minHeight: 48,
    justifyContent: 'center',
  },
  text: {
    ...typographyPresets.body,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
