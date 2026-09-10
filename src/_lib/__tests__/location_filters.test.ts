import { applyFilterChange } from '../location_filters';
import type { ResolvedOption } from '../active_filters';

const optionsById = new Map<string, ResolvedOption[]>([
  [
    'countries',
    [
      { id: '1', name: 'Spain', country_id: '1' },
      { id: '2', name: 'Portugal', country_id: '2' }
    ]
  ],
  [
    'regions',
    [
      { id: '10', name: 'Andalucía', country_id: '1' },
      { id: '11', name: 'Catalunya', country_id: '1' },
      { id: '20', name: 'Algarve', country_id: '2' }
    ]
  ],
  [
    'cities',
    [
      { id: '100', name: 'Nerja', country_id: '1', region: '10' },
      { id: '110', name: 'Girona', country_id: '1', region: '11' },
      { id: '200', name: 'Lagos', country_id: '2', region: '20' },
      { id: '300', name: 'Nowhere', country_id: '3' }
    ]
  ],
  ['persons_min', [0, 1, 2]]
]);

describe('applyFilterChange', () => {
  test('sets and clears non-location filters without side effects', () => {
    const set = applyFilterChange(
      { countries: '1' },
      'persons_min',
      '2',
      optionsById
    );
    expect(set).toEqual({ countries: '1', persons_min: '2' });

    const cleared = applyFilterChange(set, 'persons_min', '', optionsById);
    expect(cleared).toEqual({ countries: '1' });
    expect('persons_min' in cleared).toBe(false);
  });

  test('picking a region also picks its country', () => {
    expect(applyFilterChange({}, 'regions', '20', optionsById)).toEqual({
      regions: '20',
      countries: '2'
    });
  });

  test('picking a city also picks its region and country', () => {
    expect(applyFilterChange({}, 'cities', '100', optionsById)).toEqual({
      cities: '100',
      regions: '10',
      countries: '1'
    });
  });

  test('picking a city without a region only fills the country', () => {
    expect(applyFilterChange({}, 'cities', '300', optionsById)).toEqual({
      cities: '300',
      countries: '3'
    });
  });

  test('picking a city in another region replaces region and country', () => {
    const filters = { countries: '1', regions: '10', cities: '100' };

    expect(applyFilterChange(filters, 'cities', '200', optionsById)).toEqual({
      cities: '200',
      regions: '20',
      countries: '2'
    });
  });

  test('clearing the country clears region and city', () => {
    const filters = {
      countries: '1',
      regions: '10',
      cities: '100',
      persons_min: '4'
    };

    expect(applyFilterChange(filters, 'countries', null, optionsById)).toEqual({
      persons_min: '4'
    });
  });

  test('clearing the region clears the city but keeps the country', () => {
    const filters = { countries: '1', regions: '10', cities: '100' };

    expect(applyFilterChange(filters, 'regions', '', optionsById)).toEqual({
      countries: '1'
    });
  });

  test('switching country drops a region and city from the old country', () => {
    const filters = { countries: '1', regions: '10', cities: '100' };

    expect(applyFilterChange(filters, 'countries', '2', optionsById)).toEqual({
      countries: '2'
    });
  });

  test('switching country keeps a region and city that belong to it', () => {
    const filters = { countries: '2', regions: '10', cities: '100' };

    expect(applyFilterChange(filters, 'countries', '1', optionsById)).toEqual({
      countries: '1',
      regions: '10',
      cities: '100'
    });
  });

  test('switching region drops a city from another region', () => {
    const filters = { countries: '1', regions: '10', cities: '100' };

    expect(applyFilterChange(filters, 'regions', '11', optionsById)).toEqual({
      countries: '1',
      regions: '11'
    });
  });

  test('accepts a list of countries from a deep link', () => {
    const filters = { countries: ['1', '2'], regions: '20', cities: '200' };

    expect(applyFilterChange(filters, 'regions', '10', optionsById)).toEqual({
      countries: '1',
      regions: '10'
    });
  });

  test('keeps children that belong to one of several deep-linked countries', () => {
    const filters = { regions: '10', cities: '100' };

    expect(
      applyFilterChange(filters, 'countries', ['2', '1'], optionsById)
    ).toEqual({ countries: ['2', '1'], regions: '10', cities: '100' });
  });

  test('leaves unknown ids alone when no option describes them', () => {
    expect(
      applyFilterChange({ regions: '10' }, 'cities', '999', optionsById)
    ).toEqual({
      regions: '10',
      cities: '999'
    });
  });

  test('does nothing clever when the chain fields have no options', () => {
    const empty = new Map<string, ResolvedOption[]>();

    expect(
      applyFilterChange(
        { countries: '1', cities: '100' },
        'regions',
        '10',
        empty
      )
    ).toEqual({ countries: '1', cities: '100', regions: '10' });
  });

  test('does not mutate the given filters', () => {
    const filters = { countries: '1', regions: '10' };
    applyFilterChange(filters, 'countries', null, optionsById);

    expect(filters).toEqual({ countries: '1', regions: '10' });
  });
});
