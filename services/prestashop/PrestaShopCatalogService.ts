import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopCatalogService');

export class PrestaShopCatalogService implements CatalogService {
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
      const response = await this.makeRequest('categories?display=[id,name,id_image]&filter[active]=1');
      return (response.categories ?? []).map((cat: any) => ({
        id: String(cat.id),
        name: typeof cat.name === 'object' ? (cat.name.language?.[0]?.value ?? cat.name) : String(cat.name),
        image: cat.id_image ? `${this.baseUrl}/api/images/categories/${cat.id}` : undefined,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop categories' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let endpoint = 'products?display=full&filter[active]=1&limit=250';
      if (categoryId) {
        endpoint += `&filter[id_category_default]=${categoryId}`;
      }

      const response = await this.makeRequest(endpoint);
      return (response.products ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}?display=full`);
      return this.mapProduct(response.product);
    } catch (error) {
      logger.error({ message: `Failed to fetch PrestaShop product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`search?query=${encodeURIComponent(query)}&language=1`);
      const productIds = (response.products ?? []).map((p: any) => String(p.id));

      if (productIds.length === 0) return [];

      const products: Product[] = [];
      for (const id of productIds.slice(0, 50)) {
        const product = await this.getProduct(id);
        if (product) products.push(product);
      }
      return products;
    } catch (error) {
      logger.error({ message: 'Failed to search PrestaShop products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private mapProduct(product: any): Product {
    const name = typeof product.name === 'object' ? (product.name.language?.[0]?.value ?? product.name) : String(product.name ?? 'Unknown');

    const description =
      typeof product.description_short === 'object'
        ? (product.description_short.language?.[0]?.value ?? '')
        : String(product.description_short ?? '');

    const price = parseFloat(product.price ?? '0');
    const imageId = product.id_default_image;

    return {
      id: String(product.id),
      categoryId: String(product.id_category_default ?? 'default'),
      name,
      description: description.replace(/<[^>]*>/g, ''),
      price: {
        amount: Math.round(price * 100),
        currency: 'GBP',
      },
      image: imageId ? `${this.baseUrl}/api/images/products/${product.id}/${imageId}` : undefined,
    };
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const auth = btoa(`${this.apiKey}:`);
    const separator = endpoint.includes('?') ? '&' : '?';

    const response = await fetch(`${this.baseUrl}/api/${endpoint}${separator}output_format=JSON`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
