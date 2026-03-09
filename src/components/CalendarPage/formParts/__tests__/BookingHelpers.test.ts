import { subYears, addYears, format } from 'date-fns';
import {
    createPeronsArray,
    initializeBookingFields,
    byString,
    validateAge
} from '../BookingHelpers';

describe('createPeronsArray', () => {
    it('should create an array from 0 to persons (inclusive)', () => {
        expect(createPeronsArray(3)).toStrictEqual([0, 1, 2, 3]);
    });

    it('should return [0] for 0 persons', () => {
        expect(createPeronsArray(0)).toStrictEqual([0]);
    });

    it('should create a correct array for a larger number', () => {
        const result = createPeronsArray(5);
        expect(result).toHaveLength(6);
        expect(result[0]).toBe(0);
        expect(result[5]).toBe(5);
    });
});

describe('initializeBookingFields', () => {
    it('should create an object with empty string values for each field id', () => {
        const bookingFields = [
            { id: 'first_name' },
            { id: 'last_name' },
            { id: 'email' }
        ];
        const result = initializeBookingFields(bookingFields);
        expect(result).toEqual({
            first_name: '',
            last_name: '',
            email: ''
        });
    });

    it('should return an empty object for an empty array', () => {
        expect(initializeBookingFields([])).toEqual({});
    });

    it('should handle a single booking field', () => {
        const result = initializeBookingFields([{ id: 'phone' }]);
        expect(result).toEqual({ phone: '' });
    });
});

describe('byString', () => {
    it('should retrieve a top-level property', () => {
        const obj = { name: 'Alice' };
        expect(byString(obj, 'name')).toBe('Alice');
    });

    it('should retrieve a nested property using dot notation', () => {
        const obj = { user: { address: { city: 'Amsterdam' } } };
        expect(byString(obj, 'user.address.city')).toBe('Amsterdam');
    });

    it('should retrieve a property using bracket notation', () => {
        const obj = { items: ['a', 'b', 'c'] };
        expect(byString(obj, 'items[1]')).toBe('b');
    });

    it('should return undefined for a missing property', () => {
        const obj = { name: 'Alice' };
        expect(byString(obj, 'missing')).toBeUndefined();
    });

    it('should return undefined for a missing nested property', () => {
        const obj = { user: { name: 'Alice' } };
        expect(byString(obj, 'user.address.city')).toBeUndefined();
    });
});

describe('validateAge', () => {
    it('should return true for someone under 18 years old', () => {
        const tenYearsAgo = format(subYears(new Date(), 10), 'yyyy-MM-dd');
        expect(validateAge(tenYearsAgo)).toBe(true);
    });

    it('should return false for someone exactly 18 years old', () => {
        const eighteenYearsAgo = format(subYears(new Date(), 18), 'yyyy-MM-dd');
        expect(validateAge(eighteenYearsAgo)).toBe(false);
    });

    it('should return false for someone over 18 years old', () => {
        const twentyYearsAgo = format(subYears(new Date(), 20), 'yyyy-MM-dd');
        expect(validateAge(twentyYearsAgo)).toBe(false);
    });

    it('should return true for a date in the future (not yet born / very young)', () => {
        const futureDate = format(addYears(new Date(), 1), 'yyyy-MM-dd');
        expect(validateAge(futureDate)).toBe(true);
    });
});
