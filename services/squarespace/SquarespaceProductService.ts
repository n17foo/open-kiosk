import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SquarespaceProductService');

export class SquarespaceProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`commerce/products/${id}`);
      return this.mapProduct(response);
    } catch (error) {
      logger.error({ message: `Failed to fetch Squarespace product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    const products: Product[] = [];
    for (const id of ids) {
      const product = await this.getProduct(id);
      if (product) products.push(product);
    }
    return products;
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`commerce/products/${productId}`);
      const variants = response.variants ?? [];
      const parent = this.mapProduct(response);

      return variants.map((variant: any) => {
        const attributes = variant.attributes ? Object.values(variant.attributes).join(', ') : (variant.sku ?? '');

        const priceCents = variant.priceMoney?.value
          ? Number(variant.priceMoney.value)
          : Math.round(parseFloat(variant.price ?? '0') * 100);

        return {
          id: variant.id,
          categoryId: parent.categoryId,
          name: `${parent.name} - ${attributes}`,
          description: parent.description,
          price: {
            amount: priceCents,
            currency: variant.priceMoney?.currency ?? 'GBP',
          },
          image: parent.image,
        };
      });
    } catch (error) {
      logger.error({ message: 'Failed to fetch Squarespace product variants' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // Squarespace doesn't have a native related products API
      // Fetch products from the same category/tag
      const product = await this.getProduct(productId);
      if (!product || product.categoryId === 'default') return [];

      // Fetch all products and filter by same category
      const response = await this.makeRequest('commerce/products');
      const allProducts = response.result ?? [];

      return allProducts
        .filter((p: any) => p.id !== productId && (p.tags?.includes(product.categoryId) || p.type === product.categoryId))
        .slice(0, 5)
        .map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch Squarespace upsell recommendations' },
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
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
