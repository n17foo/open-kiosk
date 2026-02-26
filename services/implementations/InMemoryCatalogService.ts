import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { MOCK_DATA } from '../mockData';

export class InMemoryCatalogService implements CatalogService {
  async getCatalog(): Promise<KioskCatalog> {
    return MOCK_DATA;
  }

  async getCategories(): Promise<Category[]> {
    return MOCK_DATA.categories;
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    if (!categoryId) {
      return MOCK_DATA.products;
    }
    return MOCK_DATA.products.filter(product => product.categoryId === categoryId);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return MOCK_DATA.products.find(product => product.id === id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return MOCK_DATA.products.filter(
      product => product.name.toLowerCase().includes(lowerQuery) || product.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
