import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { KioskFlowParamList } from '../../navigation/types';
import { useCatalog } from '../../context/CatalogContext';
import { useBasket } from '../../context/BasketContext';
import { createStyles } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import type { Product } from '../../services/types';

const UpsellScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<KioskFlowParamList>>();
  const route = useRoute<RouteProp<KioskFlowParamList, 'Upsell'>>();
  const { addedProductId, addedProductName, basketItemCount } = route.params;
  const { products } = useCatalog();
  const { addItem, basket } = useBasket();

  const addedProduct = useMemo(() => products.find(p => p.id === addedProductId), [products, addedProductId]);

  const upsellProducts = useMemo<Product[]>(() => {
    if (!addedProduct?.upsellProductIds?.length) return [];
    return addedProduct.upsellProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined)
      .slice(0, 3);
  }, [addedProduct, products]);

  const handleAddUpsell = async (product: Product) => {
    await addItem({
      productId: product.id,
      name: product.name,
      qty: 1,
      lineTotal: product.price,
    });
    navigation.goBack();
  };

  const handleViewBasket = () => {
    navigation.navigate('Basket');
  };

  const handleKeepShopping = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      {/* Added confirmation banner */}
      <View style={styles.successBanner}>
        <Text style={styles.successIcon}>✓</Text>
        <View style={styles.successText}>
          <Text style={styles.successTitle}>Added to basket!</Text>
          <Text style={styles.successSub} numberOfLines={1}>
            {addedProductName}
          </Text>
        </View>
        <View style={styles.basketBadge}>
          <Text style={styles.basketBadgeText}>{basketItemCount}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {upsellProducts.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Customers also bought</Text>
            <View style={styles.grid}>
              {upsellProducts.map(product => (
                <View key={product.id} style={styles.card}>
                  <View style={styles.cardImageBox}>
                    <Text style={styles.cardEmoji}>{product.emoji ?? '📦'}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <Text style={styles.cardPrice}>{formatMoney(product.price.amount)}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAddUpsell(product)} activeOpacity={0.8}>
                    <Text style={styles.addBtnText}>+ Add to basket</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.noUpsell}>
            <Text style={styles.noUpsellIcon}>🛍️</Text>
            <Text style={styles.noUpsellText}>Great choice!</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.keepShoppingBtn} onPress={handleKeepShopping} activeOpacity={0.8}>
          <Text style={styles.keepShoppingText}>← Keep Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBasketBtn} onPress={handleViewBasket} activeOpacity={0.85}>
          <Text style={styles.viewBasketText}>View Basket · {formatMoney(basket.total.amount)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpsellScreen;

const styles = createStyles(t => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.success,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    gap: t.spacing.md,
  },
  successIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 36,
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: t.typography.base,
    fontWeight: '800',
  },
  successSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  basketBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.sm,
  },
  basketBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxl,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: t.typography.subheading,
    fontWeight: '800',
    marginBottom: t.spacing.lg,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.md,
    justifyContent: 'center',
  },
  card: {
    width: 280,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImageBox: {
    height: 140,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 72,
  },
  cardBody: {
    padding: t.spacing.md,
    gap: t.spacing.xs,
  },
  cardName: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '700',
    lineHeight: 24,
  },
  cardDescription: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardPrice: {
    color: t.colors.primary,
    fontSize: t.typography.subheading,
    fontWeight: '800',
    marginTop: t.spacing.xs,
  },
  addBtn: {
    margin: t.spacing.md,
    marginTop: 0,
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.md,
    paddingVertical: t.spacing.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: t.typography.base,
    fontWeight: '700',
  },
  noUpsell: {
    alignItems: 'center',
    paddingVertical: t.spacing.xxl * 2,
    gap: t.spacing.md,
  },
  noUpsellIcon: {
    fontSize: 64,
  },
  noUpsellText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.subheading,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    gap: t.spacing.md,
    padding: t.spacing.lg,
    backgroundColor: t.colors.surface,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  keepShoppingBtn: {
    flex: 1,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.xl,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepShoppingText: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '700',
  },
  viewBasketBtn: {
    flex: 2,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBasketText: {
    color: '#FFFFFF',
    fontSize: t.typography.base,
    fontWeight: '800',
  },
}));
