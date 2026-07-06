import { escapeHtml, isInt } from '../utils';

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('should convert null and undefined to strings', () => {
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });
});

describe('isInt', () => {
  it('should return true for integer strings', () => {
    expect(isInt('0')).toBe(true);
    expect(isInt('1')).toBe(true);
    expect(isInt('42')).toBe(true);
    expect(isInt('100')).toBe(true);
  });

  it('should return true for integer numbers', () => {
    expect(isInt(0)).toBe(true);
    expect(isInt(5)).toBe(true);
    expect(isInt(-3)).toBe(true);
  });

  it('should return false for float numbers', () => {
    expect(isInt(1.5)).toBe(false);
    expect(isInt(3.14)).toBe(false);
    expect(isInt('1.5')).toBe(false);
  });

  it('should return false for non-numeric strings', () => {
    expect(isInt('abc')).toBe(false);
    expect(isInt('first_name')).toBe(false);
    expect(isInt('1abc')).toBe(false);
    expect(isInt('abc1')).toBe(false);
    expect(isInt('1.0.0')).toBe(false);
    expect(isInt('')).toBe(false);
  });

  it('should return true for values outside 32-bit range', () => {
    expect(isInt('2147483648')).toBe(true);
    expect(isInt(2147483648)).toBe(true);
    expect(isInt('-2147483649')).toBe(true);
    expect(isInt(-2147483649)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isInt(null)).toBe(false);
    expect(isInt(undefined)).toBe(false);
  });
});
