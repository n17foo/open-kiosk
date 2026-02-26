import type { CrossSellService, Product, Basket } from '../interfaces';

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
  crosssell_products?: Array<{
    sku: string;
    name: string;
  }>;
  related_products?: Array<{
    sku: string;
    name: string;
  }>;
}

export class MagentoCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // Get the product to check crosssell_products
      const productResponse = await this.makeRequest(`products/${productId}`);
      const product: MagentoProduct = productResponse;

      if (product.crosssell_products && product.crosssell_products.length > 0) {
        // Fetch cross-sell products
        const crossSellSkus = product.crosssell_products.slice(0, 5); // Limit to 5
        const crossSells: Product[] = [];

        for (const crossSell of crossSellSkus) {
          try {
            const crossSellProduct = await this.makeRequest(`products/${crossSell.sku}`);
            const mgProduct: MagentoProduct = crossSellProduct;
            crossSells.push({
              id: mgProduct.id.toString(),
              categoryId: mgProduct.extension_attributes?.category_links?.[0]?.category_id || 'default',
              name: mgProduct.name,
              description: this.getProductDescription(mgProduct),
              price: {
                amount: Math.round(mgProduct.price * 100),
                currency: 'GBP',
              },
              image: this.getProductImage(mgProduct),
            });
          } catch (error) {
            console.error(`Failed to fetch cross-sell product ${crossSell.sku}:`, error);
          }
        }

        return crossSells;
      }

      // Fallback to related products if no cross-sells defined
      if (product.related_products && product.related_products.length > 0) {
        const relatedSkus = product.related_products.slice(0, 5);
        const related: Product[] = [];

        for (const relatedProduct of relatedSkus) {
          try {
            const relProduct = await this.makeRequest(`products/${relatedProduct.sku}`);
            const mgProduct: MagentoProduct = relProduct;
            related.push({
              id: mgProduct.id.toString(),
              categoryId: mgProduct.extension_attributes?.category_links?.[0]?.category_id || 'default',
              name: mgProduct.name,
              description: this.getProductDescription(mgProduct),
              price: {
                amount: Math.round(mgProduct.price * 100),
                currency: 'GBP',
              },
              image: this.getProductImage(mgProduct),
            });
          } catch (error) {
            console.error(`Failed to fetch related product ${relatedProduct.sku}:`, error);
          }
        }

        return related;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch Magento cross-sell products:', error);
      return [];
    }
  }

  async getCrossSellProductsForBasket(basket: Basket): Promise<Product[]> {
    // For basket cross-sells, combine cross-sells from all basket items
    const allCrossSells: Product[] = [];
    const seenIds = new Set<string>();

    for (const line of basket.lines) {
      const crossSells = await this.getCrossSellProducts(line.productId);
      for (const product of crossSells) {
        if (!seenIds.has(product.id) && !basket.lines.some(l => l.productId === product.id)) {
          seenIds.add(product.id);
          allCrossSells.push(product);
        }
      }
    }

    return allCrossSells.slice(0, 5); // Limit to 5 suggestions
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
