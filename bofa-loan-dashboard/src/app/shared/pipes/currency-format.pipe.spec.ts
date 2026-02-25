import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;

  beforeEach(() => {
    pipe = new CurrencyFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('USD formatting', () => {
    it('should format whole numbers', () => {
      expect(pipe.transform(1000)).toBe('$1,000.00');
    });

    it('should format decimal numbers', () => {
      expect(pipe.transform(1234.56)).toBe('$1,234.56');
    });

    it('should format zero', () => {
      expect(pipe.transform(0)).toBe('$0.00');
    });

    it('should format large numbers', () => {
      expect(pipe.transform(1000000)).toBe('$1,000,000.00');
    });

    it('should format negative numbers', () => {
      expect(pipe.transform(-2500)).toBe('-$2,500.00');
    });

    it('should default to USD when no currency code provided', () => {
      const result = pipe.transform(100);
      expect(result).toContain('$');
      expect(result).toContain('100.00');
    });
  });

  describe('other currencies', () => {
    it('should format EUR', () => {
      const result = pipe.transform(1000, 'EUR');
      expect(result).toContain('1,000.00');
    });

    it('should format GBP', () => {
      const result = pipe.transform(1000, 'GBP');
      expect(result).toContain('1,000.00');
    });

    it('should format JPY', () => {
      const result = pipe.transform(1000, 'JPY');
      expect(result).toContain('1,000');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for null', () => {
      expect(pipe.transform(null as any)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(pipe.transform(undefined as any)).toBe('');
    });

    it('should handle small decimal values', () => {
      expect(pipe.transform(0.01)).toBe('$0.01');
    });

    it('should round to 2 decimal places', () => {
      expect(pipe.transform(10.999)).toBe('$11.00');
    });
  });
});
