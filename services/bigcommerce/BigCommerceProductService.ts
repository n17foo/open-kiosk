import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceProductService');

export class BigCommerceProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`catalog/products/${id}?include=images,variants`);
      return this.mapProduct(response.data);
    } catch (error) {
      logger.error({ message: `Failed to fetch BigCommerce product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const idFilter = ids.join(',');
      const response = await this.makeRequest(`catalog/products?id:in=${idFilter}&include=images,variants`);
      return (response.data ?? []).map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce products by IDs' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`catalog/products/${productId}/variants`);
      const parent = await this.getProduct(productId);
      if (!parent) return [];

      return (response.data ?? []).map((variant: any) => ({
        id: `${productId}-${variant.id}`,
        categoryId: parent.categoryId,
        name: `${parent.name} - ${variant.option_values?.map((o: any) => o.label).join(', ') ?? ''}`,
        description: parent.description,
        price: {
          amount: Math.round((variant.price ?? 0) * 100),
          currency: 'GBP',
        },
        image: variant.image_url || parent.image,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce product variants' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // BigCommerce related products API
      const response = await this.makeRequest(`catalog/products/${productId}/related`);
      return (response.data ?? []).slice(0, 5).map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch BigCommerce upsell recommendations' },
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  private mapProduct(product: any): Product {
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price ?? product.price ?? 0;
    const image = product.images?.[0]?.url_standard || product.images?.[0]?.url_thumbnail;

    return {
      id: String(product.id),
      categoryId: product.categories?.[0] ? String(product.categories[0]) : 'default',
      name: product.name,
      description: product.description?.replace(/<[^>]*>/g, '') ?? '',
      price: {
        amount: Math.round(price * 100),
        currency: 'GBP',
      },
      image,
    };
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v3/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
