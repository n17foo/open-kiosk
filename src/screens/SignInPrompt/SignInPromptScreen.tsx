import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import type { RootStackParamList } from '../../navigation/types';
import { createStyles } from '../../theme/styles';

const SignInPromptScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { mode } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleSkip = () => {
    navigation.navigate('Products', {});
  };

  const modeLabel = mode === 'dinein' ? 'Dine In' : 'Takeaway';
  const modeIcon = mode === 'dinein' ? '🍽️' : '🥡';

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🍔</Text>
          </View>
          <Text style={styles.brandName}>OpenKiosk</Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeIcon}>{modeIcon}</Text>
          <Text style={styles.modeText}>{modeLabel}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.cardContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.userIcon}>👤</Text>
            </View>
            
            <Text style={styles.title}>Want to sign in?</Text>
            <Text style={styles.subtitle}>
              Access your favorites, earn loyalty points, and enjoy faster checkout. Or skip ahead to browse the menu.
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⭐</Text>
                <Text style={styles.benefitText}>Earn loyalty rewards</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>❤️</Text>
                <Text style={styles.benefitText}>Access saved favorites</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⚡</Text>
                <Text style={styles.benefitText}>Faster checkout</Text>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSignIn}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSkip}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Back Navigation */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInPromptScreen;

const styles = createStyles(t => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xxl,
    paddingTop: t.spacing.xxl,
    paddingBottom: t.spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 24,
  },
  brandName: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    backgroundColor: t.colors.surface,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeText: {
    color: t.colors.text,
    fontSize: t.typography.base - 2,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xxl,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
  },
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl * 1.5,
    padding: t.spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.xl,
  },
  userIcon: {
    fontSize: 40,
  },
  title: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: t.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    lineHeight: t.typography.base * 1.5,
    textAlign: 'center',
    marginBottom: t.spacing.xl,
  },
  benefitsList: {
    width: '100%',
    gap: t.spacing.md,
    marginBottom: t.spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.colors.muted,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.xl,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    gap: t.spacing.md,
  },
  primaryButton: {
    backgroundColor: t.colors.primary,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  secondaryButtonText: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.xl,
  },
  backArrow: {
    color: t.colors.textSecondary,
    fontSize: 20,
  },
  backText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    fontWeight: '500',
  },
}));
