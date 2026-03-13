import { subYears, format } from 'date-fns';
import { validateForm } from '../Validations';
import { HouseType } from '../../../../types';

beforeEach(() => {
  (window as any).__localeId__ = 'en';
});

afterEach(() => {
  delete (window as any).__localeId__;
});

const baseHouse: HouseType = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'villa',
  persons: 4,
  bedrooms: 2,
  bathrooms: 1,
  minimum_week_price: 500,
  max_nights: 14,
  babies_extra: 0,
  city: 'Amsterdam',
  province: 'NH',
  country_name: 'Netherlands',
  description: 'A lovely test house'
};

const baseValues = {
  adults: 2,
  children: 0,
  babies: 0,
  persons: 0,
  discount: 0,
  cancel_insurance: 0
};

describe('validateForm - required fields', () => {
  it('returns no errors when all required fields are filled', () => {
    const bookingFields = [{ id: 'first_name', required: true }];
    const values = { ...baseValues, first_name: 'John' };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors).toEqual({});
  });

  it('returns an error message for a missing required field', () => {
    const bookingFields = [{ id: 'first_name', required: true }];
    const values = { ...baseValues, first_name: '' };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['first_name']).toBe('This field is required.');
  });

  it('returns an error when a required field is absent from values', () => {
    const bookingFields = [{ id: 'last_name', required: true }];
    const errors = validateForm({ ...baseValues }, baseHouse, bookingFields as any);
    expect(errors['last_name']).toBe('This field is required.');
  });

  it('does not return an error for an optional (non-required) field that is empty', () => {
    const bookingFields = [{ id: 'comment', required: false }];
    const values = { ...baseValues, comment: '' };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['comment']).toBeUndefined();
  });

  it('does not return an error for a non-required field that is not present', () => {
    const bookingFields = [{ id: 'preposition', required: false }];
    const errors = validateForm({ ...baseValues }, baseHouse, bookingFields as any);
    expect(errors['preposition']).toBeUndefined();
  });

  it('validates multiple required fields independently', () => {
    const bookingFields = [
      { id: 'first_name', required: true },
      { id: 'last_name', required: true },
      { id: 'email', required: true }
    ];
    const values = { ...baseValues, first_name: 'John', last_name: '', email: '' };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['first_name']).toBeUndefined();
    expect(errors['last_name']).toBe('This field is required.');
    expect(errors['email']).toBe('This field is required.');
  });
});

describe('validateForm - booking_field type (integer id)', () => {
  it('returns an error for a missing required booking_field', () => {
    const bookingFields = [{ id: '42', required: true }];
    const values = { ...baseValues, extra_fields: { booking_field_42: '' } };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['42']).toBe('This field is required.');
  });

  it('does not return an error when a required booking_field is filled', () => {
    const bookingFields = [{ id: '42', required: true }];
    const values = { ...baseValues, extra_fields: { booking_field_42: 'some value' } };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['42']).toBeUndefined();
  });

  it('does not return an error for an optional booking_field that is empty', () => {
    const bookingFields = [{ id: '7', required: false }];
    const values = { ...baseValues, extra_fields: { booking_field_7: '' } };
    const errors = validateForm(values, baseHouse, bookingFields as any);
    expect(errors['7']).toBeUndefined();
  });
});

describe('validateForm - adults validation', () => {
  it('returns an error when no adults are selected and there is a persons limit', () => {
    const values = { ...baseValues, adults: 0, children: 1 };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['adults']).toBe('Choose at least 1 adult.');
  });

  it('does not return an adults error when at least 1 adult is selected', () => {
    const values = { ...baseValues, adults: 1, children: 0 };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['adults']).toBeUndefined();
  });

  it('does not return an adults error when the house has no persons limit (0)', () => {
    const house = { ...baseHouse, persons: 0 };
    const values = { ...baseValues, adults: 0, children: 0 };
    const errors = validateForm(values, house, [] as any);
    expect(errors['adults']).toBeUndefined();
  });
});

describe('validateForm - max persons', () => {
  it('returns an error when the number of persons exceeds the house limit', () => {
    const values = { ...baseValues, adults: 5, children: 0 };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['max_persons']).toBe('Too many people have been selected.');
  });

  it('does not return an error when persons are exactly at the limit', () => {
    const values = { ...baseValues, adults: 4, children: 0 };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['max_persons']).toBeUndefined();
  });

  it('does not return an error when persons are below the limit', () => {
    const values = { ...baseValues, adults: 2, children: 1 };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['max_persons']).toBeUndefined();
  });

  it('accounts for babies_extra when calculating babies count', () => {
    const house = { ...baseHouse, babies_extra: 1, persons: 3 };
    // 1 baby but 1 is "extra" (not counted) → effective babies = 0
    const values = { ...baseValues, adults: 3, children: 0, babies: 1 };
    const errors = validateForm(values, house, [] as any);
    expect(errors['max_persons']).toBeUndefined();
  });
});

describe('validateForm - discount reason', () => {
  it('returns an error when a discount is applied but no reason is given', () => {
    const values = { ...baseValues, discount: 50, discount_reason: '' };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['discount_reason']).toBe('You must indicate a valid discount reason');
  });

  it('does not return an error when a discount is applied and a reason is provided', () => {
    const values = { ...baseValues, discount: 50, discount_reason: 'VIP guest' };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['discount_reason']).toBeUndefined();
  });

  it('does not return an error when discount is 0', () => {
    const values = { ...baseValues, discount: 0, discount_reason: '' };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['discount_reason']).toBeUndefined();
  });
});

describe('validateForm - age validation for cancel insurance', () => {
  it('returns an age error when cancel_insurance is non-zero and date_of_birth indicates under 18', () => {
    const tenYearsAgo = format(subYears(new Date(), 10), 'yyyy-MM-dd');
    const values = {
      ...baseValues,
      cancel_insurance: '1',
      extra_fields: { date_of_birth: tenYearsAgo }
    };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['extra_fields.date_of_birth']).toBeDefined();
    expect(errors['insurances']).toBeDefined();
  });

  it('does not return an age error when date_of_birth indicates 18 or older', () => {
    const twentyYearsAgo = format(subYears(new Date(), 20), 'yyyy-MM-dd');
    const values = {
      ...baseValues,
      cancel_insurance: '1',
      extra_fields: { date_of_birth: twentyYearsAgo }
    };
    const errors = validateForm(values, baseHouse, [] as any);
    expect(errors['extra_fields.date_of_birth']).toBeUndefined();
    expect(errors['insurances']).toBeUndefined();
  });
});
