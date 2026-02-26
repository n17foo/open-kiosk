import type { CrossSellService, Product, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixCrossSellService');

export class WixCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // Wix doesn't have a native cross-sell API
      // Fetch products from the same collection
      const productResponse = await this.makeRequest(`stores/v1/products/${productId}`);
      const product = productResponse.product;
      const collectionId = product?.collectionIds?.[0];

      if (!collectionId) return [];

      const response = await this.makeRequest('stores/v1/products/query', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: { collectionIds: { $hasSome: [collectionId] } },
            paging: { limit: 6 },
          },
        }),
      });

      return (response.products ?? [])
        .filter((p: any) => p.id !== productId)
        .slice(0, 5)
        .map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix cross-sell products' }, error instanceof Error ? error : new Error(String(error)));
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
