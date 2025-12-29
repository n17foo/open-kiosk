import type { Basket, BasketLine, PlatformType } from './extended-types';

/**
 * Order Conversion Utilities
 * Convert unified basket format to platform-specific order formats
 */

export interface WooCommerceOrderData {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
    total: string;
  }>;
}

export interface ShopifyOrderData {
  email: string;
  lineItems: Array<{
    variantId: string;
    quantity: number;
  }>;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MagentoOrderData {
  customer_email: string;
  payment_method: {
    method: string;
  };
  billing_address: {
    firstname: string;
    lastname: string;
    email: string;
  };
  items: Array<{
    sku: string;
    qty: number;
    price: number;
  }>;
}

export class OrderConverter {
  /**
   * Convert basket to WooCommerce order format
   */
  static toWooCommerceOrder(
    basket: Basket,
    platformType: PlatformType = 'woocommerce'
  ): WooCommerceOrderData {
    return {
      payment_method: 'cod', // Cash on delivery for kiosk
      payment_method_title: 'Cash on Delivery',
      set_paid: false, // Will be marked as paid when payment is processed
      billing: {
        first_name: 'Kiosk',
        last_name: 'Customer',
        email: 'kiosk@example.com',
      },
      shipping: {
        first_name: 'Kiosk',
        last_name: 'Customer',
      },
      line_items: basket.lines.map(line => ({
        product_id: parseInt(line.productId),
        quantity: line.qty,
        total: (line.lineTotal.amount / 100).toString(), // Convert cents to dollars/pounds
      })),
    };
  }

  /**
   * Convert basket to Shopify order format
   */
  static toShopifyOrder(
    basket: Basket,
    platformType: PlatformType = 'shopify'
  ): ShopifyOrderData {
    return {
      email: 'kiosk@example.com',
      lineItems: basket.lines.map(line => ({
        // For Shopify, we need variant IDs, but basket currently uses product IDs
        // This assumes the basket line has been enriched with variant information
        variantId: this.getShopifyVariantId(line),
        quantity: line.qty,
      })),
      billingAddress: {
        firstName: 'Kiosk',
        lastName: 'Customer',
        email: 'kiosk@example.com',
      },
      shippingAddress: {
        firstName: 'Kiosk',
        lastName: 'Customer',
        email: 'kiosk@example.com',
      },
    };
  }

  /**
   * Convert basket to Magento order format
   */
  static toMagentoOrder(
    basket: Basket,
    platformType: PlatformType = 'magento'
  ): MagentoOrderData {
    return {
      customer_email: 'kiosk@example.com',
      payment_method: {
        method: 'cashondelivery',
      },
      billing_address: {
        firstname: 'Kiosk',
        lastname: 'Customer',
        email: 'kiosk@example.com',
      },
      items: basket.lines.map(line => ({
        // For Magento, we need SKUs, but basket currently uses product IDs
        // This assumes the basket line has been enriched with SKU information
        sku: this.getMagentoSku(line),
        qty: line.qty,
        price: line.lineTotal.amount / 100 / line.qty, // Unit price
      })),
    };
  }

  /**
   * Generic order conversion based on platform type
   */
  static convertOrder(
    basket: Basket,
    platformType: PlatformType
  ): any {
    switch (platformType) {
      case 'woocommerce':
        return this.toWooCommerceOrder(basket, platformType);
      case 'shopify':
        return this.toShopifyOrder(basket, platformType);
      case 'magento':
        return this.toMagentoOrder(basket, platformType);
      default:
        throw new Error(`Order conversion not implemented for platform: ${platformType}`);
    }
  }

  /**
   * Helper to get Shopify variant ID from basket line
   * In a real implementation, this would look up the variant ID from stored product data
   */
  private static getShopifyVariantId(line: BasketLine): string {
    // TODO: Implement proper variant ID lookup
    // For now, assume product ID is also variant ID
    return `gid://shopify/ProductVariant/${line.productId}`;
  }

  /**
   * Helper to get Magento SKU from basket line
   * In a real implementation, this would look up the SKU from stored product data
   */
  private static getMagentoSku(line: BasketLine): string {
    // TODO: Implement proper SKU lookup
    // For now, use product ID as SKU
    return line.productId;
  }
}

/**
 * Basket Enrichment Utilities
 * Add platform-specific data to basket lines for order conversion
 */
export class BasketEnricher {
  /**
   * Enrich basket lines with platform-specific data needed for order conversion
   */
  static enrichBasketForOrder(
    basket: Basket,
    platformType: PlatformType,
    productLookup: (productId: string) => any
  ): Basket {
    const enrichedLines = basket.lines.map(line => {
      const productData = productLookup(line.productId);
      if (!productData) return line;

      // Add platform-specific data to line for order conversion
      return {
        ...line,
        platformData: {
          [platformType]: productData.platformData?.[platformType],
        },
      };
    });

    return {
      ...basket,
      lines: enrichedLines,
    };
  }
}
