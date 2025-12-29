import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';

interface ShopifyCollection {
  id: string;
  title: string;
  image?: {
    url: string;
  };
}

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  images: { edges: Array<{ node: { url: string } }> };
  variants: { edges: Array<{ node: { price: { amount: string; currencyCode: string } } }> };
  collections: { edges: Array<{ node: { id: string } }> };
}

export class ShopifyCatalogService implements CatalogService {
  constructor(private baseUrl: string, private accessToken: string) {}

  async getCatalog(): Promise<KioskCatalog> {
    const categories = await this.getCategories();
    const products = await this.getProducts();
    
    return {
      categories,
      products,
      upgradeOffers: [], // Not used in Shopify context
      variantGroups: [], // To be implemented based on Shopify product variants
    };
  }

  async getCategories(): Promise<Category[]> {
    try {
      const query = `
        query {
          collections(first: 50) {
            edges {
              node {
                id
                title
                image {
                  url
                }
              }
            }
          }
        }
      `;

      const response = await this.makeGraphQLRequest(query);
      const collections = response.data.collections.edges.map((edge: any) => edge.node);

      return collections.map((collection: ShopifyCollection) => ({
        id: this.extractId(collection.id),
        name: collection.title,
        image: collection.image?.url,
      }));
    } catch (error) {
      console.error('Failed to fetch Shopify collections:', error);
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let query = `
        query($first: Int!) {
          products(first: $first) {
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
                collections(first: 10) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const variables = { first: 100 };
      const response = await this.makeGraphQLRequest(query, variables);
      const products = response.data.products.edges.map((edge: any) => edge.node);

      let filteredProducts = products;
      if (categoryId) {
        filteredProducts = products.filter((product: ShopifyProduct) =>
          product.collections.edges.some((edge: any) =>
            this.extractId(edge.node.id) === categoryId
          )
        );
      }

      return filteredProducts.map((product: ShopifyProduct) => ({
        id: this.extractId(product.id),
        categoryId: product.collections.edges[0]
          ? this.extractId(product.collections.edges[0].node.id)
          : 'default',
        name: product.title,
        description: product.description,
        price: {
          amount: Math.round(parseFloat(product.variants.edges[0]?.node.price.amount || '0') * 100),
          currency: product.variants.edges[0]?.node.price.currencyCode === 'GBP' ? 'GBP' : 'GBP',
        },
        image: product.images.edges[0]?.node.url,
      }));
    } catch (error) {
      console.error('Failed to fetch Shopify products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );
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
}
