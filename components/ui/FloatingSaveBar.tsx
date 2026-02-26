import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Button from './Button';
import { lightColors, spacing, borderRadius } from '../../utils/theme';

interface FloatingSaveBarProps {
  visible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  discardLabel?: string;
}

const FloatingSaveBar: React.FC<FloatingSaveBarProps> = ({
  visible,
  onSave,
  onDiscard,
  isSaving = false,
  saveLabel = 'Save',
  discardLabel = 'Discard',
}) => {
  if (!visible) return null;

  return (
    <Animated.View style={styles.container}>
      <View style={styles.inner}>
        <Button title={discardLabel} variant="ghost" onPress={onDiscard} size="medium" />
        <Button title={saveLabel} variant="primary" onPress={onSave} isLoading={isSaving} size="medium" />
      </View>
    </Animated.View>
  );
};

export default FloatingSaveBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.medium,
    backgroundColor: lightColors.background,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.small,
  },
});
