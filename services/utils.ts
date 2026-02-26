import type { Basket, BasketLine, Money } from './types';

const DEFAULT_CURRENCY = 'GBP';

const makeMoney = (amount = 0, currency = DEFAULT_CURRENCY): Money => ({ amount, currency });

const calculateTotals = (lines: BasketLine[]) => {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal.amount, 0);
  const tax = Math.round(subtotal * 0.2);
  const total = subtotal + tax;
  return {
    subtotal: makeMoney(subtotal),
    tax: makeMoney(tax),
    total: makeMoney(total),
  };
};

export const createBasket = (lines: BasketLine[] = []): Basket => {
  const totals = calculateTotals(lines);
  return {
    lines,
    ...totals,
  };
};

export const createEmptyBasket = (): Basket => createBasket();

export const withUpdatedTotals = (basket: Basket): Basket => ({
  ...basket,
  ...calculateTotals(basket.lines),
});

export const formatMoney = (amount: number, currency = DEFAULT_CURRENCY): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount / 100);
