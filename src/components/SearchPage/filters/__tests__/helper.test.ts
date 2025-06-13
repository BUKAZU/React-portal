import { createNumberArray, createPriceArray } from '../helper';

describe('export numbered array', () => {
  test('Small array', () => {
    expect(createNumberArray(2)).toStrictEqual([0, 1, 2]);
  });
});

describe('export price array', () => {
  test('Small array', () => {
    expect(createPriceArray(400)).toStrictEqual([0, 100, 200, 300, 400]);
  });
});
