import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusCatalogService');

export class SyliusCatalogService implements CatalogService {
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
      const response = await this.makeRequest('shop/taxons?itemsPerPage=100');
      const items = response['hydra:member'] ?? response.member ?? [];

      return items.map((taxon: any) => ({
        id: String(taxon.id ?? taxon.code),
        name: taxon.name ?? taxon.code,
        image: taxon.images?.[0]?.path ? `${this.baseUrl}/media/image/${taxon.images[0].path}` : undefined,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius categories' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let endpoint = 'shop/products?itemsPerPage=100';
      if (categoryId) {
        endpoint += `&productTaxons.taxon.code=${categoryId}`;
      }

      const response = await this.makeRequest(endpoint);
      const items = response['hydra:member'] ?? response.member ?? [];

      return items.map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`shop/products/${id}`);
      return this.mapProduct(response);
    } catch (error) {
      logger.error({ message: `Failed to fetch Sylius product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`shop/products?translations.name=${encodeURIComponent(query)}&itemsPerPage=50`);
      const items = response['hydra:member'] ?? response.member ?? [];
      return items.map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error({ message: 'Failed to search Sylius products' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private mapProduct(product: any): Product {
    const variant = product.variants?.[0];
    const price = variant?.price ?? product.price ?? 0;
    const currency = variant?.channelPricings?.[0]?.currencyCode ?? 'GBP';
    const channelPrice = variant?.channelPricings?.[0]?.price ?? price;
    const image = product.images?.[0]?.path ? `${this.baseUrl}/media/image/${product.images[0].path}` : undefined;

    return {
      id: String(product.id ?? product.code),
      categoryId: product.mainTaxon?.code ?? product.productTaxons?.[0]?.taxon?.code ?? 'default',
      name: product.name ?? product.code ?? 'Unknown',
      description: product.shortDescription ?? product.description ?? '',
      price: {
        amount: channelPrice,
        currency,
      },
      image,
    };
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v2/${endpoint}`, {
      headers: {
        Accept: 'application/ld+json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Sylius API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
