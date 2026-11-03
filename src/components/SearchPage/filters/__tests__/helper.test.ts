import {
  createNumberArray,
  createPriceArray,
  isLabelableField,
  resolveFieldOptions,
  resolveFieldType
} from '../helper';

describe('resolveFieldType', () => {
  test.each(['select', 'list', 'radio', 'number', 'date'])(
    'keeps the known type %s',
    (type) => {
      expect(resolveFieldType({ id: 'x', type, label: null })).toBe(type);
    }
  );

  test('coerces numeric fields with an unknown type to select', () => {
    expect(
      resolveFieldType({ id: 'persons_min', type: 'integer', label: null })
    ).toBe('select');
  });

  test('treats any other unknown type as text', () => {
    expect(
      resolveFieldType({ id: 'extra_search', type: 'string', label: null })
    ).toBe('text');
  });
});

describe('isLabelableField', () => {
  test.each(['select', 'number', 'date', 'string'])(
    '%s renders one control a label can target',
    (type) => {
      expect(isLabelableField({ id: 'x', type, label: null })).toBe(true);
    }
  );

  test.each(['list', 'radio'])('%s is a group, not labelable', (type) => {
    expect(isLabelableField({ id: 'x', type, label: null })).toBe(false);
  });
});

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

describe('resolveFieldOptions', () => {
  const facets = {
    countries: [{ id: 'NL', name: 'Netherlands', country_id: 'NL' }],
    cities: 'not a list'
  };

  test('prefers the options supplied by the API', () => {
    const options = [{ id: 1, name: 'Pool' }];

    expect(
      resolveFieldOptions(
        { id: 'category_1', type: 'list', label: 'Pool', options },
        facets
      )
    ).toBe(options);
  });

  test('generates a numeric range from max', () => {
    expect(
      resolveFieldOptions(
        { id: 'persons_min', type: 'select', label: null, max: 2 },
        facets
      )
    ).toStrictEqual([0, 1, 2]);
  });

  test('generates price steps for weekprice_max', () => {
    expect(
      resolveFieldOptions(
        { id: 'weekprice_max', type: 'select', label: null, max: 250 },
        facets
      )
    ).toStrictEqual([0, 100, 200, 300]);
  });

  test('falls back to the portal site facet list for location fields', () => {
    expect(
      resolveFieldOptions(
        { id: 'countries', type: 'select', label: null },
        facets
      )
    ).toBe(facets.countries);
  });

  test('returns an empty list when the facet is not a list', () => {
    expect(
      resolveFieldOptions({ id: 'cities', type: 'list', label: null }, facets)
    ).toStrictEqual([]);
  });

  test('returns an empty list for fields without options', () => {
    expect(
      resolveFieldOptions(
        { id: 'extra_search', type: 'text', label: null },
        facets
      )
    ).toStrictEqual([]);
  });
});
