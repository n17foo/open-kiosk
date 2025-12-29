import type {
  ExtendedProduct,
  ExtendedCategory,
  ExtendedProductVariant,
  WooCommerceProductData,
  WooCommerceCategoryData,
  ShopifyProductData,
  ShopifyCollectionData,
  MagentoProductData,
  MagentoCategoryData,
  PlatformType,
  Money,
  Product,
  Category,
} from './extended-types';

/**
 * Product Conversion Utilities
 * Convert platform-specific product data to unified internal format
 */

export class ProductConverter {
  static fromWooCommerce(
    wooProduct: WooCommerceProductData,
    platformType: PlatformType = 'woocommerce'
  ): ExtendedProduct {
    const currency = 'GBP'; // TODO: Make configurable

    return {
      id: wooProduct.id.toString(),
      name: wooProduct.name,
      description: wooProduct.short_description || wooProduct.description,
      price: {
        amount: Math.round(parseFloat(wooProduct.price) * 100),
        currency,
      },
      image: wooProduct.images[0]?.src,
      categoryIds: wooProduct.categories.map(cat => cat.id.toString()),

      // Extended fields
      regularPrice: {
        amount: Math.round(parseFloat(wooProduct.regular_price) * 100),
        currency,
      },
      salePrice: wooProduct.sale_price ? {
        amount: Math.round(parseFloat(wooProduct.sale_price) * 100),
        currency,
      } : undefined,
      status: wooProduct.status === 'publish' ? 'active' : 'inactive',
      images: wooProduct.images.map(img => img.src),
      tags: wooProduct.tags?.map(tag => tag.name),
      sku: wooProduct.sku,
      weight: wooProduct.weight ? parseFloat(wooProduct.weight) : undefined,
      dimensions: wooProduct.dimensions ? {
        length: parseFloat(wooProduct.dimensions.length),
        width: parseFloat(wooProduct.dimensions.width),
        height: parseFloat(wooProduct.dimensions.height),
      } : undefined,

      platformData: { [platformType]: wooProduct },

      hasVariants: wooProduct.variations && wooProduct.variations.length > 0,
      variants: [], // TODO: Load variations separately if needed
    };
  }

  static fromShopify(
    shopifyProduct: ShopifyProductData,
    platformType: PlatformType = 'shopify'
  ): ExtendedProduct {
    const firstVariant = shopifyProduct.variants.edges[0]?.node;
    const currency = firstVariant?.price.currencyCode || 'GBP';

    return {
      id: this.extractShopifyId(shopifyProduct.id),
      name: shopifyProduct.title,
      description: shopifyProduct.description,
      price: {
        amount: Math.round(parseFloat(firstVariant?.price.amount || '0') * 100),
        currency,
      },
      image: shopifyProduct.images.edges[0]?.node.url,
      categoryIds: shopifyProduct.collections.edges.map(edge =>
        this.extractShopifyId(edge.node.id)
      ),

      // Extended fields
      regularPrice: firstVariant?.compareAtPrice ? {
        amount: Math.round(parseFloat(firstVariant.compareAtPrice.amount) * 100),
        currency,
      } : undefined,
      salePrice: firstVariant?.compareAtPrice ? {
        amount: Math.round(parseFloat(firstVariant.price.amount) * 100),
        currency,
      } : undefined,
      status: shopifyProduct.status === 'ACTIVE' ? 'active' : 'inactive',
      images: shopifyProduct.images.edges.map(edge => edge.node.url),
      tags: shopifyProduct.tags,
      sku: firstVariant?.sku,

      platformData: { [platformType]: shopifyProduct },

      hasVariants: shopifyProduct.variants.edges.length > 1,
      variants: shopifyProduct.variants.edges.map(edge => ({
        id: this.extractShopifyId(edge.node.id),
        productId: this.extractShopifyId(shopifyProduct.id),
        name: edge.node.title,
        price: {
          amount: Math.round(parseFloat(edge.node.price.amount) * 100),
          currency: edge.node.price.currencyCode,
        },
        regularPrice: edge.node.compareAtPrice ? {
          amount: Math.round(parseFloat(edge.node.compareAtPrice.amount) * 100),
          currency: edge.node.compareAtPrice.currencyCode,
        } : undefined,
        sku: edge.node.sku,
        options: edge.node.selectedOptions.reduce((acc, option) => {
          acc[option.name.toLowerCase()] = option.value;
          return acc;
        }, {} as Record<string, string>),
        platformData: { [platformType]: edge.node },
      })),
    };
  }

