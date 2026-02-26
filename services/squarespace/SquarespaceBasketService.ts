import type { BasketService, Basket, BasketLine } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SquarespaceBasketService');

/**
 * Squarespace Commerce API does not have a native cart/basket API.
 * We manage the basket in-memory and create the order at checkout time.
 */
export class SquarespaceBasketService implements BasketService {
  private lines: BasketLine[] = [];
  private currency = 'GBP';

  constructor(
    private _baseUrl: string,
    private _accessToken: string
  ) {}

  async getBasket(): Promise<Basket> {
    return this.buildBasket();
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    const existing = this.lines.find(l => l.productId === line.productId);
    if (existing) {
      existing.qty += line.qty;
      existing.lineTotal = {
        amount: existing.lineTotal.amount + line.lineTotal.amount,
        currency: this.currency,
      };
    } else {
      this.lines.push({ ...line });
    }
    logger.info(`Added ${line.name} to basket`);
    return this.buildBasket();
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    this.lines = this.lines.filter(l => l.productId !== productId);
    return this.buildBasket();
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    const line = this.lines.find(l => l.productId === productId);
    if (line) {
      const unitPrice = line.lineTotal.amount / line.qty;
      line.qty = quantity;
      line.lineTotal = { amount: Math.round(unitPrice * quantity), currency: this.currency };
    }
    return this.buildBasket();
  }

  async clearBasket(): Promise<Basket> {
    this.lines = [];
    return this.buildBasket();
  }

  async applyDiscount(_code: string): Promise<Basket> {
    // Squarespace discount codes are applied at order creation
    logger.warn('Discount codes are applied during checkout on Squarespace');
    return this.buildBasket();
  }

  async removeDiscount(): Promise<Basket> {
    return this.buildBasket();
  }

  private buildBasket(): Basket {
    const subtotal = this.lines.reduce((sum, l) => sum + l.lineTotal.amount, 0);

    return {
      lines: [...this.lines],
      subtotal: { amount: subtotal, currency: this.currency },
      tax: { amount: 0, currency: this.currency },
      total: { amount: subtotal, currency: this.currency },
    };
  }
}
