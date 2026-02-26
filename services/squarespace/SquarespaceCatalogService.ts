import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SquarespaceCatalogService');

export class SquarespaceCatalogService implements CatalogService {
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
      // Squarespace Commerce API v1 — products have categories as tags
      // Fetch all products and extract unique categories from them
      const products = await this.fetchAllProducts();
      const categoryMap = new Map<string, Category>();

      for (const product of products) {
        for (const tag of product.tags ?? []) {
          if (!categoryMap.has(tag)) {
            categoryMap.set(tag, {
              id: tag,
              name: tag,
            });
          }
        }
      }

      // Also add product types as categories
      for (const product of products) {
        const type = product.type;
        if (type && !categoryMap.has(type)) {
          categoryMap.set(type, {
            id: type,
            name: type,
          });
        }
      }

      return Array.from(categoryMap.values());
    } catch (error) {
      logger.error({ message: 'Failed to fetch Squarespace categories' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      const rawProducts = await this.fetchAllProducts();

      let filtered = rawProducts;
      if (categoryId) {
        filtered = rawProducts.filter((p: any) => p.tags?.includes(categoryId) || p.type === categoryId);
      }

      return filtered.map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Squarespace products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`commerce/products/${id}`);
      return this.mapProduct(response);
    } catch (error) {
      logger.error({ message: `Failed to fetch Squarespace product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    // Squarespace Commerce API does not have search — filter client-side
    const allProducts = await this.getProducts();
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description?.toLowerCase().includes(lowerQuery));
  }

  private async fetchAllProducts(): Promise<any[]> {
    const allProducts: any[] = [];
    let cursor: string | undefined;

    do {
      const endpoint = cursor ? `commerce/products?cursor=${cursor}` : 'commerce/products';
      const response = await this.makeRequest(endpoint);

      allProducts.push(...(response.result ?? []));
      cursor = response.pagination?.nextPageCursor;
    } while (cursor);

    return allProducts;
  }

  private mapProduct(product: any): Product {
    const variant = product.variants?.[0];
    const priceCents = variant?.priceMoney?.value
      ? Number(variant.priceMoney.value)
      : Math.round(parseFloat(variant?.price ?? product.price ?? '0') * 100);
    const currency = variant?.priceMoney?.currency ?? 'GBP';
    const image = product.images?.[0]?.url ?? product.mainImage?.url;

    return {
      id: product.id,
      categoryId: product.tags?.[0] ?? product.type ?? 'default',
      name: product.name ?? 'Unknown',
      description: product.description?.replace(/<[^>]*>/g, '') ?? '',
      price: {
        amount: priceCents,
        currency,
      },
      image,
    };
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/1.0/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Squarespace API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
