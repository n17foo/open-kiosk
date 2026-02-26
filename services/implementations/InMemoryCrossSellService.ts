import type { CrossSellService, Product, Basket } from '../interfaces';
import { MOCK_DATA } from '../mockData';

export class InMemoryCrossSellService implements CrossSellService {
  async getCrossSellProducts(productId: string): Promise<Product[]> {
    // Return mock cross-sell products based on the product type
    const product = MOCK_DATA.products.find(p => p.id === productId);
    if (!product) return [];

    // Mock cross-sell logic - return complementary products
    switch (product.categoryId) {
      case 'burgers':
        // Burgers go well with sides and drinks
        return MOCK_DATA.products.filter(p => p.categoryId === 'sides' || p.categoryId === 'drinks').slice(0, 3);

      case 'sides':
        // Sides go well with burgers and drinks
        return [
          ...MOCK_DATA.products.filter(p => p.categoryId === 'burgers').slice(0, 2),
          ...MOCK_DATA.products.filter(p => p.categoryId === 'drinks').slice(0, 1),
        ];

      case 'drinks':
        // Drinks go well with everything
        return MOCK_DATA.products.filter(p => p.categoryId === 'burgers' || p.categoryId === 'sides').slice(0, 3);

      default:
        return [];
    }
  }

  async getCrossSellProductsForBasket(basket: Basket): Promise<Product[]> {
    // Analyze basket contents and suggest cross-sells
    const basketCategories = new Set(
      basket.lines.map(line => {
        const product = MOCK_DATA.products.find(p => p.id === line.productId);
        return product?.categoryId;
      })
    );

    // If basket has burgers but no sides, suggest sides
    if (basketCategories.has('burgers') && !basketCategories.has('sides')) {
      return MOCK_DATA.products.filter(p => p.categoryId === 'sides').slice(0, 2);
    }

    // If basket has food but no drinks, suggest drinks
    if ((basketCategories.has('burgers') || basketCategories.has('sides')) && !basketCategories.has('drinks')) {
      return MOCK_DATA.products.filter(p => p.categoryId === 'drinks').slice(0, 2);
    }

    // Default: suggest popular items not in basket
    return MOCK_DATA.products.filter(p => !basket.lines.some(line => line.productId === p.id)).slice(0, 3);
  }
}
