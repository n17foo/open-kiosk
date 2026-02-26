import type { CrossSellService, Product, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SquarespaceCrossSellService');

export class SquarespaceCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // Squarespace doesn't have a native cross-sell API
      // Fetch products from the same tag/category
      const productResponse = await this.makeRequest(`commerce/products/${productId}`);
      const tag = productResponse.tags?.[0] ?? productResponse.type;

      if (!tag) return [];

      const response = await this.makeRequest('commerce/products');
      const allProducts = response.result ?? [];

      return allProducts
        .filter((p: any) => p.id !== productId && (p.tags?.includes(tag) || p.type === tag))
        .slice(0, 5)
        .map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch Squarespace cross-sell products' },
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
