import type { CrossSellService, Product, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopCrossSellService');

export class PrestaShopCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // PrestaShop accessories = related/cross-sell products
      const response = await this.makeRequest(`products/${productId}?display=full`);
      const accessoryIds = response.product?.associations?.accessories?.map((a: any) => String(a.id)) ?? [];

      if (accessoryIds.length === 0) return [];

      const products: Product[] = [];
      for (const id of accessoryIds.slice(0, 5)) {
        const product = await this.fetchProduct(id);
        if (product) products.push(product);
      }

      return products;
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch PrestaShop cross-sell products' },
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

  private async fetchProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}?display=full`);
      const product = response.product;
      if (!product) return undefined;

      const name =
        typeof product.name === 'object' ? (product.name.language?.[0]?.value ?? product.name) : String(product.name ?? 'Unknown');

      const description =
        typeof product.description_short === 'object'
          ? (product.description_short.language?.[0]?.value ?? '')
          : String(product.description_short ?? '');

      return {
        id: String(product.id),
        categoryId: String(product.id_category_default ?? 'default'),
        name,
        description: description.replace(/<[^>]*>/g, ''),
        price: {
          amount: Math.round(parseFloat(product.price ?? '0') * 100),
          currency: 'GBP',
        },
        image: product.id_default_image ? `${this.baseUrl}/api/images/products/${product.id}/${product.id_default_image}` : undefined,
      };
    } catch {
      return undefined;
    }
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
