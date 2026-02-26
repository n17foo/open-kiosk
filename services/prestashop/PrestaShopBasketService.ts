import type { BasketService, Basket, BasketLine } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopBasketService');

export class PrestaShopBasketService implements BasketService {
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
      const response = await this.makeRequest(`carts/${this.cartId}?display=full`);
      return this.mapCart(response.cart);
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop cart' }, error instanceof Error ? error : new Error(String(error)));
      return this.emptyBasket();
    }
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    try {
      if (!this.cartId) {
        // Create a new cart
        const response = await this.makeRequest('carts', {
          method: 'POST',
          body: this.buildXml('cart', {
            id_currency: '1',
            id_lang: '1',
          }),
        });
        this.cartId = String(response.cart?.id);
      }

      // Add product to cart via cart row
      await this.makeRequest(`carts/${this.cartId}`, {
        method: 'PUT',
        body: this.buildCartRowXml(this.cartId, line.productId, line.qty),
      });

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to add item to PrestaShop cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`carts/${this.cartId}?display=full`);
      const rows = cart.cart?.associations?.cart_rows ?? [];
      const updatedRows = rows.filter((row: any) => String(row.id_product) !== productId);

      await this.makeRequest(`carts/${this.cartId}`, {
        method: 'PUT',
        body: this.buildCartWithRowsXml(this.cartId, updatedRows),
      });

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to remove item from PrestaShop cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    if (!this.cartId) return this.emptyBasket();

    try {
      const cart = await this.makeRequest(`carts/${this.cartId}?display=full`);
      const rows = cart.cart?.associations?.cart_rows ?? [];
      const updatedRows = rows.map((row: any) => (String(row.id_product) === productId ? { ...row, quantity } : row));

      await this.makeRequest(`carts/${this.cartId}`, {
        method: 'PUT',
        body: this.buildCartWithRowsXml(this.cartId, updatedRows),
      });

      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to update PrestaShop cart item' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async clearBasket(): Promise<Basket> {
    if (this.cartId) {
      try {
        await this.makeRequest(`carts/${this.cartId}`, { method: 'DELETE' });
      } catch (error) {
        logger.error({ message: 'Failed to clear PrestaShop cart' }, error instanceof Error ? error : new Error(String(error)));
      }
      this.cartId = null;
    }
    return this.emptyBasket();
  }

  async applyDiscount(code: string): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');

    try {
      // Look up cart rule by code
      const ruleResponse = await this.makeRequest(`cart_rules?filter[code]=${encodeURIComponent(code)}`);
      const ruleId = ruleResponse.cart_rules?.[0]?.id;

      if (!ruleId) throw new Error('Discount code not found');

      // Apply cart rule (PrestaShop handles this through order creation)
      // For now, store the discount code for checkout
      return this.getBasket();
    } catch (error) {
      logger.error({ message: 'Failed to apply discount to PrestaShop cart' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async removeDiscount(): Promise<Basket> {
    if (!this.cartId) throw new Error('No active cart');
    return this.getBasket();
  }

  private mapCart(cart: any): Basket {
    const rows = cart?.associations?.cart_rows ?? [];
    const currency = 'GBP'; // Would be resolved from cart's id_currency

    return {
      lines: rows.map((row: any) => ({
        productId: String(row.id_product),
        name: row.product_name ?? `Product #${row.id_product}`,
        qty: Number(row.quantity ?? 1),
        lineTotal: {
          amount: Math.round(Number(row.total_price_tax_incl ?? 0) * 100),
          currency,
        },
      })),
      subtotal: {
        amount: rows.reduce((sum: number, row: any) => sum + Math.round(Number(row.total_price_tax_excl ?? 0) * 100), 0),
        currency,
      },
      tax: {
        amount: rows.reduce(
          (sum: number, row: any) =>
            sum + Math.round((Number(row.total_price_tax_incl ?? 0) - Number(row.total_price_tax_excl ?? 0)) * 100),
          0
        ),
        currency,
      },
      total: {
        amount: rows.reduce((sum: number, row: any) => sum + Math.round(Number(row.total_price_tax_incl ?? 0) * 100), 0),
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

  private buildXml(resource: string, fields: Record<string, string>): string {
    const fieldsXml = Object.entries(fields)
      .map(([key, value]) => `<${key}>${value}</${key}>`)
      .join('');
    return `<?xml version="1.0" encoding="UTF-8"?><prestashop><${resource}>${fieldsXml}</${resource}></prestashop>`;
  }

  private buildCartRowXml(cartId: string, productId: string, quantity: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?><prestashop><cart><id>${cartId}</id><associations><cart_rows><cart_row><id_product>${productId}</id_product><id_product_attribute>0</id_product_attribute><quantity>${quantity}</quantity></cart_row></cart_rows></associations></cart></prestashop>`;
  }

  private buildCartWithRowsXml(cartId: string, rows: any[]): string {
    const rowsXml = rows
      .map(
        (row: any) =>
          `<cart_row><id_product>${row.id_product}</id_product><id_product_attribute>${row.id_product_attribute ?? 0}</id_product_attribute><quantity>${row.quantity}</quantity></cart_row>`
      )
      .join('');
    return `<?xml version="1.0" encoding="UTF-8"?><prestashop><cart><id>${cartId}</id><associations><cart_rows>${rowsXml}</cart_rows></associations></cart></prestashop>`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const auth = btoa(`${this.apiKey}:`);
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}/api/${endpoint}${separator}output_format=JSON`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        ...(options.body && typeof options.body === 'string' && options.body.startsWith('<?xml')
          ? { 'Content-Type': 'text/xml' }
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    if (options.method === 'DELETE' && (response.status === 200 || response.status === 204)) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
