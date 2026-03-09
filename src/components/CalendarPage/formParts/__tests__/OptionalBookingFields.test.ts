import { isInt } from '../OptionalBookingFields';

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
        expect(isInt('')).toBe(false);
    });

    it('should return false for null and undefined', () => {
        expect(isInt(null)).toBe(false);
        expect(isInt(undefined)).toBe(false);
    });
});
