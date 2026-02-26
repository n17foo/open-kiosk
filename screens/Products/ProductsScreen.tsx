import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCatalog } from '../../context/CatalogContext';
import { useBasket } from '../../context/BasketContext';
import { usePlatform } from '../../context/PlatformContext';
import type { KioskFlowParamList } from '../../navigation/types';
import type { Product, VariantItem } from '../../services/types';
import { createStyles, palette } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import { SearchBar, CategorySidebar } from '../../components';
import BasketFAB from '../../components/ui/BasketFAB';
import { useLogger } from '../../hooks/useLogger';

const SIDEBAR_WIDTH = 220;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<KioskFlowParamList>>();
  const route = useRoute<RouteProp<KioskFlowParamList, 'Products'>>();
  const logger = useLogger('ProductsScreen');
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { categories, products, isLoading, variantGroups } = useCatalog();
  const { basket, addItem } = useBasket();
  const { service: platform } = usePlatform();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(route.params?.categoryId);
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Customization modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<VariantItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [fabBounce, setFabBounce] = useState(false);
  const fabBounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup fab bounce timer on unmount
  useEffect(() => {
    return () => {
      if (fabBounceTimer.current) clearTimeout(fabBounceTimer.current);
    };
  }, []);

  // Set initial category
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Get subcategories for the selected category
  const getSubcategories = useCallback(() => {
    if (!selectedCategoryId) return [];
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    if (!selectedCategory || selectedCategory.parentId) return []; // Only show subcategories for parent categories
    return categories.filter(c => c.parentId === selectedCategoryId);
  }, [selectedCategoryId, categories]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults;
    }
    if (!selectedCategoryId) {
      return products;
    }

    // If selected category has subcategories, don't show products directly
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    if (selectedCategory && !selectedCategory.parentId && categories.some(c => c.parentId === selectedCategoryId)) {
      return []; // Show subcategories instead
    }

    return products.filter(product => product.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId, searchQuery, searchResults, categories]);

  const subcategories = getSubcategories();

  // Search handler
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      if (platform?.catalog) {
        setIsSearching(true);
        try {
          const results = await platform.catalog.searchProducts(query);
          setSearchResults(results);
        } catch (error) {
          logger.error({ message: 'Search failed' }, error instanceof Error ? error : new Error(String(error)));
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }
    },
    [platform, logger]
  );

  const basketItemCount = useMemo(() => {
    return basket.lines.reduce((sum, line) => sum + line.qty, 0);
  }, [basket.lines]);

  const cardWidth = (SCREEN_WIDTH - SIDEBAR_WIDTH - 48 - 16) / 3;

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSelectedVariants([]);
    setQuantity(1);
    setModalVisible(true);
  }, []);

  const handleBasketPress = () => {
    navigation.navigate('Basket');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setSelectedVariants([]);
    setQuantity(1);
  };

  const handleToggleVariant = (variant: VariantItem, groupId: string) => {
    const group = variantGroups.find(g => g.id === groupId);
    const maxSelection = group?.max ?? 99;

    setSelectedVariants(prev => {
      const isSelected = prev.some(v => v.id === variant.id);
      if (isSelected) {
        return prev.filter(v => v.id !== variant.id);
      }

      const currentGroupCount = prev.filter(v => group?.items.some(item => item.id === v.id)).length;

      if (currentGroupCount >= maxSelection) {
        const firstGroupVariant = prev.find(v => group?.items.some(item => item.id === v.id));
        if (firstGroupVariant) {
          return [...prev.filter(v => v.id !== firstGroupVariant.id), variant];
        }
      }

      return [...prev, variant];
    });
  };

  const calculateTotal = useCallback(() => {
    if (!selectedProduct) return 0;

    let total = selectedProduct.price.amount;

    selectedVariants.forEach(variant => {
      total += variant.price.amount;
    });

    return total * quantity;
  }, [selectedProduct, selectedVariants, quantity]);

  const handleAddToBasket = async () => {
    if (!selectedProduct) return;

    const lineTotal = calculateTotal();

    await addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      qty: quantity,
      lineTotal: { amount: lineTotal, currency: selectedProduct.price.currency },
      variants: selectedVariants.length > 0 ? selectedVariants : undefined,
    });

    const newCount = basketItemCount + quantity;
    const newTotal = basket.total.amount + lineTotal;
    handleCloseModal();
    setFabBounce(true);
    if (fabBounceTimer.current) clearTimeout(fabBounceTimer.current);
    fabBounceTimer.current = setTimeout(() => setFabBounce(false), 400);

    // Navigate to upsell screen if product has upsells
    if (selectedProduct.upsellProductIds && selectedProduct.upsellProductIds.length > 0) {
      navigation.navigate('Upsell', {
        addedProductId: selectedProduct.id,
        addedProductName: selectedProduct.name,
        basketTotal: newTotal,
        basketItemCount: newCount,
      });
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    // Retail category icons
    const icons: Record<string, string> = {
      clothing: '👕',
      electronics: '📱',
      home: '🏠',
      accessories: '👜',
    };
    return icons[categoryId] || '📦';
  };

  // Get relevant variant groups for the selected product using its own variantGroupIds
  const getRelevantVariantGroups = useCallback(
    (product: Product) => {
      if (product.variantGroupIds && product.variantGroupIds.length > 0) {
        return variantGroups.filter(group => product.variantGroupIds!.includes(group.id));
      }
      return [];
    },
    [variantGroups]
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🛍️</Text>
            </View>
            <Text style={styles.brandName}>OpenKiosk</Text>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChangeText={handleSearch} onClear={() => handleSearch('')} placeholder="Search products..." />
      </View>

      {/* Main Content - Sidebar + Products */}
      <View style={styles.mainContent}>
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={categoryId => {
            setSelectedCategoryId(categoryId);
            setSearchQuery('');
            setSearchResults([]);
          }}
          getCategoryIcon={getCategoryIcon}
        />

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.productsSectionTitle}>
              {searchQuery ? `Search: "${searchQuery}"` : categories.find(c => c.id === selectedCategoryId)?.name || 'All Products'}
            </Text>
            <Text style={styles.productsSectionCount}>
              {subcategories.length > 0
                ? `${subcategories.length} ${subcategories.length === 1 ? 'subcategory' : 'subcategories'}`
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
            </Text>
          </View>

          {isLoading || isSearching ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={palette.accent} size="large" />
              <Text style={styles.loadingText}>{isSearching ? 'Searching...' : 'Loading products...'}</Text>
            </View>
          ) : subcategories.length > 0 ? (
            // Show subcategories
            <ScrollView contentContainerStyle={styles.productGrid} showsVerticalScrollIndicator={false}>
              {subcategories.map(subcategory => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[styles.productCard, { width: cardWidth }]}
                  onPress={() => {
                    setSelectedCategoryId(subcategory.id);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productEmoji}>{getCategoryIcon(subcategory.id)}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {subcategory.name}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      Browse {subcategory.name.toLowerCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>{searchQuery ? 'Try a different search term' : 'Try selecting a different category'}</Text>
            </View>
          ) : (
            // Show products
            <ScrollView contentContainerStyle={styles.productGrid} showsVerticalScrollIndicator={false}>
              {filteredProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { width: cardWidth }]}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.9}
                >
                  <View style={styles.productImagePlaceholder}>
                    {product.image ? (
                      <Text style={styles.productEmoji}>🖼️</Text>
                    ) : (
                      <Text style={styles.productEmoji}>{product.emoji ?? getCategoryIcon(product.categoryId)}</Text>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>{formatMoney(product.price.amount)}</Text>
                      <View style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Product Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Product Details</Text>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {/* Product Info */}
                  <View style={styles.modalProductInfo}>
                    <View style={styles.modalProductImage}>
                      <Text style={styles.modalProductEmoji}>{selectedProduct.emoji ?? getCategoryIcon(selectedProduct.categoryId)}</Text>
                    </View>
                    <View style={styles.modalProductDetails}>
                      <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                      {selectedProduct.description && <Text style={styles.modalProductDesc}>{selectedProduct.description}</Text>}
                      <Text style={styles.modalProductPrice}>{formatMoney(selectedProduct.price.amount)}</Text>
                    </View>
                  </View>

                  {/* Options/Variants Section */}
                  {selectedProduct && getRelevantVariantGroups(selectedProduct).length > 0 && (
                    <View style={styles.optionsSection}>
                      <Text style={styles.sectionLabel}>Options</Text>
                      {getRelevantVariantGroups(selectedProduct).map(group => (
                        <View key={group.id} style={styles.optionGroup}>
                          <View style={styles.optionGroupHeader}>
                            <Text style={styles.optionGroupTitle}>{group.name}</Text>
                            {group.max && <Text style={styles.optionGroupMax}>Select up to {group.max}</Text>}
                          </View>
                          <View style={styles.optionItems}>
                            {group.items.map(addon => {
                              const isSelected = selectedVariants.some(v => v.id === addon.id);
                              return (
                                <TouchableOpacity
                                  key={addon.id}
                                  style={[styles.optionItem, isSelected && styles.optionItemActive]}
                                  onPress={() => handleToggleVariant(addon, group.id)}
                                  activeOpacity={0.85}
                                >
                                  <Text style={styles.optionName}>{addon.name}</Text>
                                  {addon.price.amount > 0 && <Text style={styles.optionPrice}>+{formatMoney(addon.price.amount)}</Text>}
                                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                {/* Quantity & Add to Basket */}
                <View style={styles.modalFooter}>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.addToBasketButton} onPress={handleAddToBasket} activeOpacity={0.85}>
                    <Text style={styles.addToBasketText}>Add to Basket</Text>
                    <Text style={styles.addToBasketPrice}>{formatMoney(calculateTotal())}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Floating Basket Button */}
      <BasketFAB itemCount={basketItemCount} total={basket.total.amount} onPress={handleBasketPress} bounce={fabBounce} />
    </View>
  );
};

export default ProductsScreen;

const styles = createStyles(t => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
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
    gap: t.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  brandName: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.lg,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.lg,
  },
  productsSectionTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  productsSectionCount: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: t.typography.subheading,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.lg,
    paddingBottom: t.spacing.xxl,
  },
  productCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  productImagePlaceholder: {
    height: 140,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: t.spacing.md,
    gap: t.spacing.xs,
  },
  productName: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  productDescription: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    lineHeight: (t.typography.base - 2) * 1.4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: t.spacing.sm,
  },
  productPrice: {
    color: t.colors.accent,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: t.colors.onPrimary,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: t.colors.surface,
    borderTopLeftRadius: t.radius.xl * 2,
    borderTopRightRadius: t.radius.xl * 2,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
    paddingBottom: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.spacing.md,
  },
  closeButtonText: {
    color: t.colors.text,
    fontSize: 18,
  },
  modalTitle: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.lg,
  },
  modalProductInfo: {
    flexDirection: 'row',
    gap: t.spacing.lg,
    marginBottom: t.spacing.xl,
  },
  modalProductImage: {
    width: 100,
    height: 100,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProductEmoji: {
    fontSize: 48,
  },
  modalProductDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: t.spacing.xs,
  },
  modalProductName: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  modalProductDesc: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  modalProductPrice: {
    color: t.colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  optionsSection: {
    marginBottom: t.spacing.xl,
  },
  sectionLabel: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
    marginBottom: t.spacing.md,
  },
  optionGroup: {
    marginBottom: t.spacing.lg,
  },
  optionGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.md,
  },
  optionGroupTitle: {
    color: t.colors.text,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  optionGroupMax: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
  },
  optionItems: {
    gap: t.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.muted,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemActive: {
    borderColor: t.colors.primary,
  },
  optionName: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '500',
    flex: 1,
  },
  optionPrice: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    marginRight: t.spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  checkmark: {
    color: t.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.muted,
    borderRadius: t.radius.xl,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  quantityValue: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: t.spacing.lg,
  },
  addToBasketButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    backgroundColor: t.colors.primary,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
  },
  addToBasketText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
  addToBasketPrice: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
    opacity: 0.9,
  },
}));
