import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useBasket } from '../../context/BasketContext';
import { useApp } from '../../context/AppContext';
import type { RootStackParamList } from '../../navigation/types';
import { createStyles, palette } from '../../theme/styles';
import { formatMoney } from '../../services/utils';

const BasketScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { basket, isLoading, removeItem, clear } = useBasket();
  const { mode } = useApp();

  const handleContinueShopping = () => {
    navigation.navigate('Products', {});
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {});
  };

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
  };

  const handleClear = async () => {
    await clear();
  };

  // Removed mode-specific labels for retail kiosk
  const hasItems = basket.lines.length > 0;
  const itemCount = basket.lines.reduce((sum, line) => sum + line.qty, 0);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={styles.loadingText}>Updating basket…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleContinueShopping}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Your Basket</Text>
            <Text style={styles.headerSubtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🛍️</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Items List */}
        <View style={styles.itemsSection}>
          {hasItems ? (
            <ScrollView 
              contentContainerStyle={styles.itemsList}
              showsVerticalScrollIndicator={false}
            >
              {basket.lines.map((line, index) => (
                <View key={line.productId} style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    <Text style={styles.itemEmoji}>
                      📦
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{line.name}</Text>
                    {line.variants && line.variants.length > 0 && (
                      <Text style={styles.itemAddons}>
                        {line.variants.map(v => v.name).join(', ')}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>{formatMoney(line.lineTotal.amount)}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>×{line.qty}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemove(line.productId)}
                    >
                      <Text style={styles.removeIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Clear All Button */}
              {hasItems && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearButtonText}>Clear All Items</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
              </View>
              <Text style={styles.emptyTitle}>Your basket is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add some items from our store
              </Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={handleContinueShopping}
              >
                <Text style={styles.browseButtonText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
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

            <TouchableOpacity 
              style={[styles.checkoutButton, !hasItems && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={!hasItems}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Text style={styles.checkoutArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={handleContinueShopping}
            >
              <Text style={styles.continueShoppingText}>← Add More Items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BasketScreen;

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
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 22,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  itemsSection: {
    flex: 1,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.lg,
  },
  itemsList: {
    gap: t.spacing.md,
    paddingBottom: t.spacing.xxl,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing.lg,
    gap: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  itemImageContainer: {
    width: 72,
    height: 72,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 36,
  },
  itemDetails: {
    flex: 1,
    gap: t.spacing.xs,
  },
  itemName: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  itemAddons: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
  },
  itemPrice: {
    color: t.colors.accent,
    fontSize: t.typography.base,
    fontWeight: '700',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: t.spacing.sm,
  },
  quantityBadge: {
    backgroundColor: t.colors.muted,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radius.md,
  },
  quantityText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '700',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 18,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: t.spacing.md,
    marginTop: t.spacing.md,
  },
  clearButtonText: {
    color: t.colors.error,
    fontSize: t.typography.base,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.md,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: t.colors.primary,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    marginTop: t.spacing.md,
  },
  browseButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  summarySection: {
    width: 400,
    padding: t.spacing.xl,
    backgroundColor: t.colors.surfaceElevated,
    borderLeftWidth: 1,
    borderLeftColor: t.colors.border,
  },
  summaryCard: {
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
    marginBottom: t.spacing.md,
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
    fontSize: 28,
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    backgroundColor: t.colors.primary,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
    marginBottom: t.spacing.md,
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  checkoutArrow: {
    color: t.colors.onPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  continueShoppingButton: {
    alignItems: 'center',
    paddingVertical: t.spacing.md,
  },
  continueShoppingText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    fontWeight: '500',
  },
}));
