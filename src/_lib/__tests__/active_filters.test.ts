import {
  activeFilters,
  hasFilterValue,
  removeFilter,
  type ResolvedField
} from '../active_filters';

const fields: ResolvedField[] = [
  {
    id: 'countries',
    type: 'select',
    label: 'Country',
    options: [
      { id: '12', name: 'Spain', country_id: '12' },
      { id: '13', name: 'Portugal', country_id: '13' }
    ]
  },
  { id: 'arrival_date', type: 'date', label: 'Arrival', options: [] },
  {
    id: 'persons_min',
    type: 'select',
    label: 'Persons',
    options: [0, 1, 2, 3, 4]
  },
  {
    id: 'category_7',
    type: 'list',
    label: null,
    options: [{ id: 7, name: 'Pool' }]
  },
  { id: 'extra_search', type: 'text', label: 'Search', options: [] },
  { id: 'cities', type: 'list', label: 'City', options: ['Nerja', 'Ronda'] }
];

beforeEach(() => {
  (window as unknown as { __localeId__: string }).__localeId__ = 'en';
});

describe('hasFilterValue', () => {
  test.each([null, undefined, '', '  ', []])('%p is not a value', (value) => {
    expect(hasFilterValue(value)).toBe(false);
  });

  test.each(['12', 0, ['NL'], 4])('%p is a value', (value) => {
    expect(hasFilterValue(value)).toBe(true);
  });
});

describe('removeFilter', () => {
  test('drops the key instead of leaving a null behind', () => {
    const next = removeFilter(
      { countries: '12', persons_min: '4' },
      'countries'
    );

    expect(next).toEqual({ persons_min: '4' });
    expect('countries' in next).toBe(false);
  });

  test('does not mutate the original filters', () => {
    const filters = { countries: '12' };
    removeFilter(filters, 'countries');

    expect(filters).toEqual({ countries: '12' });
  });
});

describe('activeFilters', () => {
  test('returns nothing when no filter is set', () => {
    expect(activeFilters({}, fields)).toEqual([]);
  });

  test('skips empty, null and undefined values', () => {
    const filters = { countries: '', persons_min: undefined, cities: null };

    expect(activeFilters(filters as never, fields)).toEqual([]);
  });

  test('labels an option field with the option name', () => {
    expect(activeFilters({ countries: '12' }, fields)).toEqual([
      {
        key: 'countries',
        label: 'Country',
        value: 'Spain',
        text: 'Country: Spain'
      }
    ]);
  });

  test('matches numeric option ids against string values', () => {
    expect(
      activeFilters({ category_7: '7' } as never, fields)[0]
    ).toMatchObject({
      key: 'category_7',
      value: 'Pool'
    });
  });

  test('matches plain string and number options', () => {
    const result = activeFilters({ cities: 'Ronda', persons_min: '4' }, fields);

    expect(result.map((f) => f.value)).toEqual(['4', 'Ronda']);
  });

  test('falls back to the field id when the label is missing', () => {
    expect(activeFilters({ category_7: '7' } as never, fields)[0].label).toBe(
      'category_7'
    );
  });

  test('formats dates for the active locale', () => {
    expect(activeFilters({ arrival_date: '2026-07-12' }, fields)[0].value).toBe(
      '12 Jul 2026'
    );
  });

  test('passes a malformed date through untouched', () => {
    expect(activeFilters({ arrival_date: 'soon' }, fields)[0].value).toBe(
      'soon'
    );
  });

  test('uses the raw value when no option matches', () => {
    expect(
      activeFilters({ countries: '99', extra_search: 'pool' }, fields)
    ).toEqual([
      { key: 'countries', label: 'Country', value: '99', text: 'Country: 99' },
      {
        key: 'extra_search',
        label: 'Search',
        value: 'pool',
        text: 'Search: pool'
      }
    ]);
  });

  test('joins list values with a comma', () => {
    expect(activeFilters({ countries: ['12', '13'] }, fields)[0].value).toBe(
      'Spain, Portugal'
    );
  });

  test('ignores keys without a configured field', () => {
    expect(activeFilters({ properties: ['1', '2'] }, fields)).toEqual([]);
  });

  test('keeps panel order', () => {
    const result = activeFilters({ persons_min: '2', countries: '13' }, fields);

    expect(result.map((f) => f.key)).toEqual(['countries', 'persons_min']);
  });
});
