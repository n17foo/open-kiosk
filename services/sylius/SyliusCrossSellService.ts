import type { CrossSellService, Product, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusCrossSellService');

export class SyliusCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // Sylius uses product associations for cross-sells
      const response = await this.makeRequest(`shop/products/${productId}`);
      const associations = response.associations ?? [];

      const crossSells: Product[] = [];
      for (const assoc of associations) {
        if (assoc.type?.code === 'cross_sell' || assoc.type?.code === 'similar_products') {
          const associated = assoc.associatedProducts ?? [];
          for (const product of associated) {
            if (crossSells.length < 5) {
              crossSells.push(this.mapProduct(product));
            }
          }
        }
      }

      return crossSells;
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius cross-sell products' }, error instanceof Error ? error : new Error(String(error)));
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
    const channelPrice = variant?.channelPricings?.[0]?.price ?? 0;
    const currency = variant?.channelPricings?.[0]?.currencyCode ?? 'GBP';
    const image = product.images?.[0]?.path ? `${this.baseUrl}/media/image/${product.images[0].path}` : undefined;

    return {
      id: String(product.id ?? product.code),
      categoryId: product.mainTaxon?.code ?? 'default',
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
