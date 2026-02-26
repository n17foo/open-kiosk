import type { CrossSellService, Product, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceCrossSellService');

export class BigCommerceCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // BigCommerce related products endpoint
      const response = await this.makeRequest(`catalog/products/${productId}/related?limit=5`);
      return (response.data ?? []).map((product: any) => this.mapProduct(product));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch BigCommerce cross-sell products' },
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  async getCrossSellProductsForBasket(basket: Basket): Promise<Product[]> {
    const allCrossSells: Product[] = [];
    const seenIds = new Set<string>();
    const basketProductIds = new Set(basket.lines.map(l => l.productId));

    for (const line of basket.lines) {
      const crossSells = await this.getCrossSellProducts(line.productId);
      for (const product of crossSells) {
        if (!seenIds.has(product.id) && !basketProductIds.has(product.id)) {
          seenIds.add(product.id);
          allCrossSells.push(product);
        }
      }
    }

    return allCrossSells.slice(0, 5);
  }

  private mapProduct(product: any): Product {
    const price = product.variants?.[0]?.price ?? product.price ?? 0;
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
