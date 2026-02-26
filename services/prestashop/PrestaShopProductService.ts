import type { ProductService, Product } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopProductService');

export class PrestaShopProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}?display=full`);
      return this.mapProduct(response.product);
    } catch (error) {
      logger.error({ message: `Failed to fetch PrestaShop product ${id}` }, error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const filter = ids.join('|');
      const response = await this.makeRequest(`products?filter[id]=[${filter}]&display=full`);
      return (response.products ?? []).map((p: any) => this.mapProduct(p));
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop products by IDs' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      const response = await this.makeRequest(`combinations?filter[id_product]=${productId}&display=full`);
      const parent = await this.getProduct(productId);
      if (!parent) return [];

      return (response.combinations ?? []).map((combo: any) => {
        const attributes = combo.associations?.product_option_values ?? [];
        const variantName = attributes.map((a: any) => a.name ?? a.id).join(', ');

        return {
          id: `${productId}-${combo.id}`,
          categoryId: parent.categoryId,
          name: `${parent.name} - ${variantName}`,
          description: parent.description,
          price: {
            amount: Math.round((parseFloat(combo.price ?? '0') + (parent.price?.amount ?? 0) / 100) * 100),
            currency: 'GBP',
          },
          image: parent.image,
        };
      });
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop product variants' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // PrestaShop has accessories (related products)
      const response = await this.makeRequest(`products/${productId}?display=full`);
      const accessoryIds = response.product?.associations?.accessories?.map((a: any) => String(a.id)) ?? [];

      if (accessoryIds.length === 0) return [];

      return await this.getProductsByIds(accessoryIds.slice(0, 5));
    } catch (error) {
      logger.error(
        { message: 'Failed to fetch PrestaShop upsell recommendations' },
        error instanceof Error ? error : new Error(String(error))
      );
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
