export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function toDollars(cents: number): number {
  return cents / 100;
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function multiplyMoney(price: number, quantity: number): number {
  const priceCents = toCents(price);
  const totalCents = priceCents * quantity;
  return toDollars(totalCents);
}

export function addMoney(a: number, b: number): number {
  return toDollars(toCents(a) + toCents(b));
}

export function subtractMoney(a: number, b: number): number {
  return toDollars(toCents(a) - toCents(b));
}

export function sumMoney(amounts: number[]): number {
  const totalCents = amounts.reduce((sum, amount) => sum + toCents(amount), 0);
  return toDollars(totalCents);
}

export function calculateTax(amount: number, rate: number): number {
  const amountCents = toCents(amount);
  const taxCents = Math.round(amountCents * rate);
  return toDollars(taxCents);
}

export function formatMoney(amount: number, currencyCode?: string): string {
  const info = getCurrencyInfo(currencyCode ?? 'GBP');
  const formatted = Math.abs(amount).toFixed(2);
  const sign = amount < 0 ? '-' : '';

  if (info.symbolPlacement === 'before') {
    return `${sign}${info.symbol}${formatted}`;
  }
  return `${sign}${formatted}${info.symbol}`;
}

export interface LineTotal {
  lineTotal: number;
  taxAmount: number;
}

export function calculateLineTotal(price: number, quantity: number, taxable: boolean, taxRate: number): LineTotal {
  const lineTotal = multiplyMoney(price, quantity);
  const taxAmount = taxable ? calculateTax(lineTotal, taxRate) : 0;
  return { lineTotal, taxAmount };
}

interface CurrencyInfo {
  symbol: string;
  symbolPlacement: 'before' | 'after';
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  const currencies: Record<string, CurrencyInfo> = {
    USD: { symbol: '$', symbolPlacement: 'before' },
    GBP: { symbol: '\u00A3', symbolPlacement: 'before' },
    EUR: { symbol: '\u20AC', symbolPlacement: 'after' },
    CAD: { symbol: 'CA$', symbolPlacement: 'before' },
    AUD: { symbol: 'A$', symbolPlacement: 'before' },
    JPY: { symbol: '\u00A5', symbolPlacement: 'before' },
    CHF: { symbol: 'CHF ', symbolPlacement: 'before' },
    SEK: { symbol: ' kr', symbolPlacement: 'after' },
    NOK: { symbol: ' kr', symbolPlacement: 'after' },
    DKK: { symbol: ' kr', symbolPlacement: 'after' },
  };

  return currencies[code.toUpperCase()] ?? { symbol: code + ' ', symbolPlacement: 'before' };
}
