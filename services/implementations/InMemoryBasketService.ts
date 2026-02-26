import type { BasketService, Basket, BasketLine } from '../interfaces';
import type { Money } from '../types';
import { createEmptyBasket } from '../utils';

const cloneMoney = (money: Money): Money => ({ amount: money.amount, currency: money.currency });

export class InMemoryBasketService implements BasketService {
  private basket: Basket = createEmptyBasket();

  async getBasket(): Promise<Basket> {
    return this.snapshot();
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    const existing = this.basket.lines.find(l => l.productId === line.productId);
    if (existing) {
      existing.qty += line.qty;
      existing.lineTotal.amount += line.lineTotal.amount;
      if (line.variants?.length) {
        existing.variants = [...(existing.variants ?? []), ...line.variants];
      }
    } else {
      this.basket.lines.push({
        ...line,
        lineTotal: cloneMoney(line.lineTotal),
        variants: line.variants ? [...line.variants] : undefined,
      });
    }

    this.recalculate();
    return this.snapshot();
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    this.basket.lines = this.basket.lines.filter(line => line.productId !== productId);
    this.recalculate();
    return this.snapshot();
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    if (quantity <= 0) {
      return this.removeFromBasket(productId);
    }

    const line = this.basket.lines.find(l => l.productId === productId);
    if (!line) {
      throw new Error(`Product ${productId} not found in basket`);
    }

    // Recalculate line total based on new quantity
    const unitPrice = line.lineTotal.amount / line.qty;
    line.qty = quantity;
    line.lineTotal.amount = unitPrice * quantity;

    this.recalculate();
    return this.snapshot();
  }

  async clearBasket(): Promise<Basket> {
    this.basket = createEmptyBasket();
    return this.snapshot();
  }

  async applyDiscount(code: string): Promise<Basket> {
    // Mock discount application
    if (code === 'DISCOUNT10') {
      this.basket.subtotal.amount = Math.round(this.basket.subtotal.amount * 0.9);
      this.recalculate();
    }
    return this.snapshot();
  }

  async removeDiscount(): Promise<Basket> {
    // Reset basket calculations
    this.recalculate();
    return this.snapshot();
  }

  private recalculate() {
    const subtotal = this.basket.lines.reduce((sum, line) => sum + line.lineTotal.amount, 0);
    const tax = Math.round(subtotal * 0.2);

    this.basket.subtotal.amount = subtotal;
    this.basket.tax.amount = tax;
    this.basket.total.amount = subtotal + tax;
  }

  private snapshot(): Basket {
    return {
      lines: this.basket.lines.map(line => ({
        ...line,
        lineTotal: cloneMoney(line.lineTotal),
        variants: line.variants ? [...line.variants] : undefined,
      })),
      subtotal: cloneMoney(this.basket.subtotal),
      tax: cloneMoney(this.basket.tax),
      total: cloneMoney(this.basket.total),
    };
  }
}
