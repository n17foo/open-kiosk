import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';
import { ProductConverter, CategoryConverter } from '../converters';
import type { WooCommerceProductData, WooCommerceCategoryData } from '../extended-types';

export class WooCommerceCatalogService implements CatalogService {
  constructor(
    private baseUrl: string,
    private consumerKey: string,
    private consumerSecret: string
  ) {}

  async getCatalog(): Promise<KioskCatalog> {
    const categories = await this.getCategories();
    const products = await this.getProducts();

    return {
      categories,
      products,
      upgradeOffers: [], // Not used in WooCommerce context
      variantGroups: [], // To be implemented based on WooCommerce product variations
    };
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.makeRequest('products/categories?per_page=100');
      const wooCategories: WooCommerceCategoryData[] = response;

      // Convert to extended categories first, then to basic categories
      return wooCategories.map(wooCategory =>
        CategoryConverter.toBasicCategory(CategoryConverter.fromWooCommerce(wooCategory, 'woocommerce'))
      );
    } catch (error) {
      console.error('Failed to fetch WooCommerce categories:', error);
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let endpoint = 'products?per_page=100&status=publish';

      if (categoryId) {
        endpoint += `&category=${categoryId}`;
      }

      const response = await this.makeRequest(endpoint);
      const wooProducts: WooCommerceProductData[] = response;

      // Convert to extended products first, then to basic products
      return wooProducts.map(wooProduct => ProductConverter.toBasicProduct(ProductConverter.fromWooCommerce(wooProduct, 'woocommerce')));
    } catch (error) {
      console.error('Failed to fetch WooCommerce products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const response = await this.makeRequest(`products/${id}`);
      const wooProduct: WooCommerceProductData = response;

      return ProductConverter.toBasicProduct(ProductConverter.fromWooCommerce(wooProduct, 'woocommerce'));
    } catch (error) {
      console.error('Failed to fetch WooCommerce product:', error);
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const endpoint = `products?per_page=100&search=${encodeURIComponent(query)}&status=publish`;
      const response = await this.makeRequest(endpoint);
      const wooProducts: WooCommerceProductData[] = response;

      return wooProducts.map(wooProduct => ProductConverter.toBasicProduct(ProductConverter.fromWooCommerce(wooProduct, 'woocommerce')));
    } catch (error) {
      console.error('Failed to search WooCommerce products:', error);
      return [];
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
