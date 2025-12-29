import type { BasketService, Basket, BasketLine, Money } from '../interfaces';

export class MagentoBasketService implements BasketService {
  private basket: Basket = {
    lines: [],
    subtotal: { amount: 0, currency: 'GBP' },
    tax: { amount: 0, currency: 'GBP' },
    total: { amount: 0, currency: 'GBP' },
  };

  constructor(private baseUrl: string, private accessToken: string) {}

  async getBasket(): Promise<Basket> {
    return { ...this.basket };
  }

  async addToBasket(line: BasketLine): Promise<Basket> {
    const existingLineIndex = this.basket.lines.findIndex(l => l.productId === line.productId);

    if (existingLineIndex >= 0) {
      // Update existing line
      this.basket.lines[existingLineIndex].qty += line.qty;
      this.basket.lines[existingLineIndex].lineTotal.amount += line.lineTotal.amount;
    } else {
      // Add new line
      this.basket.lines.push({ ...line });
    }

    this.recalculateTotals();
    return this.getBasket();
  }

  async removeFromBasket(productId: string): Promise<Basket> {
    this.basket.lines = this.basket.lines.filter(line => line.productId !== productId);
    this.recalculateTotals();
    return this.getBasket();
  }

  async updateBasketItem(productId: string, quantity: number): Promise<Basket> {
    const lineIndex = this.basket.lines.findIndex(l => l.productId === productId);

    if (lineIndex >= 0) {
      if (quantity <= 0) {
        return this.removeFromBasket(productId);
      }

      const line = this.basket.lines[lineIndex];
      const unitPrice = Math.round(line.lineTotal.amount / line.qty);
      line.qty = quantity;
      line.lineTotal.amount = unitPrice * quantity;
    }

    this.recalculateTotals();
    return this.getBasket();
  }

  async clearBasket(): Promise<Basket> {
    this.basket.lines = [];
    this.recalculateTotals();
    return this.getBasket();
  }

  async applyDiscount(code: string): Promise<Basket> {
    // TODO: Implement discount application with Magento cart rules API
    console.log(`Applying discount code: ${code}`);
    // For now, just return the current basket
    return this.getBasket();
  }

  async removeDiscount(): Promise<Basket> {
    // TODO: Implement discount removal
    return this.getBasket();
  }

  private recalculateTotals(): void {
    const subtotal = this.basket.lines.reduce((sum, line) => sum + line.lineTotal.amount, 0);
    this.basket.subtotal.amount = subtotal;

    // Simple tax calculation (20% VAT for UK)
    this.basket.tax.amount = Math.round(subtotal * 0.20);

    this.basket.total.amount = subtotal + this.basket.tax.amount;
  }
}
