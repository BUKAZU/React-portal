import { createNumberArray, createPriceArray } from '../helper';

describe('createNumberArray', () => {
  test('returns array from 0 to max_number inclusive', () => {
    expect(createNumberArray(2)).toStrictEqual([0, 1, 2]);
  });

  test('returns single-element array for 0', () => {
    expect(createNumberArray(0)).toStrictEqual([0]);
  });

  test('returns correct length', () => {
    expect(createNumberArray(5)).toHaveLength(6);
  });
});

describe('createPriceArray', () => {
  test('returns array of multiples of 100 up to max_price', () => {
    expect(createPriceArray(400)).toStrictEqual([0, 100, 200, 300, 400]);
  });

  test('rounds up to nearest 100 for non-round prices', () => {
    expect(createPriceArray(350)).toStrictEqual([0, 100, 200, 300, 400]);
  });

  test('returns single-element array for 0', () => {
    expect(createPriceArray(0)).toStrictEqual([0]);
  });

  test('returns correct length for exact multiples of 100', () => {
    expect(createPriceArray(200)).toHaveLength(3);
  });
});
