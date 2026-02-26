import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WooCommerceProductService');

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  images: Array<{ src: string }>;
  regular_price: string;
  sale_price?: string;
  price: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  status: string;
  related_ids?: number[];
  upsell_ids?: number[];
  variations?: number[];
}

export class WooCommerceProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private consumerKey: string,
    private consumerSecret: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}`);
      const product: WooCommerceProduct = response;

      return {
        id: product.id.toString(),
        categoryId: product.categories[0]?.id.toString() || 'default',
        name: product.name,
        description: product.short_description || product.description,
        price: {
          amount: Math.round(parseFloat(product.price) * 100),
          currency: 'GBP',
        },
        image: product.images[0]?.src,
      };
    } catch (error) {
      logger.error({ message: 'Failed to fetch WooCommerce product' }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const products: Product[] = [];
      // Fetch products individually (WooCommerce doesn't have batch endpoint)
      for (const id of ids) {
        const product = await this.getProduct(id);
        if (product) {
          products.push(product);
        }
      }
      return products;
    } catch (error) {
      logger.error({ message: 'Failed to fetch WooCommerce products by IDs' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      // Get product variations
      const response = await this.makeRequest(`products/${productId}/variations?per_page=100`);
      const variations: WooCommerceProduct[] = response;

      return variations.map(variation => ({
        id: variation.id.toString(),
        categoryId: productId, // Parent product ID as category
        name: variation.name,
        description: variation.short_description || variation.description,
        price: {
          amount: Math.round(parseFloat(variation.price) * 100),
          currency: 'GBP',
        },
        image: variation.images[0]?.src,
      }));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch WooCommerce product variations' },
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // Get the product first to check upsell_ids
      const productResponse = await this.makeRequest(`products/${productId}`);
      const product: WooCommerceProduct = productResponse;

      if (product.upsell_ids && product.upsell_ids.length > 0) {
        // Fetch upsell products
        const upsellIds = product.upsell_ids.slice(0, 5); // Limit to 5
        const upsells: Product[] = [];

        for (const id of upsellIds) {
          const upsellProduct = await this.getProduct(id.toString());
          if (upsellProduct) {
            upsells.push(upsellProduct);
          }
        }

        return upsells;
      }

      // Fallback to related products
      if (product.related_ids && product.related_ids.length > 0) {
        const relatedIds = product.related_ids.slice(0, 5);
        const related: Product[] = [];

        for (const id of relatedIds) {
          const relatedProduct = await this.getProduct(id.toString());
          if (relatedProduct) {
            related.push(relatedProduct);
          }
        }

        return related;
      }

      return [];
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch WooCommerce upsell recommendations' },
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
