import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceCatalogService');

export class BigCommerceCatalogService implements CatalogService {
  constructor(
    private baseUrl: string,
    private accessToken: string
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
      const response = await this.makeRequest('catalog/categories?is_visible=true&limit=250');
      return (response.data ?? []).map((cat: any) => ({
        id: String(cat.id),
        name: cat.name,
        image: cat.image_url || undefined,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce categories' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let endpoint = 'catalog/products?is_visible=true&include=images,variants&limit=250';
      if (categoryId) {
        endpoint += `&categories:in=${categoryId}`;
      }

      const response = await this.makeRequest(endpoint);
      return (response.data ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`catalog/products/${id}?include=images,variants`);
      return this.mapProduct(response.data);
    } catch (error) {
      logger.error({ message: `Failed to fetch BigCommerce product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(
        `catalog/products?keyword=${encodeURIComponent(query)}&is_visible=true&include=images,variants&limit=50`
      );
      return (response.data ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to search BigCommerce products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private mapProduct(product: any): Product {
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price ?? product.price ?? 0;
    const currency = product.currency ?? 'GBP';
    const image = product.images?.[0]?.url_standard || product.images?.[0]?.url_thumbnail;

    return {
      id: String(product.id),
      categoryId: product.categories?.[0] ? String(product.categories[0]) : 'default',
      name: product.name,
      description: product.description?.replace(/<[^>]*>/g, '') ?? '',
      price: {
        amount: Math.round(price * 100),
        currency,
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
