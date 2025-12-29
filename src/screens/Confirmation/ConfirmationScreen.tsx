import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { useBasket } from '../../context/BasketContext';
import { useApp } from '../../context/AppContext';
import { createStyles } from '../../theme/styles';

const ConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Confirmation'>>();
  const {
    orderId,
    paymentResult,
    customerName = 'Valued Customer',
    customerEmail
  } = route.params;
  const { basket, clear } = useBasket();
  const { clearSession } = useApp();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Success checkmark animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 400,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Content fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for order number
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

  }, [scaleAnim, fadeAnim, slideAnim, pulseAnim, orderId, basket, customerName, paymentResult]);

  const handleFinish = async () => {
    await clear();
    clearSession();
    navigation.navigate('Splash');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* Success Animation */}
        <Animated.View 
          style={[
            styles.successCircle,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.successInner}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>Thank you for your order, {customerName}</Text>

          {/* Order Number Card */}
          <Animated.View 
            style={[
              styles.orderCard,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.orderLabel}>Your Order Number</Text>
            <Text style={styles.orderNumber}>{orderId}</Text>
          </Animated.View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionRow}>
              <Text style={styles.instructionIcon}>📦</Text>
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>Order Processing</Text>
                <Text style={styles.instructionDesc}>
                  Your order is being processed. You will receive a confirmation email shortly.
                </Text>
              </View>
            </View>
            {paymentResult && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentIcon}>{paymentResult.method?.icon || '💳'}</Text>
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Payment Method</Text>
                  <Text style={styles.paymentDesc}>{paymentResult.method?.label || 'Card Payment'}</Text>
                </View>
              </View>
            )}
            {customerEmail && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentIcon}>📧</Text>
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Confirmation Email</Text>
                  <Text style={styles.paymentDesc}>{customerEmail}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Thank You Message */}
          <View style={styles.timeCard}>
            <Text style={styles.timeIcon}>🙏</Text>
            <View>
              <Text style={styles.timeLabel}>Thank You</Text>
              <Text style={styles.timeValue}>For shopping with us!</Text>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.newOrderButton}
            onPress={handleFinish}
            activeOpacity={0.85}
          >
            <Text style={styles.newOrderText}>Start New Order</Text>
            <Text style={styles.newOrderArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            This screen will automatically reset in 30 seconds
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default ConfirmationScreen;

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
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.xxl,
  },
  successInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: t.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  title: {
    color: t.colors.text,
    fontSize: 42,
    fontWeight: '800',
    marginBottom: t.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.subheading,
    marginBottom: t.spacing.xxl,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.xl * 1.5,
    paddingHorizontal: t.spacing.xxl * 1.5,
    paddingVertical: t.spacing.xl,
    alignItems: 'center',
    marginBottom: t.spacing.xl,
    width: '100%',
  },
  orderLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: t.typography.base,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: t.spacing.sm,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 2,
  },
  instructionsCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing.xl,
    width: '100%',
    marginBottom: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
  },
  instructionIcon: {
    fontSize: 36,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
    marginBottom: t.spacing.xs,
  },
  instructionDesc: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
    marginTop: t.spacing.md,
    paddingTop: t.spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    color: t.colors.text,
    fontSize: t.typography.base - 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: t.spacing.xs,
  },
  paymentDesc: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.colors.muted,
    borderRadius: t.radius.xl,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.lg,
  },
  timeIcon: {
    fontSize: 28,
  },
  timeLabel: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    marginBottom: t.spacing.xs,
  },
  timeValue: {
    color: t.colors.accent,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: t.spacing.xxl,
    left: t.spacing.xxl,
    right: t.spacing.xxl,
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    backgroundColor: t.colors.surface,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  newOrderText: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  newOrderArrow: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  footerNote: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 4,
  },
}));
