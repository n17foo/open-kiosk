import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightColors, borderRadius, typographyPresets, spacing } from '../../utils/theme';

interface PinKeypadProps {
  pinLength?: number;
  onComplete: (pin: string) => void;
  title?: string;
  error?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

const PinKeypad: React.FC<PinKeypadProps> = ({ pinLength = 4, onComplete, title = 'Enter PIN', error }) => {
  const [pin, setPin] = useState('');

  const handlePress = useCallback(
    (key: string) => {
      if (key === 'del') {
        setPin(prev => prev.slice(0, -1));
        return;
      }
      if (key === '') return;

      const newPin = pin + key;
      setPin(newPin);

      if (newPin.length === pinLength) {
        onComplete(newPin);
        // Reset after a brief delay to allow for processing
        setTimeout(() => setPin(''), 300);
      }
    },
    [pin, pinLength, onComplete]
  );

  return (
    <View style={styles.container} accessibilityLabel="PIN keypad">
      <Text style={styles.title}>{title}</Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: pinLength }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} accessibilityLabel={i < pin.length ? 'Filled' : 'Empty'} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.grid}>
        {KEYS.map((key, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.key, key === '' && styles.keyEmpty]}
            onPress={() => handlePress(key)}
            disabled={key === ''}
            accessibilityLabel={key === 'del' ? 'Delete' : key || undefined}
            accessibilityRole="button"
          >
            <Text style={[styles.keyText, key === 'del' && styles.keyTextDel]}>{key === 'del' ? '⌫' : key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PinKeypad;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  title: {
    ...typographyPresets.h2,
    color: lightColors.textPrimary,
    marginBottom: spacing.large,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: lightColors.border,
    marginHorizontal: spacing.small,
  },
  dotFilled: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  error: {
    ...typographyPresets.caption,
    color: lightColors.error,
    marginBottom: spacing.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 264,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 60,
    margin: 4,
    borderRadius: borderRadius.md,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: lightColors.textPrimary,
  },
  keyTextDel: {
    fontSize: 20,
    color: lightColors.textSecondary,
  },
});
