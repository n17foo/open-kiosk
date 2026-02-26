import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusProductService');

export class SyliusProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`shop/products/${id}`);
      return this.mapProduct(response);
    } catch (error) {
      logger.error({ message: `Failed to fetch Sylius product ${id}` }, error instanceof Error ? error : new Error(String(error)));
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
      const response = await this.makeRequest(`shop/products/${productId}`);
      const variants = response.variants ?? [];

      return variants.map((variant: any) => ({
        id: String(variant.id ?? variant.code),
        categoryId: response.mainTaxon?.code ?? 'default',
        name: `${response.name} - ${variant.name ?? variant.code ?? ''}`,
        description: response.shortDescription ?? response.description ?? '',
        price: {
          amount: variant.channelPricings?.[0]?.price ?? 0,
          currency: variant.channelPricings?.[0]?.currencyCode ?? 'GBP',
        },
        image: response.images?.[0]?.path ? `${this.baseUrl}/media/image/${response.images[0].path}` : undefined,
      }));
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius product variants' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // Sylius associations can be used for upsells
      const response = await this.makeRequest(`shop/products/${productId}`);
      const associations = response.associations ?? [];

      const upsellProducts: Product[] = [];
      for (const assoc of associations) {
        const associated = assoc.associatedProducts ?? [];
        for (const product of associated) {
          if (upsellProducts.length < 5) {
            upsellProducts.push(this.mapProduct(product));
          }
        }
      }

      return upsellProducts;
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius upsell recommendations' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
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
