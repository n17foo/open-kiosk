import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useBasket } from '../../context/BasketContext';
import { useCatalog } from '../../context/CatalogContext';
import type { KioskFlowParamList } from '../../navigation/types';
import { createStyles, palette } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import CrossSellStrip from '../../components/ui/CrossSellStrip';
import type { Product } from '../../services/types';

const BasketScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<KioskFlowParamList>>();
  const { basket, isLoading, removeItem, updateItem, clear, addItem } = useBasket();
  const { products } = useCatalog();

  const handleContinueShopping = () => navigation.navigate('Products', {});
  const handleCheckout = () => navigation.navigate('Checkout', {});

  const handleDecrement = async (productId: string, qty: number) => {
    if (qty <= 1) {
      await removeItem(productId);
    } else {
      await updateItem(productId, qty - 1);
    }
  };

  const handleIncrement = async (productId: string, qty: number) => {
    await updateItem(productId, qty + 1);
  };

  const handleAddCrossSell = async (product: Product) => {
    await addItem({
      productId: product.id,
      name: product.name,
      qty: 1,
      lineTotal: product.price,
    });
  };

  // Compute cross-sell products from all basket lines
  const crossSellProducts = useMemo<Product[]>(() => {
    const basketIds = new Set(basket.lines.map(l => l.productId));
    const seen = new Set<string>();
    const result: Product[] = [];
    for (const line of basket.lines) {
      const src = products.find(p => p.id === line.productId);
      for (const csId of src?.crossSellProductIds ?? []) {
        if (!basketIds.has(csId) && !seen.has(csId)) {
          const p = products.find(pr => pr.id === csId);
          if (p) {
            seen.add(csId);
            result.push(p);
          }
        }
      }
    }
    return result.slice(0, 5);
  }, [basket.lines, products]);

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
            <>
              <ScrollView contentContainerStyle={styles.itemsList} showsVerticalScrollIndicator={false}>
                {basket.lines.map(line => (
                  <View key={line.productId} style={styles.itemCard}>
                    <View style={styles.itemImageContainer}>
                      <Text style={styles.itemEmoji}>{products.find(p => p.id === line.productId)?.emoji ?? '📦'}</Text>
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {line.name}
                      </Text>
                      {line.variants && line.variants.length > 0 && (
                        <Text style={styles.itemAddons}>{line.variants.map(v => v.name).join(' · ')}</Text>
                      )}
                      <Text style={styles.itemPrice}>{formatMoney(line.lineTotal.amount)}</Text>
                    </View>
                    {/* Inline quantity controls */}
                    <View style={styles.qtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(line.productId, line.qty)}>
                        <Text style={styles.qtyBtnText}>{line.qty <= 1 ? '🗑' : '−'}</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{line.qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleIncrement(line.productId, line.qty)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {hasItems && (
                  <TouchableOpacity style={styles.clearButton} onPress={clear}>
                    <Text style={styles.clearButtonText}>Remove All Items</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Cross-sell strip */}
              <CrossSellStrip products={crossSellProducts} onAdd={handleAddCrossSell} />
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
              </View>
              <Text style={styles.emptyTitle}>Your basket is empty</Text>
              <Text style={styles.emptySubtitle}>Add some items from our store</Text>
              <TouchableOpacity style={styles.browseButton} onPress={handleContinueShopping}>
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
              <Text style={styles.summaryLabel}>Tax</Text>
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

            <TouchableOpacity style={styles.continueShoppingButton} onPress={handleContinueShopping}>
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
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.muted,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: t.colors.text,
  },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: t.typography.base + 2,
    fontWeight: '800',
    color: t.colors.text,
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
