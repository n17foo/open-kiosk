import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixProductService');

export class WixProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`stores/v1/products/${id}`);
      return this.mapProduct(response.product);
    } catch (error) {
      logger.error({ message: `Failed to fetch Wix product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const response = await this.makeRequest('stores/v1/products/query', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: { id: { $hasSome: ids } },
            paging: { limit: ids.length },
          },
        }),
      });
      return (response.products ?? []).map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix products by IDs' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`stores/v1/products/${productId}/variants/query`, {
        method: 'POST',
        body: JSON.stringify({
          paging: { limit: 100 },
        }),
      });

      const parent = await this.getProduct(productId);
      if (!parent) return [];

      return (response.variants ?? []).map((variant: any) => ({
        id: variant.id,
        categoryId: parent.categoryId,
        name: `${parent.name} - ${Object.values(variant.choices ?? {}).join(', ')}`,
        description: parent.description,
        price: {
          amount: Math.round(parseFloat(variant.variant?.priceData?.price ?? '0') * 100),
          currency: variant.variant?.priceData?.currency ?? 'GBP',
        },
        image: parent.image,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix product variants' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // Wix doesn't have a native related products API
      // Fetch products from the same collection as recommendations
      const product = await this.getProduct(productId);
      if (!product || product.categoryId === 'default') return [];

      const response = await this.makeRequest('stores/v1/products/query', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: { collectionIds: { $hasSome: [product.categoryId] } },
            paging: { limit: 6 },
          },
        }),
      });

      return (response.products ?? [])
        .filter((p: any) => p.id !== productId)
        .slice(0, 5)
        .map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix upsell recommendations' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private mapProduct(product: any): Product {
    const price = parseFloat(product.price?.price ?? product.priceData?.price ?? '0');
    const currency = product.price?.currency ?? product.priceData?.currency ?? 'GBP';
    const image = product.media?.mainMedia?.image?.url ?? product.media?.items?.[0]?.image?.url;

    return {
      id: product.id,
      categoryId: product.collectionIds?.[0] ?? 'default',
      name: product.name ?? 'Unknown',
      description: product.description?.replace(/<[^>]*>/g, '') ?? '',
      price: {
        amount: Math.round(price * 100),
        currency,
      },
      image,
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
