export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  symbolPlacement: 'before' | 'after';
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: CurrencyMetadata[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', symbolPlacement: 'before', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3', symbolPlacement: 'before', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC', symbolPlacement: 'after', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', symbolPlacement: 'before', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', symbolPlacement: 'before', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5', symbolPlacement: 'before', decimalPlaces: 0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', symbolPlacement: 'before', decimalPlaces: 2 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', symbolPlacement: 'after', decimalPlaces: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', symbolPlacement: 'after', decimalPlaces: 2 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', symbolPlacement: 'after', decimalPlaces: 2 },
];

export function getCurrencyByCode(code: string): CurrencyMetadata | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase());
}

export function getDefaultCurrency(): CurrencyMetadata {
  return SUPPORTED_CURRENCIES.find(c => c.code === 'GBP')!;
}

export function getSupportedCurrencyCodes(): string[] {
  return SUPPORTED_CURRENCIES.map(c => c.code);
}
