import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useBasket } from '../../context/BasketContext';
import { useApp } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import type { RootStackParamList } from '../../navigation/types';
import { createStyles, palette } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import type { CheckoutData, PaymentMethod } from '../../services/interfaces';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { basket, isLoading } = useBasket();
  const { user, setUser } = useApp();
  const { service: platformService } = usePlatform();
  
  // Guest checkout form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Checkout and payment state
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // Sign-in prompt modal
  const [showSignInPrompt, setShowSignInPrompt] = useState(!user);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={styles.loadingText}>Preparing checkout…</Text>
        </View>
      </View>
    );
  }

  const handleSignIn = () => {
    setShowSignInPrompt(false);
    navigation.navigate('SignIn');
  };

  const handleContinueAsGuest = () => {
    setShowSignInPrompt(false);
  };

  const handleCreateOrder = async () => {
    if (!basket.lines.length) {
      Alert.alert('Basket empty', 'Add items before checking out.');
      navigation.navigate('Products', {});
      return;
    }

    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name for the order.');
      return;
    }

    if (!email.trim() && !user) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    setIsCreatingDraft(true);

    try {
      // Create draft order in the platform (WooCommerce/Magento)
      let draftOrderId = '';

      if (platformService?.checkout) {
        // Create draft order - the checkout service will handle platform-specific logic
        draftOrderId = await platformService.checkout.createCheckout(basket);
      }

      // Load checkout data with payment methods
      setIsLoadingCheckout(true);
      const checkoutInfo = await platformService!.checkout.getCheckoutData(draftOrderId);
      setCheckoutData(checkoutInfo);

      // Auto-select first payment method if available
      if (checkoutInfo.paymentMethods.length > 0) {
        setSelectedPaymentMethod(checkoutInfo.paymentMethods[0]);
      }

    } catch (error) {
      console.error('Failed to create draft order:', error);
      Alert.alert(
        'Error',
        'Failed to create order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingDraft(false);
      setIsLoadingCheckout(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!checkoutData || !selectedPaymentMethod) return;

    // Navigate to payment screen with draft order, customer details, and selected payment method
    navigation.navigate('Payment', {
      draftOrderId: checkoutData.id,
      customerName: name,
      customerEmail: email || user?.email,
      selectedPaymentMethod,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      {/* Sign-in Prompt Modal */}
      <Modal
        visible={showSignInPrompt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSignInPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signInPromptCard}>
            <View style={styles.signInIconCircle}>
              <Text style={styles.signInIcon}>👤</Text>
            </View>
            <Text style={styles.signInTitle}>Sign in for offers</Text>
            <Text style={styles.signInSubtitle}>
              Sign in to check if you have any special offers or discounts available for your account.
            </Text>
            
            <View style={styles.signInBenefits}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🏷️</Text>
                <Text style={styles.benefitText}>Access exclusive discounts</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⭐</Text>
                <Text style={styles.benefitText}>Earn loyalty points</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📋</Text>
                <Text style={styles.benefitText}>View order history</Text>
              </View>
            </View>

            <View style={styles.signInButtons}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                activeOpacity={0.85}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleContinueAsGuest}
                activeOpacity={0.85}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>Complete your order</Text>
          </View>
        </View>
        {user && (
          <View style={styles.userBadge}>
            <Text style={styles.userIcon}>👤</Text>
            <Text style={styles.userName}>{user.name || 'Signed In'}</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Left Section - Form */}
        <ScrollView 
          style={styles.formSection}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Details */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>👤</Text>
              <Text style={styles.cardTitle}>
                {user ? 'Order Details' : 'Guest Checkout'}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={name}
                onChangeText={setName}
              />
            </View>
            {!user && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Order Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Any special requests?"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Payment Method Selection (shown after draft order is created) */}
          {checkoutData && checkoutData.paymentMethods.length > 0 && (
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💳</Text>
                <Text style={styles.cardTitle}>
                  Payment Method
                </Text>
              </View>
              <View style={styles.paymentMethods}>
                {checkoutData.paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.type}
                    style={[
                      styles.paymentMethod,
                      selectedPaymentMethod?.type === method.type && styles.paymentMethodActive
                    ]}
                    onPress={() => setSelectedPaymentMethod(method)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.paymentIcon}>{method.icon}</Text>
                    <Text style={[
                      styles.paymentLabel,
                      selectedPaymentMethod?.type === method.type && styles.paymentLabelActive
                    ]}>
                      {method.label}
                    </Text>
                    <View style={[
                      styles.radioButton,
                      selectedPaymentMethod?.type === method.type && styles.radioButtonActive
                    ]}>
                      {selectedPaymentMethod?.type === method.type && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {/* Sign in prompt for guests */}
          {!user && (
            <TouchableOpacity 
              style={styles.signInPromptBanner}
              onPress={() => setShowSignInPrompt(true)}
            >
              <Text style={styles.signInPromptIcon}>🏷️</Text>
              <View style={styles.signInPromptText}>
                <Text style={styles.signInPromptTitle}>Have an account?</Text>
                <Text style={styles.signInPromptSubtitle}>Sign in to check for offers</Text>
              </View>
              <Text style={styles.signInPromptArrow}>→</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Right Section - Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <ScrollView style={styles.summaryItems} showsVerticalScrollIndicator={false}>
              {basket.lines.map(line => (
                <View key={line.productId} style={styles.summaryLine}>
                  <View style={styles.summaryLineLeft}>
                    <View style={styles.summaryQtyBadge}>
                      <Text style={styles.summaryQty}>{line.qty}</Text>
                    </View>
                    <View style={styles.summaryLineInfo}>
                      <Text style={styles.summaryLineName}>{line.name}</Text>
                      {line.variants && line.variants.length > 0 && (
                        <Text style={styles.summaryLineAddons}>
                          {line.variants.map(v => v.name).join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.summaryLinePrice}>{formatMoney(line.lineTotal.amount)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(basket.subtotal.amount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (20%)</Text>
              <Text style={styles.summaryValue}>{formatMoney(basket.tax.amount)}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(basket.total.amount)}</Text>
            </View>

            {!checkoutData && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleCreateOrder}
                disabled={isCreatingDraft || isLoadingCheckout}
              >
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    {isCreatingDraft ? 'Creating Order...' : 'Create Order'}
                  </Text>
                  <Text style={styles.payButtonArrow}>→</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Payment Button (shown after payment method is selected) */}
            {checkoutData && selectedPaymentMethod && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleProceedToPayment}
              >
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    Pay with {selectedPaymentMethod.label}
                  </Text>
                  <Text style={styles.payButtonArrow}>→</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Secure payment powered by Stripe</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CheckoutScreen;

const styles = createStyles(t => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
  },
  loadingText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
    paddingBottom: t.spacing.lg,
    backgroundColor: t.colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  backArrow: {
    color: t.colors.text,
    fontSize: 20,
  },
  headerTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    marginTop: t.spacing.xs,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    backgroundColor: t.colors.surface,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  modeIcon: {
    fontSize: 16,
  },
  modeText: {
    color: t.colors.text,
    fontSize: t.typography.base - 2,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  formSection: {
    flex: 1,
  },
  formContent: {
    padding: t.spacing.xl,
    gap: t.spacing.xl,
  },
  formCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: t.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginBottom: t.spacing.sm,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  formGroup: {
    gap: t.spacing.sm,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: t.radius.xl,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.muted,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: t.typography.base,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: t.spacing.md,
  },
  summarySection: {
    width: 420,
    padding: t.spacing.xl,
    backgroundColor: t.colors.surfaceElevated,
    borderLeftWidth: 1,
    borderLeftColor: t.colors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  summaryTitle: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: t.spacing.lg,
  },
  summaryItems: {
    maxHeight: 200,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: t.spacing.sm,
  },
  summaryLineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    flex: 1,
  },
  summaryQtyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryQty: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryLineInfo: {
    flex: 1,
  },
  summaryLineName: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
  summaryLineAddons: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 4,
    marginTop: 2,
  },
  summaryLinePrice: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: t.colors.border,
    marginVertical: t.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: t.spacing.sm,
  },
  summaryLabel: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  summaryValue: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: t.spacing.xl,
  },
  totalLabel: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  totalValue: {
    color: t.colors.accent,
    fontSize: 32,
    fontWeight: '800',
  },
  payButtonDisabled: {
    backgroundColor: t.colors.muted,
  },
  payButton: {
    backgroundColor: t.colors.primary,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    marginBottom: t.spacing.md,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
  },
  payButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 4,
    fontWeight: '700',
  },
  payButtonArrow: {
    color: t.colors.onPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 4,
  },
  paymentMethods: {
    gap: t.spacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.muted,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    borderColor: t.colors.primary,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: t.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.primary,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: t.spacing.md,
  },
  paymentLabel: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '500',
    flex: 1,
  },
  paymentLabelActive: {
    color: t.colors.primary,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPromptCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl * 1.5,
    padding: t.spacing.xxl,
    width: '90%',
    maxWidth: 420,
    alignItems: 'center',
  },
  signInIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.xl,
  },
  signInIcon: {
    fontSize: 40,
  },
  signInTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: t.spacing.md,
    textAlign: 'center',
  },
  signInSubtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    lineHeight: t.typography.base * 1.5,
    textAlign: 'center',
    marginBottom: t.spacing.xl,
  },
  signInBenefits: {
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
  signInButtons: {
    width: '100%',
    gap: t.spacing.md,
  },
  signInButton: {
    backgroundColor: t.colors.primary,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
  },
  signInButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  guestButtonText: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '600',
  },
  // User badge
  userBadge: {
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
  userIcon: {
    fontSize: 16,
  },
  userName: {
    color: t.colors.text,
    fontSize: t.typography.base - 2,
    fontWeight: '600',
  },
  // Sign in prompt banner
  signInPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.colors.primary,
    gap: t.spacing.md,
  },
  signInPromptIcon: {
    fontSize: 24,
  },
  signInPromptText: {
    flex: 1,
  },
  signInPromptTitle: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '700',
  },
  signInPromptSubtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
  },
  signInPromptArrow: {
    color: t.colors.primary,
    fontSize: 20,
    fontWeight: '600',
  },
}));
