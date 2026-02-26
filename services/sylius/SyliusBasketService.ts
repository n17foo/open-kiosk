import type { BasketService, Basket, BasketLine } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusBasketService');

export class SyliusBasketService implements BasketService {
  private orderToken: string | null = null;

  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getBasket(): Promise<Basket> {
    if (!this.orderToken) {
      return this.emptyBasket();
    }

    try {
      const response = await this.makeRequest(`shop/orders/${this.orderToken}`);
      return this.mapOrder(response);
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      return this.emptyBasket();
    }
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    try {
      if (!this.orderToken) {
        // Create a new cart (order in "cart" state)
        const cartResponse = await this.makeRequest('shop/orders', {
          method: 'POST',
          body: JSON.stringify({ localeCode: 'en_US' }),
        });
        this.orderToken = cartResponse.tokenValue;
      }

      await this.makeRequest(`shop/orders/${this.orderToken}/items`, {
        method: 'POST',
        body: JSON.stringify({
          productVariant: `/api/v2/shop/product-variants/${line.productId}`,
          quantity: line.qty,
        }),
      });

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to add item to Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    if (!this.orderToken) return this.emptyBasket();

    try {
      const order = await this.makeRequest(`shop/orders/${this.orderToken}`);
      const item = order.items?.find((i: any) => String(i.variant?.id ?? i.id) === productId);

      if (item) {
        await this.makeRequest(`shop/orders/${this.orderToken}/items/${item.id}`, {
          method: 'DELETE',
        });
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to remove item from Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    if (!this.orderToken) return this.emptyBasket();

    try {
      const order = await this.makeRequest(`shop/orders/${this.orderToken}`);
      const item = order.items?.find((i: any) => String(i.variant?.id ?? i.id) === productId);

      if (item) {
        await this.makeRequest(`shop/orders/${this.orderToken}/items/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity }),
        });
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to update Sylius cart item' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async clearBasket(): Promise<Basket> {
    if (this.orderToken) {
      try {
        await this.makeRequest(`shop/orders/${this.orderToken}`, { method: 'DELETE' });
      } catch (error) {
        logger.error({ message: 'Failed to clear Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      }
      this.orderToken = null;
    }
    return this.emptyBasket();
  }

  async applyDiscount(code: string): Promise<Basket> {
    if (!this.orderToken) throw new Error('No active cart');

    try {
      await this.makeRequest(`shop/orders/${this.orderToken}/coupon`, {
        method: 'PATCH',
        body: JSON.stringify({ couponCode: code }),
      });
      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to apply discount to Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeDiscount(): Promise<Basket> {
    if (!this.orderToken) throw new Error('No active cart');

    try {
      await this.makeRequest(`shop/orders/${this.orderToken}/coupon`, {
        method: 'DELETE',
      });
      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to remove discount from Sylius cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private mapOrder(order: any): Basket {
    const currency = order.currencyCode ?? 'GBP';
    const items = order.items ?? [];

    return {
      lines: items.map((item: any) => ({
        productId: String(item.variant?.id ?? item.id),
        name: item.productName ?? item.variant?.name ?? 'Unknown',
        qty: item.quantity ?? 1,
        lineTotal: {
          amount: item.total ?? 0,
          currency,
        },
      })),
      subtotal: {
        amount: order.itemsTotal ?? 0,
        currency,
      },
      tax: {
        amount: order.taxTotal ?? 0,
        currency,
      },
      total: {
        amount: order.total ?? 0,
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
    const response = await fetch(`${this.baseUrl}/api/v2/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': options.method === 'PATCH' ? 'application/merge-patch+json' : 'application/ld+json',
        Accept: 'application/ld+json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (options.method === 'DELETE' && response.status === 204) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`Sylius API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
