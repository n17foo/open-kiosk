import type { BasketService, Basket, BasketLine } from '../interfaces';

export class ShopifyBasketService implements BasketService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getBasket(): Promise<Basket> {
    // In a real implementation, this would fetch cart from Shopify
    // For now, return empty basket
    return {
      lines: [],
      subtotal: { amount: 0, currency: 'GBP' },
      tax: { amount: 0, currency: 'GBP' },
      total: { amount: 0, currency: 'GBP' },
    };
  }

  async addToBasket(_line: BasketLine): Promise<Basket> {
    // TODO: Implement Shopify cart creation/update
    throw new Error('Shopify basket operations not yet implemented');
  }

  async removeFromBasket(_productId: string): Promise<Basket> {
    // TODO: Implement removal from Shopify cart
    throw new Error('Shopify basket operations not yet implemented');
  }

  async updateBasketItem(_productId: string, _quantity: number): Promise<Basket> {
    // TODO: Implement quantity update in Shopify cart
    throw new Error('Shopify basket operations not yet implemented');
  }

  async clearBasket(): Promise<Basket> {
    // TODO: Clear Shopify cart
    return this.getBasket();
  }

  async applyDiscount(_code: string): Promise<Basket> {
    // TODO: Apply discount code to Shopify cart
    throw new Error('Shopify discount application not yet implemented');
  }

  async removeDiscount(): Promise<Basket> {
    // TODO: Remove discount from Shopify cart
    throw new Error('Shopify discount removal not yet implemented');
  }
}
