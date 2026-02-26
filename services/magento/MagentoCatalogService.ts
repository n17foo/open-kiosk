import type { CatalogService, Category, KioskCatalog, Product } from '../interfaces';

interface MagentoCategory {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: MagentoCategory[];
  custom_attributes?: Array<{
    attribute_code: string;
    value: string;
  }>;
}

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
}

export class MagentoCatalogService implements CatalogService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getCatalog(): Promise<KioskCatalog> {
    const categories = await this.getCategories();
    const products = await this.getProducts();

    return {
      categories,
      products,
      upgradeOffers: [], // Not used in Magento context
      variantGroups: [], // To be implemented based on Magento product configurations
    };
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.makeRequest('categories');
      const magentoCategories: MagentoCategory[] = this.flattenCategories([response]);

      return magentoCategories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        image: this.getCategoryImage(category),
      }));
    } catch (error) {
      console.error('Failed to fetch Magento categories:', error);
      return [];
    }
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      let searchCriteria = 'searchCriteria[pageSize]=100&searchCriteria[currentPage]=1';

      if (categoryId) {
        searchCriteria += `&searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=${categoryId}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`;
      }

      // Filter for enabled products only
      searchCriteria +=
        '&searchCriteria[filter_groups][1][filters][0][field]=status&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq';

      const response = await this.makeRequest(`products?${searchCriteria}`);
      const products: MagentoProduct[] = response.items || [];

      return products.map(product => ({
        id: product.id.toString(),
        categoryId: product.extension_attributes?.category_links?.[0]?.category_id || 'default',
        name: product.name,
        description: this.getProductDescription(product),
        price: {
          amount: Math.round(product.price * 100), // Convert to cents
          currency: 'GBP', // Assuming GBP, can be made configurable
        },
        image: this.getProductImage(product),
      }));
    } catch (error) {
      console.error('Failed to fetch Magento products:', error);
      return [];
    }
  }

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

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const searchCriteria = `searchCriteria[pageSize]=100&searchCriteria[currentPage]=1&searchCriteria[filter_groups][0][filters][0][field]=name&searchCriteria[filter_groups][0][filters][0][value]=%${query}%&searchCriteria[filter_groups][0][filters][0][condition_type]=like&searchCriteria[filter_groups][1][filters][0][field]=status&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq`;

      const response = await this.makeRequest(`products?${searchCriteria}`);
      const products: MagentoProduct[] = response.items || [];

      return products.map(product => ({
        id: product.id.toString(),
        categoryId: product.extension_attributes?.category_links?.[0]?.category_id || 'default',
        name: product.name,
        description: this.getProductDescription(product),
        price: {
          amount: Math.round(product.price * 100),
          currency: 'GBP',
        },
        image: this.getProductImage(product),
      }));
    } catch (error) {
      console.error('Failed to search Magento products:', error);
      return [];
    }
  }

  private flattenCategories(categories: MagentoCategory[]): MagentoCategory[] {
    const flattened: MagentoCategory[] = [];

    for (const category of categories) {
      if (category.is_active && category.level > 1) {
        // Skip root category
        flattened.push(category);
      }
      if (category.children_data && category.children_data.length > 0) {
        flattened.push(...this.flattenCategories(category.children_data));
      }
    }

    return flattened;
  }

  private getProductImage(product: MagentoProduct): string | undefined {
    const imageEntry = product.media_gallery_entries?.find(entry => entry.types.includes('image') || entry.types.includes('small_image'));
    if (imageEntry) {
      return `${this.baseUrl}/media/catalog/product${imageEntry.file}`;
    }
    return undefined;
  }

  private getCategoryImage(category: MagentoCategory): string | undefined {
    const imageAttr = category.custom_attributes?.find(attr => attr.attribute_code === 'image');
    if (imageAttr && typeof imageAttr.value === 'string') {
      return `${this.baseUrl}/media/catalog/category/${imageAttr.value}`;
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
