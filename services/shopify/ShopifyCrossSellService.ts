import type { CrossSellService, Product, Basket } from '../interfaces';

export class ShopifyCrossSellService implements CrossSellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCrossSellProducts(productId: string): Promise<Product[]> {
    try {
      // In Shopify, cross-sells can be implemented using related products or collections
      // For now, we'll query products from the same collections as cross-sells
      const query = `
        query($id: ID!) {
          product(id: $id) {
            collections(first: 5) {
              edges {
                node {
                  products(first: 10) {
                    edges {
                      node {
                        id
                        title
                        description
                        images(first: 1) {
                          edges {
                            node {
                              url
                            }
                          }
                        }
                        variants(first: 1) {
                          edges {
                            node {
                              price {
                                amount
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.makeGraphQLRequest(query, { id: `gid://shopify/Product/${this.extractNumericId(productId)}` });
      const collections = response.data.product.collections.edges;

      const crossSellProducts: Product[] = [];

      for (const collectionEdge of collections) {
        const products = collectionEdge.node.products.edges;
        for (const productEdge of products) {
          const product = productEdge.node;
          if (this.extractId(product.id) !== productId && crossSellProducts.length < 5) {
            crossSellProducts.push({
              id: this.extractId(product.id),
              categoryId: 'default', // Could be improved to get actual category
              name: product.title,
              description: product.description,
              price: {
                amount: Math.round(parseFloat(product.variants.edges[0]?.node.price.amount || '0') * 100),
                currency: product.variants.edges[0]?.node.price.currencyCode === 'GBP' ? 'GBP' : 'GBP',
              },
              image: product.images.edges[0]?.node.url,
            });
          }
        }
      }

      return crossSellProducts;
    } catch (error) {
      console.error('Failed to fetch Shopify cross-sell products:', error);
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

  private async makeGraphQLRequest(query: string, variables?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify GraphQL error: ${response.status}`);
    }

    return response.json();
  }

  private extractId(shopifyId: string): string {
    // Shopify IDs are in format "gid://shopify/Product/123456789"
    return shopifyId.split('/').pop() || shopifyId;
  }

  private extractNumericId(id: string): string {
    // Convert our string ID back to numeric for Shopify
    return id;
  }
}
