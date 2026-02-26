import type { BasketService, Basket, BasketLine } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixBasketService');

export class WixBasketService implements BasketService {
  private cartId: string | null = null;

  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getBasket(): Promise<Basket> {
    if (!this.cartId) {
      return this.emptyBasket();
    }

    try {
      const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}`);
      return this.mapCart(response.cart);
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      return this.emptyBasket();
    }
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    try {
      if (!this.cartId) {
        const response = await this.makeRequest('ecom/v1/carts', {
          method: 'POST',
          body: JSON.stringify({
            lineItems: [
              {
                catalogReference: {
                  catalogItemId: line.productId,
                  appId: '1380b703-ce81-ff05-f115-39571d94dfcd', // Wix Stores app ID
                },
                quantity: line.qty,
              },
            ],
          }),
        });
        this.cartId = response.cart?.id;
        return this.mapCart(response.cart);
      }

      const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}/addToCart`, {
        method: 'POST',
        body: JSON.stringify({
          lineItems: [
            {
              catalogReference: {
                catalogItemId: line.productId,
                appId: '1380b703-ce81-ff05-f115-39571d94dfcd',
              },
              quantity: line.qty,
            },
          ],
        }),
      });
      return this.mapCart(response.cart);
    } catch (error) {
      logger.error({ message: 'Failed to add item to Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`ecom/v1/carts/${this.cartId}`);
      const lineItem = cart.cart?.lineItems?.find((item: any) => item.catalogReference?.catalogItemId === productId);

      if (lineItem) {
        const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}/removeLineItems`, {
          method: 'POST',
          body: JSON.stringify({ lineItemIds: [lineItem._id] }),
        });
        return this.mapCart(response.cart);
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to remove item from Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`ecom/v1/carts/${this.cartId}`);
      const lineItem = cart.cart?.lineItems?.find((item: any) => item.catalogReference?.catalogItemId === productId);

      if (lineItem) {
        const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}/updateLineItemsQuantity`, {
          method: 'POST',
          body: JSON.stringify({
            lineItems: [{ _id: lineItem._id, quantity }],
          }),
        });
        return this.mapCart(response.cart);
      }

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to update Wix cart item' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async clearBasket(): Promise<Basket> {
    if (this.cartId) {
      try {
        await this.makeRequest(`ecom/v1/carts/${this.cartId}`, { method: 'DELETE' });
      } catch (error) {
        logger.error({ message: 'Failed to clear Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      }
      this.cartId = null;
    }
    return this.emptyBasket();
  }

  async applyDiscount(code: string): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');

    try {
      const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}/applyCoupon`, {
        method: 'POST',
        body: JSON.stringify({ couponCode: code }),
      });
      return this.mapCart(response.cart);
    } catch (error) {
      logger.error({ message: 'Failed to apply discount to Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeDiscount(): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');

    try {
      const response = await this.makeRequest(`ecom/v1/carts/${this.cartId}/removeCoupon`, {
        method: 'POST',
      });
      return this.mapCart(response.cart);
    } catch (error) {
      logger.error({ message: 'Failed to remove discount from Wix cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private mapCart(cart: any): Basket {
    const lineItems = cart?.lineItems ?? [];
    const currency = cart?.currency ?? 'GBP';

    return {
      lines: lineItems.map((item: any) => ({
        productId: item.catalogReference?.catalogItemId ?? item._id,
        name: item.productName?.translated ?? item.productName?.original ?? 'Unknown',
        qty: item.quantity ?? 1,
        lineTotal: {
          amount: Math.round(parseFloat(item.price?.amount ?? '0') * 100 * (item.quantity ?? 1)),
          currency,
        },
      })),
      subtotal: {
        amount: Math.round(parseFloat(cart?.subtotal?.amount ?? '0') * 100),
        currency,
      },
      tax: {
        amount: Math.round(parseFloat(cart?.taxIncludedInPrice ? '0' : (cart?.tax?.amount ?? '0')) * 100),
        currency,
      },
      total: {
        amount: Math.round(parseFloat(cart?.subtotal?.amount ?? '0') * 100),
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
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
        ...options.headers,
      },
    });

    if (options.method === 'DELETE' && response.status === 204) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