  static fromMagento(
    magentoProduct: MagentoProductData,
    platformType: PlatformType = 'magento'
  ): ExtendedProduct {
    const currency = 'GBP'; // TODO: Make configurable
    const imageAttribute = magentoProduct.custom_attributes.find(
      attr => attr.attribute_code === 'image'
    );
    const weightAttribute = magentoProduct.custom_attributes.find(
      attr => attr.attribute_code === 'weight'
    );

    return {
      id: magentoProduct.id.toString(),
      name: magentoProduct.name,
      description: magentoProduct.description || magentoProduct.short_description,
      price: {
        amount: Math.round(magentoProduct.price * 100),
        currency,
      },
      image: imageAttribute?.value as string,
      categoryIds: magentoProduct.category_links?.map(link => link.category_id) || [],

      // Extended fields
      regularPrice: {
        amount: Math.round(magentoProduct.price * 100),
        currency,
      },
      salePrice: magentoProduct.special_price ? {
        amount: Math.round(magentoProduct.special_price * 100),
        currency,
      } : undefined,
      status: magentoProduct.status === 1 ? 'active' : 'inactive',
      images: magentoProduct.media_gallery_entries?.map(entry => entry.file),
      sku: magentoProduct.sku,
      weight: magentoProduct.weight || (weightAttribute ? parseFloat(weightAttribute.value as string) : undefined),

      platformData: { [platformType]: magentoProduct },

      hasVariants: magentoProduct.type_id === 'configurable',
      variants: [], // TODO: Load variants separately if needed
    };
  }

  /**
   * Convert extended product to basic Product format for backward compatibility
   */
  static toBasicProduct(extendedProduct: ExtendedProduct): Product {
    return {
      id: extendedProduct.id,
      categoryId: extendedProduct.categoryIds[0] || 'default',
      name: extendedProduct.name,
      description: extendedProduct.description,
      price: {
        amount: extendedProduct.price.amount,
        currency: 'GBP' as const, // Convert to GBP for backward compatibility
      },
      image: extendedProduct.image,
      upgradeOfferId: undefined, // Not supported in extended format yet
    };
  }

  static extractShopifyId(shopifyGid: string): string {
    // Shopify GIDs are like "gid://shopify/Product/12345"
    const parts = shopifyGid.split('/');
    return parts[parts.length - 1];
  }
}

/**
 * Category Conversion Utilities
 */

export class CategoryConverter {
  static fromWooCommerce(
    wooCategory: WooCommerceCategoryData,
    platformType: PlatformType = 'woocommerce'
  ): ExtendedCategory {
    return {
      id: wooCategory.id.toString(),
      name: wooCategory.name,
      description: wooCategory.description,
      image: wooCategory.image?.src,
      parentId: wooCategory.parent ? wooCategory.parent.toString() : undefined,
      platformData: { [platformType]: wooCategory },
    };
  }

  static fromShopify(
    shopifyCollection: ShopifyCollectionData,
    platformType: PlatformType = 'shopify'
  ): ExtendedCategory {
    return {
      id: ProductConverter.extractShopifyId(shopifyCollection.id),
      name: shopifyCollection.title,
      description: shopifyCollection.description,
      image: shopifyCollection.image?.url,
      platformData: { [platformType]: shopifyCollection },
    };
  }

  static fromMagento(
    magentoCategory: MagentoCategoryData,
    platformType: PlatformType = 'magento'
  ): ExtendedCategory {
    return {
      id: magentoCategory.id.toString(),
      name: magentoCategory.name,
      description: magentoCategory.description,
      image: magentoCategory.image,
      parentId: magentoCategory.parent_id.toString(),
      platformData: { [platformType]: magentoCategory },
    };
  }

  /**
   * Convert extended category to basic Category format for backward compatibility
   */
  static toBasicCategory(extendedCategory: ExtendedCategory): Category {
    return {
      id: extendedCategory.id,
      name: extendedCategory.name,
      image: extendedCategory.image,
    };
  }
}
