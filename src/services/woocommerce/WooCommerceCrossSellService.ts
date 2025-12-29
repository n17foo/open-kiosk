import type { CrossSellService, Product, Basket } from '../interfaces';

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  images: Array<{ src: string }>;
  regular_price: string;
  sale_price?: string;
  price: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  status: string;
  cross_sell_ids?: number[];
  related_ids?: number[];
}

export class WooCommerceCrossSellService implements CrossSellService {
  constructor(private baseUrl: string, private consumerKey: string, private consumerSecret: string) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // Get the product to check cross_sell_ids
      const productResponse = await this.makeRequest(`products/${productId}`);
      const product: WooCommerceProduct = productResponse;

      if (product.cross_sell_ids && product.cross_sell_ids.length > 0) {
        // Fetch cross-sell products
        const crossSellIds = product.cross_sell_ids.slice(0, 5); // Limit to 5
        const crossSells: Product[] = [];

        for (const id of crossSellIds) {
          try {
            const crossSellProduct = await this.makeRequest(`products/${id}`);
            const wcProduct: WooCommerceProduct = crossSellProduct;
            crossSells.push({
              id: wcProduct.id.toString(),
              categoryId: wcProduct.categories[0]?.id.toString() || 'default',
              name: wcProduct.name,
              description: wcProduct.short_description || wcProduct.description,
              price: {
                amount: Math.round(parseFloat(wcProduct.price) * 100),
                currency: 'GBP',
              },
              image: wcProduct.images[0]?.src,
            });
          } catch (error) {
            console.error(`Failed to fetch cross-sell product ${id}:`, error);
          }
        }

        return crossSells;
      }

      // Fallback to related products if no cross-sells defined
      if (product.related_ids && product.related_ids.length > 0) {
        const relatedIds = product.related_ids.slice(0, 5);
        const related: Product[] = [];

        for (const id of relatedIds) {
          try {
            const relatedProduct = await this.makeRequest(`products/${id}`);
            const wcProduct: WooCommerceProduct = relatedProduct;
            related.push({
              id: wcProduct.id.toString(),
              categoryId: wcProduct.categories[0]?.id.toString() || 'default',
              name: wcProduct.name,
              description: wcProduct.short_description || wcProduct.description,
              price: {
                amount: Math.round(parseFloat(wcProduct.price) * 100),
                currency: 'GBP',
              },
              image: wcProduct.images[0]?.src,
            });
          } catch (error) {
            console.error(`Failed to fetch related product ${id}:`, error);
          }
        }

        return related;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch WooCommerce cross-sell products:', error);
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

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
