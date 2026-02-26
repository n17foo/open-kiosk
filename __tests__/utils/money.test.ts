import { toCents, toDollars, addMoney, subtractMoney, multiplyMoney, calculateTax, formatMoney } from '../../utils/money';

describe('money utils', () => {
  describe('toCents', () => {
    it('converts dollars to integer cents', () => {
      expect(toCents(9.99)).toBe(999);
      expect(toCents(0)).toBe(0);
      expect(toCents(100)).toBe(10000);
    });

    it('rounds half-cent values correctly', () => {
      expect(toCents(1.005)).toBe(101);
      expect(toCents(1.994)).toBe(199);
    });
  });

  describe('toDollars', () => {
    it('converts cents to dollars', () => {
      expect(toDollars(999)).toBe(9.99);
      expect(toDollars(0)).toBe(0);
      expect(toDollars(10000)).toBe(100);
    });
  });

  describe('addMoney', () => {
    it('adds two dollar values using integer cents internally', () => {
      expect(addMoney(1.0, 2.0)).toBe(3.0);
      expect(addMoney(0.1, 0.2)).toBe(0.3);
    });
  });

  describe('subtractMoney', () => {
    it('subtracts two dollar values', () => {
      expect(subtractMoney(5.0, 2.0)).toBe(3.0);
    });
  });

  describe('multiplyMoney', () => {
    it('multiplies a price by quantity', () => {
      expect(multiplyMoney(9.99, 3)).toBe(29.97);
    });
  });

  describe('calculateTax', () => {
    it('calculates tax on a dollar amount', () => {
      expect(calculateTax(100, 0.2)).toBe(20);
    });
  });

  describe('formatMoney', () => {
    it('formats dollars to a currency string', () => {
      const formatted = formatMoney(9.99);
      expect(formatted).toContain('9.99');
    });

    it('formats zero', () => {
      const formatted = formatMoney(0);
      expect(formatted).toContain('0.00');
    });
  });
});
