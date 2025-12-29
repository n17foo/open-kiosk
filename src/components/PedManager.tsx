import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import type { PaymentMethod } from '../services/interfaces';
import type { Money } from '../services/types';
import { createStyles } from '../theme/styles';

interface PedManagerProps {
  paymentMethod: PaymentMethod;
  amount: Money;
  onPaymentComplete: (success: boolean, transactionId?: string, error?: string) => void;
  onCancel: () => void;
}

interface PedState {
  phase: 'detecting' | 'reading' | 'pin_prompt' | 'processing' | 'complete' | 'error';
  message: string;
  cardData?: any;
  transactionId?: string;
  error?: string;
}

export const PedManager: React.FC<PedManagerProps> = ({
  paymentMethod,
  amount,
  onPaymentComplete,
  onCancel,
}) => {
  const [pedState, setPedState] = useState<PedState>({
    phase: 'detecting',
    message: 'Please present card...',
  });

  // PED workflow simulation
  useEffect(() => {
    const runPedWorkflow = async () => {
      try {
        // Phase 1: Card detection
        setPedState({ phase: 'detecting', message: 'Please present card...' });
        await new Promise(resolve => setTimeout(resolve, 800));

        const cardDetected = Math.random() > 0.3; // 70% chance of card detection
        if (!cardDetected) {
          setPedState({
            phase: 'error',
            message: 'No card detected. Please try again.',
            error: 'Card not detected'
          });
          return;
        }

        // Phase 2: Card reading
        setPedState({ phase: 'reading', message: 'Reading card...' });
        await new Promise(resolve => setTimeout(resolve, 1200));

        const cardReadSuccess = Math.random() > 0.1; // 90% success rate
        if (!cardReadSuccess) {
          setPedState({
            phase: 'error',
            message: 'Failed to read card. Please try again.',
            error: 'Card read failed'
          });
          return;
        }

        // Generate mock card data
        const cardData = {
          lastFour: Math.floor(Math.random() * 9000) + 1000,
          cardholderName: 'JOHN DOE',
        };

        setPedState({
          phase: 'reading',
          message: `Card read: **** **** **** ${cardData.lastFour}`,
          cardData
        });

        // Phase 3: PIN prompt (if required for larger amounts)
        if (amount.amount > 5000) {
          setPedState({ phase: 'pin_prompt', message: 'Please enter PIN...' });
          await new Promise(resolve => setTimeout(resolve, 2000));

          const pinSuccess = Math.random() > 0.15; // 85% success rate
          if (!pinSuccess) {
            setPedState({
              phase: 'error',
              message: 'PIN entry failed or cancelled',
              error: 'PIN verification failed'
            });
            return;
          }
        }

        // Phase 4: Processing
        setPedState({ phase: 'processing', message: 'Processing payment...' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const paymentSuccess = Math.random() > 0.05; // 95% success rate

        if (paymentSuccess) {
          const transactionId = `${paymentMethod.label.includes('Square') ? 'sq' : 'adyen'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          setPedState({
            phase: 'complete',
            message: 'Payment approved!',
            transactionId
          });

          // Auto-complete after showing success
          setTimeout(() => {
            onPaymentComplete(true, transactionId);
          }, 1500);
        } else {
          setPedState({
            phase: 'error',
            message: 'Payment declined by issuer',
            error: 'Transaction declined'
          });
        }

      } catch (error) {
        setPedState({
          phase: 'error',
          message: 'PED communication error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    runPedWorkflow();
  }, [paymentMethod, amount, onPaymentComplete]);

  const handleRetry = () => {
    setPedState({
      phase: 'detecting',
      message: 'Please present card...',
    });
  };

  const handleCancel = async () => {
    onCancel();
  };

  const getStatusColor = () => {
    switch (pedState.phase) {
      case 'complete': return '#28a745';
      case 'error': return '#dc3545';
      case 'processing': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getPhaseIcon = () => {
    switch (pedState.phase) {
      case 'detecting': return '🔍';
      case 'reading': return '💳';
      case 'pin_prompt': return '🔢';
      case 'processing': return '⚙️';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '💳';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {paymentMethod.icon} {paymentMethod.label}
        </Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconContainer}>
          <Text style={styles.phaseIcon}>{getPhaseIcon()}</Text>
        </View>

        <Text style={styles.message}>{pedState.message}</Text>

        {pedState.cardData && (
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>
              Card: **** **** **** {pedState.cardData.lastFour}
            </Text>
            <Text style={styles.cardInfoText}>
              Name: {pedState.cardData.cardholderName}
            </Text>
          </View>
        )}

        {pedState.phase === 'processing' && (
          <ActivityIndicator size="large" color="#007bff" style={styles.spinner} />
        )}
      </View>

      <View style={styles.actions}>
        {pedState.phase === 'error' && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={pedState.phase === 'processing' || pedState.phase === 'complete'}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = createStyles((t: any) => ({
  container: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    borderWidth: 3,
    borderColor: t.colors.border,
    padding: t.spacing.xl,
    width: '100%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.lg,
  },
  title: {
    color: t.colors.text,
    fontSize: t.typography.base + 4,
    fontWeight: '700',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  body: {
    alignItems: 'center',
    marginBottom: t.spacing.xl,
  },
  iconContainer: {
    marginBottom: t.spacing.lg,
  },
  phaseIcon: {
    fontSize: 48,
  },
  message: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: t.spacing.md,
  },
  cardInfo: {
    backgroundColor: t.colors.muted,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    width: '100%',
    marginBottom: t.spacing.md,
  },
  cardInfoText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    marginBottom: t.spacing.xs,
  },
  spinner: {
    marginTop: t.spacing.md,
  },
  actions: {
    gap: t.spacing.md,
    width: '100%',
  },
  retryButton: {
    backgroundColor: t.colors.accent,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: t.typography.base + 1,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
  },
  cancelText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
}));
