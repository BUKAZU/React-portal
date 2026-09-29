import { searchFilters, searchInfo } from '../search_tracking';

describe('searchInfo', () => {
  it('splits dates and persons from the remaining filters', () => {
    expect(
      searchInfo(
        {
          arrival_date: '2026-07-01',
          departure_date: '2026-07-08',
          persons_min: '4',
          persons_max: '6',
          bedrooms_min: '2',
          countries: '12',
          properties: [3, 5],
          extra_search: 'near the beach'
        },
        17
      )
    ).toEqual({
      arrival: '2026-07-01',
      departure: '2026-07-08',
      persons: 4,
      filters: {
        persons_max: '6',
        bedrooms_min: '2',
        countries: '12',
        properties: [3, 5]
      },
      result_count: 17
    });
  });

  it('leaves out what is not set', () => {
    expect(searchInfo({ persons_min: '', arrival_date: 'soon' }, 0)).toEqual({
      arrival: undefined,
      departure: undefined,
      persons: undefined,
      filters: undefined,
      result_count: 0
    });
  });
});

describe('searchFilters', () => {
  it('sends regions and cities with spaces and punctuation', () => {
    expect(
      searchFilters({
        regions: ['1|Zuid-Holland', "2|Provence-Alpes-Côte d'Azur"],
        cities: '1|Zuid-Holland|Den Haag'
      })
    ).toEqual({
      regions: ['1|Zuid-Holland', "2|Provence-Alpes-Côte d'Azur"],
      cities: '1|Zuid-Holland|Den Haag'
    });
  });

  it.each([
    ['regions', 'Zuid-Holland'],
    ['regions', '1|Zuid-Holland|Den Haag'],
    ['regions', '1|<script>'],
    ['cities', '1|Zuid-Holland'],
    ['cities', 'Den Haag'],
    ['cities', `1|Zuid-Holland|${'a'.repeat(101)}`]
  ])('drops %s value %p', (key, value) => {
    expect(searchFilters({ [key]: value })).toEqual({});
  });

  it('keeps integer ids and counts, as numbers or digit strings', () => {
    expect(
      searchFilters({
        countries: 12,
        properties: ['3', 5],
        persons_max: '6',
        bedrooms_min: '0',
        bathrooms_min: 2,
        weekprice_max: '1500'
      } as never)
    ).toEqual({
      countries: 12,
      properties: ['3', 5],
      persons_max: '6',
      bedrooms_min: '0',
      bathrooms_min: 2,
      weekprice_max: '1500'
    });
  });

  it('drops values that are not non-negative integers', () => {
    expect(
      searchFilters({
        countries: 'NL',
        properties: ['pool', 2.5, -1],
        persons_max: '6.5',
        bedrooms_min: -1,
        bathrooms_min: '',
        weekprice_max: 'cheap'
      } as never)
    ).toEqual({});
  });

  it('keeps the valid items of a list', () => {
    expect(searchFilters({ countries: ['NL', '1', 2] })).toEqual({
      countries: ['1', 2]
    });
  });

  it('only sends list values for list filters', () => {
    expect(searchFilters({ persons_max: ['4'] } as never)).toEqual({});
  });

  it('does not send unknown keys', () => {
    expect(
      searchFilters({
        category_4: 7,
        pets: true,
        extra_search: 'sea view',
        persons_min: '2'
      } as never)
    ).toEqual({});
  });

  it('drops a list over 50 items', () => {
    const ids = Array.from({ length: 51 }, (_, i) => i + 1);

    expect(searchFilters({ properties: ids })).toEqual({});
    expect(searchFilters({ properties: ids.slice(0, 50) })).toEqual({
      properties: ids.slice(0, 50)
    });
  });
});
