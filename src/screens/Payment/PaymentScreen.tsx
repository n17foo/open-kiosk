import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { useBasket } from '../../context/BasketContext';
import { usePlatform } from '../../context/PlatformContext';
import { createStyles } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import { PaymentServiceFactory } from '../../services/payment';
import { PedManager } from '../../components';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Payment'>>();
  const { draftOrderId, customerName, customerEmail, selectedPaymentMethod } = route.params;
  const { basket } = useBasket();
  const { service: platform, config: platformConfig } = usePlatform();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'success' | 'failed'>('waiting');
  const [paymentService, setPaymentService] = useState<any>(null);

  // Initialize payment service from platform config
  useEffect(() => {
    if (platformConfig?.paymentProcessor) {
      const service = PaymentServiceFactory.createService(
        platformConfig.paymentProcessor.type,
        platformConfig.paymentProcessor.config
      );
      setPaymentService(service);
    }
  }, [platformConfig]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulsing animation for payment terminal indicator
    startPulseAnimation();
  }, [fadeAnim, scaleAnim]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePaymentComplete = async (success: boolean, transactionId?: string, error?: string) => {
    setIsProcessing(true);
    setPaymentStatus(success ? 'success' : 'failed');

    if (success && transactionId) {
      // Payment successful - navigate to confirmation
      setTimeout(() => {
        navigation.navigate('Confirmation', {
          orderId: draftOrderId || `ORD-${Date.now()}`,
          paymentResult: {
            method: selectedPaymentMethod!,
            amount: basket.total,
            currency: basket.total.currency,
            transactionId: transactionId,
          },
          customerName: customerName || 'Kiosk Customer',
          customerEmail: customerEmail,
        });
      }, 2000);
    } else {
      // Payment failed - show error
      Alert.alert(
        'Payment Failed',
        error || 'The payment was not successful. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setPaymentStatus('waiting');
              setIsProcessing(false);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };

  // Simulate payment terminal interaction - in real implementation this would
  // connect to actual payment hardware
  const simulatePayment = () => {
    // For demo purposes, randomly succeed or fail after a delay
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      handlePaymentComplete(success);
    }, 3000);
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'waiting':
        return 'Please complete payment using the terminal below';
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment successful! Preparing your order...';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Ready for payment';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      case 'processing':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  if (!basket.lines.length) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>No Items</Text>
          <Text style={styles.errorMessage}>Your basket is empty.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your payment</Text>
        </View>

        {/* Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>
            {formatMoney(basket.total.amount)}
          </Text>
        </View>

        {/* PED Terminal Interface */}
        {selectedPaymentMethod && paymentStatus === 'waiting' && (
          <PedManager
            paymentMethod={selectedPaymentMethod}
            amount={basket.total}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => navigation.goBack()}
          />
        )}

        {/* Fallback for when no payment method is selected */}
        {!selectedPaymentMethod && (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>No Payment Method Selected</Text>
            <Text style={styles.fallbackMessage}>
              Please go back to checkout and select a payment method.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Payment terminal is ready for card insertion or contactless payment
        </Text>
      </Animated.View>
    </View>
  );
};

export default PaymentScreen;

const styles = createStyles(t => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: t.spacing.xxl,
  },
  title: {
    color: t.colors.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: t.spacing.sm,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.subheading,
  },
  amountCard: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.xl * 1.5,
    paddingHorizontal: t.spacing.xxl * 1.5,
    paddingVertical: t.spacing.xl,
    alignItems: 'center',
    marginBottom: t.spacing.xxl,
    width: '100%',
    maxWidth: 400,
  },
  amountLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: t.typography.base,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: t.spacing.sm,
  },
  amountValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2,
  },
  terminalCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    borderWidth: 4,
    padding: t.spacing.xl,
    width: '100%',
    maxWidth: 500,
    marginBottom: t.spacing.xl,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.lg,
  },
  terminalTitle: {
    color: t.colors.text,
    fontSize: t.typography.base + 4,
    fontWeight: '700',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  terminalBody: {
    alignItems: 'center',
  },
  terminalMessage: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: t.spacing.lg,
  },
  instructionBox: {
    backgroundColor: t.colors.muted,
    borderRadius: t.radius.xl,
    padding: t.spacing.lg,
    width: '100%',
  },
  instructionTitle: {
    color: t.colors.text,
    fontSize: t.typography.base + 1,
    fontWeight: '700',
    marginBottom: t.spacing.md,
  },
  instructionText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    marginBottom: t.spacing.xs,
    lineHeight: 20,
  },
  processingBox: {
    alignItems: 'center',
    padding: t.spacing.lg,
  },
  processingText: {
    color: t.colors.accent,
    fontSize: t.typography.base + 4,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    padding: t.spacing.lg,
  },
  successText: {
    color: '#28a745',
    fontSize: t.typography.base + 4,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: t.colors.accent,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    marginBottom: t.spacing.lg,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: t.typography.base + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    gap: t.spacing.md,
    width: '100%',
    maxWidth: 400,
  },
  cancelButton: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
  footerNote: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 4,
    textAlign: 'center',
    marginTop: t.spacing.lg,
  },
  errorTitle: {
    color: t.colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: t.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: t.colors.textSecondary,
    fontSize: t.typography.subheading,
    marginBottom: t.spacing.xxl,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: t.colors.primary,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
  },
  backButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 1,
    fontWeight: '700',
  },
  fallbackCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.spacing.xl,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  fallbackTitle: {
    color: t.colors.text,
    fontSize: t.typography.subheading,
    fontWeight: '800',
    marginBottom: t.spacing.md,
  },
  fallbackMessage: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    textAlign: 'center',
    marginBottom: t.spacing.xl,
  },
}));
