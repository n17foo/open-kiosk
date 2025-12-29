import type { ProductService, Product } from '../interfaces';
import { MOCK_DATA } from '../mockData';

export class InMemoryProductService implements ProductService {
  async getProduct(id: string): Promise<Product | undefined> {
    return MOCK_DATA.products.find(product => product.id === id);
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return MOCK_DATA.products.filter(product => ids.includes(product.id));
  }

  async getProductVariants(productId: string): Promise<Product[]> {
    // Mock variants - in a real implementation, this would return variants of the same product
    const baseProduct = MOCK_DATA.products.find(p => p.id === productId);
    if (!baseProduct) return [];

    // Return mock variants (in reality, these would be actual variants)
    return [baseProduct];
  }

  async getUpsellRecommendations(productId: string): Promise<Product[]> {
    // Simple mock recommendations - return products from the same category
    const product = MOCK_DATA.products.find(p => p.id === productId);
    if (!product) return [];

    return MOCK_DATA.products
      .filter(p => p.categoryId === product.categoryId && p.id !== productId)
      .slice(0, 3); // Return up to 3 recommendations
  }
}
