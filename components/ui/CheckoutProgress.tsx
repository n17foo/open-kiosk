import React from 'react';
import { View, Text } from 'react-native';
import { createStyles, palette } from '../../theme/styles';

interface CheckoutProgressProps {
  step: 1 | 2 | 3;
}

const STEPS = ['Details', 'Payment', 'Done'];

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ step }) => {
  return (
    <View style={styles.container}>
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < step;
        const isActive = stepNum === step;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepWrapper}>
              <View style={[styles.dot, isComplete && styles.dotComplete, isActive && styles.dotActive]}>
                {isComplete ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={[styles.dotLabel, isActive && styles.dotLabelActive]}>{stepNum}</Text>
                )}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive, isComplete && styles.labelComplete]}>{label}</Text>
            </View>
            {idx < STEPS.length - 1 && <View style={[styles.line, isComplete && styles.lineComplete]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default CheckoutProgress;

const styles = createStyles(t => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.xxl,
  },
  stepWrapper: {
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.colors.muted,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  dotComplete: {
    backgroundColor: t.colors.success,
    borderColor: t.colors.success,
  },
  dotLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: t.colors.textSecondary,
  },
  dotLabelActive: {
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: t.colors.textSecondary,
  },
  labelActive: {
    color: t.colors.primary,
    fontWeight: '700',
  },
  labelComplete: {
    color: t.colors.success,
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: t.colors.border,
    marginBottom: t.spacing.md + 4,
    marginHorizontal: t.spacing.xs,
  },
  lineComplete: {
    backgroundColor: palette.success,
  },
}));
