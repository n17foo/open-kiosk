import type { BasketService, Basket, BasketLine } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceBasketService');

export class BigCommerceBasketService implements BasketService {
  private cartId: string | null = null;

  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getBasket(): Promise<Basket> {
    if (!this.cartId) {
      return this.emptyBasket();
    }

    try {
      const response = await this.makeRequest(`carts/${this.cartId}?include=line_items`);
      return this.mapCart(response.data);
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce cart' }, error instanceof Error ? error : new Error(String(error)));
      return this.emptyBasket();
    }
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    try {
      if (!this.cartId) {
        // Create a new cart with the line item
        const response = await this.makeRequest('carts', {
          method: 'POST',
          body: JSON.stringify({
            line_items: [
              {
                product_id: Number(line.productId),
                quantity: line.qty,
              },
            ],
          }),
        });
        this.cartId = response.data.id;
        return this.mapCart(response.data);
      }

      // Add item to existing cart
      const response = await this.makeRequest(`carts/${this.cartId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          line_items: [
            {
              product_id: Number(line.productId),
              quantity: line.qty,
            },
          ],
        }),
      });
      return this.mapCart(response.data);
    } catch (error) {
      logger.error({ message: 'Failed to add item to BigCommerce cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`carts/${this.cartId}?include=line_items`);
      const lineItem = cart.data.line_items?.physical_items?.find((item: any) => String(item.product_id) === productId);

      if (lineItem) {
        await this.makeRequest(`carts/${this.cartId}/items/${lineItem.id}`, {
          method: 'DELETE',
        });
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to remove item from BigCommerce cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`carts/${this.cartId}?include=line_items`);
      const lineItem = cart.data.line_items?.physical_items?.find((item: any) => String(item.product_id) === productId);

      if (lineItem) {
        await this.makeRequest(`carts/${this.cartId}/items/${lineItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            line_item: {
              product_id: Number(productId),
              quantity,
            },
          }),
        });
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to update BigCommerce cart item' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async clearBasket(): Promise<Basket> {
    if (this.cartId) {
      try {
        await this.makeRequest(`carts/${this.cartId}`, { method: 'DELETE' });
      } catch (error) {
        logger.error({ message: 'Failed to clear BigCommerce cart' }, error instanceof Error ? error : new Error(String(error)));
      }
      this.cartId = null;
    }
    return this.emptyBasket();
  }

  async applyDiscount(code: string): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');

    try {
      await this.makeRequest(`checkouts/${this.cartId}/coupons`, {
        method: 'POST',
        body: JSON.stringify({ coupon_code: code }),
      });
      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to apply discount to BigCommerce cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeDiscount(): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');

    try {
      const checkout = await this.makeRequest(`checkouts/${this.cartId}`);
      const couponId = checkout.data?.coupons?.[0]?.id;
      if (couponId) {
        await this.makeRequest(`checkouts/${this.cartId}/coupons/${couponId}`, {
          method: 'DELETE',
        });
      }
      return this.getBasket();
    } catch (error) {
      logger.error(
        { message: 'Failed to remove discount from BigCommerce cart' },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  private mapCart(cart: any): Basket {
    const physicalItems = cart.line_items?.physical_items ?? [];
    const currency = cart.currency?.code ?? 'GBP';

    return {
      lines: physicalItems.map((item: any) => ({
        productId: String(item.product_id),
        name: item.name,
        qty: item.quantity,
        lineTotal: {
          amount: Math.round(item.extended_sale_price * 100),
          currency,
        },
      })),
      subtotal: {
        amount: Math.round((cart.base_amount ?? 0) * 100),
        currency,
      },
      tax: {
        amount: Math.round((cart.tax_included ?? 0) * 100),
        currency,
      },
      total: {
        amount: Math.round((cart.cart_amount ?? 0) * 100),
        currency,
      },
    };
  }

  private emptyBasket(): Basket {
    return {
      lines: [],
      subtotal: { amount: 0, currency: 'GBP' },
      tax: { amount: 0, currency: 'GBP' },
      total: { amount: 0, currency: 'GBP' },
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v3/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
        ...options.headers,
      },
    });

    if (options.method === 'DELETE' && response.status === 204) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
