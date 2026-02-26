import type { ProductService, Product } from '../interfaces';

interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  attribute_set_id: number;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: {
    category_links: Array<{
      category_id: string;
    }>;
  };
  custom_attributes: Array<{
    attribute_code: string;
    value: string | number;
  }>;
  media_gallery_entries?: Array<{
    id: number;
    media_type: string;
    label: string;
    position: number;
    disabled: boolean;
    types: string[];
    file: string;
  }>;
  configurable_product_links?: number[];
  related_products?: Array<{
    sku: string;
    name: string;
  }>;
  upsell_products?: Array<{
    sku: string;
    name: string;
  }>;
}

export class MagentoProductService implements ProductService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}`);
      const product: MagentoProduct = response;

      return {
        id: product.id.toString(),
        categoryId: product.extension_attributes?.category_links?.[0]?.category_id || 'default',
        name: product.name,
        description: this.getProductDescription(product),
        price: {
          amount: Math.round(product.price * 100),
          currency: 'GBP',
        },
        image: this.getProductImage(product),
      };
    } catch (error) {
      console.error('Failed to fetch Magento product:', error);
      return undefined;
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const products: Product[] = [];
      // Fetch products individually (Magento doesn't have batch endpoint)
      for (const id of ids) {
        const product = await this.getProduct(id);
        if (product) {
          products.push(product);
        }
      }
      return products;
    } catch (error) {
      console.error('Failed to fetch Magento products by IDs:', error);
      return [];
    }
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    try {
      // For configurable products, get child products
      const response = await this.makeRequest(`configurable-products/${productId}/children`);
      const variants: MagentoProduct[] = response;

      return variants.map(variant => ({
        id: variant.id.toString(),
        categoryId: productId, // Parent product ID as category
        name: variant.name,
        description: this.getProductDescription(variant),
        price: {
          amount: Math.round(variant.price * 100),
          currency: 'GBP',
        },
        image: this.getProductImage(variant),
      }));
    } catch (error) {
      console.error('Failed to fetch Magento product variants:', error);
      return [];
    }
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    try {
      // Get the product first to check upsell products
      const productResponse = await this.makeRequest(`products/${productId}`);
      const product: MagentoProduct = productResponse;

      if (product.upsell_products && product.upsell_products.length > 0) {
        // Fetch upsell products
        const upsellSkus = product.upsell_products.slice(0, 5); // Limit to 5
        const upsells: Product[] = [];

        for (const upsell of upsellSkus) {
          try {
            const upsellProduct = await this.makeRequest(`products/${upsell.sku}`);
            const product: MagentoProduct = upsellProduct;
            upsells.push({
              id: product.id.toString(),
              categoryId: product.extension_attributes?.category_links?.[0]?.category_id || 'default',
              name: product.name,
              description: this.getProductDescription(product),
              price: {
                amount: Math.round(product.price * 100),
                currency: 'GBP',
              },
              image: this.getProductImage(product),
            });
          } catch (error) {
            console.error(`Failed to fetch upsell product ${upsell.sku}:`, error);
          }
        }

        return upsells;
      }

      // Fallback to related products
      if (product.related_products && product.related_products.length > 0) {
        const relatedSkus = product.related_products.slice(0, 5);
        const related: Product[] = [];

        for (const relatedProduct of relatedSkus) {
          try {
            const relProduct = await this.makeRequest(`products/${relatedProduct.sku}`);
            const product: MagentoProduct = relProduct;
            related.push({
              id: product.id.toString(),
              categoryId: product.extension_attributes?.category_links?.[0]?.category_id || 'default',
              name: product.name,
              description: this.getProductDescription(product),
              price: {
                amount: Math.round(product.price * 100),
                currency: 'GBP',
              },
              image: this.getProductImage(product),
            });
          } catch (error) {
            console.error(`Failed to fetch related product ${relatedProduct.sku}:`, error);
          }
        }

        return related;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch Magento upsell recommendations:', error);
      return [];
    }
  }

  private getProductImage(product: MagentoProduct): string | undefined {
    const imageEntry = product.media_gallery_entries?.find(entry => entry.types.includes('image') || entry.types.includes('small_image'));
    if (imageEntry) {
      return `${this.baseUrl}/media/catalog/product${imageEntry.file}`;
    }
    return undefined;
  }

  private getProductDescription(product: MagentoProduct): string | undefined {
    const descAttr = product.custom_attributes?.find(attr => attr.attribute_code === 'description');
    return descAttr && typeof descAttr.value === 'string' ? descAttr.value : undefined;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/rest/V1/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Magento API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
