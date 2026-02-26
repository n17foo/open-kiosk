import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixCatalogService');

export class WixCatalogService implements CatalogService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getCatalog(): Promise<KioskCatalog> {
    const categories = await this.getCategories();
    const products = await this.getProducts();

    return {
      categories,
      products,
      upgradeOffers: [],
      variantGroups: [],
    };
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.makeRequest('stores/v1/collections/query', {
        method: 'POST',
        body: JSON.stringify({
          query: { paging: { limit: 100 } },
        }),
      });

      return (response.collections ?? []).map((col: any) => ({
        id: col.id,
        name: col.name,
        image: col.media?.mainMedia?.image?.url ?? undefined,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix categories' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      const filter: any = {};
      if (categoryId) {
        filter.collectionIds = { $hasSome: [categoryId] };
      }

      const response = await this.makeRequest('stores/v1/products/query', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter,
            paging: { limit: 100 },
          },
          includeVariants: true,
        }),
      });

      return (response.products ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`stores/v1/products/${id}`);
      return this.mapProduct(response.product);
    } catch (error) {
      logger.error({ message: `Failed to fetch Wix product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest('stores/v1/products/query', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: { name: { $contains: query } },
            paging: { limit: 50 },
          },
        }),
      });

      return (response.products ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to search Wix products' }, error instanceof Error ? error : new Error(String(error)));
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
